import math
import re
from collections import Counter

from app.schemas import IntentResult

TOKEN_RE = re.compile(r"[a-z0-9]+")

SUPPORT_KEYWORDS = {
    "order", "refund", "return", "shipping", "delivery", "payment", "subscription",
    "password", "account", "delete", "warranty", "support", "invoice", "tracking",
}
ASSISTANT_KEYWORDS = {
    "remind", "reminder", "note", "draft", "email", "schedule", "summarize",
    "write", "brainstorm", "plan", "call", "todo", "task",
}


class IntentRouter:
    async def route(self, message: str, requested_mode: str | None = None) -> IntentResult:
        if requested_mode in {"support", "assistant"}:
            return IntentResult(mode=requested_mode, confidence=0.99, reason="user-selected mode")

        tokens = TOKEN_RE.findall(message.lower())
        support_score = self._score(tokens, SUPPORT_KEYWORDS)
        assistant_score = self._score(tokens, ASSISTANT_KEYWORDS)

        if support_score == assistant_score == 0:
            return IntentResult(mode="assistant", confidence=0.52, reason="default assistant fallback")

        total = support_score + assistant_score
        confidence = max(support_score, assistant_score) / total if total else 0.5
        mode = "support" if support_score >= assistant_score else "assistant"
        return IntentResult(mode=mode, confidence=round(max(confidence, 0.55), 3), reason="keyword and similarity routing")

    def _score(self, tokens: list[str], keywords: set[str]) -> float:
        counts = Counter(tokens)
        direct = sum(counts[word] * 2.0 for word in keywords)
        fuzzy = 0.0
        for token in tokens:
            fuzzy += max((self._cosine(token, keyword) for keyword in keywords), default=0.0)
        return direct + fuzzy

    def _cosine(self, left: str, right: str) -> float:
        left_counts = Counter(left)
        right_counts = Counter(right)
        dot = sum(left_counts[ch] * right_counts[ch] for ch in left_counts)
        denom = math.sqrt(sum(v * v for v in left_counts.values())) * math.sqrt(sum(v * v for v in right_counts.values()))
        return dot / denom if denom else 0.0
