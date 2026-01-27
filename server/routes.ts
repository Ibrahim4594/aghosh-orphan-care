import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage, verifyPassword } from "./storage";
import { insertDonationSchema, insertProgramSchema, insertImpactStorySchema, insertContactMessageSchema, insertEventSchema, insertEventDonationSchema, insertVolunteerSchema, insertChildSchema, insertSponsorshipSchema, insertNewsletterSubscriberSchema, donationCategories, donorLoginSchema, donorSignupSchema } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { addSubscriberToMailerLite, getMailerLiteGroupId } from "./mailerliteClient";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "..", "public", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Session storage with per-session tokens (Admin)
const activeSessions: Map<string, { username: string; createdAt: Date }> = new Map();

// Donor session storage
const donorSessions: Map<string, { donorId: string; email: string; createdAt: Date }> = new Map();

// Session timeout (1 hour)
const SESSION_TIMEOUT = 60 * 60 * 1000;

// Receipt number counter (in production, use database sequence)
let receiptCounter = 0;

// Generate unique receipt number: AGH-YYYYMMDD-XXXX
function generateReceiptNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  receiptCounter++;
  const counter = String(receiptCounter).padStart(4, '0');
  return `AGH-${year}${month}${day}-${counter}`;
}

// Clean expired sessions
function cleanExpiredSessions() {
  const now = Date.now();
  Array.from(activeSessions.entries()).forEach(([token, session]) => {
    if (now - session.createdAt.getTime() > SESSION_TIMEOUT) {
      activeSessions.delete(token);
    }
  });
  // Also clean donor sessions
  Array.from(donorSessions.entries()).forEach(([token, session]) => {
    if (now - session.createdAt.getTime() > SESSION_TIMEOUT) {
      donorSessions.delete(token);
    }
  });
}

// Validate donor session token from header
function getDonorSessionFromRequest(req: Request): { donorId: string; email: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const session = donorSessions.get(token);

  if (!session) {
    return null;
  }

  // Check if session expired
  if (Date.now() - session.createdAt.getTime() > SESSION_TIMEOUT) {
    donorSessions.delete(token);
    return null;
  }

  return { donorId: session.donorId, email: session.email };
}

// Validate session token from header
function getSessionFromRequest(req: Request): { username: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const session = activeSessions.get(token);

  if (!session) {
    return null;
  }

  // Check if session expired
  if (Date.now() - session.createdAt.getTime() > SESSION_TIMEOUT) {
    activeSessions.delete(token);
    return null;
  }

  return { username: session.username };
}

// Validation schemas for updates
const updateProgramSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.enum(donationCategories).optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

const updateImpactStorySchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  childName: z.string().nullable().optional(),
  childAge: z.number().int().positive().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
}).strict();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Clean expired sessions periodically
  setInterval(cleanExpiredSessions, 5 * 60 * 1000);

  // Retry failed MailerLite syncs every 15 minutes
  setInterval(async () => {
    try {
      const unsynced = await storage.getUnsyncedSubscribers();

      if (unsynced.length > 0) {
        console.log(`Retrying ${unsynced.length} failed MailerLite syncs...`);

        const groupId = getMailerLiteGroupId();

        for (const subscriber of unsynced) {
          const mailerliteId = await addSubscriberToMailerLite(
            subscriber.email,
            undefined,
            groupId
          );

          if (mailerliteId) {
            await storage.updateNewsletterSubscriberSyncStatus(
              subscriber.id,
              mailerliteId,
              true
            );
            console.log(`Retry successful for ${subscriber.email}`);
          } else {
            console.log(`Retry failed for ${subscriber.email}`);
          }
        }
      }
    } catch (error) {
      console.error("Error in MailerLite retry job:", error);
    }
  }, 15 * 60 * 1000);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // ============ FILE UPLOAD ============
  console.log("Registering upload endpoints...");
  console.log("Upload directory:", uploadDir);

  // Test endpoint
  app.get("/api/upload/test", (req: Request, res: Response) => {
    res.json({ message: "Upload endpoint is working!" });
  });

  // Upload image endpoint (requires admin authentication)
  app.post("/api/upload", (req: Request, res: Response) => {
    console.log("Upload endpoint hit");

    // Verify admin session first
    const session = getSessionFromRequest(req);
    console.log("Session:", session);

    if (!session) {
      console.log("No session - unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Now handle the upload
    upload.single("image")(req, res, (err: any) => {
      if (err) {
        console.error("Multer upload error:", err);
        return res.status(400).json({ message: err.message || "Failed to upload image" });
      }

      if (!req.file) {
        console.error("No file in request");
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Return the URL to access the uploaded file
      const imageUrl = `/uploads/${req.file.filename}`;
      console.log("File uploaded successfully:", imageUrl);
      res.json({ imageUrl });
    });
  });

  // ============ STRIPE SPONSORSHIP PAYMENTS ============

  // Create payment intent for monthly sponsorship
  app.post("/api/stripe/create-sponsorship-intent", async (req: Request, res: Response) => {
    try {
      console.log("Creating sponsorship payment intent:", req.body);
      const { childId, amount, sponsorName, sponsorEmail } = req.body;

      if (!childId || !amount || !sponsorName || !sponsorEmail) {
        console.error("Missing required fields:", { childId, amount, sponsorName, sponsorEmail });
        return res.status(400).json({ message: "Missing required fields" });
      }

      const stripe = await getUncachableStripeClient();
      if (!stripe) {
        console.error("Stripe client not initialized");
        return res.status(500).json({ message: "Stripe not configured - please contact support" });
      }

      console.log("Creating payment intent for amount:", amount);

      // Create a payment intent for monthly sponsorship
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to paisa (PKR cents)
        currency: "pkr",
        description: `Monthly sponsorship for child ID: ${childId}`,
        metadata: {
          childId,
          sponsorName,
          sponsorEmail,
          type: "monthly_sponsorship",
        },
      });

      console.log("Payment intent created successfully:", paymentIntent.id);
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error.message, error.type);
      res.status(500).json({ message: error.message || "Failed to create payment intent" });
    }
  });

  // ============ DONATIONS ============

  // Get all donations
  app.get("/api/donations", async (req: Request, res: Response) => {
    try {
      const donations = await storage.getDonations();
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  // Create a new donation
  app.post("/api/donations", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(validatedData);
      res.status(201).json(donation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid donation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create donation" });
      }
    }
  });

  // Get donations by category
  app.get("/api/donations/category/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const donations = await storage.getDonationsByCategory(category);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  // ============ PROGRAMS ============

  // Get all programs
  app.get("/api/programs", async (req: Request, res: Response) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  // Get single program
  app.get("/api/programs/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const program = await storage.getProgram(id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch program" });
    }
  });

  // Create a new program (admin only)
  app.post("/api/programs", async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertProgramSchema.parse(req.body);
      const program = await storage.createProgram(validatedData);
      res.status(201).json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid program data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create program" });
      }
    }
  });

  // Update program (admin only)
  app.patch("/api/programs/:id", async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = updateProgramSchema.parse(req.body);
      const { id } = req.params;
      const program = await storage.updateProgram(id, validatedData);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update program" });
      }
    }
  });

  // ============ IMPACT STORIES ============

  // Get all published impact stories
  app.get("/api/impact-stories", async (req: Request, res: Response) => {
    try {
      const stories = await storage.getImpactStories();
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch impact stories" });
    }
  });

  // Get single impact story
  app.get("/api/impact-stories/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const story = await storage.getImpactStory(id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  // Create a new impact story (admin only)
  app.post("/api/impact-stories", async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertImpactStorySchema.parse(req.body);
      const story = await storage.createImpactStory(validatedData);
      res.status(201).json(story);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid story data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create story" });
      }
    }
  });

  // Update impact story (admin only)
  app.patch("/api/impact-stories/:id", async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = updateImpactStorySchema.parse(req.body);
      const { id } = req.params;
      const story = await storage.updateImpactStory(id, validatedData);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update story" });
      }
    }
  });

  // ============ STATISTICS ============

  app.get("/api/statistics", async (req: Request, res: Response) => {
    try {
      const statistics = await storage.getStatistics();
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // ============ CONTACT MESSAGES ============

  // Submit a contact message (public)
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json({
        success: true,
        message: "Message received successfully",
        id: message.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  // Get all contact messages (admin only)
  app.get("/api/admin/messages", async (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Update message status (admin only)
  app.patch("/api/admin/messages/:id", async (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { id } = req.params;
      const updateSchema = z.object({
        status: z.enum(["unread", "read", "resolved"]).optional(),
        adminNotes: z.string().optional(),
      });
      const data = updateSchema.parse(req.body);

      const updates: Record<string, any> = { ...data };
      if (data.status === "read") updates.readAt = new Date();
      if (data.status === "resolved") updates.resolvedAt = new Date();

      const message = await storage.updateContactMessage(id, updates);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update message" });
      }
    }
  });

  // ============ EVENTS ============

  // Get all active events (public)
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const eventsList = await storage.getEvents();
      res.json(eventsList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get single event (public)
  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Create event (admin only)
  app.post("/api/events", async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create event" });
      }
    }
  });

  // Update event (admin only)
  app.patch("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const event = await storage.updateEvent(id, req.body);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Delete event (admin only)
  app.delete("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const deleted = await storage.deleteEvent(id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ message: "Event deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // ============ EVENT DONATIONS ============

  // Create event donation (public or authenticated)
  app.post("/api/event-donations", async (req: Request, res: Response) => {
    try {
      const validatedData = insertEventDonationSchema.parse(req.body);

      // Get donor ID from session if authenticated
      const donorSession = getDonorSessionFromRequest(req);
      if (donorSession) {
        validatedData.donorId = donorSession.donorId;
      }

      // Generate local receipt number
      const receiptNumber = `EVT-${Date.now()}-${randomUUID().split('-')[0]}`;
      validatedData.localReceiptNumber = receiptNumber;

      const eventDonation = await storage.createEventDonation(validatedData);
      res.status(201).json(eventDonation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event donation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create event donation" });
      }
    }
  });

  // Get event donations for logged-in donor
  app.get("/api/donor/event-donations", async (req: Request, res: Response) => {
    try {
      const donorSession = getDonorSessionFromRequest(req);
      if (!donorSession) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const donorDonations = await storage.getDonorEventDonations(donorSession.donorId);
      res.json(donorDonations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event donations" });
    }
  });

  // Get all event donations for a specific event (admin only)
  app.get("/api/admin/events/:eventId/donations", async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { eventId } = req.params;
      const eventDonations = await storage.getEventDonationsByEvent(eventId);
      res.json(eventDonations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event donations" });
    }
  });

  // Get event donation receipt data
  app.get("/api/event-donations/:id/receipt", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Get event donation
      const eventDonation = await storage.getEventDonation(id);

      if (!eventDonation) {
        return res.status(404).json({ message: "Event donation not found" });
      }

      // Get event details
      const event = await storage.getEvent(eventDonation.eventId);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Format receipt data similar to sponsorship receipts
      const receiptData = {
        localReceiptNumber: eventDonation.localReceiptNumber,
        sponsorName: eventDonation.donorName,
        sponsorEmail: eventDonation.donorEmail,
        monthlyAmount: eventDonation.amount,
        startDate: eventDonation.createdAt,
        paymentMethod: eventDonation.paymentMethod,
        paymentStatus: eventDonation.paymentStatus,
        stripeReceiptUrl: eventDonation.stripeReceiptUrl,
        child: {
          name: event.title,
        },
        isEventDonation: true,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        attendanceStatus: eventDonation.attendanceStatus,
      };

      res.json(receiptData);
    } catch (error) {
      console.error("Error fetching event donation receipt:", error);
      res.status(500).json({ message: "Failed to fetch receipt" });
    }
  });

  // Create Stripe payment intent for event donation
  app.post("/api/stripe/create-event-donation-intent", async (req: Request, res: Response) => {
    try {
      console.log("[Event Donation] Creating payment intent...");
      console.log("[Event Donation] Request body:", req.body);

      const stripe = await getUncachableStripeClient();
      if (!stripe) {
        console.error("[Event Donation] Stripe not configured");
        return res.status(400).json({ message: "Stripe not configured" });
      }

      const { amount, eventId, donorName, donorEmail, attendanceStatus } = req.body;

      if (!amount || !eventId || !donorName || !donorEmail) {
        console.error("[Event Donation] Missing required fields");
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get donor ID from session if authenticated
      const donorSession = getDonorSessionFromRequest(req);
      const donorId = donorSession?.donorId || null;
      console.log("[Event Donation] Donor ID:", donorId);

      // Generate local receipt number
      const receiptNumber = `EVT-${Date.now()}-${randomUUID().split('-')[0]}`;

      // Create event donation record first
      console.log("[Event Donation] Creating event donation record...");
      const eventDonation = await storage.createEventDonation({
        eventId,
        donorId,
        donorName,
        donorEmail,
        amount: Math.round(amount),
        paymentMethod: "card",
        paymentStatus: "pending",
        attendanceStatus: attendanceStatus || "attending",
        localReceiptNumber: receiptNumber,
      });
      console.log("[Event Donation] Event donation created:", eventDonation.id);

      // Create Stripe payment intent
      console.log("[Event Donation] Creating Stripe payment intent...");
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "pkr",
        description: `Event Donation: ${eventId}`,
        metadata: {
          eventDonationId: eventDonation.id,
          eventId,
          donorName,
          donorEmail,
          type: "event_donation",
        },
        receipt_email: donorEmail,
      });
      console.log("[Event Donation] Payment intent created:", paymentIntent.id);

      const response = {
        clientSecret: paymentIntent.client_secret,
        eventDonationId: eventDonation.id,
      };
      console.log("[Event Donation] Sending response:", response);

      return res.status(200).json(response);
    } catch (error: any) {
      console.error("[Event Donation] Error:", error);
      return res.status(500).json({
        message: error.message || "Failed to create payment intent",
        error: error.toString()
      });
    }
  });

  // ============ VOLUNTEERS ============

  // Submit volunteer application (public)
  app.post("/api/volunteers", async (req: Request, res: Response) => {
    try {
      const validatedData = insertVolunteerSchema.parse(req.body);
      const volunteer = await storage.createVolunteer(validatedData);
      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        id: volunteer.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid volunteer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit application" });
      }
    }
  });

  // Get all volunteers (admin only)
  app.get("/api/admin/volunteers", async (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const volunteersList = await storage.getVolunteers();
      res.json(volunteersList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch volunteers" });
    }
  });

  // Update volunteer status (admin only)
  app.patch("/api/admin/volunteers/:id", async (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { id } = req.params;
      const updateSchema = z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      });
      const data = updateSchema.parse(req.body);

      const volunteer = await storage.updateVolunteer(id, data);
      if (!volunteer) {
        return res.status(404).json({ message: "Volunteer not found" });
      }
      res.json(volunteer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update volunteer" });
      }
    }
  });

  // ============ CHILDREN (SPONSORSHIP) ============

  // Get all children available for sponsorship (public)
  app.get("/api/children", async (req: Request, res: Response) => {
    try {
      const childrenList = await storage.getChildren();
      res.json(childrenList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  // Get available (unsponsored) children (public)
  app.get("/api/children/available", async (req: Request, res: Response) => {
    try {
      const childrenList = await storage.getAvailableChildren();
      res.json(childrenList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available children" });
    }
  });

  // Get single child (public)
  app.get("/api/children/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const child = await storage.getChild(id);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      res.json(child);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch child" });
    }
  });

  // Create child (admin only)
  app.post("/api/admin/children", async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertChildSchema.parse(req.body);
      const child = await storage.createChild(validatedData);
      res.status(201).json(child);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid child data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create child" });
      }
    }
  });

  // Update child (admin only)
  app.patch("/api/admin/children/:id", async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const child = await storage.updateChild(id, req.body);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      res.json(child);
    } catch (error) {
      res.status(500).json({ message: "Failed to update child" });
    }
  });

  // ============ SPONSORSHIPS ============

  // Submit sponsorship request (public)
  app.post("/api/sponsorships", async (req: Request, res: Response) => {
    try {
      const sponsorshipRequestSchema = z.object({
        childId: z.string().min(1, "Child ID is required"),
        sponsorName: z.string().min(2, "Sponsor name must be at least 2 characters"),
        sponsorEmail: z.string().email("Invalid email address"),
        sponsorPhone: z.string().optional(),
        paymentMethod: z.enum(["bank", "card"]).default("bank"),
        notes: z.string().optional(),
      });

      const validatedData = sponsorshipRequestSchema.parse(req.body);

      // Check if child exists and is available
      const child = await storage.getChild(validatedData.childId);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      if (child.isSponsored) {
        return res.status(400).json({ message: "This child is already sponsored" });
      }

      // Get donor ID if logged in
      const donorSession = getDonorSessionFromRequest(req);

      // Generate receipt number: AGH-YYYYMMDD-XXXX
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const receiptNumber = `AGH-${year}${month}${day}-${random}`;

      const sponsorship = await storage.createSponsorship({
        childId: validatedData.childId,
        donorId: donorSession?.donorId || null,
        sponsorName: validatedData.sponsorName,
        sponsorEmail: validatedData.sponsorEmail,
        sponsorPhone: validatedData.sponsorPhone || null,
        monthlyAmount: child.monthlyAmount || 5000,
        paymentMethod: validatedData.paymentMethod,
        localReceiptNumber: receiptNumber,
        paymentStatus: validatedData.paymentMethod === "bank" ? "pending" : "pending",
        notes: validatedData.notes || null,
        status: "active",
      });

      res.status(201).json({
        success: true,
        message: "Sponsorship request submitted successfully",
        sponsorship: {
          id: sponsorship.id,
          childName: child.name,
          monthlyAmount: sponsorship.monthlyAmount,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid sponsorship data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit sponsorship" });
      }
    }
  });

  // Get sponsorship details by child ID (public - for viewing receipts)
  app.get("/api/sponsorships/child/:childId", async (req: Request, res: Response) => {
    try {
      const { childId } = req.params;

      // Get the child info
      const child = await storage.getChild(childId);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }

      // Get sponsorship for this child
      const sponsorships = await storage.getSponsorships();
      const sponsorship = sponsorships.find(s => s.childId === childId && s.status === "active");

      if (!sponsorship) {
        return res.status(404).json({ message: "No active sponsorship found for this child" });
      }

      // Return sponsorship with child details
      res.json({
        ...sponsorship,
        childName: child.name,
        childAge: child.age,
        childGrade: child.grade,
        childImageUrl: child.imageUrl,
      });
    } catch (error) {
      console.error("Error fetching sponsorship:", error);
      res.status(500).json({ message: "Failed to fetch sponsorship details" });
    }
  });

  // Get all sponsorships (admin only)
  app.get("/api/admin/sponsorships", async (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const sponsorshipsList = await storage.getSponsorships();
      res.json(sponsorshipsList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sponsorships" });
    }
  });

  // Get donor's sponsorships
  app.get("/api/donor/sponsorships", async (req: Request, res: Response) => {
    const session = getDonorSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const sponsorshipsList = await storage.getSponsorshipsByDonorId(session.donorId);
      res.json(sponsorshipsList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sponsorships" });
    }
  });

  // Update sponsorship payment details (after successful Stripe payment)
  app.patch("/api/sponsorships/:id/payment", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateSchema = z.object({
        stripePaymentIntentId: z.string().optional(),
        paymentStatus: z.enum(["pending", "completed", "failed"]).optional(),
      });
      const data = updateSchema.parse(req.body);

      let receiptUrl = null;

      // If payment intent ID is provided, fetch the receipt URL from Stripe
      if (data.stripePaymentIntentId) {
        try {
          const stripe = await getUncachableStripeClient();
          if (stripe) {
            const paymentIntent = await stripe.paymentIntents.retrieve(data.stripePaymentIntentId, {
              expand: ['latest_charge']
            });

            if (paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'object') {
              receiptUrl = paymentIntent.latest_charge.receipt_url || null;
            }
          }
        } catch (err) {
          console.error("Error fetching Stripe receipt:", err);
        }
      }

      const sponsorship = await storage.updateSponsorship(id, {
        ...data,
        stripeReceiptUrl: receiptUrl,
      });

      if (!sponsorship) {
        return res.status(404).json({ message: "Sponsorship not found" });
      }

      res.json(sponsorship);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update sponsorship payment" });
      }
    }
  });

  // Generate receipt numbers for existing sponsorships (admin only)
  app.post("/api/admin/sponsorships/generate-receipts", async (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const sponsorships = await storage.getSponsorships();
      let updated = 0;

      for (const sponsorship of sponsorships) {
        if (!sponsorship.localReceiptNumber) {
          const now = new Date(sponsorship.createdAt || new Date());
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
          const receiptNumber = `AGH-${year}${month}${day}-${random}`;

          await storage.updateSponsorship(sponsorship.id, {
            localReceiptNumber: receiptNumber,
          });
          updated++;
        }
      }

      res.json({ message: `Generated ${updated} receipt numbers`, updated });
    } catch (error) {
      console.error("Error generating receipts:", error);
      res.status(500).json({ message: "Failed to generate receipt numbers" });
    }
  });

  // Update sponsorship status (admin only)
  app.patch("/api/admin/sponsorships/:id", async (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { id } = req.params;
      const updateSchema = z.object({
        status: z.enum(["active", "paused", "ended"]).optional(),
        notes: z.string().optional(),
      });
      const data = updateSchema.parse(req.body);

      const sponsorship = await storage.updateSponsorship(id, data);
      if (!sponsorship) {
        return res.status(404).json({ message: "Sponsorship not found" });
      }

      // If sponsorship ended, mark child as available again
      if (data.status === "ended") {
        await storage.updateChild(sponsorship.childId, { isSponsored: false });
      }

      res.json(sponsorship);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update sponsorship" });
      }
    }
  });

  // ============ ADMIN AUTH ============

  // Admin login
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare passwords using bcrypt
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session token
      const sessionToken = randomUUID();
      activeSessions.set(sessionToken, {
        username: user.username,
        createdAt: new Date()
      });

      res.json({
        message: "Login successful",
        token: sessionToken,
        user: { username: user.username }
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      activeSessions.delete(token);
    }
    res.json({ message: "Logged out successfully" });
  });

  // Check admin session
  app.get("/api/admin/session", async (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    if (session) {
      res.json({ authenticated: true, user: session });
    } else {
      res.json({ authenticated: false });
    }
  });

  // ============ DONOR AUTH ============

  // Donor signup
  app.post("/api/donor/signup", async (req: Request, res: Response) => {
    try {
      const parsed = donorSignupSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid signup data",
          errors: parsed.error.errors
        });
      }

      const { email, password, fullName, phone, address, city, country } = parsed.data;

      // Check if email already exists
      const existingDonor = await storage.getDonorByEmail(email);
      if (existingDonor) {
        return res.status(409).json({ message: "Email already registered" });
      }

      // Create donor
      const donor = await storage.createDonor({
        email,
        password,
        fullName,
        phone: phone || null,
        address: address || null,
        city: city || null,
        country: country || null,
      });

      // Create session token
      const sessionToken = randomUUID();
      donorSessions.set(sessionToken, {
        donorId: donor.id,
        email: donor.email,
        createdAt: new Date()
      });

      res.status(201).json({
        message: "Signup successful",
        token: sessionToken,
        donor: {
          id: donor.id,
          email: donor.email,
          fullName: donor.fullName,
        }
      });
    } catch (error) {
      console.error("Donor signup error:", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  // Donor login
  app.post("/api/donor/login", async (req: Request, res: Response) => {
    try {
      const parsed = donorLoginSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid login data",
          errors: parsed.error.errors
        });
      }

      const { email, password } = parsed.data;

      const donor = await storage.getDonorByEmail(email);

      if (!donor) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare passwords using bcrypt
      const isValidPassword = await verifyPassword(password, donor.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session token
      const sessionToken = randomUUID();
      donorSessions.set(sessionToken, {
        donorId: donor.id,
        email: donor.email,
        createdAt: new Date()
      });

      res.json({
        message: "Login successful",
        token: sessionToken,
        donor: {
          id: donor.id,
          email: donor.email,
          fullName: donor.fullName,
        }
      });
    } catch (error) {
      console.error("Donor login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Donor logout
  app.post("/api/donor/logout", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      donorSessions.delete(token);
    }
    res.json({ message: "Logged out successfully" });
  });

  // Check donor session
  app.get("/api/donor/session", async (req: Request, res: Response) => {
    const session = getDonorSessionFromRequest(req);
    if (session) {
      const donor = await storage.getDonor(session.donorId);
      if (donor) {
        res.json({
          authenticated: true,
          donor: {
            id: donor.id,
            email: donor.email,
            fullName: donor.fullName,
            phone: donor.phone,
            address: donor.address,
            city: donor.city,
            country: donor.country,
            createdAt: donor.createdAt,
          }
        });
      } else {
        res.json({ authenticated: false });
      }
    } else {
      res.json({ authenticated: false });
    }
  });

  // Get donor profile
  app.get("/api/donor/profile", async (req: Request, res: Response) => {
    const session = getDonorSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const donor = await storage.getDonor(session.donorId);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.json({
      id: donor.id,
      email: donor.email,
      fullName: donor.fullName,
      phone: donor.phone,
      address: donor.address,
      city: donor.city,
      country: donor.country,
      createdAt: donor.createdAt,
    });
  });

  // Update donor profile
  app.patch("/api/donor/profile", async (req: Request, res: Response) => {
    const session = getDonorSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const updateSchema = z.object({
        fullName: z.string().min(2).optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
      });

      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid update data",
          errors: parsed.error.errors
        });
      }

      const updatedDonor = await storage.updateDonor(session.donorId, parsed.data);
      if (!updatedDonor) {
        return res.status(404).json({ message: "Donor not found" });
      }

      res.json({
        id: updatedDonor.id,
        email: updatedDonor.email,
        fullName: updatedDonor.fullName,
        phone: updatedDonor.phone,
        address: updatedDonor.address,
        city: updatedDonor.city,
        country: updatedDonor.country,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get donor's donation history
  app.get("/api/donor/donations", async (req: Request, res: Response) => {
    const session = getDonorSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const donations = await storage.getDonationsByDonorId(session.donorId);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  // ============ NEWSLETTER SUBSCRIPTION ============

  // Newsletter subscription schema
  const newsletterSubscribeSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
  });

  // Subscribe to newsletter
  app.post("/api/newsletter/subscribe", async (req: Request, res: Response) => {
    try {
      const parsed = newsletterSubscribeSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid email address",
          errors: parsed.error.errors
        });
      }

      const { email } = parsed.data;

      // Check if email already exists
      const existing = await storage.getNewsletterSubscriber(email);
      if (existing) {
        return res.status(400).json({
          message: "This email is already subscribed to our newsletter"
        });
      }

      // Store subscriber in database (critical path - always succeeds)
      const subscriber = await storage.createNewsletterSubscriber({
        email,
        source: "footer",
        isActive: true,
      });

      // Async sync to MailerLite (non-blocking, retry on failure)
      const groupId = getMailerLiteGroupId();
      addSubscriberToMailerLite(email, undefined, groupId)
        .then(async (mailerliteId) => {
          if (mailerliteId) {
            await storage.updateNewsletterSubscriberSyncStatus(subscriber.id, mailerliteId, true);
            console.log(`MailerLite sync successful for ${email}`);
          } else {
            await storage.updateNewsletterSubscriberSyncStatus(
              subscriber.id,
              null,
              false,
              "Failed to sync to MailerLite"
            );
            console.log(`MailerLite sync failed for ${email}, will retry later`);
          }
        })
        .catch(async (error) => {
          await storage.updateNewsletterSubscriberSyncStatus(
            subscriber.id,
            null,
            false,
            error.message
          );
          console.error(`MailerLite sync error for ${email}:`, error);
        });

      // Return success immediately (user doesn't wait for MailerLite)
      res.status(201).json({
        message: "Successfully subscribed to newsletter",
        email: subscriber.email
      });
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // ============ STRIPE PAYMENTS ============

  // Supported currencies for donations
  const supportedCurrencies = ['usd', 'cad', 'gbp', 'aed', 'eur', 'pkr'];

  // Exchange rates to PKR (approximate rates - refreshed periodically)
  // Last updated: 2026-01-09
  const exchangeRates: Record<string, number> = {
    usd: 278.50,
    cad: 201.89,
    gbp: 351.20,
    aed: 75.82,
    eur: 287.50,
    pkr: 1,
  };
  const ratesLastUpdated = '2026-01-09';

  // Minimum donation amounts per currency
  const minimumAmounts: Record<string, number> = {
    usd: 5,
    cad: 7,
    gbp: 4,
    aed: 20,
    eur: 5,
    pkr: 500,
  };

  // Check if Stripe is configured
  app.get("/api/stripe/status", async (req: Request, res: Response) => {
    const isConfigured = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
    res.json({ configured: isConfigured });
  });

  // Get Stripe publishable key
  app.get("/api/stripe/publishable-key", async (req: Request, res: Response) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLISHABLE_KEY) {
        return res.status(404).json({ message: "Stripe not configured" });
      }
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      res.status(500).json({ message: "Failed to get Stripe key" });
    }
  });

  // Get exchange rates with timestamp
  app.get("/api/exchange-rates", async (req: Request, res: Response) => {
    res.json({
      rates: exchangeRates,
      baseCurrency: "pkr",
      lastUpdated: ratesLastUpdated,
      supportedCurrencies,
      minimumAmounts,
    });
  });

  // Checkout validation schema
  const donationTypes = ['zakat', 'sadaqah', 'charity', 'funds'] as const;
  const checkoutSchema = z.object({
    amount: z.number().positive(),
    currency: z.string().toLowerCase().refine((c) => supportedCurrencies.includes(c), {
      message: "Unsupported currency"
    }),
    category: z.enum(donationCategories),
    donationType: z.enum(donationTypes).default('sadaqah'),
    donorName: z.string().optional(),
    donorEmail: z.string().email().optional().or(z.literal('')),
    isAnonymous: z.boolean().optional().default(false),
    message: z.string().max(500).optional(),
  });

  // Create donation checkout session
  app.post("/api/donate/checkout", async (req: Request, res: Response) => {
    try {
      // Check if Stripe is configured
      if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLISHABLE_KEY) {
        return res.status(400).json({ message: "Card payments not available. Please use Bank Transfer." });
      }

      const parsed = checkoutSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid donation data",
          errors: parsed.error.errors
        });
      }

      const { amount, currency, category, donationType, donorName, donorEmail, isAnonymous, message } = parsed.data;

      // Validate minimum amount for currency
      const minAmount = minimumAmounts[currency] || 5;
      if (amount < minAmount) {
        return res.status(400).json({
          message: `Minimum donation in ${currency.toUpperCase()} is ${minAmount}`
        });
      }

      // Cap maximum to prevent abuse
      const maxAmount = 100000;
      if (amount > maxAmount) {
        return res.status(400).json({
          message: `Maximum donation is ${maxAmount} ${currency.toUpperCase()}. For larger donations, please contact us.`
        });
      }

      const stripe = await getUncachableStripeClient();

      // Calculate PKR equivalent server-side
      const rate = exchangeRates[currency] || 1;
      const pkrAmount = Math.round(amount * rate);

      // Format donation type for display
      const typeLabels: Record<string, string> = {
        zakat: 'Zakat',
        sadaqah: 'Sadaqah',
        charity: 'Charity',
        funds: 'Funds'
      };
      const typeLabel = typeLabels[donationType] || 'Donation';

      // Create checkout session with dynamic price
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${typeLabel} - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
              description: `Aghosh Orphan Care Home - ${typeLabel} for ${category} (PKR ${pkrAmount.toLocaleString()} equivalent)`,
              images: ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400'],
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        metadata: {
          category,
          donationType,
          donorName: isAnonymous ? 'Anonymous' : (donorName || 'Anonymous'),
          donorEmail: donorEmail || '',
          isAnonymous: String(isAnonymous),
          message: message || '',
          pkrEquivalent: String(pkrAmount),
          originalCurrency: currency,
          originalAmount: String(amount),
        },
        customer_email: donorEmail || undefined,
        success_url: `${req.protocol}://${req.get('host')}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/donate`,
      });

      res.json({
        sessionId: session.id,
        url: session.url,
        pkrEquivalent: pkrAmount
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Create PaymentIntent for embedded card payments
  app.post("/api/donate/create-payment-intent", async (req: Request, res: Response) => {
    try {
      // Check if Stripe is configured
      if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLISHABLE_KEY) {
        return res.status(400).json({ message: "Card payments not available. Please use Bank Transfer." });
      }

      const parsed = checkoutSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid donation data",
          errors: parsed.error.errors
        });
      }

      const { amount, currency, category, donationType, donorName, donorEmail, isAnonymous, message } = parsed.data;

      // Validate minimum amount for currency
      const minAmount = minimumAmounts[currency] || 5;
      if (amount < minAmount) {
        return res.status(400).json({
          message: `Minimum donation in ${currency.toUpperCase()} is ${minAmount}`
        });
      }

      // Cap maximum to prevent abuse
      const maxAmount = 100000;
      if (amount > maxAmount) {
        return res.status(400).json({
          message: `Maximum donation is ${maxAmount} ${currency.toUpperCase()}. For larger donations, please contact us.`
        });
      }

      const stripe = await getUncachableStripeClient();

      // Calculate PKR equivalent server-side
      const rate = exchangeRates[currency] || 1;
      const pkrAmount = Math.round(amount * rate);

      // Format donation type for display
      const typeLabels: Record<string, string> = {
        zakat: 'Zakat',
        sadaqah: 'Sadaqah',
        charity: 'Charity',
        funds: 'Funds'
      };
      const typeLabel = typeLabels[donationType] || 'Donation';

      // Create PaymentIntent for embedded payment
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        metadata: {
          category,
          donationType,
          donorName: isAnonymous ? 'Anonymous' : (donorName || 'Anonymous'),
          donorEmail: donorEmail || '',
          isAnonymous: String(isAnonymous),
          message: message || '',
          pkrEquivalent: String(pkrAmount),
          originalCurrency: currency,
          originalAmount: String(amount),
        },
        description: `Aghosh Orphan Care Home - ${typeLabel} for ${category} (PKR ${pkrAmount.toLocaleString()})`,
        receipt_email: donorEmail || undefined,
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        pkrEquivalent: pkrAmount
      });
    } catch (error: any) {
      console.error('PaymentIntent error:', error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  // Confirm payment was successful and record donation
  app.post("/api/donate/confirm-payment", async (req: Request, res: Response) => {
    try {
      const { paymentIntentId } = req.body;

      if (!paymentIntentId || typeof paymentIntentId !== 'string') {
        return res.status(400).json({ message: "Invalid payment intent ID" });
      }

      const stripe = await getUncachableStripeClient();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        const metadata = paymentIntent.metadata || {};

        // Get the charge to retrieve receipt URL
        let stripeReceiptUrl = null;
        if (paymentIntent.latest_charge) {
          try {
            const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
            stripeReceiptUrl = charge.receipt_url;
          } catch (e) {
            console.log('Could not retrieve charge receipt URL');
          }
        }

        // Only record donation once per payment (idempotency)
        if (!processedPayments.has(paymentIntentId)) {
          processedPayments.add(paymentIntentId);

          await storage.createDonation({
            donorName: metadata.donorName || 'Anonymous',
            email: metadata.donorEmail || null,
            amount: parseInt(metadata.pkrEquivalent || '0'),
            category: metadata.category as any || 'general',
            paymentMethod: 'card',
            isAnonymous: metadata.isAnonymous === 'true',
          });
        }

        res.json({
          success: true,
          receiptNumber: generateReceiptNumber(),
          transactionId: paymentIntentId,
          stripeReceiptUrl,
          date: new Date().toISOString(),
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency?.toUpperCase(),
          pkrEquivalent: parseInt(metadata.pkrEquivalent || '0'),
          category: metadata.category,
          donorName: metadata.isAnonymous === 'true' ? 'Anonymous' : metadata.donorName,
          donorEmail: metadata.isAnonymous === 'true' ? null : metadata.donorEmail,
          donationType: metadata.donationType,
          paymentMethod: 'Credit/Debit Card',
        });
      } else {
        res.json({ success: false, status: paymentIntent.status });
      }
    } catch (error: any) {
      console.error('Confirm payment error:', error.message);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Track processed sessions to prevent duplicate donation records
  const processedPayments = new Set<string>();
  const processedSessions = new Set<string>();

  // Verify donation success
  app.get("/api/donate/verify/:sessionId", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
        return res.status(400).json({ message: "Invalid session ID" });
      }

      const stripe = await getUncachableStripeClient();

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        const metadata = session.metadata || {};

        // Only record donation once per session (idempotency)
        if (!processedSessions.has(sessionId)) {
          processedSessions.add(sessionId);

          await storage.createDonation({
            donorName: metadata.donorName || 'Anonymous',
            email: metadata.donorEmail || null,
            amount: parseInt(metadata.pkrEquivalent || '0'),
            category: metadata.category as any || 'general',
            paymentMethod: 'card',
            isAnonymous: metadata.isAnonymous === 'true',
          });
        }

        res.json({
          success: true,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency?.toUpperCase(),
          pkrEquivalent: parseInt(metadata.pkrEquivalent || '0'),
          category: metadata.category,
          donorName: metadata.isAnonymous === 'true' ? 'Anonymous' : metadata.donorName,
        });
      } else {
        res.json({ success: false, status: session.payment_status });
      }
    } catch (error: any) {
      console.error('Verify error:', error.message);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  return httpServer;
}
