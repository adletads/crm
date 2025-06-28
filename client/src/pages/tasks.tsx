import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, MoreHorizontal, CheckSquare, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task, Client } from "@shared/schema";
import AddTaskModal from "@/components/modals/add-task-modal";
import { format } from "date-fns";

export default function Tasks() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Task> }) => {
      await apiRequest("PATCH", `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return variants[priority as keyof typeof variants] || variants.medium;
  };

  const getClientName = (clientId: number | null) => {
    if (!clientId) return "No client";
    const client = clients?.find(c => c.id === clientId);
    return client?.name || "Unknown client";
  };

  const isOverdue = (task: Task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  const markAsCompleted = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { status: 'completed' }
    });
  };

  const tasksWithStatus = tasks?.map(task => ({
    ...task,
    isOverdue: isOverdue(task)
  }));

  if (tasksLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Add Task
          </Button>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-yellow-600" size={16} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {tasksWithStatus?.filter(t => t.status === 'pending').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckSquare className="text-blue-600" size={16} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {tasksWithStatus?.filter(t => t.status === 'in_progress').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckSquare className="text-green-600" size={16} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {tasksWithStatus?.filter(t => t.status === 'completed').length || 0}
                  </p>
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
                  <p className="text-sm font-medium text-gray-500">Overdue</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {tasksWithStatus?.filter(t => t.isOverdue).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tasks ({tasks?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!tasks || tasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first task.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={16} className="mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasksWithStatus?.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {getClientName(task.clientId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadge(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(task.isOverdue ? 'overdue' : task.status)}>
                          {task.isOverdue ? 'overdue' : task.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <div className={`text-sm ${task.isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {format(new Date(task.dueDate), "MMM d, yyyy")}
                          </div>
                        ) : (
                          <span className="text-gray-400">No due date</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {task.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsCompleted(task)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckSquare size={16} />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => deleteTaskMutation.mutate(task.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  );
}
