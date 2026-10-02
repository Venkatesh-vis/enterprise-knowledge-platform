"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Search, SlidersHorizontal } from "lucide-react";

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

  const hasSearchQuery = normalizedQuery.length > 0;

  return (
    <section aria-label="Knowledge bases" className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Your knowledge bases
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {hasSearchQuery
                ? `${filteredKnowledgeBases.length} of ${knowledgeBases.length} shown`
                : `${knowledgeBases.length} ${knowledgeBases.length === 1 ? "knowledge base" : "knowledge bases"}`}
            </p>
          </div>
        </div>

        {knowledgeBases.length > 0 && (
          <div className="relative w-full sm:w-80">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search name, slug or description"
              aria-label="Search knowledge bases"
              className="h-10 border-slate-200 bg-white pl-9 pr-9 shadow-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {filteredKnowledgeBases.length > 0 ? (
        <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {filteredKnowledgeBases.map((knowledgeBase) => (
              <KnowledgeBaseCard
                key={knowledgeBase.id}
                knowledgeBase={knowledgeBase}
                permissions={permissions}
                busyAction={
                  busyKnowledgeBaseId === knowledgeBase.id ? busyAction : null
                }
                index={knowledgeBases.findIndex(
                  (item) => item.id === knowledgeBase.id,
                )}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          key={hasSearchQuery ? "search-empty" : "empty"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <EmptyState
            icon={hasSearchQuery ? Search : BookOpen}
            title={
              hasSearchQuery
                ? "No knowledge bases found"
                : "No knowledge bases yet"
            }
            description={
              hasSearchQuery
                ? "Try a different name, slug, or description."
                : "Create your first knowledge base to start organizing documents."
            }
          />
        </motion.div>
      )}
    </section>
  );
}
