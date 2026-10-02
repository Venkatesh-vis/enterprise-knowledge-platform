"use client";

import {
  BookOpen,
  FileText,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
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
  onEdit: (knowledgeBase: KnowledgeBase) => void;
  onDelete: (knowledgeBaseId: string) => void;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function KnowledgeBaseCard({
  knowledgeBase,
  permissions,
  busyAction = null,
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
    <Card className="group flex min-h-[290px] flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-950">
              {knowledgeBase.name}
            </h2>
            <p className="mt-1 truncate font-mono text-xs text-slate-400">
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

      <CardContent className="flex-1">
        <p className="min-h-[60px] text-sm leading-6 text-slate-500">
          {knowledgeBase.description || "No description added yet."}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge>
            <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {knowledgeBase.documentCount}{" "}
            {knowledgeBase.documentCount === 1 ? "document" : "documents"}
          </Badge>
          <span className="text-xs text-slate-400">
            Updated {formatDate(knowledgeBase.updatedAt)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          Created {formatDate(knowledgeBase.createdAt)}
        </p>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={openDocuments}
            disabled={isBusy}
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Documents
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={openUpload}
            disabled={isBusy}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
