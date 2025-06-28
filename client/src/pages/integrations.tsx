import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Settings, FolderSync, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CrmIntegration } from "@shared/schema";
import { format } from "date-fns";

const availableIntegrations = [
  {
    id: "salesforce",
    name: "Salesforce",
    description: "FolderSync contacts, leads, and opportunities with Salesforce CRM",
    icon: "SF",
    color: "bg-blue-500",
    isPopular: true
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Connect with HubSpot CRM for comprehensive contact management",
    icon: "HS",
    color: "bg-orange-500",
    isPopular: true
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Integrate with Pipedrive for pipeline and deal tracking",
    icon: "PD",
    color: "bg-green-500",
    isPopular: false
  },
  {
    id: "zoho",
    name: "Zoho CRM",
    description: "FolderSync data with Zoho CRM platform",
    icon: "ZO",
    color: "bg-purple-500",
    isPopular: false
  }
];

export default function Integrations() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: integrations, isLoading } = useQuery<CrmIntegration[]>({
    queryKey: ["/api/integrations"],
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (data: { name: string; type: string; apiKey?: string }) => {
      return await apiRequest("POST", "/api/integrations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setConnecting(null);
      toast({
        title: "Success",
        description: "Integration connected successfully",
      });
    },
    onError: () => {
      setConnecting(null);
      toast({
        title: "Error",
        description: "Failed to connect integration",
        variant: "destructive",
      });
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CrmIntegration> }) => {
      return await apiRequest("PATCH", `/api/integrations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Success",
        description: "Integration updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      });
    },
  });

  const connectIntegration = async (integration: typeof availableIntegrations[0]) => {
    setConnecting(integration.id);
    
    // Simulate API key prompt for demo
    const apiKey = prompt(`Enter your ${integration.name} API key:`);
    if (!apiKey) {
      setConnecting(null);
      return;
    }

    createIntegrationMutation.mutate({
      name: integration.name,
      type: integration.id,
      apiKey,
    });
  };

  const toggleIntegration = (integration: CrmIntegration) => {
    updateIntegrationMutation.mutate({
      id: integration.id,
      data: { isConnected: !integration.isConnected }
    });
  };

  const syncIntegration = (integration: CrmIntegration) => {
    updateIntegrationMutation.mutate({
      id: integration.id,
      data: { lastSync: new Date() }
    });
  };

  const getConnectedIntegration = (type: string) => {
    return integrations?.find(int => int.type === type);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
          <p className="text-gray-600">Connect your favorite CRM tools to sync data seamlessly</p>
        </div>
      </div>

      {/* Connected Integrations */}
      {integrations && integrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Connected Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">
                          {integration.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-500">
                          {integration.lastSync 
                            ? `Last sync: ${format(new Date(integration.lastSync), "MMM d, h:mm a")}`
                            : "Never synced"
                          }
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={integration.isConnected}
                      onCheckedChange={() => toggleIntegration(integration)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={integration.isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {integration.isConnected ? (
                        <>
                          <CheckCircle size={12} className="mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} className="mr-1" />
                          Disconnected
                        </>
                      )}
                    </Badge>
                    
                    {integration.isConnected && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => syncIntegration(integration)}
                      >
                        <FolderSync size={12} className="mr-1" />
                        FolderSync
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableIntegrations.map((integration) => {
            const connectedIntegration = getConnectedIntegration(integration.id);
            const isConnected = !!connectedIntegration;
            
            return (
              <Card key={integration.id} className={isConnected ? "ring-2 ring-green-200" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{integration.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{integration.name}</h3>
                          {integration.isPopular && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {isConnected ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => connectIntegration(integration)}
                        disabled={connecting === integration.id}
                      >
                        {connecting === integration.id ? (
                          <>
                            <Settings size={12} className="mr-1 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Plus size={12} className="mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Integration Help */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings size={20} />
            <span>Integration Help</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Setting up integrations</h4>
              <p className="text-sm text-gray-600">
                To connect a CRM integration, you'll need API credentials from your CRM provider. 
                These are typically found in your CRM's settings or developer section.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Data synchronization</h4>
              <p className="text-sm text-gray-600">
                Once connected, data will sync automatically every hour. You can also trigger manual 
                syncs using the sync button on each connected integration.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Need help?</h4>
              <p className="text-sm text-gray-600">
                Check our documentation or contact support for assistance with setting up integrations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
