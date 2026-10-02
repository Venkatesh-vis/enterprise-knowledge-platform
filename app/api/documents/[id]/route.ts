import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/http/api-middleware";
import { errorResponse } from "@/lib/http/api-error";
import { deleteDocument, getDocumentDetail, updateDocument } from "@/lib/documents/service";

export const GET = withApiMiddleware(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      return NextResponse.json(
        { success: true, data: { document: await getDocumentDetail(id) } },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      return errorResponse(error, "Document detail API");
    }
  },
  { permission: "DOCUMENT_READ", context: "Document detail API" },
);

export const PATCH = withApiMiddleware(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      return NextResponse.json({
        success: true,
        data: await updateDocument(id, {
          name: body?.name === undefined ? undefined : String(body.name),
          knowledgeBaseIds: Array.isArray(body?.knowledgeBaseIds)
            ? body.knowledgeBaseIds.map(String)
            : undefined,
        }),
      });
    } catch (error) {
      return errorResponse(error, "Update document API");
    }
  },
  { permission: "DOCUMENT_UPDATE", context: "Update document API" },
);

export const DELETE = withApiMiddleware(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      return NextResponse.json({
        success: true,
        data: await deleteDocument(id),
      });
    } catch (error) {
      return errorResponse(error, "Delete document API");
    }
  },
  { permission: "DOCUMENT_DELETE", context: "Delete document API" },
);
