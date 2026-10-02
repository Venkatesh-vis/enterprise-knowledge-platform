"use client";

import { BookOpen, Search } from "lucide-react";

import { EmptyState } from "@/app/shared/ui/empty-state";
import { Input } from "@/app/shared/ui/input";

import { KnowledgeBaseCard } from "./knowledge-base-card";
import type {
  KnowledgeBase,
  KnowledgeBasePermissions,
} from "./knowledge-base-types";

type KnowledgeBaseGridProps = {
  knowledgeBases: KnowledgeBase[];
  permissions: KnowledgeBasePermissions;
  query: string;
  onQueryChange: (value: string) => void;
  onEdit: (knowledgeBase: KnowledgeBase) => void;
  onDelete: (knowledgeBaseId: string) => void;
  busyKnowledgeBaseId?: string | null;
  busyAction?: "edit" | "delete" | null;
};

export function KnowledgeBaseGrid({
  knowledgeBases,
  permissions,
  query,
  onQueryChange,
  onEdit,
  onDelete,
  busyKnowledgeBaseId = null,
  busyAction = null,
}: KnowledgeBaseGridProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredKnowledgeBases = normalizedQuery
    ? knowledgeBases.filter((item) =>
        [item.name, item.slug, item.description ?? ""].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        ),
      )
    : knowledgeBases;

  return (
    <section aria-label="Knowledge bases" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Your knowledge bases
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {knowledgeBases.length}{" "}
            {knowledgeBases.length === 1 ? "knowledge base" : "knowledge bases"}
          </p>
        </div>

        {knowledgeBases.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search knowledge bases"
              aria-label="Search knowledge bases"
              className="pl-9"
            />
          </div>
        )}
      </div>

      {filteredKnowledgeBases.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredKnowledgeBases.map((knowledgeBase) => (
            <KnowledgeBaseCard
              key={knowledgeBase.id}
              knowledgeBase={knowledgeBase}
              permissions={permissions}
              busyAction={
                busyKnowledgeBaseId === knowledgeBase.id ? busyAction : null
              }
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : knowledgeBases.length > 0 ? (
        <EmptyState
          icon={Search}
          title="No knowledge bases found"
          description="Try a different name, slug, or description."
        />
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No knowledge bases yet"
          description="Create your first knowledge base to start organizing documents."
        />
      )}
    </section>
  );
}
