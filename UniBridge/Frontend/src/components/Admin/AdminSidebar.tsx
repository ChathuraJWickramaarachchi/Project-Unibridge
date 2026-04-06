import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Settings, 
  BarChart3,
  MessageSquare,
  Menu,
  X,
  GraduationCap,
  FileText,
  HelpCircle,
  CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [activePath, setActivePath] = useState(location.pathname);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Employers",
      href: "/admin/employers",
      icon: Building,
    },
    {
      name: "Feedback",
      href: "/admin/feedback",
      icon: MessageSquare,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  const examNavigation = [
    {
      name: "Create Exam",
      href: "/admin/exams/create",
      icon: FileText,
    },
    {
      name: "Add Questions",
      href: "/admin/exams/questions/add",
      icon: HelpCircle,
    },
    {
      name: "View Exams",
      href: "/admin/exams/view",
      icon: CheckSquare,
    },
    {
      name: "View Questions",
      href: "/admin/exams/questions/view",
      icon: HelpCircle,
    },
    {
      name: "View Results",
      href: "/admin/exams/results",
      icon: BarChart3,
    },
  ];

  const secondaryNavigation = [
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const isActive = (path: string) => {
    // Exact match for root path
    if (path === "/admin" && location.pathname === "/admin") {
      return true;
    }
    // For other paths, check if current path starts with the nav path
    if (path !== "/admin") {
      return location.pathname === path || location.pathname.startsWith(path + "/");
    }
    return false;
  };

  return (
    <>
      {/* Sidebar */}
      <div className="fixed md:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:translate-x-0 md:inset-0 md:z-auto">
        <div className="flex flex-col h-full md:h-[calc(100vh-4rem)] pt-16 md:pt-0">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Welcome, {user?.firstName}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              <style>{`
                .admin-nav-link {
                  position: relative;
                  overflow: hidden;
                }
                .admin-nav-link:not(.active)::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: hsl(210, 40%, 96.1%);
                  opacity: 0;
                  transition: opacity 0.2s ease-in-out;
                  z-index: -1;
                }
                .dark .admin-nav-link:not(.active)::before {
                  background: hsl(217.2, 32.6%, 17.5%);
                }
                .admin-nav-link:not(.active):hover::before {
                  opacity: 1;
                }
              `}</style>
              
              {/* Main Navigation */}
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href) || activePath === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`admin-nav-link ${active ? 'active' : ''} flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out ${
                        active
                          ? "bg-primary text-primary-foreground shadow-md relative z-10 border-l-4 border-primary cursor-default"
                          : "text-muted-foreground hover:text-accent-foreground hover:shadow-md hover:translate-x-1 relative z-10 hover:bg-accent/50"
                      }`}
                    >
                      <div className="relative">
                        <Icon className="h-5 w-5" />
                        {active && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border-2 border-primary"></div>
                        )}
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}

              {/* Exam Management Section */}
              <li className="pt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-3 mb-2">
                  Exam Management
                </h3>
              </li>

              {examNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href) || activePath === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`admin-nav-link ${active ? 'active' : ''} flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out ${
                        active
                          ? "bg-primary text-primary-foreground shadow-md relative z-10 border-l-4 border-primary cursor-default"
                          : "text-muted-foreground hover:text-accent-foreground hover:shadow-md hover:translate-x-1 relative z-10 hover:bg-accent/50"
                      }`}
                    >
                      <div className="relative">
                        <Icon className="h-5 w-5" />
                        {active && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border-2 border-primary"></div>
                        )}
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}

              {/* Secondary Navigation */}
              <li className="pt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-3 mb-2">
                  Other
                </h3>
              </li>

              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href) || activePath === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`admin-nav-link ${active ? 'active' : ''} flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out ${
                        active
                          ? "bg-primary text-primary-foreground shadow-md relative z-10 border-l-4 border-primary cursor-default"
                          : "text-muted-foreground hover:text-accent-foreground hover:shadow-md hover:translate-x-1 relative z-10 hover:bg-accent/50"
                      }`}
                    >
                      <div className="relative">
                        <Icon className="h-5 w-5" />
                        {active && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border-2 border-primary"></div>
                        )}
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              UniBridge Admin v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar behavior will be handled by the parent layout */}
      {/* Overlay handled in AdminLayout */}
    </>
  );
};

export default AdminSidebar;