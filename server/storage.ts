import {
  type User,
  type InsertUser,
  type Donation,
  type InsertDonation,
  type Program,
  type InsertProgram,
  type ImpactStory,
  type InsertImpactStory,
  type Statistics,
  type Donor,
  type InsertDonor,
  type ContactMessage,
  type InsertContactMessage,
  type Event,
  type InsertEvent,
  type Volunteer,
  type InsertVolunteer,
  type Child,
  type InsertChild,
  type Sponsorship,
  type InsertSponsorship,
  users,
  donors,
  donations,
  programs,
  impactStories,
  contactMessages,
  events,
  volunteers,
  children,
  sponsorships,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Hash password utility
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password utility
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface IStorage {
  // Users (Admin)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Donors
  getDonor(id: string): Promise<Donor | undefined>;
  getDonorByEmail(email: string): Promise<Donor | undefined>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  updateDonor(id: string, donor: Partial<InsertDonor>): Promise<Donor | undefined>;
  getDonationsByDonorId(donorId: string): Promise<Donation[]>;

  // Donations
  getDonations(): Promise<Donation[]>;
  getDonation(id: string): Promise<Donation | undefined>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationsByCategory(category: string): Promise<Donation[]>;

  // Programs
  getPrograms(): Promise<Program[]>;
  getProgram(id: string): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program | undefined>;

  // Impact Stories
  getImpactStories(): Promise<ImpactStory[]>;
  getImpactStory(id: string): Promise<ImpactStory | undefined>;
  createImpactStory(story: InsertImpactStory): Promise<ImpactStory>;
  updateImpactStory(id: string, story: Partial<InsertImpactStory>): Promise<ImpactStory | undefined>;

  // Statistics
  getStatistics(): Promise<Statistics>;

  // Contact Messages
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: string): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: string, update: Partial<ContactMessage>): Promise<ContactMessage | undefined>;

  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;

  // Volunteers
  getVolunteers(): Promise<Volunteer[]>;
  getVolunteer(id: string): Promise<Volunteer | undefined>;
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;
  updateVolunteer(id: string, volunteer: Partial<Volunteer>): Promise<Volunteer | undefined>;

  // Children (Sponsorship)
  getChildren(): Promise<Child[]>;
  getChild(id: string): Promise<Child | undefined>;
  getAvailableChildren(): Promise<Child[]>;
  createChild(child: InsertChild): Promise<Child>;
  updateChild(id: string, child: Partial<InsertChild>): Promise<Child | undefined>;

  // Sponsorships
  getSponsorships(): Promise<Sponsorship[]>;
  getSponsorship(id: string): Promise<Sponsorship | undefined>;
  getSponsorshipsByDonorId(donorId: string): Promise<Sponsorship[]>;
  createSponsorship(sponsorship: InsertSponsorship): Promise<Sponsorship>;
  updateSponsorship(id: string, sponsorship: Partial<Sponsorship>): Promise<Sponsorship | undefined>;

  // Database initialization
  initializeDatabase(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(insertUser.password);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  // Donor methods
  async getDonor(id: string): Promise<Donor | undefined> {
    const result = await db.select().from(donors).where(eq(donors.id, id)).limit(1);
    return result[0];
  }

  async getDonorByEmail(email: string): Promise<Donor | undefined> {
    const result = await db.select().from(donors).where(eq(donors.email, email.toLowerCase())).limit(1);
    return result[0];
  }

  async createDonor(insertDonor: InsertDonor): Promise<Donor> {
    const hashedPassword = await hashPassword(insertDonor.password);
    const result = await db.insert(donors).values({
      ...insertDonor,
      email: insertDonor.email.toLowerCase(),
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async updateDonor(id: string, donorUpdate: Partial<InsertDonor>): Promise<Donor | undefined> {
    // If updating password, hash it
    if (donorUpdate.password) {
      donorUpdate.password = await hashPassword(donorUpdate.password);
    }

    const result = await db.update(donors)
      .set(donorUpdate)
      .where(eq(donors.id, id))
      .returning();
    return result[0];
  }

  async getDonationsByDonorId(donorId: string): Promise<Donation[]> {
    return db.select()
      .from(donations)
      .where(eq(donations.donorId, donorId))
      .orderBy(desc(donations.createdAt));
  }

  // Donation methods
  async getDonations(): Promise<Donation[]> {
    return db.select().from(donations).orderBy(desc(donations.createdAt));
  }

  async getDonation(id: string): Promise<Donation | undefined> {
    const result = await db.select().from(donations).where(eq(donations.id, id)).limit(1);
    return result[0];
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const result = await db.insert(donations).values(donation).returning();
    return result[0];
  }

  async getDonationsByCategory(category: string): Promise<Donation[]> {
    return db.select().from(donations).where(eq(donations.category, category));
  }

  // Program methods
  async getPrograms(): Promise<Program[]> {
    return db.select().from(programs).where(eq(programs.isActive, true));
  }

  async getProgram(id: string): Promise<Program | undefined> {
    const result = await db.select().from(programs).where(eq(programs.id, id)).limit(1);
    return result[0];
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    const result = await db.insert(programs).values(program).returning();
    return result[0];
  }

  async updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program | undefined> {
    const result = await db.update(programs)
      .set(program)
      .where(eq(programs.id, id))
      .returning();
    return result[0];
  }

  // Impact Story methods
  async getImpactStories(): Promise<ImpactStory[]> {
    return db.select()
      .from(impactStories)
      .where(eq(impactStories.isPublished, true))
      .orderBy(desc(impactStories.createdAt));
  }

  async getImpactStory(id: string): Promise<ImpactStory | undefined> {
    const result = await db.select().from(impactStories).where(eq(impactStories.id, id)).limit(1);
    return result[0];
  }

  async createImpactStory(story: InsertImpactStory): Promise<ImpactStory> {
    const result = await db.insert(impactStories).values({
      ...story,
      isPublished: story.isPublished ?? true,
    }).returning();
    return result[0];
  }

  async updateImpactStory(id: string, story: Partial<InsertImpactStory>): Promise<ImpactStory | undefined> {
    const result = await db.update(impactStories)
      .set(story)
      .where(eq(impactStories.id, id))
      .returning();
    return result[0];
  }

  // Statistics
  async getStatistics(): Promise<Statistics> {
    const result = await db.select({
      totalDonations: sql<number>`COALESCE(SUM(${donations.amount}), 0)`,
    }).from(donations);

    const totalDonations = Number(result[0]?.totalDonations || 0);

    return {
      totalDonations,
      childrenSupported: 527,
      mealsProvided: 52400,
      studentsEducated: 312,
      medicalTreatments: 1850,
    };
  }

  // Contact Message methods
  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    const result = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
    return result[0];
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const result = await db.insert(contactMessages).values(message).returning();
    return result[0];
  }

  async updateContactMessage(id: string, update: Partial<ContactMessage>): Promise<ContactMessage | undefined> {
    const result = await db.update(contactMessages)
      .set(update)
      .where(eq(contactMessages.id, id))
      .returning();
    return result[0];
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return db.select()
      .from(events)
      .where(eq(events.isActive, true))
      .orderBy(desc(events.date));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return result[0];
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  // Volunteer methods
  async getVolunteers(): Promise<Volunteer[]> {
    return db.select().from(volunteers).orderBy(desc(volunteers.createdAt));
  }

  async getVolunteer(id: string): Promise<Volunteer | undefined> {
    const result = await db.select().from(volunteers).where(eq(volunteers.id, id)).limit(1);
    return result[0];
  }

  async createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer> {
    const result = await db.insert(volunteers).values(volunteer).returning();
    return result[0];
  }

  async updateVolunteer(id: string, volunteer: Partial<Volunteer>): Promise<Volunteer | undefined> {
    const result = await db.update(volunteers)
      .set(volunteer)
      .where(eq(volunteers.id, id))
      .returning();
    return result[0];
  }

  // Children methods
  async getChildren(): Promise<Child[]> {
    return db.select().from(children).where(eq(children.isActive, true));
  }

  async getChild(id: string): Promise<Child | undefined> {
    const result = await db.select().from(children).where(eq(children.id, id)).limit(1);
    return result[0];
  }

  async getAvailableChildren(): Promise<Child[]> {
    return db.select()
      .from(children)
      .where(sql`${children.isActive} = true AND ${children.isSponsored} = false`);
  }

  async createChild(child: InsertChild): Promise<Child> {
    const result = await db.insert(children).values(child).returning();
    return result[0];
  }

  async updateChild(id: string, child: Partial<InsertChild>): Promise<Child | undefined> {
    const result = await db.update(children)
      .set(child)
      .where(eq(children.id, id))
      .returning();
    return result[0];
  }

  // Sponsorship methods
  async getSponsorships(): Promise<Sponsorship[]> {
    return db.select().from(sponsorships).orderBy(desc(sponsorships.createdAt));
  }

  async getSponsorship(id: string): Promise<Sponsorship | undefined> {
    const result = await db.select().from(sponsorships).where(eq(sponsorships.id, id)).limit(1);
    return result[0];
  }

  async getSponsorshipsByDonorId(donorId: string): Promise<Sponsorship[]> {
    return db.select()
      .from(sponsorships)
      .where(eq(sponsorships.donorId, donorId))
      .orderBy(desc(sponsorships.createdAt));
  }

  async createSponsorship(sponsorship: InsertSponsorship): Promise<Sponsorship> {
    const result = await db.insert(sponsorships).values(sponsorship).returning();
    // Mark child as sponsored
    await db.update(children)
      .set({ isSponsored: true })
      .where(eq(children.id, sponsorship.childId));
    return result[0];
  }

  async updateSponsorship(id: string, sponsorship: Partial<Sponsorship>): Promise<Sponsorship | undefined> {
    const result = await db.update(sponsorships)
      .set(sponsorship)
      .where(eq(sponsorships.id, id))
      .returning();
    return result[0];
  }

  // Initialize database - only create admin user
  async initializeDatabase(): Promise<void> {
    try {
      // Check if admin user exists
      const existingAdmin = await this.getUserByUsername("admin123");

      if (!existingAdmin) {
        console.log("Initializing database...");

        // Create admin user
        await this.createUser({
          username: "admin123",
          password: "123456",
        });
        console.log("Admin user created (username: admin123, password: 123456)");
        console.log("Database initialization complete!");
      } else {
        console.log("Database already initialized");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
