import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Donors table (separate from admin users)
export const donors = pgTable("donors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDonorSchema = createInsertSchema(donors).omit({
  id: true,
  createdAt: true,
});

export const donorLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const donorSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export type InsertDonor = z.infer<typeof insertDonorSchema>;
export type Donor = typeof donors.$inferSelect;
export type DonorLogin = z.infer<typeof donorLoginSchema>;
export type DonorSignup = z.infer<typeof donorSignupSchema>;

// Donation categories
export const donationCategories = [
  "health",
  "education", 
  "food",
  "clothing",
  "general"
] as const;

export type DonationCategory = typeof donationCategories[number];

// Donations table
export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donorId: varchar("donor_id"), // Optional link to registered donor
  donorName: text("donor_name"),
  email: text("email"),
  amount: integer("amount").notNull(),
  category: text("category").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  paymentMethod: text("payment_method").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  recurringInterval: text("recurring_interval"), // 'monthly', 'quarterly', 'yearly'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  donorIdIdx: index("donations_donor_id_idx").on(table.donorId),
}));

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

// Programs table
export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
});

export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;

// Impact stories table
export const impactStories = pgTable("impact_stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  childName: text("child_name"),
  childAge: integer("child_age"),
  imageUrl: text("image_url"),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertImpactStorySchema = createInsertSchema(impactStories).omit({
  id: true,
  createdAt: true,
});

export type InsertImpactStory = z.infer<typeof insertImpactStorySchema>;
export type ImpactStory = typeof impactStories.$inferSelect;

// Newsletter subscribers table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  source: text("source").default("footer"),
  isActive: boolean("is_active").default(true),
  mailerliteId: text("mailerlite_id"),
  mailerliteSynced: boolean("mailerlite_synced").default(false),
  mailerliteSyncedAt: timestamp("mailerlite_synced_at"),
  mailerliteError: text("mailerlite_error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  createdAt: true,
});

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Statistics type (not a table, calculated from data)
export interface Statistics {
  totalDonations: number;
  childrenSupported: number;
  mealsProvided: number;
  studentsEducated: number;
  medicalTreatments: number;
}

// Category info for display
export interface CategoryInfo {
  id: DonationCategory;
  title: string;
  description: string;
  icon: string;
}

export const categoryInfoList: CategoryInfo[] = [
  {
    id: "health",
    title: "Healthcare & Medical",
    description: "Provide medical treatments, check-ups, and essential healthcare services for orphaned children.",
    icon: "Heart"
  },
  {
    id: "education",
    title: "Education & Learning",
    description: "Support education, Quran learning, and skill development programs for a brighter future.",
    icon: "GraduationCap"
  },
  {
    id: "food",
    title: "Food & Nutrition",
    description: "Ensure nutritious meals and proper dietary support for growing children.",
    icon: "Utensils"
  },
  {
    id: "clothing",
    title: "Clothing & Daily Needs",
    description: "Provide clean clothes, shoes, and essential daily necessities for comfort and dignity.",
    icon: "Shirt"
  },
  {
    id: "general",
    title: "General Donation",
    description: "Support where it's needed most - shelter, utilities, staff, and emergency needs.",
    icon: "HandHeart"
  }
];

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("unread"), // 'unread', 'read', 'resolved'
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
  resolvedAt: timestamp("resolved_at"),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
  readAt: true,
  resolvedAt: true,
  adminNotes: true,
  status: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  eventType: text("event_type").default("general"), // 'general', 'fundraiser', 'volunteer', 'religious'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.union([
    z.date(),
    z.string().transform((val) => new Date(val))
  ]),
  endDate: z.union([
    z.date(),
    z.string().transform((val) => new Date(val)),
    z.null(),
    z.undefined()
  ]).optional(),
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Event Donations table - track donations to specific events
export const eventDonations = pgTable("event_donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  donorId: varchar("donor_id"), // Optional link to registered donor
  donorName: text("donor_name").notNull(),
  donorEmail: text("donor_email").notNull(),
  donorPhone: text("donor_phone"),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method").default("bank"),
  paymentStatus: text("payment_status").default("pending"),
  attendanceStatus: text("attendance_status").default("attending"), // "attending", "not_attending", "maybe"
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeReceiptUrl: text("stripe_receipt_url"),
  localReceiptNumber: text("local_receipt_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  donorIdIdx: index("event_donations_donor_id_idx").on(table.donorId),
  eventIdIdx: index("event_donations_event_id_idx").on(table.eventId),
}));

export const insertEventDonationSchema = createInsertSchema(eventDonations).omit({
  id: true,
  createdAt: true,
});

export type InsertEventDonation = z.infer<typeof insertEventDonationSchema>;
export type EventDonation = typeof eventDonations.$inferSelect;

// Volunteers table
export const volunteers = pgTable("volunteers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city"),
  skills: text("skills"), // Comma-separated skills
  availability: text("availability"), // 'weekdays', 'weekends', 'flexible'
  message: text("message"),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVolunteerSchema = createInsertSchema(volunteers).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type Volunteer = typeof volunteers.$inferSelect;

// Children available for sponsorship
export const children = pgTable("children", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // 'male' or 'female'
  grade: text("grade"),
  story: text("story"),
  needs: text("needs"),
  imageUrl: text("image_url"),
  monthlyAmount: integer("monthly_amount").default(5000), // PKR per month
  isSponsored: boolean("is_sponsored").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChildSchema = createInsertSchema(children).omit({
  id: true,
  createdAt: true,
});

export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof children.$inferSelect;

// Sponsorship records
export const sponsorships = pgTable("sponsorships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull(),
  donorId: varchar("donor_id"), // Optional link to registered donor
  sponsorName: text("sponsor_name").notNull(),
  sponsorEmail: text("sponsor_email").notNull(),
  sponsorPhone: text("sponsor_phone"),
  monthlyAmount: integer("monthly_amount").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  status: text("status").default("active"), // 'active', 'paused', 'ended'
  paymentMethod: text("payment_method").default("bank"),
  paymentStatus: text("payment_status").default("pending"), // 'pending', 'completed', 'failed'
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeReceiptUrl: text("stripe_receipt_url"),
  localReceiptNumber: text("local_receipt_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  donorIdIdx: index("sponsorships_donor_id_idx").on(table.donorId),
  childIdIdx: index("sponsorships_child_id_idx").on(table.childId),
  statusIdx: index("sponsorships_status_idx").on(table.status),
}));

export const insertSponsorshipSchema = createInsertSchema(sponsorships).omit({
  id: true,
  createdAt: true,
});

export type InsertSponsorship = z.infer<typeof insertSponsorshipSchema>;
export type Sponsorship = typeof sponsorships.$inferSelect;
