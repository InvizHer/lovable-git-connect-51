import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MessageCircle, LogOut, LayoutDashboard, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ThemeToggle from "./ThemeToggle";
import { useScrollHeader } from "@/hooks/use-scroll-header";

const AdminHeader = () => {
  const navigate = useNavigate();
  const isVisible = useScrollHeader();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to logout");
      return;
    }
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className={`sticky top-0 z-50 w-full glass border-b transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/dashboard")}
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:inline">
              TellUs
            </span>
            <span className="hidden md:inline text-sm text-muted-foreground ml-2 px-2 py-1 rounded-full bg-primary/10">
              Admin
            </span>
          </div>
          
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2 rounded-full"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button 
              variant="ghost"
              size="sm" 
              onClick={() => navigate("/profile")}
              className="gap-2 rounded-full"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
