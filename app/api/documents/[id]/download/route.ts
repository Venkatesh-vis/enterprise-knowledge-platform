import { errorResponse } from "@/lib/http/api-error";
import { getDocumentStorageAccess } from "@/lib/documents/service";
import { documentStorage } from "@/lib/documents/storage";
import { DOCUMENT_MIME_TYPES } from "@/lib/documents/constants";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const document = await getDocumentStorageAccess(id);
    const stream = await documentStorage.createReadStream(document.storageKey);

    return new Response(stream, {
      headers: {
        "Content-Type": DOCUMENT_MIME_TYPES[document.fileType],
        "Content-Length": String(document.sizeBytes),
        "Content-Disposition": `attachment; filename="${document.name.replace(/["\\\r\n]/g, "_")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return errorResponse(error, "Document download API");
  }
}
