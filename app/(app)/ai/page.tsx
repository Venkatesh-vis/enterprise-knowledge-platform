import { requirePermission } from "@/lib/auth/authorization";
import { AIAssistant } from "./ai-assistant";

export default async function AIAssistantPage() {
  await requirePermission("AI_USE");

  return <AIAssistant />;
}
