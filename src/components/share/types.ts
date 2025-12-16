import type { ComponentType } from "react";

export type SharePlatformId =
  | "whatsapp"
  | "telegram"
  | "twitter"
  | "email";

export type SharePlatform = {
  id: SharePlatformId;
  name: string;
  icon: ComponentType<{ className?: string }>;
  brandVar: string; // CSS variable name without `--`
};
