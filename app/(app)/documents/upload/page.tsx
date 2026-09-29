import Link from "next/link";
import { redirect } from "next/navigation";
import { UploadDocumentForm } from "./upload-document-form";
import { getKnowledgeBaseOptions } from "@/lib/knowledge-bases/service";
import { requirePermission } from "@/lib/auth/authorization";

export default async function DocumentUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ knowledgeBaseId?: string }>;
}) {
  const auth = await requirePermission("DOCUMENT_CREATE");
  const bases = await getKnowledgeBaseOptions();
  if (!bases.length) {
    redirect("/knowledge-bases?create=1");
  }
  const params = await searchParams;
  const selected = bases.some((base) => base.id === params.knowledgeBaseId)
    ? [params.knowledgeBaseId as string]
    : [bases[0].id];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/documents" className="text-sm text-slate-500 hover:text-slate-900">← Documents</Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Upload document</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Upload a PDF or DOCX and immediately attach it to one or more knowledge bases.</p>
      </div>
      <UploadDocumentForm knowledgeBases={bases} initialSelection={selected} />
    </div>
  );
}
