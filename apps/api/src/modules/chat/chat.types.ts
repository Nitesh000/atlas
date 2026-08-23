export type ChatInput = {
  message: string;
};

export type ChatResponse = {
  reply: string;
  sources?: string[];
};
