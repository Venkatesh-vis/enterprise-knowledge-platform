import "server-only";

import { randomUUID } from "node:crypto";
import { Op, QueryTypes } from "sequelize";
import { KnowledgeBase, DocumentKnowledgeBase } from "@/db/models";
import sequelize from "@/lib/database";
import { requirePermission } from "@/lib/auth/authorization";
import { createAuditLog } from "@/lib/audit/audit-service";

export class KnowledgeBaseServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "KnowledgeBaseServiceError";
    this.status = status;
  }
}

function validateName(name: string) {
  const value = name.trim();
  if (!value) throw new KnowledgeBaseServiceError("Knowledge base name is required.");
  if (value.length > 150) throw new KnowledgeBaseServiceError("Knowledge base name cannot exceed 150 characters.");
  return value;
}

function validateDescription(value: unknown) {
  const description = value == null ? null : String(value).trim();
  if (description && description.length > 500) throw new KnowledgeBaseServiceError("Description cannot exceed 500 characters.");
  return description || null;
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "knowledge-base";
}

async function uniqueSlug(organizationId: string, name: string, excludeId?: string) {
  const base = slugify(name);
  let candidate = base;
  let index = 1;
  while (await KnowledgeBase.count({ where: { organizationId, slug: candidate, ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}) } })) {
    index += 1;
    candidate = `${base}-${index}`;
  }
  return candidate;
}

function serialize(row: any) {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: row.description ? String(row.description) : null,
    documentCount: Number(row.documentCount ?? 0),
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export async function getKnowledgeBasePageData() {
  const auth = await requirePermission("KNOWLEDGE_BASE_READ");
  const rows = await sequelize.query(
    "SELECT kb.id, kb.name, kb.slug, kb.description, kb.createdAt, kb.updatedAt, COUNT(dkb.documentId) AS documentCount FROM knowledge_bases kb LEFT JOIN document_knowledge_bases dkb ON dkb.knowledgeBaseId = kb.id WHERE kb.organizationId = :organizationId GROUP BY kb.id, kb.name, kb.slug, kb.description, kb.createdAt, kb.updatedAt ORDER BY kb.createdAt DESC",
    { replacements: { organizationId: auth.organization.id }, type: QueryTypes.SELECT },
  );
  return {
    knowledgeBases: rows.map(serialize),
    permissions: {
      canCreate: auth.permissions.includes("KNOWLEDGE_BASE_CREATE"),
      canUpdate: auth.permissions.includes("KNOWLEDGE_BASE_UPDATE"),
      canDelete: auth.permissions.includes("KNOWLEDGE_BASE_DELETE"),
    },
  };
}

export async function getKnowledgeBaseOptions() {
  const auth = await requirePermission("KNOWLEDGE_BASE_READ");
  const rows = await KnowledgeBase.findAll({ where: { organizationId: auth.organization.id }, attributes: ["id", "name"], order: [["name", "ASC"]], raw: true });
  return rows.map((row: any) => ({ id: String(row.id), name: String(row.name) }));
}

export async function createKnowledgeBase(input: { name: string; description?: string }) {
  const auth = await requirePermission("KNOWLEDGE_BASE_CREATE");
  const name = validateName(input.name);
  const id = randomUUID();
  await KnowledgeBase.create({ id, organizationId: auth.organization.id, name, slug: await uniqueSlug(auth.organization.id, name), description: validateDescription(input.description), createdByUserId: auth.user.id });
  await createAuditLog({ action: "KNOWLEDGE_BASE_CREATED", resource: "KNOWLEDGE_BASE", resourceId: id, metadata: { name } });
  return { knowledgeBase: await getKnowledgeBase(id) };
}

export async function getKnowledgeBase(id: string) {
  const auth = await requirePermission("KNOWLEDGE_BASE_READ");
  const row = await KnowledgeBase.findOne({ where: { id: id.trim(), organizationId: auth.organization.id }, raw: true });
  if (!row) throw new KnowledgeBaseServiceError("Knowledge base not found.", 404);
  const documentCount = await DocumentKnowledgeBase.count({ where: { knowledgeBaseId: row.id } });
  return serialize({ ...row, documentCount });
}

export async function updateKnowledgeBase(id: string, input: { name?: string; description?: string | null }) {
  const auth = await requirePermission("KNOWLEDGE_BASE_UPDATE");
  const row = await KnowledgeBase.findOne({ where: { id: id.trim(), organizationId: auth.organization.id } });
  if (!row) throw new KnowledgeBaseServiceError("Knowledge base not found.", 404);
  if (input.name !== undefined) {
    row.name = validateName(input.name);
    row.slug = await uniqueSlug(auth.organization.id, String(row.name), id);
  }
  if (input.description !== undefined) row.description = validateDescription(input.description);
  await row.save();
  await createAuditLog({ action: "KNOWLEDGE_BASE_UPDATED", resource: "KNOWLEDGE_BASE", resourceId: id, metadata: { name: String(row.name) } });
  return { knowledgeBase: await getKnowledgeBase(id) };
}

export async function deleteKnowledgeBase(id: string) {
  const auth = await requirePermission("KNOWLEDGE_BASE_DELETE");
  const row = await KnowledgeBase.findOne({ where: { id: id.trim(), organizationId: auth.organization.id } });
  if (!row) throw new KnowledgeBaseServiceError("Knowledge base not found.", 404);
  await sequelize.transaction(async (transaction) => {
    await DocumentKnowledgeBase.destroy({ where: { knowledgeBaseId: id }, transaction });
    await row.destroy({ transaction });
  });
  await createAuditLog({ action: "KNOWLEDGE_BASE_DELETED", resource: "KNOWLEDGE_BASE", resourceId: id, metadata: { name: String(row.name) } });
  return { knowledgeBaseId: id };
}
