"use client";

import {
  Bot,
  Copy,
  FileText,
  MessageSquarePlus,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Badge } from "@/app/shared/ui/badge";
import { Button } from "@/app/shared/ui/button";
import { EmptyState } from "@/app/shared/ui/empty-state";
import { Input } from "@/app/shared/ui/input";
import { Select } from "@/app/shared/ui/select";
import { Textarea } from "@/app/shared/ui/textarea";

import {
  assistantConversations as initialConversations,
  assistantKnowledgeBases,
} from "./dummy-data";
import type {
  AssistantConversation,
  AssistantMessage,
  AssistantSource,
} from "./ai-assistant-types";

const SUGGESTIONS = [
  "What is our annual leave policy?",
  "Summarize the production deployment process.",
  "What documents cover customer onboarding?",
];

function nowLabel() {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

export function AIAssistant() {
  const [conversations, setConversations] = useState<AssistantConversation[]>(
    initialConversations,
  );
  const [activeConversationId, setActiveConversationId] = useState(
    initialConversations[0]?.id ?? "",
  );
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState(
    initialConversations[0]?.knowledgeBaseId ??
      assistantKnowledgeBases[0]?.id ??
      "",
  );
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSources, setMobileSources] = useState<AssistantSource[] | null>(
    null,
  );

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === activeConversationId,
      ) ?? null,
    [activeConversationId, conversations],
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(query),
    );
  }, [conversations, search]);

  function selectConversation(conversation: AssistantConversation) {
    setActiveConversationId(conversation.id);
    setSelectedKnowledgeBaseId(conversation.knowledgeBaseId);
    setMobileSources(null);
  }

  function createConversation() {
    const knowledgeBaseId =
      selectedKnowledgeBaseId || assistantKnowledgeBases[0]?.id || "";

    const conversation: AssistantConversation = {
      id: "conv-" + Date.now(),
      title: "New conversation",
      updatedAt: "Just now",
      knowledgeBaseId,
      messages: [],
    };

    setConversations((current) => [conversation, ...current]);
    setActiveConversationId(conversation.id);
    setDraft("");
    setMobileSources(null);
  }

  function appendDummyResponse(
    conversationId: string,
    question: string,
  ) {
    const normalized = question.toLowerCase();
    let answer =
      "I found relevant information in your selected knowledge base. This dummy response will be replaced by the real RAG pipeline.";
    let sources: AssistantSource[] = [
      {
        id: "src-dummy-1",
        documentName: "Knowledge Base Overview.pdf",
        documentType: "PDF",
        page: 3,
        excerpt:
          "This is a placeholder source excerpt showing how retrieved documents will be presented to the user.",
      },
    ];

    if (normalized.includes("leave")) {
      answer =
        "Employees receive 20 days of annual leave per calendar year. The policy also covers advance requests and manager approval.";
      sources = [
        {
          id: "src-leave-1",
          documentName: "Employee Handbook.pdf",
          documentType: "PDF",
          page: 14,
          excerpt:
            "Employees are entitled to 20 days of annual leave per calendar year.",
        },
        {
          id: "src-leave-2",
          documentName: "People Operations Guide.docx",
          documentType: "DOCX",
          page: 6,
          excerpt:
            "Managers review leave requests based on team coverage and business requirements.",
        },
      ];
    } else if (normalized.includes("deployment")) {
      answer =
        "The production deployment flow uses a reviewed pull request, successful CI checks, staging verification, and a controlled production release.";
      sources = [
        {
          id: "src-deploy-1",
          documentName: "Engineering Runbook.pdf",
          documentType: "PDF",
          page: 31,
          excerpt:
            "Production releases require approval after staging verification and successful automated checks.",
        },
      ];
    } else if (normalized.includes("onboarding")) {
      answer =
        "Customer onboarding covers workspace setup, user invitations, knowledge-base preparation, and the initial adoption review.";
      sources = [
        {
          id: "src-onboard-1",
          documentName: "Customer Operations Playbook.pptx",
          documentType: "PPTX",
          page: 9,
          excerpt:
            "The onboarding journey begins with workspace setup and concludes with the first adoption review.",
        },
      ];
    }

    const message: AssistantMessage = {
      id: "assistant-" + Date.now(),
      role: "assistant",
      content: answer,
      createdAt: nowLabel(),
      feedback: null,
      sources,
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              title:
                conversation.title === "New conversation"
                  ? question.slice(0, 48)
                  : conversation.title,
              updatedAt: "Just now",
              messages: [
                ...conversation.messages.map((item) =>
                  item.status === "thinking"
                    ? {
                        ...item,
                        status: "complete" as const,
                      }
                    : item,
                ),
                message,
              ],
            }
          : conversation,
      ),
    );
  }

  function sendMessage(value = draft) {
    const question = value.trim();
    if (!question) return;

    let conversationId = activeConversationId;

    if (!conversationId) {
      const conversation: AssistantConversation = {
        id: "conv-" + Date.now(),
        title: question.slice(0, 48),
        updatedAt: "Just now",
        knowledgeBaseId: selectedKnowledgeBaseId,
        messages: [],
      };

      conversationId = conversation.id;
      setConversations((current) => [conversation, ...current]);
      setActiveConversationId(conversationId);
    }

    const userMessage: AssistantMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: question,
      createdAt: nowLabel(),
    };

    const thinkingMessage: AssistantMessage = {
      id: "thinking-" + Date.now(),
      role: "assistant",
      content: "",
      createdAt: nowLabel(),
      status: "thinking",
      feedback: null,
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              title:
                conversation.title === "New conversation"
                  ? question.slice(0, 48)
                  : conversation.title,
              updatedAt: "Just now",
              knowledgeBaseId: selectedKnowledgeBaseId,
              messages: [...conversation.messages, userMessage, thinkingMessage],
            }
          : conversation,
      ),
    );

    setDraft("");

    window.setTimeout(() => {
      appendDummyResponse(conversationId, question);
    }, 450);
  }

  function updateFeedback(messageId: string, value: "up" | "down") {
    setConversations((current) =>
      current.map((conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) =>
          message.id === messageId
            ? {
                ...message,
                feedback: message.feedback === value ? null : value,
              }
            : message,
        ),
      })),
    );
  }

  async function copyMessage(content: string) {
    await navigator.clipboard?.writeText(content);
  }

  function regenerate(messageId: string) {
    const target = activeConversation?.messages.find(
      (message) => message.id === messageId,
    );
    const previousUserMessage = activeConversation?.messages
      .slice(
        0,
        Math.max(
          0,
          (activeConversation?.messages.findIndex(
            (message) => message.id === messageId,
          ) ?? 0) - 1,
        ),
      )
      .reverse()
      .find((message) => message.role === "user");

    if (!target || !previousUserMessage || !activeConversation) return;

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              messages: conversation.messages.map((message) =>
                message.id === messageId
                  ? {
                      ...message,
                      status: "thinking" as const,
                      content: "",
                      sources: [],
                    }
                  : message,
              ),
            }
          : conversation,
      ),
    );

    window.setTimeout(() => {
      appendDummyResponse(
        activeConversation.id,
        previousUserMessage.content,
      );
    }, 450);
  }

  const selectedKnowledgeBase =
    assistantKnowledgeBases.find(
      (item) => item.id === selectedKnowledgeBaseId,
    ) ?? assistantKnowledgeBases[0];

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-[620px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((current) => !current)}
            aria-label={sidebarOpen ? "Hide conversation history" : "Show conversation history"}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>

          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold text-slate-950">
                  AI Assistant
                </h1>
                <Badge variant="info" className="hidden sm:inline-flex">
                  Dummy mode
                </Badge>
              </div>
              <p className="truncate text-[11px] text-slate-400">
                Ask questions across your organization&apos;s knowledge
              </p>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Select
            value={selectedKnowledgeBase?.id ?? ""}
            onValueChange={(value) => {
              setSelectedKnowledgeBaseId(value);
              const next = conversations.find(
                (conversation) => conversation.id === activeConversationId,
              );
              if (next) {
                setConversations((current) =>
                  current.map((conversation) =>
                    conversation.id === activeConversationId
                      ? {
                          ...conversation,
                          knowledgeBaseId: value,
                        }
                      : conversation,
                  ),
                );
              }
            }}
            options={assistantKnowledgeBases.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            aria-label="Select knowledge base"
            triggerClassName="h-9 w-56 text-xs"
          />

          <Button variant="secondary" onClick={createConversation}>
            <MessageSquarePlus className="mr-1.5 h-4 w-4" />
            New chat
          </Button>
        </div>

        <Button
          className="sm:hidden"
          aria-label="Start a new conversation"
          onClick={createConversation}
        >
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        {sidebarOpen && (
          <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-50/70 lg:flex lg:flex-col">
            <div className="shrink-0 border-b border-slate-200 p-3">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
                className="h-9 bg-white text-xs"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Conversations
                </p>
                <span className="text-[10px] text-slate-400">
                  {filteredConversations.length}
                </span>
              </div>

              <div className="space-y-1">
                {filteredConversations.map((conversation) => {
                  const active = conversation.id === activeConversationId;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => selectConversation(conversation)}
                      className={
                        "w-full rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 " +
                        (active
                          ? "border-slate-200 bg-white shadow-sm"
                          : "border-transparent hover:bg-white")
                      }
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquarePlus
                          className={
                            "mt-0.5 h-3.5 w-3.5 shrink-0 " +
                            (active
                              ? "text-slate-700"
                              : "text-slate-400")
                          }
                        />
                        <div className="min-w-0">
                          <p
                            className={
                              "truncate text-xs font-medium " +
                              (active
                                ? "text-slate-900"
                                : "text-slate-600")
                            }
                          >
                            {conversation.title}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {conversation.updatedAt}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200 p-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <p className="text-xs font-semibold text-slate-900">
                    Knowledge scope
                  </p>
                </div>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Answers are scoped to the selected knowledge base in this UI prototype.
                </p>
              </div>
            </div>
          </aside>
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            {activeConversation?.messages.length ? (
              <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
                <div className="space-y-7">
                  {activeConversation.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onCopy={copyMessage}
                      onFeedback={updateFeedback}
                      onRegenerate={regenerate}
                      onOpenSources={setMobileSources}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-center px-4 py-10 sm:px-8">
                <div className="w-full">
                  <div className="mx-auto max-w-xl text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                      Ask your knowledge base
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Search across your organization&apos;s documents and get concise answers with source references.
                    </p>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => sendMessage(suggestion)}
                        className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        <p className="text-xs font-semibold text-slate-900">
                          {suggestion}
                        </p>
                        <p className="mt-2 text-[11px] leading-5 text-slate-500">
                          Search {selectedKnowledgeBase?.name ?? "your knowledge base"}.
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8">
                    <EmptyState
                      icon={FileText}
                      title="Ready for your first question"
                      description="This branch uses dummy responses only. The API and RAG layer can be connected without changing this conversation UI."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="mx-auto w-full max-w-4xl"
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100">
                <Textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={2}
                  placeholder="Ask a question about your organization’s knowledge..."
                  aria-label="Ask the AI assistant"
                  className="min-h-20 resize-none border-0 bg-transparent px-3 py-2 shadow-none focus:border-transparent focus:ring-0"
                />
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-2 pt-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    {selectedKnowledgeBase?.name}
                  </div>
                  <Button
                    type="submit"
                    disabled={!draft.trim()}
                    className="h-9 rounded-lg px-3"
                    aria-label="Send question"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-center text-[10px] text-slate-400">
                AI responses may be inaccurate. Verify important information against source documents.
              </p>
            </form>
          </div>
        </main>
      </div>

      {mobileSources && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-950/25 p-3 backdrop-blur-[2px] sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Sources"
        >
          <div className="max-h-[80vh] w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Sources</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Retrieved references for this answer
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileSources(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close sources"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[62vh] space-y-3 overflow-y-auto p-4">
              {mobileSources.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  onCopy,
  onFeedback,
  onRegenerate,
  onOpenSources,
}: {
  message: AssistantMessage;
  onCopy: (content: string) => Promise<void>;
  onFeedback: (messageId: string, value: "up" | "down") => void;
  onRegenerate: (messageId: string) => void;
  onOpenSources: (sources: AssistantSource[]) => void;
}) {
  const isUser = message.role === "user";

  if (message.status === "thinking") {
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
          <Bot className="h-4 w-4" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1.5" aria-label="Assistant is thinking">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isUser ? "flex justify-end" : "flex items-start gap-3"}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div className={isUser ? "max-w-[82%]" : "min-w-0 max-w-[82%] sm:max-w-3xl"}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-md bg-slate-950 px-4 py-3 text-sm leading-6 text-white shadow-sm"
              : "rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3.5 text-sm leading-6 text-slate-700 shadow-sm"
          }
        >
          {message.content}
        </div>

        {!isUser && message.sources?.length ? (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Sources
              </p>
              <span className="text-[10px] text-slate-300">
                {message.sources.length}
              </span>
            </div>

            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {message.sources.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>

            <button
              type="button"
              onClick={() => onOpenSources(message.sources ?? [])}
              className="mt-2 text-[11px] font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-slate-900 sm:hidden"
            >
              View all sources
            </button>
          </div>
        ) : null}

        {!isUser && (
          <div className="mt-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => onCopy(message.content)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Copy answer"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
            <button
              type="button"
              onClick={() => onRegenerate(message.id)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Regenerate answer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
            <button
              type="button"
              onClick={() => onFeedback(message.id, "up")}
              aria-label="Good answer"
              className={
                "inline-flex h-8 w-8 items-center justify-center rounded-lg transition " +
                (message.feedback === "up"
                  ? "bg-emerald-50 text-emerald-600"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700")
              }
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onFeedback(message.id, "down")}
              aria-label="Bad answer"
              className={
                "inline-flex h-8 w-8 items-center justify-center rounded-lg transition " +
                (message.feedback === "down"
                  ? "bg-red-50 text-red-600"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700")
              }
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="More answer actions"
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SourceCard({ source }: { source: AssistantSource }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-800">
            {source.documentName}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            {source.documentType} · Page {source.page}
          </p>
        </div>
      </div>
      <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-slate-500">
        {source.excerpt}
      </p>
    </div>
  );
}
