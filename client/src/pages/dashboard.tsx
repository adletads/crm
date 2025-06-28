import { useQuery } from "@tanstack/react-query";
import { Users, Clock, AlertTriangle, CheckCircle, UserPlus, CalendarPlus, PlusSquare, Download, FolderSync } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow } from "date-fns";
import type { Client, FollowUp } from "@shared/schema";
import { useState } from "react";
import AddClientModal from "@/components/modals/add-client-modal";
import AddTaskModal from "@/components/modals/add-task-modal";
import AddFollowUpModal from "@/components/modals/add-followup-modal";

interface DashboardStats {
  totalClients: number;
  pendingFollowups: number;
  overdueTasks: number;
  completedThisWeek: number;
}

interface FollowUpWithClient extends FollowUp {
  client?: Client;
}

export default function Dashboard() {
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddFollowUpModalOpen, setIsAddFollowUpModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: upcomingFollowUps, isLoading: followUpsLoading } = useQuery<FollowUp[]>({
    queryKey: ["/api/followups?upcoming=true"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Enhance follow-ups with client data
  const followUpsWithClients: FollowUpWithClient[] = upcomingFollowUps?.map(followUp => ({
    ...followUp,
    client: clients?.find(client => client.id === followUp.clientId)
  })) || [];

  const formatFollowUpDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const getClientInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (statsLoading || followUpsLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-primary" size={16} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Clients</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.totalClients || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-yellow-600" size={16} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Follow-ups</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.pendingFollowups || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-red-600" size={16} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Overdue Tasks</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.overdueTasks || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={16} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed This Week</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.completedThisWeek || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Follow-ups */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-gray-900">Upcoming Follow-ups</CardTitle>
                  <Button variant="link" className="text-sm text-primary hover:text-blue-700">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {followUpsWithClients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming follow-ups scheduled
                  </div>
                ) : (
                  <div className="space-y-4">
                    {followUpsWithClients.slice(0, 5).map((followUp) => (
                      <div key={followUp.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {followUp.client ? getClientInitials(followUp.client.name) : "??"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {followUp.client?.name || "Unknown Client"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {followUp.client?.company || "No company"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatFollowUpDate(new Date(followUp.scheduledDate))}, {format(new Date(followUp.scheduledDate), "h:mm a")}
                          </p>
                          <p className="text-sm text-gray-500">{followUp.title}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="ml-4 text-primary hover:text-blue-700">
                          <CheckCircle size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Quick Actions and Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                    onClick={() => setIsAddClientModalOpen(true)}
                  >
                    <UserPlus className="mr-3 text-primary" size={16} />
                    Add New Client
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                    onClick={() => setIsAddFollowUpModalOpen(true)}
                  >
                    <CalendarPlus className="mr-3 text-primary" size={16} />
                    Schedule Follow-up
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                    onClick={() => setIsAddTaskModalOpen(true)}
                  >
                    <PlusSquare className="mr-3 text-primary" size={16} />
                    Create Task
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                  >
                    <Download className="mr-3 text-primary" size={16} />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CRM Integration Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">CRM Integration</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-xs">SF</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Salesforce</p>
                        <p className="text-xs text-gray-500">Last sync: 2 hours ago</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <Button variant="link" className="w-full text-sm text-primary hover:text-blue-700 font-medium p-0">
                      <FolderSync className="mr-2" size={16} />
                      FolderSync Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">
                        New client <span className="font-medium">TechCorp Inc.</span> added
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">
                        Follow-up reminder set for <span className="font-medium">Sarah Miller</span>
                      </p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">
                        Task completed: <span className="font-medium">Project proposal review</span>
                      </p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddClientModal 
        isOpen={isAddClientModalOpen} 
        onClose={() => setIsAddClientModalOpen(false)} 
      />
      <AddTaskModal 
        isOpen={isAddTaskModalOpen} 
        onClose={() => setIsAddTaskModalOpen(false)} 
      />
      <AddFollowUpModal 
        isOpen={isAddFollowUpModalOpen} 
        onClose={() => setIsAddFollowUpModalOpen(false)} 
      />
    </>
  );
}
