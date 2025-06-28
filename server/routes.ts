import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, insertTaskSchema, insertFollowUpSchema, 
  insertInteractionSchema, insertCrmIntegrationSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const { search, status } = req.query;
      let clients;
      
      if (search) {
        clients = await storage.searchClients(search as string);
      } else if (status) {
        clients = await storage.getClientsByStatus(status as string);
      } else {
        clients = await storage.getAllClients();
      }
      
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(parseInt(req.params.id));
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data", error });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data", error });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const { clientId, status } = req.query;
      let tasks;
      
      if (clientId) {
        tasks = await storage.getTasksByClient(parseInt(clientId as string));
      } else if (status) {
        tasks = await storage.getTasksByStatus(status as string);
      } else {
        tasks = await storage.getAllTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/overdue", async (req, res) => {
    try {
      const tasks = await storage.getOverdueTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overdue tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data", error });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, validatedData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data", error });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Follow-up routes
  app.get("/api/followups", async (req, res) => {
    try {
      const { clientId, upcoming } = req.query;
      let followUps;
      
      if (clientId) {
        followUps = await storage.getFollowUpsByClient(parseInt(clientId as string));
      } else if (upcoming === 'true') {
        followUps = await storage.getUpcomingFollowUps();
      } else {
        followUps = await storage.getAllFollowUps();
      }
      
      res.json(followUps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch follow-ups" });
    }
  });

  app.get("/api/followups/overdue", async (req, res) => {
    try {
      const followUps = await storage.getOverdueFollowUps();
      res.json(followUps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overdue follow-ups" });
    }
  });

  app.post("/api/followups", async (req, res) => {
    try {
      const validatedData = insertFollowUpSchema.parse(req.body);
      const followUp = await storage.createFollowUp(validatedData);
      res.status(201).json(followUp);
    } catch (error) {
      res.status(400).json({ message: "Invalid follow-up data", error });
    }
  });

  app.patch("/api/followups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFollowUpSchema.partial().parse(req.body);
      const followUp = await storage.updateFollowUp(id, validatedData);
      if (!followUp) {
        return res.status(404).json({ message: "Follow-up not found" });
      }
      res.json(followUp);
    } catch (error) {
      res.status(400).json({ message: "Invalid follow-up data", error });
    }
  });

  app.delete("/api/followups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFollowUp(id);
      if (!deleted) {
        return res.status(404).json({ message: "Follow-up not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete follow-up" });
    }
  });

  // Interaction routes
  app.get("/api/interactions", async (req, res) => {
    try {
      const { clientId } = req.query;
      let interactions;
      
      if (clientId) {
        interactions = await storage.getInteractionsByClient(parseInt(clientId as string));
      } else {
        interactions = await storage.getAllInteractions();
      }
      
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });

  app.post("/api/interactions", async (req, res) => {
    try {
      const validatedData = insertInteractionSchema.parse(req.body);
      const interaction = await storage.createInteraction(validatedData);
      res.status(201).json(interaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid interaction data", error });
    }
  });

  // CRM Integration routes
  app.get("/api/integrations", async (req, res) => {
    try {
      const integrations = await storage.getAllCrmIntegrations();
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.post("/api/integrations", async (req, res) => {
    try {
      const validatedData = insertCrmIntegrationSchema.parse(req.body);
      const integration = await storage.createCrmIntegration(validatedData);
      res.status(201).json(integration);
    } catch (error) {
      res.status(400).json({ message: "Invalid integration data", error });
    }
  });

  app.patch("/api/integrations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCrmIntegrationSchema.partial().parse(req.body);
      const integration = await storage.updateCrmIntegration(id, validatedData);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      res.json(integration);
    } catch (error) {
      res.status(400).json({ message: "Invalid integration data", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
