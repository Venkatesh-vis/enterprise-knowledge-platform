import "server-only";

import { randomUUID } from "node:crypto";
import { Op } from "sequelize";
import { Document, DocumentKnowledgeBase, KnowledgeBase, User } from "@/db/models";
import sequelize from "@/lib/database";
import { requirePermission } from "@/lib/auth/authorization";
import { createAuditLog } from "@/lib/audit/audit-service";
import { DOCUMENT_EXTENSIONS, DOCUMENT_PAGE_SIZE, type DocumentFileType } from "./constants";
import { documentStorage } from "./storage";
import { normalizeKnowledgeBaseIds, validateDocumentFile, validateDocumentName } from "./validation";

export class DocumentServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "DocumentServiceError";
    this.status = status;
  }
}

function serialize(row: any) {
  const value = typeof row.get === "function" ? row.get({ plain: true }) : row;
  return {
    id: String(value.id),
    name: String(value.name),
    fileType: value.fileType as DocumentFileType,
    sizeBytes: Number(value.sizeBytes),
    status: String(value.status),
    uploadedByName: String(value.uploadedByUser?.name ?? value.uploadedBy ?? "Unknown"),
    createdAt: new Date(value.createdAt).toISOString(),
    updatedAt: new Date(value.updatedAt).toISOString(),
    knowledgeBases: (value.knowledgeBases ?? []).map((item: any) => ({ id: String(item.id), name: String(item.name) })),
  };
}

async function assertBases(organizationId: string, ids: string[], transaction?: any) {
  const uniqueIds = normalizeKnowledgeBaseIds(ids);
  if (!uniqueIds.length) throw new DocumentServiceError("Select at least one knowledge base.");
  const rows = await KnowledgeBase.findAll({ where: { organizationId, id: { [Op.in]: uniqueIds } }, attributes: ["id"], transaction, raw: true });
  if (rows.length !== uniqueIds.length) throw new DocumentServiceError("One or more selected knowledge bases are invalid.", 403);
  return uniqueIds;
}

async function findOwnedDocument(id: string, organizationId: string, transaction?: any) {
  const row = await Document.findOne({
    where: { id: id.trim(), organizationId },
    include: [
      { model: User, as: "uploadedByUser", attributes: ["id", "name"], required: false },
      { model: KnowledgeBase, as: "knowledgeBases", attributes: ["id", "name"], through: { attributes: [] }, required: false },
    ],
    transaction,
  });
  if (!row) throw new DocumentServiceError("Document not found.", 404);
  return row;
}

