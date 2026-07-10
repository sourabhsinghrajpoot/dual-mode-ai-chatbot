import { create } from "zustand";

import type { Mode } from "../lib/api";

export type Message = {
  id: string;
  role: "user" | "assistant";
  mode: Mode;
  content: string;
  confidence?: number;
  sources?: string[];
  toolCalls?: Record<string, unknown>[];
};

type ChatState = {
  sessionId: string;
  mode: Mode;
  messages: Message[];
  setMode: (mode: Mode) => void;
  newSession: () => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, patch: Partial<Message>) => void;
};

const makeSessionId = () => `session-${crypto.randomUUID()}`;

export const useChatStore = create<ChatState>((set) => ({
  sessionId: makeSessionId(),
  mode: "assistant",
  messages: [],
  setMode: (mode) => set({ mode }),
  newSession: () => set({ sessionId: makeSessionId(), messages: [] }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((message) => (message.id === id ? { ...message, ...patch } : message))
    }))
}));
