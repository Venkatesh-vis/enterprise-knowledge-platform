export const DOCUMENT_MAX_SIZE_BYTES = 25 * 1024 * 1024;
export const DOCUMENT_PAGE_SIZE = 20;
export const DOCUMENT_FILE_TYPES = ["PDF", "DOCX"] as const;
export type DocumentFileType = (typeof DOCUMENT_FILE_TYPES)[number];
export const DOCUMENT_MIME_TYPES: Record<DocumentFileType, string> = {
  PDF: "application/pdf",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
export const DOCUMENT_EXTENSIONS: Record<DocumentFileType, string> = {
  PDF: ".pdf",
  DOCX: ".docx",
};
