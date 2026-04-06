import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Home, 
  LogOut, 
  User, 
  Shield, 
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  onSidebarToggle?: () => void;
  isSidebarCollapsed?: boolean;
}

const AdminHeader = ({ onSidebarToggle, isSidebarCollapsed }: AdminHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate("/auth");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Menu button and breadcrumbs */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="md:hidden"
            >
              {isSidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
            
            <div className="hidden md:flex items-center gap-2">
              <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Admin
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium text-foreground capitalize">
                {window.location.pathname.split('/').pop() || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Center section - Page title (mobile) */}
          <div className="md:hidden flex-1 text-center">
            <h1 className="text-lg font-semibold">
              {window.location.pathname === '/admin' ? 'Dashboard' : 
               window.location.pathname.includes('/users') ? 'Users' : 
               'Admin Panel'}
            </h1>
          </div>

          {/* Right section - User actions */}
          <div className="flex items-center gap-2">
            {/* Home button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGoHome}
              className="hidden md:flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>

            {/* Mobile home button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGoHome}
              className="md:hidden"
            >
              <Home className="h-4 w-4" />
            </Button>

            {/* User profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Admin
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium border-b">
                  Signed in as
                </div>
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {user?.email}
                </div>
                <DropdownMenuItem onClick={handleGoHome} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go to Home Page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;