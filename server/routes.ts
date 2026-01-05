import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDonationSchema, insertProgramSchema, insertImpactStorySchema, donationCategories } from "@shared/schema";
import { z } from "zod";
import { randomUUID, createHash } from "crypto";

// Session storage with per-session tokens
const activeSessions: Map<string, { username: string; createdAt: Date }> = new Map();

// Session timeout (1 hour)
const SESSION_TIMEOUT = 60 * 60 * 1000;

// Hash password utility
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Clean expired sessions
function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (now - session.createdAt.getTime() > SESSION_TIMEOUT) {
      activeSessions.delete(token);
    }
  }
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
      
      // Compare hashed passwords
      const hashedInput = hashPassword(password);
      if (user.password !== hashedInput) {
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

  return httpServer;
}
