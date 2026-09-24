import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http/api-error";
import { createDocument, getDocumentPageData } from "@/lib/documents/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    return NextResponse.json({ success: true, data: await getDocumentPageData({
      query: url.searchParams.get("q") ?? "",
      fileType: url.searchParams.get("fileType") ?? "ALL",
      status: url.searchParams.get("status") ?? "ALL",
      knowledgeBaseId: url.searchParams.get("knowledgeBaseId") ?? "",
      page: Number(url.searchParams.get("page")) || 1,
    }) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, "Document list API");
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ success: false, message: "A document file is required." }, { status: 400 });
    const result = await createDocument({
      file,
      name: String(formData.get("name") ?? file.name),
      knowledgeBaseIds: formData.getAll("knowledgeBaseIds").map(String),
    });
    return NextResponse.json({ success: true, message: "Document uploaded.", data: result }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Create document API");
  }
}
