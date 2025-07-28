import { riskAssessments, type RiskAssessment, type InsertRiskAssessment } from "@shared/schema";
import { riskRegistry, type RiskRegistry, type InsertRiskRegistry } from "@shared/schema";
import { registryAssessments, type RegistryAssessment, type InsertRegistryAssessment } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  getRiskAssessmentById(id: number): Promise<RiskAssessment | undefined>;
  getAllRiskAssessments(): Promise<RiskAssessment[]>;
  createRiskRegistry(registry: InsertRiskRegistry): Promise<RiskRegistry>;
  getRiskRegistryById(id: number): Promise<RiskRegistry | undefined>;
  getAllRiskRegistry(): Promise<RiskRegistry[]>;
  updateRiskRegistry(id: number, registry: Partial<InsertRiskRegistry>): Promise<RiskRegistry>;
  deleteRiskRegistry(id: number): Promise<void>;
  createRegistryAssessment(assessment: InsertRegistryAssessment): Promise<RegistryAssessment>;
  getRegistryAssessmentById(id: number): Promise<RegistryAssessment | undefined>;
  getAllRegistryAssessments(): Promise<RegistryAssessment[]>;
  getRegistryAssessmentsByRiskId(riskId: number): Promise<RegistryAssessment[]>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createRiskAssessment(insertAssessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const [assessment] = await db
      .insert(riskAssessments)
      .values(insertAssessment)
      .returning();
    return assessment;
  }

  async getRiskAssessmentById(id: number): Promise<RiskAssessment | undefined> {
    const [assessment] = await db.select().from(riskAssessments).where(eq(riskAssessments.id, id));
    return assessment || undefined;
  }

  async getAllRiskAssessments(): Promise<RiskAssessment[]> {
    return await db.select().from(riskAssessments);
  }

  async createRiskRegistry(insertRegistry: InsertRiskRegistry): Promise<RiskRegistry> {
    const [registry] = await db
      .insert(riskRegistry)
      .values(insertRegistry)
      .returning();
    return registry;
  }

  async getRiskRegistryById(id: number): Promise<RiskRegistry | undefined> {
    const [registry] = await db.select().from(riskRegistry).where(eq(riskRegistry.id, id));
    return registry || undefined;
  }

  async getAllRiskRegistry(): Promise<RiskRegistry[]> {
    return await db.select().from(riskRegistry);
  }

  async updateRiskRegistry(id: number, updateData: Partial<InsertRiskRegistry>): Promise<RiskRegistry> {
    const [registry] = await db
      .update(riskRegistry)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(riskRegistry.id, id))
      .returning();
    return registry;
  }

  async deleteRiskRegistry(id: number): Promise<void> {
    await db.delete(riskRegistry).where(eq(riskRegistry.id, id));
  }

  async createRegistryAssessment(insertAssessment: InsertRegistryAssessment): Promise<RegistryAssessment> {
    const [assessment] = await db
      .insert(registryAssessments)
      .values(insertAssessment)
      .returning();
    return assessment;
  }

  async getRegistryAssessmentById(id: number): Promise<RegistryAssessment | undefined> {
    const [assessment] = await db.select().from(registryAssessments).where(eq(registryAssessments.id, id));
    return assessment || undefined;
  }

  async getAllRegistryAssessments(): Promise<RegistryAssessment[]> {
    return await db.select().from(registryAssessments);
  }

  async getRegistryAssessmentsByRiskId(riskId: number): Promise<RegistryAssessment[]> {
    return await db.select().from(registryAssessments).where(eq(registryAssessments.riskRegistryId, riskId));
  }
}

export const storage = new DatabaseStorage();
