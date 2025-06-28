import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Plus, MoreHorizontal, Edit, Trash2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Client } from "@shared/schema";
import AddClientModal from "@/components/modals/add-client-modal";
import { format } from "date-fns";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/clients?search=${encodeURIComponent(searchQuery)}`
        : "/api/clients";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch clients");
      return response.json();
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: number) => {
      await apiRequest("DELETE", `/api/clients/${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      lead: "bg-blue-100 text-blue-800",
    };
    return variants[status as keyof typeof variants] || variants.active;
  };

  const getClientInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Add Client
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  type="text"
                  placeholder="Search clients by name, company, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Clients ({clients?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!clients || clients.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? "Try adjusting your search terms." : "Get started by adding your first client."}
                </p>
                {!searchQuery && (
                  <div className="mt-6">
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <Plus size={16} className="mr-2" />
                      Add Client
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {getClientInitials(client.name)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{client.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">{client.company || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">{client.email}</div>
                        {client.phone && (
                          <div className="text-sm text-gray-500">{client.phone}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(client.status)}>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {format(new Date(client.createdAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit size={16} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => deleteClientMutation.mutate(client.id)}
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AddClientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  );
}
