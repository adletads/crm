import { 
  users, clients, tasks, followUps, interactions, crmIntegrations,
  type User, type InsertUser, type Client, type InsertClient,
  type Task, type InsertTask, type FollowUp, type InsertFollowUp,
  type Interaction, type InsertInteraction, type CrmIntegration, type InsertCrmIntegration
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Clients
  getAllClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientsByStatus(status: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  searchClients(query: string): Promise<Client[]>;
  
  // Tasks
  getAllTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByClient(clientId: number): Promise<Task[]>;
  getTasksByStatus(status: string): Promise<Task[]>;
  getOverdueTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Follow-ups
  getAllFollowUps(): Promise<FollowUp[]>;
  getFollowUp(id: number): Promise<FollowUp | undefined>;
  getFollowUpsByClient(clientId: number): Promise<FollowUp[]>;
  getUpcomingFollowUps(): Promise<FollowUp[]>;
  getOverdueFollowUps(): Promise<FollowUp[]>;
  createFollowUp(followUp: InsertFollowUp): Promise<FollowUp>;
  updateFollowUp(id: number, followUp: Partial<InsertFollowUp>): Promise<FollowUp | undefined>;
  deleteFollowUp(id: number): Promise<boolean>;
  
  // Interactions
  getAllInteractions(): Promise<Interaction[]>;
  getInteraction(id: number): Promise<Interaction | undefined>;
  getInteractionsByClient(clientId: number): Promise<Interaction[]>;
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  deleteInteraction(id: number): Promise<boolean>;
  
  // CRM Integrations
  getAllCrmIntegrations(): Promise<CrmIntegration[]>;
  getCrmIntegration(id: number): Promise<CrmIntegration | undefined>;
  createCrmIntegration(integration: InsertCrmIntegration): Promise<CrmIntegration>;
  updateCrmIntegration(id: number, integration: Partial<InsertCrmIntegration>): Promise<CrmIntegration | undefined>;
  deleteCrmIntegration(id: number): Promise<boolean>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalClients: number;
    pendingFollowups: number;
    overdueTasks: number;
    completedThisWeek: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private tasks: Map<number, Task>;
  private followUps: Map<number, FollowUp>;
  private interactions: Map<number, Interaction>;
  private crmIntegrations: Map<number, CrmIntegration>;
  private currentUserId: number;
  private currentClientId: number;
  private currentTaskId: number;
  private currentFollowUpId: number;
  private currentInteractionId: number;
  private currentCrmIntegrationId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.tasks = new Map();
    this.followUps = new Map();
    this.interactions = new Map();
    this.crmIntegrations = new Map();
    this.currentUserId = 1;
    this.currentClientId = 1;
    this.currentTaskId = 1;
    this.currentFollowUpId = 1;
    this.currentInteractionId = 1;
    this.currentCrmIntegrationId = 1;
    
    // Initialize with default user
    this.createUser({
      username: "admin",
      password: "password",
      name: "Sarah Johnson",
      role: "Project Manager"
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      name: insertUser.name || "User",
      role: insertUser.role || "Project Manager"
    };
    this.users.set(id, user);
    return user;
  }

  // Clients
  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientsByStatus(status: string): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(client => client.status === status);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const now = new Date();
    const client: Client = { 
      ...insertClient, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient: Client = { 
      ...client, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  async searchClients(query: string): Promise<Client[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.clients.values()).filter(client =>
      client.name.toLowerCase().includes(lowerQuery) ||
      client.company?.toLowerCase().includes(lowerQuery) ||
      client.email.toLowerCase().includes(lowerQuery)
    );
  }

  // Tasks
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByClient(clientId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.clientId === clientId);
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return Array.from(this.tasks.values()).filter(task => 
      task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const now = new Date();
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = { 
      ...task, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Follow-ups
  async getAllFollowUps(): Promise<FollowUp[]> {
    return Array.from(this.followUps.values());
  }

  async getFollowUp(id: number): Promise<FollowUp | undefined> {
    return this.followUps.get(id);
  }

  async getFollowUpsByClient(clientId: number): Promise<FollowUp[]> {
    return Array.from(this.followUps.values()).filter(followUp => followUp.clientId === clientId);
  }

  async getUpcomingFollowUps(): Promise<FollowUp[]> {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return Array.from(this.followUps.values())
      .filter(followUp => 
        followUp.status === 'scheduled' &&
        new Date(followUp.scheduledDate) >= now &&
        new Date(followUp.scheduledDate) <= nextWeek
      )
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }

  async getOverdueFollowUps(): Promise<FollowUp[]> {
    const now = new Date();
    return Array.from(this.followUps.values()).filter(followUp => 
      followUp.status === 'scheduled' && new Date(followUp.scheduledDate) < now
    );
  }

  async createFollowUp(insertFollowUp: InsertFollowUp): Promise<FollowUp> {
    const id = this.currentFollowUpId++;
    const now = new Date();
    const followUp: FollowUp = { 
      ...insertFollowUp, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.followUps.set(id, followUp);
    return followUp;
  }

  async updateFollowUp(id: number, updateData: Partial<InsertFollowUp>): Promise<FollowUp | undefined> {
    const followUp = this.followUps.get(id);
    if (!followUp) return undefined;
    
    const updatedFollowUp: FollowUp = { 
      ...followUp, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.followUps.set(id, updatedFollowUp);
    return updatedFollowUp;
  }

  async deleteFollowUp(id: number): Promise<boolean> {
    return this.followUps.delete(id);
  }

  // Interactions
  async getAllInteractions(): Promise<Interaction[]> {
    return Array.from(this.interactions.values());
  }

  async getInteraction(id: number): Promise<Interaction | undefined> {
    return this.interactions.get(id);
  }

  async getInteractionsByClient(clientId: number): Promise<Interaction[]> {
    return Array.from(this.interactions.values())
      .filter(interaction => interaction.clientId === clientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const id = this.currentInteractionId++;
    const now = new Date();
    const interaction: Interaction = { 
      ...insertInteraction, 
      id, 
      createdAt: now 
    };
    this.interactions.set(id, interaction);
    return interaction;
  }

  async deleteInteraction(id: number): Promise<boolean> {
    return this.interactions.delete(id);
  }

  // CRM Integrations
  async getAllCrmIntegrations(): Promise<CrmIntegration[]> {
    return Array.from(this.crmIntegrations.values());
  }

  async getCrmIntegration(id: number): Promise<CrmIntegration | undefined> {
    return this.crmIntegrations.get(id);
  }

  async createCrmIntegration(insertIntegration: InsertCrmIntegration): Promise<CrmIntegration> {
    const id = this.currentCrmIntegrationId++;
    const now = new Date();
    const integration: CrmIntegration = { 
      ...insertIntegration, 
      id, 
      createdAt: now 
    };
    this.crmIntegrations.set(id, integration);
    return integration;
  }

  async updateCrmIntegration(id: number, updateData: Partial<InsertCrmIntegration>): Promise<CrmIntegration | undefined> {
    const integration = this.crmIntegrations.get(id);
    if (!integration) return undefined;
    
    const updatedIntegration: CrmIntegration = { 
      ...integration, 
      ...updateData 
    };
    this.crmIntegrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async deleteCrmIntegration(id: number): Promise<boolean> {
    return this.crmIntegrations.delete(id);
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalClients: number;
    pendingFollowups: number;
    overdueTasks: number;
    completedThisWeek: number;
  }> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const totalClients = this.clients.size;
    const pendingFollowups = Array.from(this.followUps.values()).filter(f => f.status === 'scheduled').length;
    const overdueTasks = (await this.getOverdueTasks()).length;
    const completedThisWeek = Array.from(this.tasks.values()).filter(task => 
      task.status === 'completed' && 
      task.updatedAt && 
      new Date(task.updatedAt) >= oneWeekAgo
    ).length;

    return {
      totalClients,
      pendingFollowups,
      overdueTasks,
      completedThisWeek
    };
  }
}

export const storage = new MemStorage();
