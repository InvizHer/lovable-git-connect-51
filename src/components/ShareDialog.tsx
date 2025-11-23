import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Share2, Copy, ExternalLink, Mail, 
  MessageCircle, Send, Linkedin, Twitter 
} from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  description?: string;
}

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

  const handleOpen = () => {
    window.open(url, "_blank");
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || title}\n\n${url}`)}`,
  };

  const openShareLink = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary/30 max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text flex items-center gap-2 text-xl sm:text-2xl">
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
            Share Complaint Box
          </DialogTitle>
          <DialogDescription className="text-sm">
            Choose how you want to share this complaint box link
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Social Media Share Options */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              Share via Social Media
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="h-auto py-3 px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-center gap-2 hover:bg-[#25D366]/10 hover:border-[#25D366]/50 hover:text-[#25D366] transition-colors"
                onClick={() => openShareLink("whatsapp")}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs sm:text-sm font-medium">WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-3 px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-center gap-2 hover:bg-[#0088cc]/10 hover:border-[#0088cc]/50 hover:text-[#0088cc] transition-colors"
                onClick={() => openShareLink("telegram")}
              >
                <Send className="w-5 h-5" />
                <span className="text-xs sm:text-sm font-medium">Telegram</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-3 px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-center gap-2 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/50 hover:text-[#0A66C2] transition-colors"
                onClick={() => openShareLink("linkedin")}
              >
                <Linkedin className="w-5 h-5" />
                <span className="text-xs sm:text-sm font-medium">LinkedIn</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-3 px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-center gap-2 hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/50 hover:text-[#1DA1F2] transition-colors"
                onClick={() => openShareLink("twitter")}
              >
                <Twitter className="w-5 h-5" />
                <span className="text-xs sm:text-sm font-medium">Twitter</span>
              </Button>
            </div>
          </div>

          {/* Email Share */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              Share via Email
            </p>
            <Button
              variant="outline"
              className="w-full h-auto py-3 flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-colors"
              onClick={() => openShareLink("email")}
            >
              <Mail className="w-5 h-5" />
              <span className="text-sm font-medium">Send via Email</span>
            </Button>
          </div>

          {/* Direct Actions */}
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              Direct Actions
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                onClick={handleCopy}
                className="h-auto py-3 px-3 sm:px-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                <Copy className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{copied ? "Copied!" : "Copy Link"}</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleOpen}
                className="h-auto py-3 px-3 sm:px-4 border-primary/30 hover:bg-primary/10 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Open Link</span>
              </Button>
            </div>
          </div>

          {/* Link Preview */}
          <div className="pt-2">
            <div className="p-3 bg-secondary/50 rounded-lg border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Link Preview</p>
              <p className="text-xs break-all text-primary font-mono">{url}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
