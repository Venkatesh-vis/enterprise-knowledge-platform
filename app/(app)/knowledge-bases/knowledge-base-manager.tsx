"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Layers3,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { apiRequest } from "@/app/shared/lib/api";
import { Button } from "@/app/shared/ui/button";
import { ConfirmDialog } from "@/app/shared/ui/confirm-dialog";

import { KnowledgeBaseForm } from "./knowledge-base-form";
import { KnowledgeBaseGrid } from "./knowledge-base-grid";
import type {
  KnowledgeBase,
  KnowledgeBaseFormValues,
  KnowledgeBasePageData,
} from "./knowledge-base-types";

type CreateResponse = {
  success: boolean;
  message?: string;
  data: { knowledgeBase: KnowledgeBase };
};

type UpdateResponse = {
  success: boolean;
  message?: string;
  data: { knowledgeBase: KnowledgeBase };
};

type DeleteResponse = {
  success: boolean;
  message?: string;
  data: { knowledgeBaseId: string };
};

type BusyAction = {
  type: "create" | "edit" | "delete";
  knowledgeBaseId?: string;
} | null;

export function KnowledgeBaseManager({
  initialData,
}: {
  initialData: KnowledgeBasePageData;
}) {
  const [knowledgeBases, setKnowledgeBases] = useState(
    initialData.knowledgeBases,
  );
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingKnowledgeBase, setEditingKnowledgeBase] =
    useState<KnowledgeBase | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState<BusyAction>(null);

  useEffect(() => {
    setKnowledgeBases(initialData.knowledgeBases);
  }, [initialData.knowledgeBases]);

  function openCreateForm() {
    setError("");
    setEditingKnowledgeBase(null);
    setFormMode("create");
  }

  function openEditForm(knowledgeBase: KnowledgeBase) {
    setError("");
    setEditingKnowledgeBase(knowledgeBase);
    setFormMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    if (busyAction) return;
    setFormMode(null);
    setEditingKnowledgeBase(null);
  }

  async function submitForm(values: KnowledgeBaseFormValues) {
    const isEdit = formMode === "edit";

    if (!formMode || (isEdit && !editingKnowledgeBase)) return;

    const knowledgeBaseId = editingKnowledgeBase?.id;

    setBusyAction({
      type: isEdit ? "edit" : "create",
      knowledgeBaseId,
    });
    setError("");

    try {
      if (isEdit && knowledgeBaseId) {
        const result = await apiRequest<UpdateResponse>({
          path: `/api/knowledge-bases/${encodeURIComponent(knowledgeBaseId)}`,
          method: "PATCH",
          body: values,
        });

        if (!result.success) {
          throw new Error(result.message ?? "Unable to update knowledge base.");
        }

        setKnowledgeBases((current) =>
          current.map((item) =>
            item.id === result.data.knowledgeBase.id
              ? result.data.knowledgeBase
              : item,
          ),
        );
      } else {
        const result = await apiRequest<CreateResponse>({
          path: "/api/knowledge-bases",
          method: "POST",
          body: values,
        });

        if (!result.success) {
          throw new Error(result.message ?? "Unable to create knowledge base.");
        }

        setKnowledgeBases((current) => [
          result.data.knowledgeBase,
          ...current,
        ]);
      }

      window.dispatchEvent(new Event("workspace:changed"));
      setFormMode(null);
      setEditingKnowledgeBase(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : isEdit
            ? "Unable to update knowledge base."
            : "Unable to create knowledge base.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function remove() {
    if (!deleteId) return;

    const knowledgeBaseId = deleteId;

    setBusyAction({ type: "delete", knowledgeBaseId });
    setError("");

    try {
      const result = await apiRequest<DeleteResponse>({
        path: `/api/knowledge-bases/${encodeURIComponent(knowledgeBaseId)}`,
        method: "DELETE",
      });

      if (!result.success) {
        throw new Error(
          result.message ?? "Unable to delete knowledge base.",
        );
      }

      setKnowledgeBases((current) =>
        current.filter((item) => item.id !== result.data.knowledgeBaseId),
      );
      window.dispatchEvent(new Event("workspace:changed"));
      setDeleteId(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete knowledge base.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  const formBusy = busyAction?.type === formMode && formMode !== null;
  const documentCount = knowledgeBases.reduce(
    (total, knowledgeBase) => total + knowledgeBase.documentCount,
    0,
  );

  return (
    <div className="space-y-7 sm:space-y-8">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-950 px-6 py-7 text-white shadow-lg shadow-slate-950/10 sm:px-8 sm:py-8"
      >
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 left-1/3 h-60 w-60 rounded-full bg-sky-400/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner">
                <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                Knowledge management
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              Knowledge Bases
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-[15px]">
              Organize documents into focused knowledge spaces your team can
              discover, maintain, and reuse.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-slate-300">
                <Layers3 className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-semibold text-white">
                  {knowledgeBases.length}
                </span>
                {knowledgeBases.length === 1
                  ? "knowledge base"
                  : "knowledge bases"}
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-slate-300">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-semibold text-white">
                  {documentCount}
                </span>
                {documentCount === 1 ? "document" : "documents"} organized
              </div>
            </div>
          </div>

          {initialData.permissions.canCreate && (
            <Button
              onClick={formMode === "create" ? closeForm : openCreateForm}
              variant={formMode === "create" ? "secondary" : "primary"}
              className="relative shrink-0 shadow-lg shadow-black/20"
            >
              {formMode === "create" ? (
                <X className="mr-1.5 h-4 w-4" />
              ) : (
                <Plus className="mr-1.5 h-4 w-4" />
              )}
              {formMode === "create" ? "Close" : "New knowledge base"}
            </Button>
          )}
        </div>
      </motion.header>

      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            className="overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {formMode && (
          <KnowledgeBaseForm
            mode={formMode}
            knowledgeBase={editingKnowledgeBase ?? undefined}
            busy={formBusy}
            onSubmit={submitForm}
            onCancel={closeForm}
          />
        )}
      </AnimatePresence>

      <KnowledgeBaseGrid
        knowledgeBases={knowledgeBases}
        permissions={initialData.permissions}
        query={query}
        onQueryChange={setQuery}
        onEdit={openEditForm}
        onDelete={setDeleteId}
        busyKnowledgeBaseId={busyAction?.knowledgeBaseId}
        busyAction={
          busyAction?.type === "edit" || busyAction?.type === "delete"
            ? busyAction.type
            : null
        }
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete knowledge base?"
        description="Documents will not be deleted. Only their association with this knowledge base will be removed."
        confirmLabel="Delete knowledge base"
        danger
        busy={busyAction?.type === "delete"}
        onClose={() => busyAction?.type !== "delete" && setDeleteId(null)}
        onConfirm={remove}
      />
    </div>
  );
}
