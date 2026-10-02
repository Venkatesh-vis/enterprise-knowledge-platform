"use client";

import { Save, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Textarea } from "@/app/shared/ui/textarea";

import type {
  KnowledgeBase,
  KnowledgeBaseFormValues,
} from "./knowledge-base-types";

type KnowledgeBaseFormProps = {
  mode: "create" | "edit";
  knowledgeBase?: KnowledgeBase;
  busy?: boolean;
  onSubmit: (values: KnowledgeBaseFormValues) => void;
  onCancel: () => void;
};

export function KnowledgeBaseForm({
  mode,
  knowledgeBase,
  busy = false,
  onSubmit,
  onCancel,
}: KnowledgeBaseFormProps) {
  const [name, setName] = useState(knowledgeBase?.name ?? "");
  const [description, setDescription] = useState(
    knowledgeBase?.description ?? "",
  );

  useEffect(() => {
    setName(knowledgeBase?.name ?? "");
    setDescription(knowledgeBase?.description ?? "");
  }, [knowledgeBase]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) return;

    onSubmit({
      name: trimmedName,
      description: description.trim(),
    });
  }

  const isEdit = mode === "edit";

  return (
    <section
      aria-labelledby="knowledge-base-form-title"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="knowledge-base-form-title"
            className="text-sm font-semibold text-slate-900"
          >
            {isEdit ? "Edit knowledge base" : "Create knowledge base"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "Update the name or description without changing its documents."
              : "Create a focused space for a group of related documents."}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          aria-label="Close knowledge base form"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="knowledge-base-name"
            className="text-sm font-medium text-slate-700"
          >
            Name
          </label>
          <Input
            id="knowledge-base-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Engineering"
            maxLength={150}
            autoFocus
            disabled={busy}
            className="mt-2"
          />
          <p className="mt-1.5 text-xs text-slate-400">{name.length}/150</p>
        </div>

        <div>
          <label
            htmlFor="knowledge-base-description"
            className="text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <Textarea
            id="knowledge-base-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Engineering documentation and internal standards"
            maxLength={500}
            rows={3}
            disabled={busy}
            className="mt-2"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            {description.length}/500
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row md:col-span-2 md:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !name.trim()}>
            <Save className="mr-1.5 h-4 w-4" />
            {busy
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
                ? "Save changes"
                : "Create knowledge base"}
          </Button>
        </div>
      </form>
    </section>
  );
}
