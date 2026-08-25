export type ChatInput = {
  message: string;
  sessionId?: string;
};

export type ChatResponse = {
  reply: string;
  sources?: string[];
  sessionId: string;
};
