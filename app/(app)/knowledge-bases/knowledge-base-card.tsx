"use client";

import {
  BookOpen,
  CalendarDays,
  FileText,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { ActionMenu } from "@/app/shared/ui/action-menu";
import { Badge } from "@/app/shared/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/app/shared/ui/card";
import { Button } from "@/app/shared/ui/button";

import type {
  KnowledgeBase,
  KnowledgeBasePermissions,
} from "./knowledge-base-types";

type KnowledgeBaseCardProps = {
  knowledgeBase: KnowledgeBase;
  permissions: KnowledgeBasePermissions;
  busyAction?: "edit" | "delete" | null;
  index?: number;
  onEdit: (knowledgeBase: KnowledgeBase) => void;
  onDelete: (knowledgeBaseId: string) => void;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function KnowledgeBaseCard({
  knowledgeBase,
  permissions,
  busyAction = null,
  index = 0,
  onEdit,
  onDelete,
}: KnowledgeBaseCardProps) {
  const router = useRouter();
  const isBusy = busyAction !== null;

  function openDocuments() {
    router.push(
      `/documents?knowledgeBaseId=${encodeURIComponent(knowledgeBase.id)}`,
    );
  }

  function openUpload() {
    router.push(
      `/documents/upload?knowledgeBaseId=${encodeURIComponent(
        knowledgeBase.id,
      )}`,
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.045, 0.24) }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="relative flex h-full min-h-[310px] flex-col overflow-hidden border-slate-200/80 bg-white/95 shadow-sm ring-1 ring-transparent transition-[box-shadow,border-color] duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/5">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-950 via-indigo-500 to-slate-200"
        />

        <CardHeader className="flex items-start justify-between gap-4 border-slate-100 pb-4 pt-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/40 to-transparent"
              />
              <BookOpen className="relative h-5 w-5" aria-hidden="true" />
            </div>

            <div className="min-w-0 pt-0.5">
              <h2 className="truncate text-[15px] font-semibold text-slate-950">
                {knowledgeBase.name}
              </h2>
              <p className="mt-1 truncate font-mono text-[11px] text-slate-400">
                /{knowledgeBase.slug}
              </p>
            </div>
          </div>

          {(permissions.canUpdate || permissions.canDelete) && (
            <ActionMenu
              label={`Actions for ${knowledgeBase.name}`}
              items={[
                ...(permissions.canUpdate
                  ? [
                      {
                        label: "Edit",
                        icon: Pencil,
                        disabled: isBusy,
                        onSelect: () => onEdit(knowledgeBase),
                      },
                    ]
                  : []),
                ...(permissions.canDelete
                  ? [
                      {
                        label: "Delete",
                        icon: Trash2,
                        danger: true,
                        disabled: isBusy,
                        onSelect: () => onDelete(knowledgeBase.id),
                      },
                    ]
                  : []),
              ]}
            />
          )}
        </CardHeader>

        <CardContent className="flex-1 pb-5">
          <p className="min-h-[72px] text-sm leading-6 text-slate-500">
            {knowledgeBase.description || "No description added yet."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Badge className="border border-slate-200 bg-slate-50 text-slate-700">
              <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              {knowledgeBase.documentCount}{" "}
              {knowledgeBase.documentCount === 1 ? "document" : "documents"}
            </Badge>

            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Updated {formatDate(knowledgeBase.updatedAt)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-stretch gap-3 border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-400">
            Created {formatDate(knowledgeBase.createdAt)}
          </p>

          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={openDocuments}
              disabled={isBusy}
              className="h-9"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Documents
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={openUpload}
              disabled={isBusy}
              className="h-9"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
