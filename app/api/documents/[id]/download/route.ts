import { Readable } from "node:stream";
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
    if (!(await documentStorage.exists(document.storageKey))) {
      return new Response(JSON.stringify({ success: false, message: "Document file is unavailable." }), {
        status: 410,
        headers: { "Content-Type": "application/json" },
      });
    }
    const stream = documentStorage.createReadStream(document.storageKey);
    return new Response(Readable.toWeb(stream) as ReadableStream, {
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
