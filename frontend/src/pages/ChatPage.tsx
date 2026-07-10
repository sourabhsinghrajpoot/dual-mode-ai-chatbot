import { AnimatePresence, motion } from "framer-motion";
import { Bot, Copy, PanelLeftClose, Plus, RefreshCw, Send, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { cn } from "../lib/cn";
import { streamChat, type Mode } from "../lib/api";
import { useChatStore } from "../store/chatStore";

const prompts = {
  support: ["Where is my order ORD-1001?", "How do refunds work?", "My payment failed. What should I do?"],
  assistant: ["Remind me tomorrow at 9 AM to call John.", "Add a note: review Q3 dashboard.", "Draft an email asking for a project update."]
};

export function ChatPage() {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { sessionId, mode, setMode, messages, addMessage, updateMessage, newSession } = useChatStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function submit(event?: FormEvent, forced?: string) {
    event?.preventDefault();
    const message = (forced ?? input).trim();
    if (!message || isStreaming) return;
    setInput("");
    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    addMessage({ id: userId, role: "user", mode, content: message });
    addMessage({ id: assistantId, role: "assistant", mode, content: "", confidence: undefined });
    setIsStreaming(true);
    try {
      await streamChat(
        { session_id: sessionId, message, requested_mode: mode },
        (meta) => updateMessage(assistantId, { mode: meta.mode ?? mode, confidence: meta.confidence, sources: meta.sources, toolCalls: meta.tool_calls }),
        (token) => updateMessage(assistantId, { content: (useChatStore.getState().messages.find((item) => item.id === assistantId)?.content ?? "") + token })
      );
    } catch (error) {
      updateMessage(assistantId, { content: `Request failed: ${(error as Error).message}` });
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="mx-auto grid h-[calc(100vh-65px)] max-w-7xl grid-cols-1 px-4 py-5 lg:grid-cols-[280px_1fr]">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            className="glass mb-4 flex min-h-0 flex-col rounded-lg p-3 lg:mb-0 lg:mr-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white/78">Sessions</span>
              <Button variant="ghost" className="h-9 w-9 px-0" title="Collapse sidebar" onClick={() => setSidebarOpen(false)}>
                <PanelLeftClose size={17} />
              </Button>
            </div>
            <Button className="mt-3 w-full" icon={<Plus size={16} />} onClick={newSession}>New Chat</Button>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs uppercase text-white/42">Session</p>
              <p className="mt-1 break-all text-sm text-white/72">{sessionId}</p>
            </div>
            <div className="mt-4 space-y-2">
              {["support", "assistant"].map((item) => (
                <button
                  key={item}
                  onClick={() => setMode(item as Mode)}
                  className={cn("w-full rounded-lg px-3 py-2 text-left text-sm capitalize transition", mode === item ? "bg-mint text-ink" : "bg-white/6 text-white/70 hover:bg-white/10")}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              <p className="text-xs uppercase text-white/42">Suggested</p>
              {prompts[mode].map((prompt) => (
                <button key={prompt} onClick={() => submit(undefined, prompt)} className="w-full rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-white/62 hover:bg-white/8">
                  {prompt}
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <section className="glass flex min-h-0 flex-col rounded-lg">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            {!sidebarOpen && <Button variant="ghost" className="h-9 w-9 px-0" onClick={() => setSidebarOpen(true)}><PanelLeftClose size={17} /></Button>}
            <div>
              <h1 className="font-semibold">AI Chat</h1>
              <p className="text-xs text-white/48">Mode: {mode}</p>
            </div>
          </div>
          {isStreaming && <span className="rounded-lg bg-mint/10 px-3 py-1 text-xs text-mint">Streaming</span>}
        </div>

        <div className="subtle-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="grid h-full place-items-center">
              <Card className="max-w-lg text-center">
                <Bot className="mx-auto mb-4 text-mint" />
                <h2 className="text-xl font-semibold">Start with support or assistant mode</h2>
                <p className="mt-2 text-sm text-white/60">Messages stream token by token, route through the backend, and stay attached to this session.</p>
              </Card>
            </div>
          )}
          {messages.map((message) => (
            <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", message.role === "user" && "justify-end")}>
              {message.role === "assistant" && <Avatar><Bot size={16} /></Avatar>}
              <div className={cn("max-w-[820px] rounded-lg px-4 py-3", message.role === "user" ? "bg-mint text-ink" : "border border-white/10 bg-white/[0.06] text-white/82")}>
                {message.content ? <Markdown content={message.content} /> : <Skeleton />}
                {message.role === "assistant" && message.content && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs text-white/45">
                    {message.confidence !== undefined && <span>Confidence {(message.confidence * 100).toFixed(0)}%</span>}
                    {message.sources?.map((source) => <span key={source}>Source {source}</span>)}
                    <button title="Copy" onClick={() => navigator.clipboard.writeText(message.content)}><Copy size={14} /></button>
                    <button title="Regenerate"><RefreshCw size={14} /></button>
                    <button title="Like"><ThumbsUp size={14} /></button>
                    <button title="Dislike"><ThumbsDown size={14} /></button>
                  </div>
                )}
              </div>
              {message.role === "user" && <Avatar><User size={16} /></Avatar>}
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={submit} className="border-t border-white/10 p-4">
          <div className="flex items-end gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={1}
              placeholder="Ask about an order, or ask your assistant to remember something..."
              className="max-h-32 min-h-10 flex-1 resize-none border-0 bg-transparent text-sm text-white placeholder:text-white/34 focus:ring-0"
            />
            <Button disabled={isStreaming} className="h-10 w-10 px-0" title="Send"><Send size={17} /></Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Avatar({ children }: { children: ReactNode }) {
  return <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/8 text-white/70">{children}</div>;
}

function Skeleton() {
  return <div className="h-5 w-48 animate-pulse rounded bg-white/12" />;
}

function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children }) {
          const language = /language-(\w+)/.exec(className || "")?.[1];
          return language ? <SyntaxHighlighter language={language}>{String(children)}</SyntaxHighlighter> : <code className="rounded bg-black/30 px-1 py-0.5">{children}</code>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
