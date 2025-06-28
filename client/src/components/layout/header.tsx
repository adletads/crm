import { useState } from "react";
import { Search, Bell, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddClientModal from "@/components/modals/add-client-modal";

export default function Header() {
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <Menu size={20} />
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell size={20} />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/2 -translate-y-1/2" />
            </Button>
            {/* Add New */}
            <Button 
              onClick={() => setIsAddClientModalOpen(true)}
              className="bg-primary text-white hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Add Client
            </Button>
          </div>
        </div>
      </header>

      <AddClientModal 
        isOpen={isAddClientModalOpen} 
        onClose={() => setIsAddClientModalOpen(false)} 
      />
    </>
  );
}
