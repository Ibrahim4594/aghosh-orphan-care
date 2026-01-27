import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { isStripeConfigured } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { storage } from "./storage";
import { testConnection } from "./db";
import { fetchMissingReceiptURLs } from "./jobs/fetch-receipts";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

async function initializeApp() {
  // Test database connection (won't crash if not configured)
  await testConnection();

  // Initialize database with seed data
  try {
    await storage.initializeDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    // Don't exit - continue with in-memory storage
  }

  // Check Stripe configuration
  if (isStripeConfigured()) {
    console.log("Stripe configured - Card payments enabled");
  } else {
    console.log("Stripe not configured - Card payments disabled. Bank Transfer available.");
  }
}

(async () => {
  await initializeApp();

  // Health check endpoint for Koyeb/Render
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/_health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Stripe webhook endpoint (must be before express.json() middleware)
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const signature = req.headers['stripe-signature'];

      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature' });
      }

      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;

        if (!Buffer.isBuffer(req.body)) {
          const errorMsg = 'STRIPE WEBHOOK ERROR: req.body is not a Buffer.';
          console.error(errorMsg);
          return res.status(500).json({ error: 'Webhook processing error' });
        }

        await WebhookHandlers.processWebhook(req.body as Buffer, sig);

        res.status(200).json({ received: true });
      } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(400).json({ error: 'Webhook processing error' });
      }
    }
  );

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        log(logLine);
      }
    });

    next();
  });

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Only start the server if not running on Vercel (where it exports the app)
  if (process.env.VERCEL !== "1") {
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";
    httpServer.listen(port, host, () => {
      log(`serving on http://${host}:${port}`);
    });

    // Start background job to fetch missing Stripe receipt URLs
    // Run immediately on startup
    if (isStripeConfigured()) {
      console.log('[Background Jobs] Starting Stripe receipt fetcher...');
      fetchMissingReceiptURLs().catch(err => {
        console.error('[Background Jobs] Receipt fetch error:', err);
      });

      // Then run every hour
      setInterval(() => {
        fetchMissingReceiptURLs().catch(err => {
          console.error('[Background Jobs] Receipt fetch error:', err);
        });
      }, 60 * 60 * 1000); // 1 hour
    }
  }
})();

export default app;
