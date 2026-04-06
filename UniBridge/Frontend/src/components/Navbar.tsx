import { GraduationCap, Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBell from "@/components/NotificationBell";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: "Home", href: "/", isExternal: false },
    { label: "About Us", href: "/about", isExternal: false },
    { label: "Contact Us", href: "/contact", isExternal: false },
  ];

  const protectedLinks = [
    { label: "Job", href: "/jobs", isExternal: false },
    { label: "Exams", href: "/exam-list", isExternal: false },
    { label: "CV Builder", href: "/cv-builder", isExternal: false },
    { label: "Feedback", href: "/feedback", isExternal: false },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const handleNavigation = (href: string, isExternal: boolean) => {
    if (isExternal) {
      // Handle scroll links (internships, cv-services)
      if (location.pathname !== "/") {
        navigate(href);
      } else {
        const element = document.getElementById(href.split("#")[1]);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      // Handle page navigation (about, companies)
      navigate(href);
    }
    setMobileOpen(false);
  };

  const handleSignOut = () => {
    logout();
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg text-foreground">UniBridge</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {links.slice(0, 1).map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavigation(link.href, link.isExternal)}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-foreground font-semibold border-b-2 border-primary pb-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
          
          {/* Show Job and Exam links only when logged in */}
          {user && protectedLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.href)}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-foreground font-semibold border-b-2 border-primary pb-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
          
          {links.slice(1).map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavigation(link.href, link.isExternal)}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-foreground font-semibold border-b-2 border-primary pb-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {role && (
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full capitalize">
                  {role}
                </span>
              )}
              
              {/* Profile Dropdown for Students */}
              {role === "student" && (
                <>
                  <NotificationBell />
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                      </div>
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>My Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile/settings")}>Settings</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </>
              )}
              
              {/* Admin Panel Link for Admins */}
              {role === "admin" && (
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>Admin Panel</Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                    </div>
                    <LogOut className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Company Panel Link for Employers */}
              {role === "employer" && (
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <Button variant="outline" size="sm" onClick={() => navigate("/company/dashboard")}>Company Panel</Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                    </div>
                    <LogOut className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Regular Sign Out for non-students, non-admins, and non-employers */}
              {role !== "student" && role !== "admin" && role !== "employer" && (
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                  </div>
                  <LogOut className="w-4 h-4 ml-1" />
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 animate-fade-in">
          {links.slice(0, 1).map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavigation(link.href, link.isExternal)}
              className={`block w-full text-left py-3 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-foreground font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
          
          {/* Show Job and Exam links only when logged in */}
          {user && protectedLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.href)}
              className={`block w-full text-left py-3 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-foreground font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
          
          {links.slice(1).map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavigation(link.href, link.isExternal)}
              className={`block w-full text-left py-3 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-foreground font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="flex gap-3 pt-3">
            {user ? (
              <>
                {role === "student" ? (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2 p-2 bg-secondary rounded-lg">
                      <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">{role}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate("/profile")}>
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate("/profile/settings")}>
                        Settings
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ) : role === "admin" ? (
                  <div className="w-full space-y-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/admin")}>
                      Admin Panel
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={handleSignOut}>
                      <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                      </div>
                      <LogOut className="w-4 h-4 ml-1 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={handleSignOut}>
                    <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                    </div>
                    <LogOut className="w-4 h-4 ml-1 mr-2" />
                    Sign Out
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button size="sm" className="flex-1" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
