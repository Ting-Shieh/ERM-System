import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRiskAssessmentSchema, insertRiskRegistrySchema, insertRegistryAssessmentSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { strategicObjectives, subStrategicObjectives, riskCategories, strategicRiskMappings } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create risk assessment
  app.post("/api/risk-assessments", async (req, res) => {
    try {
      const validatedData = insertRiskAssessmentSchema.parse(req.body);
      const assessment = await storage.createRiskAssessment(validatedData);
      res.json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Internal server error" 
        });
      }
    }
  });

  // Get all risk assessments
  app.get("/api/risk-assessments", async (req, res) => {
    try {
      const assessments = await storage.getAllRiskAssessments();
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Get risk assessment by ID
  app.get("/api/risk-assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getRiskAssessmentById(id);
      
      if (!assessment) {
        res.status(404).json({ 
          message: "Risk assessment not found" 
        });
        return;
      }
      
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Risk Registry API Routes
  
  // Create risk registry entry
  app.post("/api/risk-registry", async (req, res) => {
    try {
      const validatedData = insertRiskRegistrySchema.parse(req.body);
      const registry = await storage.createRiskRegistry(validatedData);
      res.json(registry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Internal server error" 
        });
      }
    }
  });

  // Get all risk registry entries
  app.get("/api/risk-registry", async (req, res) => {
    try {
      const registries = await storage.getAllRiskRegistry();
      res.json(registries);
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Get risk registry entry by ID
  app.get("/api/risk-registry/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const registry = await storage.getRiskRegistryById(id);
      
      if (!registry) {
        res.status(404).json({ 
          message: "Risk registry entry not found" 
        });
        return;
      }
      
      res.json(registry);
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Update risk registry entry
  app.put("/api/risk-registry/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertRiskRegistrySchema.partial().parse(req.body);
      const registry = await storage.updateRiskRegistry(id, updateData);
      res.json(registry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Internal server error" 
        });
      }
    }
  });

  // Delete risk registry entry
  app.delete("/api/risk-registry/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRiskRegistry(id);
      res.json({ message: "Risk registry entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Registry Assessment API Routes
  
  // Create registry assessment
  app.post("/api/registry-assessments", async (req, res) => {
    try {
      const validatedData = insertRegistryAssessmentSchema.parse(req.body);
      const assessment = await storage.createRegistryAssessment(validatedData);
      res.json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Internal server error" 
        });
      }
    }
  });

  // Get all registry assessments
  app.get("/api/registry-assessments", async (req, res) => {
    try {
      const assessments = await storage.getAllRegistryAssessments();
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Get registry assessment by ID
  app.get("/api/registry-assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getRegistryAssessmentById(id);
      
      if (!assessment) {
        res.status(404).json({ 
          message: "Registry assessment not found" 
        });
        return;
      }
      
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Get registry assessments by risk ID
  app.get("/api/registry-assessments/risk/:riskId", async (req, res) => {
    try {
      const riskId = parseInt(req.params.riskId);
      const assessments = await storage.getRegistryAssessmentsByRiskId(riskId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Strategic Objectives API Routes
  
  // Get strategic objectives
  app.get("/api/strategic-objectives", async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const objectives = await db
        .select()
        .from(strategicObjectives)
        .where(eq(strategicObjectives.year, year))
        .where(eq(strategicObjectives.isActive, true))
        .orderBy(strategicObjectives.name);
      
      res.json(objectives);
    } catch (error) {
      console.error('Error fetching strategic objectives:', error);
      res.status(500).json({ error: 'Failed to fetch strategic objectives' });
    }
  });

  // Create strategic objective
  app.post("/api/strategic-objectives", async (req, res) => {
    try {
      const { name, leader } = req.body;
      const year = new Date().getFullYear();
      
      if (!name || !leader) {
        return res.status(400).json({ error: 'Name and leader are required' });
      }
      
      const [newObjective] = await db
        .insert(strategicObjectives)
        .values({ name, leader, year })
        .returning();
      
      res.json(newObjective);
    } catch (error) {
      console.error('Error creating strategic objective:', error);
      res.status(500).json({ error: 'Failed to create strategic objective' });
    }
  });

  // Get sub strategic objectives
  app.get("/api/sub-strategic-objectives/:strategicObjectiveId", async (req, res) => {
    try {
      const { strategicObjectiveId } = req.params;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const subObjectives = await db
        .select()
        .from(subStrategicObjectives)
        .where(eq(subStrategicObjectives.strategicObjectiveId, parseInt(strategicObjectiveId)))
        .where(eq(subStrategicObjectives.year, year))
        .where(eq(subStrategicObjectives.isActive, true))
        .orderBy(subStrategicObjectives.name);
      
      res.json(subObjectives);
    } catch (error) {
      console.error('Error fetching sub objectives:', error);
      res.status(500).json({ error: 'Failed to fetch sub objectives' });
    }
  });

  // Create sub strategic objective
  app.post("/api/sub-strategic-objectives", async (req, res) => {
    try {
      const { strategicObjectiveId, name } = req.body;
      const year = new Date().getFullYear();
      
      if (!strategicObjectiveId || !name) {
        return res.status(400).json({ error: 'Strategic objective ID and name are required' });
      }
      
      const [newSubObjective] = await db
        .insert(subStrategicObjectives)
        .values({ strategicObjectiveId: parseInt(strategicObjectiveId), name, year })
        .returning();
      
      res.json(newSubObjective);
    } catch (error) {
      console.error('Error creating sub objective:', error);
      res.status(500).json({ error: 'Failed to create sub objective' });
    }
  });

  // Get risk categories
  app.get("/api/risk-categories", async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const categories = await db
        .select()
        .from(riskCategories)
        .where(eq(riskCategories.year, year))
        .where(eq(riskCategories.isActive, true))
        .orderBy(riskCategories.name);
      
      res.json(categories);
    } catch (error) {
      console.error('Error fetching risk categories:', error);
      res.status(500).json({ error: 'Failed to fetch risk categories' });
    }
  });

  // Create risk category
  app.post("/api/risk-categories", async (req, res) => {
    try {
      const { name, description } = req.body;
      const year = new Date().getFullYear();
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const [newCategory] = await db
        .insert(riskCategories)
        .values({ name, description, year })
        .returning();
      
      res.json(newCategory);
    } catch (error) {
      console.error('Error creating risk category:', error);
      res.status(500).json({ error: 'Failed to create risk category' });
    }
  });

  // Strategic Risk Mappings API Routes
  
  // Get risk categories for specific strategic objective and sub objective
  app.get("/api/strategic-mappings/:strategicObjectiveId/:subObjectiveId", async (req, res) => {
    try {
      const { strategicObjectiveId, subObjectiveId } = req.params;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const mappings = await db
        .select({
          riskCategoryId: strategicRiskMappings.riskCategoryId,
          riskCategoryName: riskCategories.name,
          riskCategoryDescription: riskCategories.description
        })
        .from(strategicRiskMappings)
        .innerJoin(riskCategories, eq(strategicRiskMappings.riskCategoryId, riskCategories.id))
        .where(eq(strategicRiskMappings.strategicObjectiveId, parseInt(strategicObjectiveId)))
        .where(eq(strategicRiskMappings.subStrategicObjectiveId, parseInt(subObjectiveId)))
        .where(eq(strategicRiskMappings.year, year))
        .where(eq(strategicRiskMappings.isActive, true));
      
      res.json(mappings);
    } catch (error) {
      console.error('Error fetching strategic mappings:', error);
      res.status(500).json({ error: 'Failed to fetch strategic mappings' });
    }
  });

  // Create strategic risk mapping
  app.post("/api/strategic-mappings", async (req, res) => {
    try {
      const { strategicObjectiveId, subStrategicObjectiveId, riskCategoryId } = req.body;
      const year = new Date().getFullYear();
      
      if (!strategicObjectiveId || !subStrategicObjectiveId || !riskCategoryId) {
        return res.status(400).json({ error: 'All IDs are required' });
      }
      
      const [newMapping] = await db
        .insert(strategicRiskMappings)
        .values({ 
          strategicObjectiveId: parseInt(strategicObjectiveId), 
          subStrategicObjectiveId: parseInt(subStrategicObjectiveId), 
          riskCategoryId: parseInt(riskCategoryId), 
          year 
        })
        .returning();
      
      res.json(newMapping);
    } catch (error) {
      console.error('Error creating strategic mapping:', error);
      res.status(500).json({ error: 'Failed to create strategic mapping' });
    }
  });

  // Get all mappings for a specific year
  app.get("/api/strategic-mappings", async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const mappings = await db
        .select({
          id: strategicRiskMappings.id,
          strategicObjectiveId: strategicRiskMappings.strategicObjectiveId,
          strategicObjectiveName: strategicObjectives.name,
          subStrategicObjectiveId: strategicRiskMappings.subStrategicObjectiveId,
          subStrategicObjectiveName: subStrategicObjectives.name,
          riskCategoryId: strategicRiskMappings.riskCategoryId,
          riskCategoryName: riskCategories.name,
          year: strategicRiskMappings.year
        })
        .from(strategicRiskMappings)
        .innerJoin(strategicObjectives, eq(strategicRiskMappings.strategicObjectiveId, strategicObjectives.id))
        .innerJoin(subStrategicObjectives, eq(strategicRiskMappings.subStrategicObjectiveId, subStrategicObjectives.id))
        .innerJoin(riskCategories, eq(strategicRiskMappings.riskCategoryId, riskCategories.id))
        .where(eq(strategicRiskMappings.year, year))
        .where(eq(strategicRiskMappings.isActive, true))
        .orderBy(strategicObjectives.name, subStrategicObjectives.name);
      
      res.json(mappings);
    } catch (error) {
      console.error('Error fetching all mappings:', error);
      res.status(500).json({ error: 'Failed to fetch mappings' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
