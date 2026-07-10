import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, DatabaseZap, MessageSquareText, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";

const features = [
  { icon: MessageSquareText, title: "Dual-mode routing", text: "Intent detection chooses support or assistant with confidence scoring." },
  { icon: DatabaseZap, title: "RAG support", text: "FAQ retrieval, source awareness, and conservative support answers." },
  { icon: BrainCircuit, title: "Tool calling", text: "Mock reminders, notes, email drafts, order lookup, and account lookup." },
  { icon: ShieldCheck, title: "Session memory", text: "SQLite-backed history survives mode switches and reloads." }
];

export function LandingPage() {
  return (
    <div className="overflow-hidden">
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1fr_0.85fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-mint">Production AI portfolio system</p>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.04] text-white md:text-7xl">
            AstraDesk AI
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            A full-stack chatbot that switches between careful customer support and a personal AI assistant, with streaming responses, RAG, tools, memory, and observability.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/chat">
              <Button icon={<ArrowRight size={17} />}>Open Chat</Button>
            </Link>
            <Link to="/knowledge">
              <Button variant="soft">View Knowledge Base</Button>
            </Link>
          </div>
        </motion.div>
        <motion.div
          className="relative min-h-[420px]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="absolute inset-0 rounded-[2rem] bg-[conic-gradient(from_180deg,rgba(72,229,180,0.45),rgba(139,212,255,0.28),rgba(255,122,112,0.36),rgba(72,229,180,0.45))] blur-2xl" />
          <div className="glass relative grid h-full min-h-[420px] content-between rounded-[1.5rem] p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white/75">Live intent router</span>
              <span className="text-sm text-mint">0.94 confidence</span>
            </div>
            <div className="space-y-4">
              <div className="ml-auto max-w-xs rounded-lg bg-mint px-4 py-3 text-sm font-medium text-ink">Where is my order ORD-1001?</div>
              <div className="max-w-sm rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/78">
                Support mode selected. Retrieved Shipping and Delivery Delay FAQs. Order status: Shipped.
              </div>
              <div className="ml-auto max-w-xs rounded-lg bg-white/12 px-4 py-3 text-sm text-white">Remind me tomorrow at 9 AM to call John.</div>
              <div className="max-w-sm rounded-lg border border-mint/25 bg-mint/10 px-4 py-3 text-sm text-white/78">
                Assistant mode selected. set_reminder completed and saved to session memory.
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <Card key={title}>
              <Icon className="mb-5 text-mint" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/62">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Architecture</h2>
            <p className="mt-3 text-white/64">FastAPI coordinates routing, agents, RAG, Claude, tools, and SQLite memory. React consumes JSON and SSE streams through a focused API layer.</p>
          </div>
          <pre className="overflow-auto rounded-lg border border-white/10 bg-black/30 p-5 text-sm text-white/72">{`React + Zustand
  -> /chat SSE
FastAPI Router
  -> Intent Router
  -> Support Agent + Chroma FAQ + Tools
  -> Assistant Agent + Mock Functions
  -> SQLite Session Memory`}</pre>
        </div>
      </section>
    </div>
  );
}
