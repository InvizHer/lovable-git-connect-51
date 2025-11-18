import { MessageCircle, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="glass border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">TellUs</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Secure, Modern and Digital Complaint Management System
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-3 w-3 fill-pink-500 text-pink-500" />
            <span>for better communication</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
