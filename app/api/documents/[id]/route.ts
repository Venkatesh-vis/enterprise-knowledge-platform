import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http/api-error";
import { deleteDocument, getDocumentDetail, updateDocument } from "@/lib/documents/service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    return NextResponse.json({ success: true, data: { document: await getDocumentDetail(id) } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, "Document detail API");
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    return NextResponse.json({ success: true, data: await updateDocument(id, {
      name: body?.name === undefined ? undefined : String(body.name),
      knowledgeBaseIds: Array.isArray(body?.knowledgeBaseIds) ? body.knowledgeBaseIds.map(String) : undefined,
    }) });
  } catch (error) {
    return errorResponse(error, "Update document API");
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    return NextResponse.json({ success: true, data: await deleteDocument(id) });
  } catch (error) {
    return errorResponse(error, "Delete document API");
  }
}
