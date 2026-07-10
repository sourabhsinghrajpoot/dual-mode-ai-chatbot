from pathlib import Path

from app.config import get_settings
from app.services.llm import LLMService
from app.services.memory import MemoryService
from app.services.rag import RAGService
from app.tools.order_lookup import extract_email, extract_order_id, lookup_account, lookup_order


class SupportAgent:
    def __init__(self, llm: LLMService, rag: RAGService, memory: MemoryService) -> None:
        self.llm = llm
        self.rag = rag
        self.memory = memory
        self.settings = get_settings()
        self.prompt = (Path(__file__).resolve().parents[1] / "prompts" / "support_prompt.txt").read_text(encoding="utf-8")

    async def respond(self, session_id: str, message: str, route_confidence: float) -> tuple[str, float, list[str], list[dict]]:
        docs = await self.rag.retrieve(message)
        knowledge_confidence = max([doc.score for doc in docs], default=0.0)
        confidence = round((route_confidence * 0.55) + (knowledge_confidence * 0.45), 3)
        if confidence < self.settings.support_confidence_threshold:
            return (
                "I'm not confident enough to answer this.\nWould you like to connect with a human support representative?",
                confidence,
                [],
                [],
            )

        tool_calls: list[dict] = []
        order_id = extract_order_id(message)
        email = extract_email(message)
        if order_id:
            tool_calls.append({"name": "lookup_order", "input": order_id, "result": lookup_order(order_id)})
        if email:
            tool_calls.append({"name": "lookup_account", "input": email, "result": lookup_account(email)})

        history = await self.memory.recent_messages(session_id)
        context = "\n\n".join(f"[{doc.title}]\n{doc.content}" for doc in docs)
        tools = "\n".join(str(call) for call in tool_calls) or "No tool records found."
        messages = [
            {"role": "user" if item.role == "user" else "assistant", "content": item.content}
            for item in history[-8:]
        ]
        messages.append({"role": "user", "content": f"Context:\n{context}\n\nTool records:\n{tools}\n\nUser question: {message}"})
        response = await self.llm.complete(self.prompt, messages)
        return response, confidence, [doc.source for doc in docs], tool_calls
