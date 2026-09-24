import { DOCUMENT_EXTENSIONS, DOCUMENT_MAX_SIZE_BYTES, DOCUMENT_MIME_TYPES, type DocumentFileType } from "./constants";

export class DocumentValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "DocumentValidationError";
  }
}

export function validateDocumentName(name: string) {
  const value = name.trim();
  if (!value) throw new DocumentValidationError("Document name is required.");
  if (value.length > 255) throw new DocumentValidationError("Document name cannot exceed 255 characters.");
  return value.replace(/[\u0000-\u001f<>:"/\\|?*]/g, "-").trim();
}

export function normalizeKnowledgeBaseIds(values: unknown[]) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];
}

export async function validateDocumentFile(file: File): Promise<DocumentFileType> {
  if (!file || file.size === 0) throw new DocumentValidationError("The selected file is empty.");
  if (file.size > DOCUMENT_MAX_SIZE_BYTES) throw new DocumentValidationError("The document exceeds the 25 MB limit.");

  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const type = Object.entries(DOCUMENT_EXTENSIONS).find(([, value]) => value === extension)?.[0] as DocumentFileType | undefined;
  if (!type) throw new DocumentValidationError("Only PDF and DOCX files are supported.");

  const allowedMime = DOCUMENT_MIME_TYPES[type];
  if (file.type && file.type !== allowedMime && file.type !== "application/octet-stream") {
    throw new DocumentValidationError("The file type does not match its extension.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (type === "PDF") {
    const signature = buffer.subarray(0, 5).toString("ascii");
    if (signature !== "%PDF-") throw new DocumentValidationError("The PDF file is invalid.");
  }

  if (type === "DOCX") {
    const zipSignature = buffer.subarray(0, 4).toString("hex");
    if (zipSignature !== "504b0304" || !buffer.includes(Buffer.from("word/document.xml"))) {
      throw new DocumentValidationError("The DOCX file is invalid.");
    }
  }

  return type;
}
