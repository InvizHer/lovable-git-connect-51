import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useScrollHeader } from "@/hooks/use-scroll-header";

const FrontendHeader = () => {
  const navigate = useNavigate();
  const isVisible = useScrollHeader();

  return (
    <header className={`sticky top-0 z-50 w-full glass border-b transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              TellUs
            </span>
          </div>
          
          <nav className="flex items-center gap-2">
            {/* Desktop: Track Complaint button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate("/track")}
              className="hidden md:flex text-sm rounded-full"
            >
              Track Complaint
            </Button>
            {/* Desktop: Signup button */}
            <Button 
              onClick={() => navigate("/signup")}
              className="hidden md:flex text-sm rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Sign Up
            </Button>
            {/* Mobile: Track icon button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/track")}
              className="md:hidden rounded-full"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default FrontendHeader;
