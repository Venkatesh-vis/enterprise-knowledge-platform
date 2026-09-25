"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest } from "@/app/shared/lib/api";
import { Button } from "@/app/shared/ui/button";
import { Checkbox } from "@/app/shared/ui/checkbox";
import { Input } from "@/app/shared/ui/input";

type KnowledgeBase = {
  id: string;
  name: string;
};

type UploadResponse = {
  success: boolean;
  message?: string;
  data: {
    document: {
      id: string;
      name: string;
    };
  };
};

export function UploadDocumentForm({
  knowledgeBases,
  initialSelection,
}: {
  knowledgeBases: KnowledgeBase[];
  initialSelection: string[];
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(initialSelection);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");

  function toggleBase(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Select a PDF or DOCX file.");
      return;
    }

    if (!selected.length) {
      setError("Select at least one knowledge base.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name.trim() || file.name);
    selected.forEach((id) => formData.append("knowledgeBaseIds", id));

    setBusy(true);

    try {
      const result = await apiRequest<UploadResponse>({
        path: "/api/documents",
        method: "POST",
        body: formData,
      });

      if (!result.success) {
        throw new Error(result.message ?? "Upload failed.");
      }

      setFile(null);
      setName("");
      setSuccess("Document uploaded successfully.");

      router.push("/documents");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className="text-sm font-medium text-slate-700">File</label>
        <Input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="mt-2 h-auto py-3"
          onChange={(event) =>
            setFile(event.target.files?.[0] ?? null)
          }
        />
        <p className="mt-2 text-xs text-slate-400">
          PDF or DOCX, maximum 25 MB.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Document name
        </label>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={file?.name || "Document name"}
          className="mt-2"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Knowledge bases
            </label>
            <p className="mt-1 text-xs text-slate-400">
              Preselect the bases that should be able to use this document.
            </p>
          </div>

          <span className="text-xs font-medium text-slate-500">
            {selected.length} selected
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {knowledgeBases.map((base) => (
            <label
              key={base.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
            >
              <Checkbox
                checked={selected.includes(base.id)}
                onCheckedChange={() => toggleBase(base.id)}
                aria-label={`Select ${base.name}`}
              />
              <span className="text-sm font-medium text-slate-800">
                {base.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {success}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          type="button"
          onClick={() => router.push("/documents")}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Uploading..." : "Upload document"}
        </Button>
      </div>
    </form>
  );
}
