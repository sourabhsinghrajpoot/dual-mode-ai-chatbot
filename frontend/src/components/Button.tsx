import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "soft";
  icon?: ReactNode;
};

export function Button({ className, variant = "primary", icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
        "focus:outline-none focus:ring-2 focus:ring-mint/40 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-mint text-ink shadow-glow hover:bg-mint/90",
        variant === "ghost" && "text-white/78 hover:bg-white/10 hover:text-white",
        variant === "soft" && "border border-white/10 bg-white/8 text-white hover:bg-white/12",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
