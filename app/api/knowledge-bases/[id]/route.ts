import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http/api-error";
import { deleteKnowledgeBase, getKnowledgeBase, updateKnowledgeBase } from "@/lib/knowledge-bases/service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    return NextResponse.json({ success: true, data: { knowledgeBase: await getKnowledgeBase(id) } });
  } catch (error) {
    return errorResponse(error, "Knowledge base detail API");
  }
}

export async function PATCH(request: Request, context: Context) {
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

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    return NextResponse.json({ success: true, data: await deleteKnowledgeBase(id) });
  } catch (error) {
    return errorResponse(error, "Delete knowledge base API");
  }
}
