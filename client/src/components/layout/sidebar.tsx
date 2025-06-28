import { Link, useLocation } from "wouter";
import { Users, BarChart3, Calendar, CheckSquare, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Follow-ups", href: "/follow-ups", icon: Calendar },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Integrations", href: "/integrations", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="text-white text-sm" size={16} />
            </div>
            <span className="text-xl font-semibold text-gray-900">ClientFlow Pro</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-white bg-primary"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="mr-3" size={16} />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="text-gray-600" size={16} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
              <p className="text-xs text-gray-500">Project Manager</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
