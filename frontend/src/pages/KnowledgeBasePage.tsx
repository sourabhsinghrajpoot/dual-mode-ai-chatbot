import { Database, RefreshCw, Search, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "../components/Button";
import { Card } from "../components/Card";

const faqs = ["Shipping", "Refunds", "Returns", "Password Reset", "Account Deletion", "Payment Failure", "Subscription", "Delivery Delay", "Warranty", "Contact Support"];

export function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => faqs.filter((item) => item.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="mt-2 text-white/58">Manage FAQ documents used by support RAG.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="soft" icon={<Upload size={16} />}>Upload</Button>
          <Button icon={<RefreshCw size={16} />}>Re-index</Button>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-3">
        <Search size={17} className="text-white/42" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search FAQs" className="h-12 flex-1 border-0 bg-transparent text-white placeholder:text-white/36 focus:ring-0" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((faq) => (
          <Card key={faq} className="flex items-start justify-between gap-4">
            <div>
              <Database className="mb-4 text-mint" />
              <h2 className="font-semibold">{faq}</h2>
              <p className="mt-2 text-sm text-white/58">Indexed document available for top-k retrieval and source display.</p>
            </div>
            <button title="Delete document" className="rounded-lg p-2 text-white/42 hover:bg-white/10 hover:text-coral">
              <Trash2 size={16} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
