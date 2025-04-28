
import { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Receipt,
  Clock,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
  };

  const navigation = [
    // Dashboard hidden as requested
    { name: "POS", href: "/pos", icon: ShoppingCart, show: true },
    { name: "Inventory", href: "/inventory", icon: Package, show: true },
    { name: "Receipt", href: "/receipt", icon: Receipt, show: true },
    { name: "Shift Management", href: "/shift", icon: Clock, show: true },
    // User Management hidden as requested
    { name: "Settings", href: "/settings", icon: Settings, show: true },
  ];

  // Add the hidden navigation items but with show: false
  const fullNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home, show: false },
    ...navigation,
    { name: "User Management", href: "/users", icon: Users, show: false },
  ];

  // Filter navigation items to show only the visible ones
  const visibleNavigation = fullNavigation.filter(item => item.show);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-6 bg-primary">
            <Link to="/dashboard" className="text-xl font-bold text-secondary-foreground">
              Taichan <span className="font-normal">Searah</span>
            </Link>
            <button
              className="rounded-md p-1 text-secondary-foreground md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActive(item.href)
                      ? "bg-primary text-secondary-foreground"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 px-4 py-4">
            <Button
              variant="outline"
              className="flex w-full items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              className="rounded-md p-1 text-gray-600 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-2 md:ml-auto">
              <span className="hidden md:inline text-sm text-gray-600">
                Welcome, User
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
