import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, User, MessageSquare } from "lucide-react";
import axios from "axios";
import { cn } from "./utils";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: string[];
};

type LayoutMode = "floating" | "bottom" | "sidebar";

export default function AtlasWidget() {
  const searchParams = new URLSearchParams(window.location.search);
  const layout = (searchParams.get("layout") || "floating") as LayoutMode;

  const [isOpen, setIsOpen] = useState(layout === "sidebar");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hi there! I'm Atlas. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Focus bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post(
        "http://localhost:3001/api/v1/chat",
        { message: userMessage.content },
        {
          headers: {
            "x-atlas-api-key": "atl_preview_key", // We will make this configurable
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
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content:
          "I'm sorry, I'm having trouble connecting to the server right now.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Layout Configuration
  const layoutConfig = useMemo(() => {
    switch (layout) {
      case "sidebar":
        return {
          containerClass: "fixed top-0 right-0 z-50 h-full flex flex-col",
          windowClass: "w-[400px] h-full bg-card border-l border-border shadow-2xl rounded-none flex flex-col overflow-hidden",
          animation: {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 20 },
          },
        };
      case "bottom":
        return {
          containerClass: "fixed bottom-0 right-10 z-50 flex flex-col items-end",
          windowClass: "mb-0 w-[380px] h-[500px] max-h-[70vh] bg-card border-t border-l border-r border-border shadow-[0_-5px_40px_rgba(0,0,0,0.15)] rounded-t-2xl flex flex-col overflow-hidden",
          animation: {
            initial: { opacity: 0, y: 40 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 40 },
          },
        };
      case "floating":
      default:
        return {
          containerClass: "fixed bottom-6 right-6 z-50 flex flex-col items-end",
          windowClass: "mb-4 w-[380px] h-[600px] max-h-[80vh] bg-card border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden",
          animation: {
            initial: { opacity: 0, scale: 0.95, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.95, y: 20 },
          },
        };
    }
  }, [layout]);

  return (
    <div className={layoutConfig.containerClass}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={layoutConfig.animation.initial}
            animate={layoutConfig.animation.animate}
            exit={layoutConfig.animation.exit}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={layoutConfig.windowClass}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-card border-b border-border/50 shrink-0">
              <div className="flex items-center gap-3">
                <img src="/logo-no-bg.png" alt="Atlas Logo" className="w-8 h-8 object-contain bg-primary/5 rounded-md p-1 border border-primary/20" />
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    Atlas Support
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "",
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {msg.role === "user" ? (
                      <User className="w-3 h-3" />
                    ) : (
                      <img src="/logo-no-bg.png" alt="Atlas" className="w-4 h-4 object-contain opacity-80" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm",
                    )}
                  >
                    {msg.content}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Sources
                        </span>
                        <ul className="space-y-1">
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
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-1">
                    <img src="/logo-no-bg.png" alt="Atlas" className="w-4 h-4 object-contain opacity-80" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-muted flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card border-t border-border/50 shrink-0">
              <form
                onSubmit={handleSend}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-muted border-none rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-1.5 p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50 transition-opacity hover:opacity-90"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              <div className="text-center mt-3">
                <span className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground font-medium">
                  Powered by <img src="/logo-no-bg.png" alt="Atlas Logo" className="h-3 w-auto object-contain inline-block grayscale opacity-70" />
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB - Only shown when closed and not in sidebar mode (unless sidebar supports toggling) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "rounded-full bg-primary shadow-xl flex items-center justify-center text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background relative group",
              layout === "bottom" ? "w-14 h-14 mb-6" : "w-14 h-14",
              layout === "sidebar" && "fixed bottom-6 right-6 z-50" // Enforce position if sidebar is toggled closed
            )}
          >
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageSquare className="w-6 h-6 relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
