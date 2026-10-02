import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/http/api-middleware";
import { errorResponse } from "@/lib/http/api-error";
import { deleteKnowledgeBase, getKnowledgeBase, updateKnowledgeBase } from "@/lib/knowledge-bases/service";

type Context = { params: Promise<{ id: string }> };

async function handleGET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    return NextResponse.json({ success: true, data: { knowledgeBase: await getKnowledgeBase(id) } });
  } catch (error) {
    return errorResponse(error, "Knowledge base detail API");
  }
}

async function handlePATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    return NextResponse.json({ success: true, data: await updateKnowledgeBase(id, {
      name: body?.name === undefined ? undefined : String(body.name),
      description: body?.description === undefined ? undefined : body.description == null ? null : String(body.description),
    }) });
  } catch (error) {
    return errorResponse(error, "Update knowledge base API");
  }
}

async function handleDELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    return NextResponse.json({ success: true, data: await deleteKnowledgeBase(id) });
  } catch (error) {
    return errorResponse(error, "Delete knowledge base API");
  }
}

export const GET = withApiMiddleware(handleGET, {
  permission: "KNOWLEDGE_BASE_READ",
  context: "GET app/api/knowledge-bases/[id]/route.ts API",
});
export const PATCH = withApiMiddleware(handlePATCH, {
  permission: "KNOWLEDGE_BASE_UPDATE",
  context: "PATCH app/api/knowledge-bases/[id]/route.ts API",
});
export const DELETE = withApiMiddleware(handleDELETE, {
  permission: "KNOWLEDGE_BASE_DELETE",
  context: "DELETE app/api/knowledge-bases/[id]/route.ts API",
});
