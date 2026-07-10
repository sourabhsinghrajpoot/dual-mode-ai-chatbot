import { Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "../components/Card";

const trend = [
  { day: "Mon", conversations: 32, confidence: 86 },
  { day: "Tue", conversations: 48, confidence: 88 },
  { day: "Wed", conversations: 44, confidence: 84 },
  { day: "Thu", conversations: 58, confidence: 91 },
  { day: "Fri", conversations: 76, confidence: 89 },
  { day: "Sat", conversations: 40, confidence: 87 }
];
const split = [{ name: "Support", value: 61 }, { name: "Assistant", value: 39 }];
const colors = ["#48e5b4", "#ff7a70"];

export function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total Conversations", "298"],
          ["Support Requests", "182"],
          ["Assistant Requests", "116"],
          ["Average Response Time", "742 ms"],
          ["Confidence Score", "88%"]
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-white/48">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Conversation Volume</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs><linearGradient id="volume" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#48e5b4" stopOpacity={0.45} /><stop offset="95%" stopColor="#48e5b4" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.45)" />
                <YAxis stroke="rgba(255,255,255,0.45)" />
                <Tooltip contentStyle={{ background: "#10131d", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
                <Area dataKey="conversations" stroke="#48e5b4" fill="url(#volume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Mode Split</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={split} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95}>
                  {split.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#10131d", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-3">
          <h2 className="mb-4 font-semibold">Confidence Trend</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.45)" />
                <YAxis stroke="rgba(255,255,255,0.45)" />
                <Tooltip contentStyle={{ background: "#10131d", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="confidence" stroke="#8bd4ff" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
