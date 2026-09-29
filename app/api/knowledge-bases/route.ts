import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http/api-error";
import { createKnowledgeBase, getKnowledgeBaseOptions, getKnowledgeBasePageData } from "@/lib/knowledge-bases/service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const optionsOnly = url.searchParams.get("options") === "1";
    return NextResponse.json({ success: true, data: optionsOnly ? { knowledgeBases: await getKnowledgeBaseOptions() } : await getKnowledgeBasePageData() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, "Knowledge base list API");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, message: "Knowledge base created.", data: await createKnowledgeBase({ name: String(body?.name ?? ""), description: body?.description == null ? undefined : String(body.description) }) }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Create knowledge base API");
  }
}
