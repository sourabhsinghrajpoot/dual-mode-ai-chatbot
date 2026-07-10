import { BarChart3, Bot, Database, Home, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { cn } from "../lib/cn";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: Bot },
  { to: "/knowledge", label: "Knowledge", icon: Database },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-mint text-ink">
              <Bot size={20} />
            </span>
            <span className="font-bold">AstraDesk AI</span>
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/68 transition hover:bg-white/10 hover:text-white",
                    isActive && "bg-white/10 text-white"
                  )
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
