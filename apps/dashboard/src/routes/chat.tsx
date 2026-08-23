import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useCurrentOrg } from "../hooks/use-current-org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, User, MessageSquare, AlertCircle } from "lucide-react";
import axios from "axios";

export const Route = createFileRoute("/chat")({
  component: ChatPlayground,
});

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: string[];
};

function ChatPlayground() {
  const { data: org, isLoading: orgLoading } = useCurrentOrg();
  const queryClient = useQueryClient();

  // Fetch API keys to test chat
  const { data: apiKeys, isLoading: keysLoading } = useQuery({
    queryKey: ["apiKeys", org?.id],
    queryFn: async () => {
      const res = await api.get(`/orgs/${org?.id}/api-keys`);
      return res.data as { id: string; key: string }[];
    },
    enabled: !!org?.id,
  });

  const activeApiKey = apiKeys?.[0]?.key;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        "Hello! I am ready to answer questions based on your indexed websites. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeApiKey) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";
      const res = await axios.post(
        `${baseUrl}/chat`,
        { message: userMessage.content },
        {
          headers: {
            "x-atlas-api-key": activeApiKey,
          },
        },
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: res.data.reply,
        sources: res.data.sources,
      };
      setMessages((prev) => [...prev, aiMessage]);
      
      // Update usage stats immediately
      queryClient.invalidateQueries({ queryKey: ["usage", org?.id] });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content:
            "Sorry, an error occurred while connecting to the chat API. Make sure your API key is valid.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (orgLoading || keysLoading) {
    return (
      <div className="p-8 text-muted-foreground animate-pulse">
        Loading playground...
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8 max-w-md">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-6 text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" /> Workspace Required
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeApiKey) {
    return (
      <div className="p-8 max-w-2xl">
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
            <MessageSquare className="h-10 w-10 text-muted-foreground opacity-50" />
            <div className="text-lg font-medium">No API Key Found</div>
            <p className="text-sm text-muted-foreground max-w-md">
              To test the chat playground, you need an active API key to
              authenticate requests. Go to the API Keys tab to generate one.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Playground</h2>
        <p className="text-muted-foreground mt-2">
          Test your RAG pipeline. This simulates exactly what your users will
          see.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-sm">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/10">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-[80%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border shadow-sm"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <img
                    src="/logo-icon.png"
                    className="w-5 h-5 rounded-sm opacity-90"
                    alt="Atlas"
                  />
                )}
              </div>
              <div
                className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border text-card-foreground rounded-tl-sm"
                }`}
              >
                {msg.content}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Sources Used
                    </span>
                    <ul className="space-y-1.5">
                      {msg.sources.map((src, i) => (
                        <li key={i}>
                          <a
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline truncate block"
                          >
                            {src}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-card border shadow-sm flex items-center justify-center shrink-0 mt-1">
                <img
                  src="/logo-icon.png"
                  className="w-5 h-5 rounded-sm opacity-90"
                  alt="Atlas"
                />
              </div>
              <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-card border shadow-sm flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-card border-t shrink-0">
          <form
            onSubmit={handleSend}
            className="relative flex items-center max-w-3xl mx-auto"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your indexed data..."
              className="w-full bg-muted/50 border-transparent focus-visible:ring-1 pr-14 py-6 rounded-xl"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 rounded-lg h-9 w-9"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="text-center mt-3">
            <span className="text-xs text-muted-foreground font-medium">
              Testing as API Key:{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                {activeApiKey.slice(0, 12)}...
              </code>
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
