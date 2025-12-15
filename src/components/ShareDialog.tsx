import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Share2, Copy, Check, ExternalLink, Mail, 
  MessageCircle, Send, Link2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  description?: string;
}

// Brand colors for social platforms
const socialPlatforms = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    color: "#25D366",
    hoverBg: "hover:bg-[#25D366]/10",
    hoverBorder: "hover:border-[#25D366]/50",
    hoverText: "hover:text-[#25D366]",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: Send,
    color: "#0088cc",
    hoverBg: "hover:bg-[#0088cc]/10",
    hoverBorder: "hover:border-[#0088cc]/50",
    hoverText: "hover:text-[#0088cc]",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: "#000000",
    hoverBg: "hover:bg-foreground/10",
    hoverBorder: "hover:border-foreground/50",
    hoverText: "hover:text-foreground",
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    color: "hsl(var(--primary))",
    hoverBg: "hover:bg-primary/10",
    hoverBorder: "hover:border-primary/50",
    hoverText: "hover:text-primary",
  },
];

export function ShareDialog({ open, onOpenChange, url, title, description }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const getShareUrl = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDesc = encodeURIComponent(description || title);

    switch (platform) {
      case "whatsapp":
        return `https://wa.me/?text=${encodedTitle}%0A${encodedUrl}`;
      case "telegram":
        return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
      case "twitter":
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
      case "email":
        return `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`;
      default:
        return url;
    }
  };

  const openShareLink = (platform: string) => {
    window.open(getShareUrl(platform), "_blank", "width=600,height=400");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[92vw] sm:max-w-md p-0 gap-0 overflow-hidden border-border/50 bg-background">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Share2 className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                Share Complaint Box
              </DialogTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Share this link with others
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
          {/* Link Preview Card */}
          <div className="relative group">
            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-xl border border-border bg-muted/30 transition-colors">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-0.5">
                  Shareable Link
                </p>
                <p className="text-xs sm:text-sm font-mono text-foreground truncate">
                  {url}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions - Copy & Open */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button
              onClick={handleCopy}
              className={cn(
                "h-11 sm:h-12 gap-2 font-semibold transition-all duration-200",
                copied 
                  ? "bg-green-500 hover:bg-green-500 text-white" 
                  : "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Copy Link</span>
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open(url, "_blank")}
              className="h-11 sm:h-12 gap-2 font-semibold border-border hover:bg-accent/10 hover:border-primary/40 transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Open Link</span>
            </Button>
          </div>

          {/* Social Share Grid */}
          <div className="space-y-2.5 sm:space-y-3">
            <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Share via
            </p>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.id}
                    onClick={() => openShareLink(platform.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl",
                      "border border-border/60 bg-background transition-all duration-200",
                      "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
                      platform.hoverBg,
                      platform.hoverBorder,
                      platform.hoverText
                    )}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-[10px] sm:text-xs font-medium">
                      {platform.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
