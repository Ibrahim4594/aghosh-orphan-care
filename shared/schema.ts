import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
  donorName: text("donor_name"),
  email: text("email"),
  amount: integer("amount").notNull(),
  category: text("category").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

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
