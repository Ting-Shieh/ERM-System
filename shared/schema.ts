import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  acknowledgement: boolean("acknowledgement").notNull().default(false),
  
  // Strategic Risk assessments
  competitionImpact: integer("competition_impact"),
  competitionLikelihood: integer("competition_likelihood"),
  marketDemandImpact: integer("market_demand_impact"),
  marketDemandLikelihood: integer("market_demand_likelihood"),
  
  // Operational Risk assessments
  rawMaterialImpact: integer("raw_material_impact"),
  rawMaterialLikelihood: integer("raw_material_likelihood"),
  materialShortageImpact: integer("material_shortage_impact"),
  materialShortageLikelihood: integer("material_shortage_likelihood"),
  newProductDevelopmentImpact: integer("new_product_development_impact"),
  newProductDevelopmentLikelihood: integer("new_product_development_likelihood"),
  
  // Financial Risk assessments
  creditImpact: integer("credit_impact"),
  creditLikelihood: integer("credit_likelihood"),
  currencyImpact: integer("currency_impact"),
  currencyLikelihood: integer("currency_likelihood"),
  fundingCostImpact: integer("funding_cost_impact"),
  fundingCostLikelihood: integer("funding_cost_likelihood"),
  
  // Emerging Risk assessments
  geopoliticalConflictImpact: integer("geopolitical_conflict_impact"),
  geopoliticalConflictLikelihood: integer("geopolitical_conflict_likelihood"),
  technologyColdWarImpact: integer("technology_cold_war_impact"),
  technologyColdWarLikelihood: integer("technology_cold_war_likelihood"),
  aiTransformationImpact: integer("ai_transformation_impact"),
  aiTransformationLikelihood: integer("ai_transformation_likelihood"),
  carbonPricingImpact: integer("carbon_pricing_impact"),
  carbonPricingLikelihood: integer("carbon_pricing_likelihood"),
  
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  submittedAt: true,
}).extend({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  department: z.string().min(1, "Department is required"),
  acknowledgement: z.boolean().refine(val => val === true, "You must acknowledge the terms"),
  // Strategic Risk
  competitionImpact: z.number().min(1).max(5).optional(),
  competitionLikelihood: z.number().min(1).max(5).optional(),
  marketDemandImpact: z.number().min(1).max(5).optional(),
  marketDemandLikelihood: z.number().min(1).max(5).optional(),
  // Operational Risk
  rawMaterialImpact: z.number().min(1).max(5).optional(),
  rawMaterialLikelihood: z.number().min(1).max(5).optional(),
  materialShortageImpact: z.number().min(1).max(5).optional(),
  materialShortageLikelihood: z.number().min(1).max(5).optional(),
  newProductDevelopmentImpact: z.number().min(1).max(5).optional(),
  newProductDevelopmentLikelihood: z.number().min(1).max(5).optional(),
  // Financial Risk
  creditImpact: z.number().min(1).max(5).optional(),
  creditLikelihood: z.number().min(1).max(5).optional(),
  currencyImpact: z.number().min(1).max(5).optional(),
  currencyLikelihood: z.number().min(1).max(5).optional(),
  fundingCostImpact: z.number().min(1).max(5).optional(),
  fundingCostLikelihood: z.number().min(1).max(5).optional(),
  // Emerging Risk
  geopoliticalConflictImpact: z.number().min(1).max(5).optional(),
  geopoliticalConflictLikelihood: z.number().min(1).max(5).optional(),
  technologyColdWarImpact: z.number().min(1).max(5).optional(),
  technologyColdWarLikelihood: z.number().min(1).max(5).optional(),
  aiTransformationImpact: z.number().min(1).max(5).optional(),
  aiTransformationLikelihood: z.number().min(1).max(5).optional(),
  carbonPricingImpact: z.number().min(1).max(5).optional(),
  carbonPricingLikelihood: z.number().min(1).max(5).optional(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const riskRegistry = pgTable("risk_registry", {
  id: serial("id").primaryKey(),
  
  // Strategic Information
  strategicObjective: text("strategic_objective").notNull(),
  subObjective: text("sub_objective").notNull(),
  responsibleDepartment: text("responsible_department").notNull(),
  riskOwner: text("risk_owner").notNull(),
  operationalTarget: text("operational_target").notNull(),
  seedMember: text("seed_member").notNull(),
  
  // Risk Classification
  riskCategory: text("risk_category").notNull(),
  level1Index: text("level1_index").notNull(),
  riskEventSource: text("risk_event_source").notNull(),
  level2Index: text("level2_index").notNull(),
  riskScenario: text("risk_scenario").notNull(),
  
  // Current Risk Management
  existingMeasures: text("existing_measures").notNull(),
  warningIndicator: text("warning_indicator"),
  actionIndicator: text("action_indicator"),
  stakeholders: text("stakeholders"),
  
  // Risk Assessment - Unit Level
  unitPossibility: integer("unit_possibility"),
  unitImpact: integer("unit_impact"),
  unitRiskLevel: integer("unit_risk_level"),
  
  // Risk Assessment - Responsible Unit Level  
  responsiblePossibility: integer("responsible_possibility"),
  responsibleImpact: integer("responsible_impact"),
  responsibleRiskLevel: integer("responsible_risk_level"),
  
  // Risk Response
  responseStrategy: text("response_strategy"), // 降低/移轉/接受/拒絕
  newRiskMeasures: text("new_risk_measures"),
  responsibleUnit: text("responsible_unit"),
  newWarningIndicator: text("new_warning_indicator"),
  newActionIndicator: text("new_action_indicator"),
  
  // Optimization
  optimizationSuggestion: text("optimization_suggestion"),
  notes: text("notes"),
  weightedRiskLevel: decimal("weighted_risk_level", { precision: 10, scale: 2 }),
  assessmentOptimization: text("assessment_optimization"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertRiskRegistrySchema = createInsertSchema(riskRegistry).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  strategicObjective: z.string().min(1, "Strategic objective is required"),
  subObjective: z.string().min(1, "Sub objective is required"),
  responsibleDepartment: z.string().min(1, "Responsible department is required"),
  riskOwner: z.string().min(1, "Risk owner is required"),
  operationalTarget: z.string().min(1, "Operational target is required"),
  seedMember: z.string().min(1, "Seed member is required"),
  riskCategory: z.string().min(1, "Risk category is required"),
  level1Index: z.string().min(1, "Level 1 index is required"),
  riskEventSource: z.string().min(1, "Risk event source is required"),
  level2Index: z.string().min(1, "Level 2 index is required"),
  riskScenario: z.string().min(1, "Risk scenario is required"),
  existingMeasures: z.string().min(1, "Existing measures are required"),
  unitPossibility: z.number().min(1).max(5).optional(),
  unitImpact: z.number().min(1).max(5).optional(),
  unitRiskLevel: z.number().min(1).max(25).optional(),
  responsiblePossibility: z.number().min(1).max(5).optional(),
  responsibleImpact: z.number().min(1).max(5).optional(),
  responsibleRiskLevel: z.number().min(1).max(25).optional(),
});

export const registryAssessments = pgTable("registry_assessments", {
  id: serial("id").primaryKey(),
  riskRegistryId: integer("risk_registry_id").notNull(),
  
  // Assessor Information
  assessorEmail: text("assessor_email").notNull(),
  assessorName: text("assessor_name").notNull(),
  assessorDepartment: text("assessor_department").notNull(),
  
  // Current Risk Assessment
  currentImpact: integer("current_impact").notNull(),
  currentLikelihood: integer("current_likelihood").notNull(),
  riskLevel: integer("risk_level").notNull(),
  
  // Target Risk Assessment (Optional)
  targetImpact: integer("target_impact"),
  targetLikelihood: integer("target_likelihood"),
  targetRiskLevel: integer("target_risk_level"),
  
  // Additional Information
  assessmentNotes: text("assessment_notes"),
  mitigationActions: text("mitigation_actions"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertRegistryAssessmentSchema = createInsertSchema(registryAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  assessorEmail: z.string().email("Invalid email format"),
  assessorName: z.string().min(1, "Name is required"),
  assessorDepartment: z.string().min(1, "Department is required"),
  currentImpact: z.number().min(1).max(5),
  currentLikelihood: z.number().min(1).max(5),
  riskLevel: z.number().min(1).max(25),
  targetImpact: z.number().min(1).max(5).optional(),
  targetLikelihood: z.number().min(1).max(5).optional(),
  targetRiskLevel: z.number().min(1).max(25).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskRegistry = z.infer<typeof insertRiskRegistrySchema>;
export type RiskRegistry = typeof riskRegistry.$inferSelect;
export type InsertRegistryAssessment = z.infer<typeof insertRegistryAssessmentSchema>;
export type RegistryAssessment = typeof registryAssessments.$inferSelect;
