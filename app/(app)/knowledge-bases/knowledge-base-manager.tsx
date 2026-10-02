"use client";

import { BookOpen, Plus, X } from "lucide-react";
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

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Knowledge management
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Knowledge Bases
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Organize documents into focused knowledge spaces for your team.
              </p>
            </div>
          </div>

          {initialData.permissions.canCreate && (
            <Button
              onClick={formMode === "create" ? closeForm : openCreateForm}
              variant={formMode === "create" ? "ghost" : "primary"}
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
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {formMode && (
        <KnowledgeBaseForm
          mode={formMode}
          knowledgeBase={editingKnowledgeBase ?? undefined}
          busy={formBusy}
          onSubmit={submitForm}
          onCancel={closeForm}
        />
      )}

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
