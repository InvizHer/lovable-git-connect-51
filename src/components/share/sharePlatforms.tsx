import { Mail, Linkedin, MessageCircle, Send } from "lucide-react";
import type { SharePlatform } from "./types";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M19.54 5.08A15.05 15.05 0 0 0 15.93 4c-.16.29-.34.67-.46.97a14.49 14.49 0 0 0-3.94 0c-.12-.3-.3-.68-.46-.97a15.06 15.06 0 0 0-3.61 1.08C4.6 8.3 3.85 11.38 4.2 14.42A15.2 15.2 0 0 0 8.8 16.8c.37-.5.7-1.03.98-1.6-.54-.2-1.06-.45-1.55-.74.13-.1.26-.2.39-.3 2.98 1.39 6.2 1.39 9.14 0 .13.1.26.2.39.3-.49.29-1.01.54-1.55.74.28.57.61 1.1.98 1.6a15.2 15.2 0 0 0 4.6-2.38c.41-3.52-.67-6.57-2.69-9.34ZM9.58 13.77c-.89 0-1.62-.82-1.62-1.83 0-1.01.72-1.83 1.62-1.83.9 0 1.63.82 1.62 1.83 0 1.01-.72 1.83-1.62 1.83Zm4.84 0c-.89 0-1.62-.82-1.62-1.83 0-1.01.72-1.83 1.62-1.83.9 0 1.63.82 1.62 1.83 0 1.01-.72 1.83-1.62 1.83Z" />
  </svg>
);

export const sharePlatforms: SharePlatform[] = [
  { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, brandVar: "brand-whatsapp" },
  { id: "telegram", name: "Telegram", icon: Send, brandVar: "brand-telegram" },
  { id: "twitter", name: "X", icon: XIcon, brandVar: "brand-x" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, brandVar: "brand-linkedin" },
  { id: "discord", name: "Discord", icon: DiscordIcon, brandVar: "brand-discord" },
  { id: "email", name: "Email", icon: Mail, brandVar: "brand-email" },
];
