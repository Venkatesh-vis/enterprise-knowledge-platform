"use client";

import { motion } from "framer-motion";
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
    <motion.section
      aria-labelledby="knowledge-base-form-title"
      initial={{ opacity: 0, height: 0, y: -8 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/40 p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
              {isEdit ? "Update knowledge" : "New knowledge space"}
            </p>
            <h2
              id="knowledge-base-form-title"
              className="mt-2 text-base font-semibold text-slate-950"
            >
              {isEdit ? "Edit knowledge base" : "Create knowledge base"}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
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
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
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
              className="mt-2 h-11 bg-white"
            />
            <p className="mt-1.5 text-right text-[11px] text-slate-400">
              {name.length}/150
            </p>
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
              className="mt-2 min-h-11 bg-white"
            />
            <p className="mt-1.5 text-right text-[11px] text-slate-400">
              {description.length}/500
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row md:col-span-2 md:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy || !name.trim()}
              className="shadow-sm"
            >
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
      </div>
    </motion.section>
  );
}
