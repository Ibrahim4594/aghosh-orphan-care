import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";
import { storage } from "../server/storage";

const app = express();

// Initialize storage (in-memory for serverless)
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    try {
      await storage.initializeDatabase();
      initialized = true;
    } catch (error) {
      console.error("Failed to initialize:", error);
    }
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
const httpServer = createServer(app);
registerRoutes(httpServer, app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Vercel serverless handler
export default async function handler(req: Request, res: Response) {
  await ensureInitialized();
  return app(req, res);
}