export async function getDocumentPageData(input: {
  query?: string;
  fileType?: string;
  status?: string;
  knowledgeBaseId?: string;
  page?: number;
} = {}) {
  const auth = await requirePermission("DOCUMENT_READ");
  const page = Math.max(1, Number(input.page) || 1);
  const where: any = { organizationId: auth.organization.id };
  const query = input.query?.trim().slice(0, 100) ?? "";
  if (query) where.name = { [Op.like]: `%${query}%` };
  if (input.fileType === "PDF" || input.fileType === "DOCX") where.fileType = input.fileType;
  if (["PROCESSING", "PROCESSED", "FAILED"].includes(input.status ?? "")) where.status = input.status;

  const knowledgeBaseId = input.knowledgeBaseId?.trim() ?? "";
  if (knowledgeBaseId) {
    const base = await KnowledgeBase.findOne({ where: { id: knowledgeBaseId, organizationId: auth.organization.id }, attributes: ["id"] });
    if (!base) throw new DocumentServiceError("Knowledge base not found.", 404);
  }

  const include: any = { model: KnowledgeBase, as: "knowledgeBases", attributes: ["id", "name"], through: { attributes: [] }, required: Boolean(knowledgeBaseId) };
  if (knowledgeBaseId) include.where = { id: knowledgeBaseId };

  const result = await Document.findAndCountAll({
    where,
    include: [
      { model: User, as: "uploadedByUser", attributes: ["id", "name"], required: false },
      include,
    ],
    order: [["createdAt", "DESC"], ["id", "DESC"]],
    limit: DOCUMENT_PAGE_SIZE,
    offset: (page - 1) * DOCUMENT_PAGE_SIZE,
    distinct: true,
  });

  const totalItems = Number(result.count);
  const totalPages = Math.max(1, Math.ceil(totalItems / DOCUMENT_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  return {
    documents: result.rows.map(serialize),
    knowledgeBases: (await KnowledgeBase.findAll({ where: { organizationId: auth.organization.id }, attributes: ["id", "name"], order: [["name", "ASC"]], raw: true })).map((item: any) => ({ id: String(item.id), name: String(item.name) })),
    filters: { query, fileType: input.fileType ?? "ALL", status: input.status ?? "ALL", knowledgeBaseId },
    pagination: { page: currentPage, pageSize: DOCUMENT_PAGE_SIZE, totalItems, totalPages },
    permissions: {
      canRead: auth.permissions.includes("DOCUMENT_READ"),
      canCreate: auth.permissions.includes("DOCUMENT_CREATE"),
      canUpdate: auth.permissions.includes("DOCUMENT_UPDATE"),
      canDelete: auth.permissions.includes("DOCUMENT_DELETE"),
    },
  };
}

export async function getDocumentDetail(id: string) {
  const auth = await requirePermission("DOCUMENT_READ");
  return serialize(await findOwnedDocument(id, auth.organization.id));
}

export async function getDocumentStorageAccess(id: string) {
  const auth = await requirePermission("DOCUMENT_READ");
  const row = await Document.findOne({ where: { id: id.trim(), organizationId: auth.organization.id }, attributes: ["id", "name", "fileType", "sizeBytes", "storageKey"], raw: true });
  if (!row) throw new DocumentServiceError("Document not found.", 404);
  return row;
}

export async function createDocument(input: { file: File; name: string; knowledgeBaseIds: string[] }) {
  const auth = await requirePermission("DOCUMENT_CREATE");
  const fileType = await validateDocumentFile(input.file);
  const name = validateDocumentName(input.name || input.file.name);
  const baseIds = await assertBases(auth.organization.id, input.knowledgeBaseIds);
  const id = randomUUID();
  const storageKey = `${auth.organization.id}/${id}${DOCUMENT_EXTENSIONS[fileType]}`;
  let stored = false;

  try {
    await documentStorage.save(storageKey, Buffer.from(await input.file.arrayBuffer()));
    stored = true;
    await sequelize.transaction(async (transaction) => {
      await Document.create({
        id,
        organizationId: auth.organization.id,
        name,
        fileType,
        storageKey,
        sizeBytes: input.file.size,
        status: "PROCESSED",
        uploadedBy: auth.user.name,
        uploadedByUserId: auth.user.id,
      }, { transaction });
      await DocumentKnowledgeBase.bulkCreate(baseIds.map((knowledgeBaseId) => ({ id: randomUUID(), documentId: id, knowledgeBaseId })), { transaction });
    });
  } catch (error) {
    if (stored) await documentStorage.remove(storageKey).catch(() => undefined);
    throw error instanceof DocumentServiceError ? error : new DocumentServiceError("The document could not be stored.", 500);
  }

  await createAuditLog({ action: "DOCUMENT_CREATED", resource: "DOCUMENT", resourceId: id, metadata: { name, fileType, knowledgeBaseIds: baseIds } });
  return { document: await getDocumentDetail(id) };
}

export async function updateDocument(id: string, input: { name?: string; knowledgeBaseIds?: string[] }) {
  const auth = await requirePermission("DOCUMENT_UPDATE");
  if (input.name === undefined && input.knowledgeBaseIds === undefined) throw new DocumentServiceError("No document changes were supplied.");

  await sequelize.transaction(async (transaction) => {
    const row = await findOwnedDocument(id, auth.organization.id, transaction);
    if (input.name !== undefined) await row.update({ name: validateDocumentName(input.name) }, { transaction });
    if (input.knowledgeBaseIds !== undefined) {
      const baseIds = normalizeKnowledgeBaseIds(input.knowledgeBaseIds);
      await assertBases(auth.organization.id, baseIds, transaction);
      await DocumentKnowledgeBase.destroy({ where: { documentId: id }, transaction });
      await DocumentKnowledgeBase.bulkCreate(baseIds.map((knowledgeBaseId) => ({ id: randomUUID(), documentId: id, knowledgeBaseId })), { transaction });
    }
  });

  await createAuditLog({ action: input.knowledgeBaseIds ? "DOCUMENT_SHARED" : "DOCUMENT_UPDATED", resource: "DOCUMENT", resourceId: id, metadata: { name: input.name ?? null } });
  return { document: await getDocumentDetail(id) };
}

export async function deleteDocument(id: string) {
  const auth = await requirePermission("DOCUMENT_DELETE");
  let storageKey = "";
  await sequelize.transaction(async (transaction) => {
    const row = await Document.findOne({ where: { id: id.trim(), organizationId: auth.organization.id }, attributes: ["id", "storageKey"], transaction, lock: transaction.LOCK.UPDATE });
    if (!row) throw new DocumentServiceError("Document not found.", 404);
    storageKey = String(row.storageKey);
    await row.destroy({ transaction });
  });
  if (storageKey) await documentStorage.remove(storageKey).catch((error) => console.error("Document storage cleanup failed:", error));
  await createAuditLog({ action: "DOCUMENT_DELETED", resource: "DOCUMENT", resourceId: id, metadata: null });
  return { documentId: id };
}
