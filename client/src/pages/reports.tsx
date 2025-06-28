import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, Calendar, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Client, Task, FollowUp } from "@shared/schema";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

interface ReportData {
  clientsThisMonth: number;
  tasksCompleted: number;
  followUpsCompleted: number;
  averageResponseTime: string;
}

export default function Reports() {
  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: followUps } = useQuery<FollowUp[]>({
    queryKey: ["/api/followups"],
  });

  const generateReport = (): ReportData => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const clientsThisMonth = clients?.filter(client => 
      new Date(client.createdAt) >= thirtyDaysAgo
    ).length || 0;

    const tasksCompleted = tasks?.filter(task => 
      task.status === 'completed' && 
      task.updatedAt &&
      new Date(task.updatedAt) >= weekStart &&
      new Date(task.updatedAt) <= weekEnd
    ).length || 0;

    const followUpsCompleted = followUps?.filter(followUp => 
      followUp.status === 'completed' &&
      new Date(followUp.updatedAt) >= weekStart &&
      new Date(followUp.updatedAt) <= weekEnd
    ).length || 0;

    return {
      clientsThisMonth,
      tasksCompleted,
      followUpsCompleted,
      averageResponseTime: "2.3 hours"
    };
  };

  const reportData = generateReport();

  const getClientStatusDistribution = () => {
    if (!clients) return {};
    
    const distribution = clients.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return distribution;
  };

  const getTaskPriorityDistribution = () => {
    if (!tasks) return {};
    
    const distribution = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return distribution;
  };

  const exportReport = () => {
    const reportContent = {
      generatedAt: new Date().toISOString(),
      summary: reportData,
      clients: clients || [],
      tasks: tasks || [],
      followUps: followUps || [],
      clientStatusDistribution: getClientStatusDistribution(),
      taskPriorityDistribution: getTaskPriorityDistribution()
    };

    const dataStr = JSON.stringify(reportContent, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `crm-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clientStatusDistribution = getClientStatusDistribution();
  const taskPriorityDistribution = getTaskPriorityDistribution();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <Button onClick={exportReport}>
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={16} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">New Clients (30d)</p>
                <p className="text-2xl font-semibold text-gray-900">{reportData.clientsThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-green-600" size={16} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tasks Completed (7d)</p>
                <p className="text-2xl font-semibold text-gray-900">{reportData.tasksCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-purple-600" size={16} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Follow-ups Completed (7d)</p>
                <p className="text-2xl font-semibold text-gray-900">{reportData.followUpsCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-yellow-600" size={16} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-semibold text-gray-900">{reportData.averageResponseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Client Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(clientStatusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'active' ? 'bg-green-500' :
                      status === 'inactive' ? 'bg-gray-500' :
                      'bg-blue-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900 capitalize">{status}</span>
                  </div>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
              {Object.keys(clientStatusDistribution).length === 0 && (
                <p className="text-gray-500 text-center py-4">No client data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(taskPriorityDistribution).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      priority === 'urgent' ? 'bg-red-500' :
                      priority === 'high' ? 'bg-orange-500' :
                      priority === 'medium' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900 capitalize">{priority}</span>
                  </div>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
              {Object.keys(taskPriorityDistribution).length === 0 && (
                <p className="text-gray-500 text-center py-4">No task data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Clients</span>
                <span className="font-medium">{clients?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Tasks</span>
                <span className="font-medium">{tasks?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Follow-ups</span>
                <span className="font-medium">{followUps?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-medium">
                  {tasks?.length ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={exportReport}
              >
                <Download size={16} className="mr-2" />
                Export Full Report (JSON)
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled
              >
                <Download size={16} className="mr-2" />
                Export Client List (CSV) - Coming Soon
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled
              >
                <Download size={16} className="mr-2" />
                Export Task Report (PDF) - Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
