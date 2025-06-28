import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("Project Manager"),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("active"), // active, inactive, lead
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  clientId: integer("client_id").references(() => clients.id),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, overdue
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const followUps = pgTable("follow_ups", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  title: text("title").notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  type: text("type").notNull().default("call"), // call, email, meeting, reminder
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled, overdue
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  type: text("type").notNull(), // call, email, meeting, note
  content: text("content").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const crmIntegrations = pgTable("crm_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // salesforce, hubspot, pipedrive
  apiKey: text("api_key"),
  isConnected: boolean("is_connected").notNull().default(false),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFollowUpSchema = createInsertSchema(followUps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({
  id: true,
  createdAt: true,
});

export const insertCrmIntegrationSchema = createInsertSchema(crmIntegrations).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;
export type FollowUp = typeof followUps.$inferSelect;

export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Interaction = typeof interactions.$inferSelect;

export type InsertCrmIntegration = z.infer<typeof insertCrmIntegrationSchema>;
export type CrmIntegration = typeof crmIntegrations.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
