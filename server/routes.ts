import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRiskAssessmentSchema, insertRiskRegistrySchema, insertRegistryAssessmentSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
