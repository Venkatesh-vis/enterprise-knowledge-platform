export type WorkspaceOverview = {
  documents: number;
  knowledgeBases: number;
  members: number;
  storageBytes: number;
  storageMb: number;
  aiQueriesMonth: number;
  aiCreditsUsed: number;
  aiCreditsLimit: number | null;
  aiCreditsRemaining: number | null;
};
