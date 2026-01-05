import { 
  type AdminUser, 
  type InsertAdminUser, 
  type Donation, 
  type InsertDonation,
  type Program,
  type InsertProgram,
  type ImpactStory,
  type InsertImpactStory,
  type Statistics,
  categoryInfoList
} from "@shared/schema";
import { randomUUID, createHash } from "crypto";

// Hash password utility
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export interface IStorage {
  // Admin Users
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  
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
}

export class MemStorage implements IStorage {
  private adminUsers: Map<string, AdminUser>;
  private donations: Map<string, Donation>;
  private programs: Map<string, Program>;
  private impactStories: Map<string, ImpactStory>;

  constructor() {
    this.adminUsers = new Map();
    this.donations = new Map();
    this.programs = new Map();
    this.impactStories = new Map();
    
    this.seedData();
  }

  private seedData() {
    // Create admin user with hashed password
    const adminId = randomUUID();
    this.adminUsers.set(adminId, {
      id: adminId,
      username: "admin",
      password: hashPassword("admin123"), // Store hashed password
    });

    // Seed programs
    const programsData: InsertProgram[] = [
      {
        title: "Orphan Care Program",
        description: "Comprehensive care for orphaned children including shelter, food, clothing, and emotional support.",
        category: "general",
        imageUrl: null,
        isActive: true,
      },
      {
        title: "Education & Quran Learning",
        description: "Quality education from primary to higher levels, combined with Islamic studies and Quran memorization.",
        category: "education",
        imageUrl: null,
        isActive: true,
      },
      {
        title: "Healthcare & Medical Support",
        description: "Regular health checkups, vaccinations, and medical treatments for all children.",
        category: "health",
        imageUrl: null,
        isActive: true,
      },
      {
        title: "Food & Nutrition",
        description: "Balanced, nutritious meals prepared with care to ensure proper growth and development.",
        category: "food",
        imageUrl: null,
        isActive: true,
      },
      {
        title: "Clothing & Daily Needs",
        description: "Quality clothing, school uniforms, and all essential daily necessities for comfortable living.",
        category: "clothing",
        imageUrl: null,
        isActive: true,
      },
    ];

    programsData.forEach(program => {
      const id = randomUUID();
      this.programs.set(id, { id, ...program });
    });

    // Seed impact stories
    const storiesData: InsertImpactStory[] = [
      {
        title: "A New Beginning for Ahmed",
        content: "Ahmed came to Aghosh at age 6 after losing both parents. Today, he excels in his studies and dreams of becoming a doctor to help others. With your support, Ahmed received proper nutrition, quality education, and the love of a caring family. He is now one of the top students in his class and participates actively in sports and Quran recitation competitions.",
        childName: "Ahmed",
        childAge: 12,
        imageUrl: null,
        isPublished: true,
      },
      {
        title: "Fatima's Journey to Success",
        content: "Fatima arrived at the orphanage malnourished and withdrawn. Through dedicated care, nutritious meals, and education, she has blossomed into a confident young girl who loves to help others. She now teaches younger children how to read and dreams of becoming a teacher herself.",
        childName: "Fatima",
        childAge: 10,
        imageUrl: null,
        isPublished: true,
      },
      {
        title: "Ibrahim Finds His Voice",
        content: "When Ibrahim first came to us, he barely spoke. Through patient care, counseling, and the support of his new family at Aghosh, he has become an outgoing child who loves to recite the Quran. His beautiful voice now leads the morning prayers.",
        childName: "Ibrahim",
        childAge: 8,
        imageUrl: null,
        isPublished: true,
      },
    ];

    storiesData.forEach(story => {
      const id = randomUUID();
      this.impactStories.set(id, { 
        id, 
        ...story, 
        createdAt: new Date() 
      });
    });

    // Seed some sample donations
    const sampleDonations: InsertDonation[] = [
      { donorName: "Muhammad Ali", email: "ali@example.com", amount: 100, category: "education", isAnonymous: false, paymentMethod: "card" },
      { donorName: null, email: null, amount: 250, category: "health", isAnonymous: true, paymentMethod: "bank" },
      { donorName: "Sarah Khan", email: "sarah@example.com", amount: 50, category: "food", isAnonymous: false, paymentMethod: "card" },
      { donorName: "Ahmed Hassan", email: "ahmed@example.com", amount: 500, category: "general", isAnonymous: false, paymentMethod: "wallet" },
      { donorName: null, email: null, amount: 75, category: "clothing", isAnonymous: true, paymentMethod: "card" },
    ];

    sampleDonations.forEach((donation, index) => {
      const id = randomUUID();
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - index);
      this.donations.set(id, { id, ...donation, createdAt });
    });
  }

  // Admin User methods
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(
      (user) => user.username === username,
    );
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const user: AdminUser = { 
      ...insertUser, 
      id,
      password: hashPassword(insertUser.password) // Hash password on creation
    };
    this.adminUsers.set(id, user);
    return user;
  }

  // Donation methods
  async getDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values()).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getDonation(id: string): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const id = randomUUID();
    const newDonation: Donation = { 
      id, 
      ...donation, 
      createdAt: new Date() 
    };
    this.donations.set(id, newDonation);
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
    const id = randomUUID();
    const newProgram: Program = { id, ...program };
    this.programs.set(id, newProgram);
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
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getImpactStory(id: string): Promise<ImpactStory | undefined> {
    return this.impactStories.get(id);
  }

  async createImpactStory(story: InsertImpactStory): Promise<ImpactStory> {
    const id = randomUUID();
    const newStory: ImpactStory = { 
      id, 
      ...story, 
      isPublished: story.isPublished ?? true,
      createdAt: new Date() 
    };
    this.impactStories.set(id, newStory);
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
    const donations = Array.from(this.donations.values());
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    
    return {
      totalDonations,
      childrenSupported: 527,
      mealsProvided: 52400,
      studentsEducated: 312,
      medicalTreatments: 1850,
    };
  }
}

export const storage = new MemStorage();
