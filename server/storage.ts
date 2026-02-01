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
  type EventDonation,
  type InsertEventDonation,
  type Volunteer,
  type InsertVolunteer,
  type Child,
  type InsertChild,
  type Sponsorship,
  type InsertSponsorship,
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
  users,
  donors,
  donations,
  programs,
  impactStories,
  contactMessages,
  events,
  eventDonations,
  volunteers,
  newsletterSubscribers,
  children,
  sponsorships,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

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

  // Event Donations
  createEventDonation(eventDonation: InsertEventDonation): Promise<EventDonation>;
  getEventDonation(id: string): Promise<EventDonation | undefined>;
  updateEventDonation(id: string, data: Partial<EventDonation>): Promise<EventDonation | undefined>;
  getDonorEventDonations(donorId: string): Promise<EventDonation[]>;
  getEventDonationsByEvent(eventId: string): Promise<EventDonation[]>;

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

  // Newsletter Subscribers
  getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined>;
  createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  updateNewsletterSubscriberSyncStatus(id: string, mailerliteId: string | null, synced: boolean, error?: string | null): Promise<NewsletterSubscriber | undefined>;
  getUnsyncedSubscribers(): Promise<NewsletterSubscriber[]>;

  // Database initialization
  initializeDatabase(): Promise<void>;
}

