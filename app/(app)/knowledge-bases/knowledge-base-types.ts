"use client";

export type KnowledgeBase = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeBasePermissions = {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export type KnowledgeBasePageData = {
  knowledgeBases: KnowledgeBase[];
  permissions: KnowledgeBasePermissions;
};

export type KnowledgeBaseFormValues = {
  name: string;
  description: string;
};
