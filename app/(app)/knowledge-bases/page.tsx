import { KnowledgeBaseManager } from "./knowledge-base-manager";
import { getKnowledgeBasePageData } from "@/lib/knowledge-bases/service";

export default async function KnowledgeBasesPage() {
  return <KnowledgeBaseManager initialData={await getKnowledgeBasePageData()} />;
}
