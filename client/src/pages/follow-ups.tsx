import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Calendar, Clock, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FollowUp, Client } from "@shared/schema";
import AddFollowUpModal from "@/components/modals/add-followup-modal";
import { format, isToday, isTomorrow } from "date-fns";

export default function FollowUps() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: followUps, isLoading } = useQuery<FollowUp[]>({
    queryKey: ["/api/followups"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const updateFollowUpMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FollowUp> }) => {
      await apiRequest("PATCH", `/api/followups/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/followups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Follow-up updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update follow-up",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
      overdue: "bg-red-100 text-red-800",
    };
    return variants[status as keyof typeof variants] || variants.scheduled;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      call: "bg-purple-100 text-purple-800",
      email: "bg-blue-100 text-blue-800",
      meeting: "bg-green-100 text-green-800",
      reminder: "bg-yellow-100 text-yellow-800",
    };
    return variants[type as keyof typeof variants] || variants.call;
  };

  const getClientName = (clientId: number) => {
    const client = clients?.find(c => c.id === clientId);
    return client?.name || "Unknown client";
  };

  const getClientInitials = (clientId: number) => {
    const client = clients?.find(c => c.id === clientId);
    if (!client) return "??";
    return client.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatFollowUpDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  };

  const isOverdue = (followUp: FollowUp) => {
    return new Date(followUp.scheduledDate) < new Date() && followUp.status === 'scheduled';
  };

  const markAsCompleted = (followUp: FollowUp) => {
    updateFollowUpMutation.mutate({
      id: followUp.id,
      data: { status: 'completed' }
    });
  };

  const followUpsWithStatus = followUps?.map(followUp => ({
    ...followUp,
    isOverdue: isOverdue(followUp)
  }));

  if (isLoading) {
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
          <h1 className="text-2xl font-semibold text-gray-900">Follow-ups</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Schedule Follow-up
          </Button>
        </div>

        {/* Follow-up Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-blue-600" size={16} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Scheduled</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {followUpsWithStatus?.filter(f => f.status === 'scheduled' && !f.isOverdue).length || 0}
                  </p>
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
                  <p className="text-sm font-medium text-gray-500">Today</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {followUpsWithStatus?.filter(f => isToday(new Date(f.scheduledDate)) && f.status === 'scheduled').length || 0}
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
                    <Clock className="text-red-600" size={16} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Overdue</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {followUpsWithStatus?.filter(f => f.isOverdue).length || 0}
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
                    {followUpsWithStatus?.filter(f => f.status === 'completed').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Follow-ups Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Follow-ups ({followUps?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!followUps || followUps.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No follow-ups scheduled</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by scheduling your first follow-up.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={16} className="mr-2" />
                    Schedule Follow-up
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {followUpsWithStatus
                    ?.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                    .map((followUp) => (
                    <TableRow key={followUp.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {getClientInitials(followUp.clientId)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {getClientName(followUp.clientId)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{followUp.title}</div>
                          {followUp.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {followUp.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadge(followUp.type)}>
                          {followUp.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${followUp.isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {formatFollowUpDate(new Date(followUp.scheduledDate))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(followUp.scheduledDate), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(followUp.isOverdue ? 'overdue' : followUp.status)}>
                          {followUp.isOverdue ? 'overdue' : followUp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {followUp.status === 'scheduled' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsCompleted(followUp)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckSquare size={16} />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AddFollowUpModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  );
}
