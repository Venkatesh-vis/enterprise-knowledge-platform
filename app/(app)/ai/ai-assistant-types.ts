export type AssistantSource = {
  id: string;
  documentName: string;
  documentType: "PDF" | "DOCX" | "PPTX";
  page: number;
  excerpt: string;
};

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: AssistantSource[];
  status?: "complete" | "thinking";
  feedback?: "up" | "down" | null;
};

export type AssistantConversation = {
  id: string;
  title: string;
  updatedAt: string;
  messages: AssistantMessage[];
  knowledgeBaseId: string;
};

export type AssistantKnowledgeBase = {
  id: string;
  name: string;
  documentCount: number;
};
