import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check, Copy, ExternalLink, Link2, Share2 } from "lucide-react";
import { sharePlatforms } from "@/components/share/sharePlatforms";
import type { SharePlatformId } from "@/components/share/types";
import { SocialShareButton } from "@/components/share/SocialShareButton";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  description?: string;
}

function buildShareUrl({
  platform,
  url,
  title,
  description,
}: {
  platform: SharePlatformId;
  url: string;
  title: string;
  description?: string;
}) {
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
}

export function ShareDialog({ open, onOpenChange, url, title, description }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const safeUrl = useMemo(() => url?.trim() || "", [url]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(safeUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const openShareLink = (platform: SharePlatformId) => {
    const shareUrl = buildShareUrl({ platform, url: safeUrl, title, description });
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=560");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[min(92vw,34rem)] p-0 gap-0",
          "overflow-hidden border-border/50 bg-background",
          "max-h-[85vh]"
        )}
      >
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-medium)] shrink-0">
              <Share2 className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate">
                Share Complaint Box
              </DialogTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                Share this link with others
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Link Preview */}
          <div className="rounded-xl border border-border bg-muted/30 p-3 sm:p-3.5">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                  Shareable Link
                </p>
                <p className="text-xs sm:text-sm font-mono text-foreground truncate">
                  {safeUrl}
                </p>
              </div>
            </div>
          </div>

          {/* Social share - moved above quick actions */}
          <section className="space-y-2.5 sm:space-y-3">
            <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Share via
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {sharePlatforms.map((platform) => (
                <SocialShareButton
                  key={platform.id}
                  platform={platform}
                  onClick={() => openShareLink(platform.id)}
                />
              ))}
            </div>
          </section>

          {/* Quick actions - moved below share options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Button
              onClick={handleCopy}
              className={cn(
                "h-11 sm:h-12 gap-2 font-semibold transition-all duration-200",
                copied
                  ? "bg-success hover:bg-success text-success-foreground"
                  : "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Copied</span>
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
              onClick={() => window.open(safeUrl, "_blank", "noopener,noreferrer")}
              className="h-11 sm:h-12 gap-2 font-semibold border-border hover:bg-accent/10 hover:border-primary/40 transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Open Link</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
