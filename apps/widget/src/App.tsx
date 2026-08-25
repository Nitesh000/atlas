import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, User, MessageSquare } from "lucide-react";
import axios from "axios";
import { cn } from "./utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const isCustomTheme = searchParams.get("theme") === "custom";

  // Custom theme overrides
  const customStyles = useMemo(() => {
    if (!isCustomTheme) return null;

    const primary = searchParams.get("primary");
    const background = searchParams.get("background");
    const foreground = searchParams.get("foreground");
    const card = searchParams.get("card");
    const radius = searchParams.get("radius");

    return {
      ...(primary && { "--primary": primary }),
      ...(background && { "--background": background }),
      ...(foreground && { "--foreground": foreground }),
      ...(card && { "--card": card }),
      ...(radius && { "--radius": radius }),
    } as React.CSSProperties;
  }, [isCustomTheme]);

  const [isOpen, setIsOpen] = useState(layout === "sidebar");

  useEffect(() => {
    // Notify parent window to resize iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        JSON.stringify({ type: "ATLAS_WIDGET_RESIZE", isOpen }),
        "*",
      );
    }
  }, [isOpen]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hi there! I'm Atlas. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
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
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";
      const res = await axios.post(
        `${baseUrl}/chat`,
        { message: userMessage.content, sessionId },
        {
          headers: {
            "x-atlas-api-key": "atl_preview_key", // We will make this configurable
          },
        },
      );

      if (res.data.sessionId && !sessionId) {
        setSessionId(res.data.sessionId);
      }

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
          windowClass:
            "w-[400px] h-full bg-card border-l border-border shadow-2xl rounded-none flex flex-col overflow-hidden",
          animation: {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 20 },
          },
        };
      case "bottom":
        return {
          containerClass:
            "fixed bottom-0 right-10 z-50 flex flex-col items-end",
          windowClass:
            "mb-0 w-[380px] h-[500px] max-h-[70vh] bg-card border-t border-l border-r border-border shadow-[0_-5px_40px_rgba(0,0,0,0.15)] rounded-t-2xl flex flex-col overflow-hidden",
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
          windowClass:
            "mb-4 w-[380px] h-[600px] max-h-[80vh] bg-card border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden",
          animation: {
            initial: { opacity: 0, scale: 0.95, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.95, y: 20 },
          },
        };
    }
  }, [layout]);

  return (
    <div
      className={layoutConfig.containerClass}
      style={customStyles || undefined}
    >
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
            <div className="flex justify-between items-center py-3 px-4 border-b bg-card border-border/50 shrink-0">
              <div className="flex gap-3 items-center">
                <img
                  src="/logo-icon.png"
                  alt="Atlas Logo"
                  className="object-cover w-8 h-8 rounded-lg border shadow-sm border-primary/20"
                />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Atlas Support
                  </h3>
                  <div className="flex gap-1.5 items-center mt-0.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium tracking-wider uppercase text-[10px] text-muted-foreground">
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
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
                      <img
                        src="/logo-icon.png"
                        alt="Atlas"
                        className="object-cover w-4 h-4 rounded-sm opacity-90"
                      />
                    )}
                  </div>
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed overflow-hidden",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm",
                    )}
                  >
                    <div
                      className={cn(
                        "prose dark:prose-invert max-w-none text-sm",
                        msg.role === "user"
                          ? "text-primary-foreground prose-p:text-primary-foreground prose-a:text-primary-foreground prose-strong:text-primary-foreground prose-code:text-primary-foreground"
                          : "text-foreground prose-p:leading-relaxed prose-pre:bg-background/50 prose-pre:border prose-pre:border-border",
                      )}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-3 mt-3 space-y-1.5 border-t border-border/50">
                        <span className="font-semibold tracking-wider uppercase text-[10px] text-muted-foreground">
                          Sources
                        </span>
                        <ul className="space-y-1">
                          {msg.sources.map((src, i) => (
                            <li key={i}>
                              <a
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-xs hover:underline text-primary truncate"
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
                  <div className="flex justify-center items-center mt-1 w-6 h-6 rounded-full bg-muted text-muted-foreground shrink-0">
                    <img
                      src="/logo-icon.png"
                      alt="Atlas"
                      className="object-cover w-4 h-4 rounded-sm opacity-90"
                    />
                  </div>
                  <div className="flex gap-1 items-center py-3 px-4 rounded-2xl rounded-tl-sm bg-muted">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce bg-foreground/40"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce bg-foreground/40"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce bg-foreground/40"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-card border-border/50 shrink-0">
              <form
                onSubmit={handleSend}
                className="flex relative items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="py-3 pr-12 pl-4 w-full text-sm rounded-full border-none focus:ring-1 focus:outline-none bg-muted text-foreground placeholder:text-muted-foreground focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-1.5 p-2 rounded-full transition-opacity hover:opacity-90 disabled:opacity-50 bg-primary text-primary-foreground"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              <div className="mt-3 text-center">
                <span className="flex gap-1 justify-center items-center font-medium text-[10px] text-muted-foreground">
                  Powered by Atlas{" "}
                  <img
                    src="/logo-icon.png"
                    alt="Atlas Logo"
                    className="inline-block object-cover w-4 h-4 rounded shadow-sm"
                  />
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
              layout === "sidebar" && "fixed bottom-6 right-6 z-50", // Enforce position if sidebar is toggled closed
            )}
          >
            <div className="absolute inset-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100 bg-primary/20 blur-xl" />
            <MessageSquare className="relative z-10 w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
