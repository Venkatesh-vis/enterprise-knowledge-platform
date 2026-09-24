"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";

type Item = { id: string; name: string; slug: string; description: string | null; documentCount: number; createdAt: string; updatedAt: string };

type Data = { knowledgeBases: Item[]; permissions: { canCreate: boolean; canUpdate: boolean; canDelete: boolean } };

export function KnowledgeBaseManager({ initialData }: { initialData: Data }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    setError("");
    if (!name.trim()) return setError("Knowledge base name is required.");
    setBusy(true);
    try {
      const response = await fetch("/api/knowledge-bases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to create knowledge base.");
      setName("");
      setDescription("");
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create knowledge base.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this knowledge base? Documents will not be deleted; only their association with this base will be removed.")) return;
    const response = await fetch(`/api/knowledge-bases/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok || !result.success) return setError(result.message || "Unable to delete knowledge base.");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Knowledge Bases</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Organize documents into separate retrieval contexts. A document can belong to multiple knowledge bases.</p>
      </div>

      {initialData.permissions.canCreate && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Create knowledge base</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.5fr_auto] md:items-end">
            <div><label className="text-sm font-medium text-slate-700">Name</label><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Engineering" className="mt-2" /></div>
            <div><label className="text-sm font-medium text-slate-700">Description</label><Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Engineering documentation and standards" className="mt-2" /></div>
            <Button onClick={create} disabled={busy}>{busy ? "Creating..." : "Create"}</Button>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {initialData.knowledgeBases.map((base) => (
          <article key={base.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><h2 className="truncate text-base font-semibold text-slate-900">{base.name}</h2><p className="mt-1 text-xs text-slate-400">/{base.slug}</p></div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{base.documentCount} docs</span>
            </div>
            {base.description && <p className="mt-4 text-sm leading-6 text-slate-500">{base.description}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => router.push(`/documents?knowledgeBaseId=${base.id}`)}>View documents</Button>
              <Button variant="secondary" onClick={() => router.push(`/documents/upload?knowledgeBaseId=${base.id}`)}>Upload</Button>
              {initialData.permissions.canDelete && <Button variant="danger" onClick={() => remove(base.id)}>Delete</Button>}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
