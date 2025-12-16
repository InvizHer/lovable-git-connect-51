import { cn } from "@/lib/utils";
import type { SharePlatform } from "./types";

type Props = {
  platform: SharePlatform;
  onClick: () => void;
};

export function SocialShareButton({ platform, onClick }: Props) {
  const Icon = platform.icon;
  const v = platform.brandVar;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-background",
        "px-2.5 py-3 sm:px-3 sm:py-3.5",
        "transition-all duration-200 hover:shadow-md active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "min-w-0",
        `hover:bg-[hsl(var(--${v})/0.12)] hover:border-[hsl(var(--${v})/0.35)] hover:text-[hsl(var(--${v}))]`
      )}
    >
      <span
        className={cn(
          "grid place-items-center rounded-lg border border-border/60",
          "h-10 w-10 sm:h-11 sm:w-11",
          "bg-muted/30 text-foreground transition-colors",
          `group-hover:bg-[hsl(var(--${v})/0.14)] group-hover:border-[hsl(var(--${v})/0.35)]`
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-[10px] sm:text-xs font-semibold leading-tight text-center max-w-full truncate">
        {platform.name}
      </span>
    </button>
  );
}
