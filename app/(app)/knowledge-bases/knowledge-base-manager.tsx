"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "@/app/shared/lib/api";
import { Button } from "@/app/shared/ui/button";
import { ConfirmDialog } from "@/app/shared/ui/confirm-dialog";
import { Input } from "@/app/shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableScroll } from "@/app/shared/ui/table";

type Item = { id: string; name: string; slug: string; description: string | null; documentCount: number; createdAt: string; updatedAt: string };
type Data = { knowledgeBases: Item[]; permissions: { canCreate: boolean; canUpdate: boolean; canDelete: boolean } };
type CreateResponse = { success: boolean; message?: string; data: { knowledgeBase: Item } };
type DeleteResponse = { success: boolean; message?: string; data: { knowledgeBaseId: string } };

export function KnowledgeBaseManager({ initialData }: { initialData: Data }) {
  const router = useRouter();
  const [knowledgeBases, setKnowledgeBases] = useState(initialData.knowledgeBases);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => setKnowledgeBases(initialData.knowledgeBases), [initialData.knowledgeBases]);

  async function create() {
    const value = name.trim();
    if (!value) return setError("Knowledge base name is required.");
    setBusy(true); setError("");
    try {
      const result = await apiRequest<CreateResponse>({ path: "/api/knowledge-bases", method: "POST", body: { name: value, description: description.trim() } });
      if (!result.success) throw new Error(result.message ?? "Unable to create knowledge base.");
      setKnowledgeBases((current) => [result.data.knowledgeBase, ...current]);
      setName(""); setDescription("");
    } catch (caughtError) { setError(caughtError instanceof Error ? caughtError.message : "Unable to create knowledge base."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!deleteId) return;
    setBusy(true); setError("");
    try {
      const result = await apiRequest<DeleteResponse>({ path: `/api/knowledge-bases/${encodeURIComponent(deleteId)}`, method: "DELETE" });
      if (!result.success) throw new Error(result.message ?? "Unable to delete knowledge base.");
      setKnowledgeBases((current) => current.filter((item) => item.id !== result.data.knowledgeBaseId));
      setDeleteId(null);
    } catch (caughtError) { setError(caughtError instanceof Error ? caughtError.message : "Unable to delete knowledge base."); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-8">
      <header><h1 className="text-2xl font-semibold tracking-tight text-slate-950">Knowledge Bases</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Organize documents into separate retrieval contexts.</p></header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {initialData.permissions.canCreate && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold text-slate-900">Create knowledge base</h2><div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.5fr_auto] md:items-end"><div><label className="text-sm font-medium text-slate-700">Name</label><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Engineering" className="mt-2" /></div><div><label className="text-sm font-medium text-slate-700">Description</label><Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Engineering documentation" className="mt-2" /></div><Button onClick={create} disabled={busy}>{busy ? "Creating..." : "Create"}</Button></div></section>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {knowledgeBases.length ? <TableScroll><Table className="min-w-[900px]"><TableHeader><tr><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Documents</TableHead><TableHead>Updated</TableHead><TableHead className="text-right">Actions</TableHead></tr></TableHeader><TableBody>{knowledgeBases.map((base) => <TableRow key={base.id}><TableCell><div><p className="font-semibold text-slate-950">{base.name}</p><p className="mt-0.5 text-xs text-slate-400">/{base.slug}</p></div></TableCell><TableCell className="max-w-[360px] text-slate-500">{base.description || "—"}</TableCell><TableCell className="font-medium text-slate-600">{base.documentCount}</TableCell><TableCell className="text-slate-500">{new Date(base.updatedAt).toLocaleDateString("en-IN")}</TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="secondary" onClick={() => router.push(`/documents?knowledgeBaseId=${encodeURIComponent(base.id)}`)}>Documents</Button><Button variant="secondary" onClick={() => router.push(`/documents/upload?knowledgeBaseId=${encodeURIComponent(base.id)}`)}>Upload</Button>{initialData.permissions.canDelete && <Button variant="danger" onClick={() => setDeleteId(base.id)}>Delete</Button>}</div></TableCell></TableRow>)}</TableBody></Table></TableScroll> : <div className="px-6 py-16 text-center text-sm text-slate-500">No knowledge bases yet.</div>}
      </section>
      <ConfirmDialog open={Boolean(deleteId)} title="Delete knowledge base?" description="Documents will not be deleted. Only their association with this knowledge base will be removed." confirmLabel="Delete knowledge base" danger busy={busy} onClose={() => !busy && setDeleteId(null)} onConfirm={remove} />
    </div>
  );
}
