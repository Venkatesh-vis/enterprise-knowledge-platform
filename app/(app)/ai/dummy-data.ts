import type {
  AssistantConversation,
  AssistantKnowledgeBase,
} from "./ai-assistant-types";

export const assistantKnowledgeBases: AssistantKnowledgeBase[] = [
  {
    id: "company-handbook",
    name: "Company Handbook",
    documentCount: 18,
  },
  {
    id: "engineering",
    name: "Engineering Knowledge",
    documentCount: 42,
  },
  {
    id: "product",
    name: "Product & Operations",
    documentCount: 27,
  },
];

export const assistantConversations: AssistantConversation[] = [
  {
    id: "conv-1",
    title: "Annual leave policy",
    updatedAt: "Today, 10:42 AM",
    knowledgeBaseId: "company-handbook",
    messages: [
      {
        id: "m-1",
        role: "user",
        content: "How many annual leave days do employees get?",
        createdAt: "10:41 AM",
      },
      {
        id: "m-2",
        role: "assistant",
        content:
          "Employees receive 20 days of annual leave per calendar year. The policy also explains the approval process and carry-forward rules.",
        createdAt: "10:42 AM",
        feedback: null,
        sources: [
          {
            id: "src-1",
            documentName: "Employee Handbook.pdf",
            documentType: "PDF",
            page: 14,
            excerpt:
              "Employees are entitled to 20 days of annual leave per calendar year. Leave requests should be submitted in advance through the internal leave workflow.",
          },
          {
            id: "src-2",
            documentName: "People Operations Guide.docx",
            documentType: "DOCX",
            page: 6,
            excerpt:
              "Managers review leave requests based on team coverage and business requirements.",
          },
        ],
      },
    ],
  },
  {
    id: "conv-2",
    title: "Deployment process",
    updatedAt: "Yesterday",
    knowledgeBaseId: "engineering",
    messages: [
      {
        id: "m-3",
        role: "user",
        content: "What is the production deployment process?",
        createdAt: "Yesterday",
      },
      {
        id: "m-4",
        role: "assistant",
        content:
          "The production deployment flow uses a reviewed pull request, successful CI checks, staging verification, and a controlled production release.",
        createdAt: "Yesterday",
        feedback: null,
        sources: [
          {
            id: "src-3",
            documentName: "Engineering Runbook.pdf",
            documentType: "PDF",
            page: 31,
            excerpt:
              "Production releases require approval after staging verification and successful automated checks.",
          },
        ],
      },
    ],
  },
  {
    id: "conv-3",
    title: "Product onboarding",
    updatedAt: "Sep 30",
    knowledgeBaseId: "product",
    messages: [
      {
        id: "m-5",
        role: "user",
        content: "Summarize the customer onboarding process.",
        createdAt: "Sep 30",
      },
      {
        id: "m-6",
        role: "assistant",
        content:
          "Customer onboarding covers workspace setup, user invitations, knowledge-base preparation, and the initial adoption review.",
        createdAt: "Sep 30",
        feedback: null,
        sources: [
          {
            id: "src-4",
            documentName: "Customer Operations Playbook.pptx",
            documentType: "PPTX",
            page: 9,
            excerpt:
              "The onboarding journey begins with workspace setup and concludes with the first adoption review.",
          },
        ],
      },
    ],
  },
];