// In-memory storage for when database is not available
class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private donors: Map<string, Donor> = new Map();
  private donations: Map<string, Donation> = new Map();
  private programs: Map<string, Program> = new Map();
  private impactStories: Map<string, ImpactStory> = new Map();
  private contactMessages: Map<string, ContactMessage> = new Map();
  private events: Map<string, Event> = new Map();
  private eventDonations: Map<string, EventDonation> = new Map();
  private volunteers: Map<string, Volunteer> = new Map();
  private children: Map<string, Child> = new Map();
  private sponsorships: Map<string, Sponsorship> = new Map();

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(insertUser.password);
    const user: User = {
      id: randomUUID(),
      username: insertUser.username,
      password: hashedPassword,
    };
    this.users.set(user.id, user);
    return user;
  }

  // Donor methods
  async getDonor(id: string): Promise<Donor | undefined> {
    return this.donors.get(id);
  }

  async getDonorByEmail(email: string): Promise<Donor | undefined> {
    return Array.from(this.donors.values()).find(d => d.email.toLowerCase() === email.toLowerCase());
  }

  async createDonor(insertDonor: InsertDonor): Promise<Donor> {
    const hashedPassword = await hashPassword(insertDonor.password);
    const donor: Donor = {
      id: randomUUID(),
      email: insertDonor.email.toLowerCase(),
      password: hashedPassword,
      fullName: insertDonor.fullName,
      phone: insertDonor.phone || null,
      address: insertDonor.address || null,
      city: insertDonor.city || null,
      country: insertDonor.country || null,
      createdAt: new Date(),
    };
    this.donors.set(donor.id, donor);
    return donor;
  }

  async updateDonor(id: string, donorUpdate: Partial<InsertDonor>): Promise<Donor | undefined> {
    const donor = this.donors.get(id);
    if (!donor) return undefined;

    if (donorUpdate.password) {
      donorUpdate.password = await hashPassword(donorUpdate.password);
    }

    const updated = { ...donor, ...donorUpdate };
    this.donors.set(id, updated);
    return updated;
  }

  async getDonationsByDonorId(donorId: string): Promise<Donation[]> {
    return Array.from(this.donations.values())
      .filter(d => d.donorId === donorId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  // Donation methods
  async getDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getDonation(id: string): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const newDonation: Donation = {
      id: randomUUID(),
      donorId: donation.donorId ?? null,
      donorName: donation.donorName ?? null,
      email: donation.email ?? null,
      amount: donation.amount,
      category: donation.category,
      isAnonymous: donation.isAnonymous ?? false,
      paymentMethod: donation.paymentMethod,
      isRecurring: donation.isRecurring ?? false,
      recurringInterval: donation.recurringInterval ?? null,
      createdAt: new Date(),
    };
    this.donations.set(newDonation.id, newDonation);
    return newDonation;
  }

  async getDonationsByCategory(category: string): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(d => d.category === category);
  }

  // Program methods
  async getPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values()).filter(p => p.isActive);
  }

  async getProgram(id: string): Promise<Program | undefined> {
    return this.programs.get(id);
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    const newProgram: Program = {
      id: randomUUID(),
      ...program,
      imageUrl: program.imageUrl || null,
      isActive: program.isActive ?? true,
    };
    this.programs.set(newProgram.id, newProgram);
    return newProgram;
  }

  async updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program | undefined> {
    const existing = this.programs.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...program };
    this.programs.set(id, updated);
    return updated;
  }

  // Impact Story methods
  async getImpactStories(): Promise<ImpactStory[]> {
    return Array.from(this.impactStories.values())
      .filter(s => s.isPublished)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getImpactStory(id: string): Promise<ImpactStory | undefined> {
    return this.impactStories.get(id);
  }

  async createImpactStory(story: InsertImpactStory): Promise<ImpactStory> {
    const newStory: ImpactStory = {
      id: randomUUID(),
      ...story,
      childName: story.childName || null,
      childAge: story.childAge || null,
      imageUrl: story.imageUrl || null,
      isPublished: story.isPublished ?? true,
      createdAt: new Date(),
    };
    this.impactStories.set(newStory.id, newStory);
    return newStory;
  }

  async updateImpactStory(id: string, story: Partial<InsertImpactStory>): Promise<ImpactStory | undefined> {
    const existing = this.impactStories.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...story };
    this.impactStories.set(id, updated);
    return updated;
  }

  // Statistics
  async getStatistics(): Promise<Statistics> {
    const totalDonations = Array.from(this.donations.values())
      .reduce((sum, d) => sum + d.amount, 0);

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
    return Array.from(this.contactMessages.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const newMessage: ContactMessage = {
      id: randomUUID(),
      ...message,
      status: "unread",
      adminNotes: null,
      readAt: null,
      resolvedAt: null,
      createdAt: new Date(),
    };
    this.contactMessages.set(newMessage.id, newMessage);
    return newMessage;
  }

  async updateContactMessage(id: string, update: Partial<ContactMessage>): Promise<ContactMessage | undefined> {
    const existing = this.contactMessages.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update };
    this.contactMessages.set(id, updated);
    return updated;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(e => e.isActive)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const newEvent: Event = {
      id: randomUUID(),
      title: event.title,
      description: event.description,
      date: event.date instanceof Date ? event.date : new Date(event.date),
      endDate: event.endDate ? (event.endDate instanceof Date ? event.endDate : new Date(event.endDate)) : null,
      location: event.location,
      imageUrl: event.imageUrl ?? null,
      eventType: event.eventType ?? "general",
      isActive: event.isActive ?? true,
      createdAt: new Date(),
    };
    this.events.set(newEvent.id, newEvent);
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const existing = this.events.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...event };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  // Event Donation methods
  async createEventDonation(eventDonation: InsertEventDonation): Promise<EventDonation> {
    const newEventDonation: EventDonation = {
      id: randomUUID(),
      eventId: eventDonation.eventId,
      donorId: eventDonation.donorId ?? null,
      donorName: eventDonation.donorName,
      donorEmail: eventDonation.donorEmail,
      donorPhone: eventDonation.donorPhone ?? null,
      amount: eventDonation.amount,
      paymentMethod: eventDonation.paymentMethod ?? "bank",
      paymentStatus: eventDonation.paymentStatus ?? "pending",
      attendanceStatus: eventDonation.attendanceStatus ?? "attending",
      stripePaymentIntentId: eventDonation.stripePaymentIntentId ?? null,
      stripeReceiptUrl: eventDonation.stripeReceiptUrl ?? null,
      localReceiptNumber: eventDonation.localReceiptNumber ?? null,
      notes: eventDonation.notes ?? null,
      createdAt: new Date(),
    };
    this.eventDonations.set(newEventDonation.id, newEventDonation);
    return newEventDonation;
  }

  async getEventDonation(id: string): Promise<EventDonation | undefined> {
    return this.eventDonations.get(id);
  }

  async updateEventDonation(id: string, data: Partial<EventDonation>): Promise<EventDonation | undefined> {
    const existing = this.eventDonations.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...data };
    this.eventDonations.set(id, updated);
    return updated;
  }

  async getDonorEventDonations(donorId: string): Promise<EventDonation[]> {
    return Array.from(this.eventDonations.values())
      .filter(ed => ed.donorId === donorId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getEventDonationsByEvent(eventId: string): Promise<EventDonation[]> {
    return Array.from(this.eventDonations.values())
      .filter(ed => ed.eventId === eventId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  // Volunteer methods
  async getVolunteers(): Promise<Volunteer[]> {
    return Array.from(this.volunteers.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getVolunteer(id: string): Promise<Volunteer | undefined> {
    return this.volunteers.get(id);
  }

  async createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer> {
    const newVolunteer: Volunteer = {
      id: randomUUID(),
      fullName: volunteer.fullName,
      email: volunteer.email,
      phone: volunteer.phone ?? null,
      city: volunteer.city ?? null,
      skills: volunteer.skills ?? null,
      availability: volunteer.availability ?? null,
      message: volunteer.message ?? null,
      status: "pending",
      createdAt: new Date(),
    };
    this.volunteers.set(newVolunteer.id, newVolunteer);
    return newVolunteer;
  }

  async updateVolunteer(id: string, volunteer: Partial<Volunteer>): Promise<Volunteer | undefined> {
    const existing = this.volunteers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...volunteer };
    this.volunteers.set(id, updated);
    return updated;
  }

  // Children methods
  async getChildren(): Promise<Child[]> {
    return Array.from(this.children.values()).filter(c => c.isActive);
  }

  async getChild(id: string): Promise<Child | undefined> {
    return this.children.get(id);
  }

  async getAvailableChildren(): Promise<Child[]> {
    return Array.from(this.children.values()).filter(c => c.isActive && !c.isSponsored);
  }

  async createChild(child: InsertChild): Promise<Child> {
    const newChild: Child = {
      id: randomUUID(),
      name: child.name,
      age: child.age,
      gender: child.gender,
      grade: child.grade ?? null,
      story: child.story ?? null,
      needs: child.needs ?? null,
      imageUrl: child.imageUrl ?? null,
      monthlyAmount: child.monthlyAmount ?? 5000,
      isSponsored: false,
      isActive: true,
      createdAt: new Date(),
    };
    this.children.set(newChild.id, newChild);
    return newChild;
  }

  async updateChild(id: string, child: Partial<InsertChild>): Promise<Child | undefined> {
    const existing = this.children.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...child };
    this.children.set(id, updated);
    return updated;
  }

  // Sponsorship methods
  async getSponsorships(): Promise<Sponsorship[]> {
    return Array.from(this.sponsorships.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getSponsorship(id: string): Promise<Sponsorship | undefined> {
    return this.sponsorships.get(id);
  }

  async getSponsorshipsByDonorId(donorId: string): Promise<Sponsorship[]> {
    return Array.from(this.sponsorships.values())
      .filter(s => s.donorId === donorId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createSponsorship(sponsorship: InsertSponsorship): Promise<Sponsorship> {
    const newSponsorship: Sponsorship = {
      id: randomUUID(),
      childId: sponsorship.childId,
      donorId: sponsorship.donorId ?? null,
      sponsorName: sponsorship.sponsorName,
      sponsorEmail: sponsorship.sponsorEmail,
      sponsorPhone: sponsorship.sponsorPhone ?? null,
      monthlyAmount: sponsorship.monthlyAmount,
      startDate: sponsorship.startDate instanceof Date ? sponsorship.startDate : new Date(),
      endDate: sponsorship.endDate ? (sponsorship.endDate instanceof Date ? sponsorship.endDate : new Date(sponsorship.endDate)) : null,
      status: sponsorship.status ?? "active",
      paymentMethod: sponsorship.paymentMethod ?? "bank",
      paymentStatus: sponsorship.paymentStatus ?? "pending",
      stripePaymentIntentId: sponsorship.stripePaymentIntentId ?? null,
      stripeReceiptUrl: sponsorship.stripeReceiptUrl ?? null,
      localReceiptNumber: sponsorship.localReceiptNumber ?? null,
      notes: sponsorship.notes ?? null,
      createdAt: new Date(),
    };
    this.sponsorships.set(newSponsorship.id, newSponsorship);

    // Mark child as sponsored
    const child = this.children.get(sponsorship.childId);
    if (child) {
      child.isSponsored = true;
      this.children.set(child.id, child);
    }

    return newSponsorship;
  }

  async updateSponsorship(id: string, sponsorship: Partial<Sponsorship>): Promise<Sponsorship | undefined> {
    const existing = this.sponsorships.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...sponsorship };
    this.sponsorships.set(id, updated);
    return updated;
  }

  // Newsletter Subscribers
  private newsletterSubscribers: Map<string, NewsletterSubscriber> = new Map();

  async getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined> {
    return Array.from(this.newsletterSubscribers.values()).find(sub => sub.email === email);
  }

  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const newSubscriber: NewsletterSubscriber = {
      id: randomUUID(),
      email: subscriber.email,
      source: subscriber.source ?? "footer",
      isActive: subscriber.isActive ?? true,
      mailerliteId: subscriber.mailerliteId ?? null,
      mailerliteSynced: subscriber.mailerliteSynced ?? false,
      mailerliteSyncedAt: subscriber.mailerliteSyncedAt ? (subscriber.mailerliteSyncedAt instanceof Date ? subscriber.mailerliteSyncedAt : new Date(subscriber.mailerliteSyncedAt)) : null,
      mailerliteError: subscriber.mailerliteError ?? null,
      createdAt: new Date(),
    };
    this.newsletterSubscribers.set(newSubscriber.id, newSubscriber);
    return newSubscriber;
  }

  async updateNewsletterSubscriberSyncStatus(
    id: string,
    mailerliteId: string | null,
    synced: boolean,
    error?: string | null
  ): Promise<NewsletterSubscriber | undefined> {
    const subscriber = this.newsletterSubscribers.get(id);
    if (!subscriber) return undefined;

    const updated: NewsletterSubscriber = {
      ...subscriber,
      mailerliteId,
      mailerliteSynced: synced,
      mailerliteSyncedAt: synced ? new Date() : null,
      mailerliteError: error || null,
    };
    this.newsletterSubscribers.set(id, updated);
    return updated;
  }

  async getUnsyncedSubscribers(): Promise<NewsletterSubscriber[]> {
    return Array.from(this.newsletterSubscribers.values())
      .filter(sub => !sub.mailerliteSynced);
  }

  // Initialize - create admin user
  async initializeDatabase(): Promise<void> {
    const existingAdmin = await this.getUserByUsername("admin123");
    if (!existingAdmin) {
      console.log("Initializing in-memory storage...");
      await this.createUser({
        username: "admin123",
        password: "123456",
      });
      console.log("Admin user created (username: admin123, password: 123456)");
    } else {
      console.log("In-memory storage already initialized");
    }
  }
}

// Database storage for when database is available
class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not available");
    const hashedPassword = await hashPassword(insertUser.password);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  // Donor methods
  async getDonor(id: string): Promise<Donor | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(donors).where(eq(donors.id, id)).limit(1);
    return result[0];
  }

  async getDonorByEmail(email: string): Promise<Donor | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(donors).where(eq(donors.email, email.toLowerCase())).limit(1);
    return result[0];
  }

  async createDonor(insertDonor: InsertDonor): Promise<Donor> {
    if (!db) throw new Error("Database not available");
    const hashedPassword = await hashPassword(insertDonor.password);
    const result = await db.insert(donors).values({
      ...insertDonor,
      email: insertDonor.email.toLowerCase(),
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async updateDonor(id: string, donorUpdate: Partial<InsertDonor>): Promise<Donor | undefined> {
    if (!db) throw new Error("Database not available");
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
    if (!db) throw new Error("Database not available");
    return db.select()
      .from(donations)
      .where(eq(donations.donorId, donorId))
      .orderBy(desc(donations.createdAt));
  }

  // Donation methods
  async getDonations(): Promise<Donation[]> {
    if (!db) throw new Error("Database not available");
    return db.select().from(donations).orderBy(desc(donations.createdAt));
  }

  async getDonation(id: string): Promise<Donation | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(donations).where(eq(donations.id, id)).limit(1);
    return result[0];
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(donations).values(donation).returning();
    return result[0];
  }

  async getDonationsByCategory(category: string): Promise<Donation[]> {
    if (!db) throw new Error("Database not available");
    return db.select().from(donations).where(eq(donations.category, category));
  }

  // Program methods
  async getPrograms(): Promise<Program[]> {
    if (!db) throw new Error("Database not available");
    return db.select().from(programs).where(eq(programs.isActive, true));
  }

  async getProgram(id: string): Promise<Program | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(programs).where(eq(programs.id, id)).limit(1);
    return result[0];
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(programs).values(program).returning();
    return result[0];
  }

  async updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.update(programs)
      .set(program)
      .where(eq(programs.id, id))
      .returning();
    return result[0];
  }

  // Impact Story methods
  async getImpactStories(): Promise<ImpactStory[]> {
    if (!db) throw new Error("Database not available");
    return db.select()
      .from(impactStories)
      .where(eq(impactStories.isPublished, true))
      .orderBy(desc(impactStories.createdAt));
  }

  async getImpactStory(id: string): Promise<ImpactStory | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(impactStories).where(eq(impactStories.id, id)).limit(1);
    return result[0];
  }

  async createImpactStory(story: InsertImpactStory): Promise<ImpactStory> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(impactStories).values({
      ...story,
      isPublished: story.isPublished ?? true,
    }).returning();
    return result[0];
  }

  async updateImpactStory(id: string, story: Partial<InsertImpactStory>): Promise<ImpactStory | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.update(impactStories)
      .set(story)
      .where(eq(impactStories.id, id))
      .returning();
    return result[0];
  }

  // Statistics
  async getStatistics(): Promise<Statistics> {
    if (!db) throw new Error("Database not available");
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
    if (!db) throw new Error("Database not available");
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
    return result[0];
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(contactMessages).values(message).returning();
    return result[0];
  }

  async updateContactMessage(id: string, update: Partial<ContactMessage>): Promise<ContactMessage | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.update(contactMessages)
      .set(update)
      .where(eq(contactMessages.id, id))
      .returning();
    return result[0];
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    if (!db) throw new Error("Database not available");
    return db.select()
      .from(events)
      .where(eq(events.isActive, true))
      .orderBy(desc(events.date));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return result[0];
  }

  async deleteEvent(id: string): Promise<boolean> {
    if (!db) throw new Error("Database not available");
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  // Event Donation methods
  async createEventDonation(eventDonation: InsertEventDonation): Promise<EventDonation> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(eventDonations).values(eventDonation).returning();
    return result[0];
  }

  async getEventDonation(id: string): Promise<EventDonation | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(eventDonations).where(eq(eventDonations.id, id)).limit(1);
    return result[0];
  }

  async updateEventDonation(id: string, data: Partial<EventDonation>): Promise<EventDonation | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.update(eventDonations)
      .set(data)
      .where(eq(eventDonations.id, id))
      .returning();
    return result[0];
  }

  async getDonorEventDonations(donorId: string): Promise<EventDonation[]> {
    if (!db) throw new Error("Database not available");
    return db.select().from(eventDonations)
      .where(eq(eventDonations.donorId, donorId))
      .orderBy(desc(eventDonations.createdAt));
  }

  async getEventDonationsByEvent(eventId: string): Promise<EventDonation[]> {
    if (!db) throw new Error("Database not available");
    return db.select().from(eventDonations)
      .where(eq(eventDonations.eventId, eventId))
      .orderBy(desc(eventDonations.createdAt));
  }

  // Volunteer methods
  async getVolunteers(): Promise<Volunteer[]> {
    if (!db) throw new Error("Database not available");
    return db.select().from(volunteers).orderBy(desc(volunteers.createdAt));
  }

  async getVolunteer(id: string): Promise<Volunteer | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(volunteers).where(eq(volunteers.id, id)).limit(1);
    return result[0];
  }

  async createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(volunteers).values(volunteer).returning();
    return result[0];
  }

  async updateVolunteer(id: string, volunteer: Partial<Volunteer>): Promise<Volunteer | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.update(volunteers)
      .set(volunteer)
      .where(eq(volunteers.id, id))
      .returning();
    return result[0];
  }

  // Children methods
  async getChildren(): Promise<Child[]> {
    if (!db) throw new Error("Database not available");
    return db.select().from(children).where(eq(children.isActive, true));
  }

  async getChild(id: string): Promise<Child | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(children).where(eq(children.id, id)).limit(1);
    return result[0];
  }

  async getAvailableChildren(): Promise<Child[]> {
    if (!db) throw new Error("Database not available");
    return db.select()
      .from(children)
      .where(sql`${children.isActive} = true AND ${children.isSponsored} = false`);
  }

  async createChild(child: InsertChild): Promise<Child> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(children).values(child).returning();
    return result[0];
  }

  async updateChild(id: string, child: Partial<InsertChild>): Promise<Child | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.update(children)
      .set(child)
      .where(eq(children.id, id))
      .returning();
    return result[0];
  }

  // Sponsorship methods
  async getSponsorships(): Promise<Sponsorship[]> {
    if (!db) throw new Error("Database not available");
    return db.select().from(sponsorships).orderBy(desc(sponsorships.createdAt));
  }

  async getSponsorship(id: string): Promise<Sponsorship | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(sponsorships).where(eq(sponsorships.id, id)).limit(1);
    return result[0];
  }

  async getSponsorshipsByDonorId(donorId: string): Promise<Sponsorship[]> {
    if (!db) throw new Error("Database not available");
    return db.select()
      .from(sponsorships)
      .where(eq(sponsorships.donorId, donorId))
      .orderBy(desc(sponsorships.createdAt));
  }

  async createSponsorship(sponsorship: InsertSponsorship): Promise<Sponsorship> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(sponsorships).values(sponsorship).returning();
    await db.update(children)
      .set({ isSponsored: true })
      .where(eq(children.id, sponsorship.childId));
    return result[0];
  }

  async updateSponsorship(id: string, sponsorship: Partial<Sponsorship>): Promise<Sponsorship | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.update(sponsorships)
      .set(sponsorship)
      .where(eq(sponsorships.id, id))
      .returning();
    return result[0];
  }

  // Newsletter Subscribers
  async getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email)).limit(1);
    return result[0];
  }

  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    if (!db) throw new Error("Database not available");
    const result = await db.insert(newsletterSubscribers).values(subscriber).returning();
    return result[0];
  }

  async updateNewsletterSubscriberSyncStatus(
    id: string,
    mailerliteId: string | null,
    synced: boolean,
    error?: string | null
  ): Promise<NewsletterSubscriber | undefined> {
    if (!db) throw new Error("Database not available");
    const result = await db.update(newsletterSubscribers)
      .set({
        mailerliteId,
        mailerliteSynced: synced,
        mailerliteSyncedAt: synced ? new Date() : null,
        mailerliteError: error || null,
      })
      .where(eq(newsletterSubscribers.id, id))
      .returning();
    return result[0];
  }

  async getUnsyncedSubscribers(): Promise<NewsletterSubscriber[]> {
    if (!db) throw new Error("Database not available");
    return db.select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.mailerliteSynced, false));
  }

  // Initialize database - only create admin user
  async initializeDatabase(): Promise<void> {
    if (!db) throw new Error("Database not available");
    try {
      const existingAdmin = await this.getUserByUsername("admin123");

      if (!existingAdmin) {
        console.log("Initializing database...");
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

// Export the appropriate storage based on database availability
export const storage: IStorage = db ? new DatabaseStorage() : new MemoryStorage();
