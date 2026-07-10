export type Mode = "support" | "assistant";

export type ChatPayload = {
  session_id: string;
  message: string;
  requested_mode?: Mode;
  stream?: boolean;
};

export type ChatResult = {
  session_id: string;
  mode: Mode;
  response: string;
  confidence: number;
  sources: string[];
  tool_calls: Record<string, unknown>[];
};

export async function sendChat(payload: ChatPayload): Promise<ChatResult> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }
  return response.json();
}

export async function streamChat(
  payload: ChatPayload,
  onMeta: (meta: Partial<ChatResult>) => void,
  onToken: (token: string) => void
): Promise<ChatResult | null> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, stream: true })
  });
  if (!response.ok || !response.body) {
    throw new Error(`Streaming request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: ChatResult | null = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      const eventName = event.match(/^event: (.+)$/m)?.[1];
      const data = event.match(/^data: (.+)$/m)?.[1];
      if (!eventName || !data) continue;
      const parsed = JSON.parse(data);
      if (eventName === "meta") onMeta(parsed);
      if (eventName === "token") onToken(parsed.token);
      if (eventName === "done") finalResult = parsed;
    }
  }
  return finalResult;
}
