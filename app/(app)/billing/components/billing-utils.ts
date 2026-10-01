import {
  Bot,
  Database,
  FileText,
  HardDrive,
  type LucideIcon,
  Users,
} from "lucide-react";

export const RESOURCE_ICONS: Record<string, LucideIcon> = {
  documents: FileText,
  knowledge_bases: Database,
  team_members: Users,
  ai_queries_month: Bot,
  storage_mb: HardDrive,
};

export function formatMoney(amountInPaise: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountInPaise / 100);
}

export function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";
}

export function formatResource(resource: string) {
  return resource.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function yearlyMonthlyPrice(price: number) {
  return Math.round(price * (1 - 20 / 100));
}
