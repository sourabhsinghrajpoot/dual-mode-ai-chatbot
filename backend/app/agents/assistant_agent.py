from pathlib import Path

from app.services.llm import LLMService
from app.services.memory import MemoryService
from app.tools.email import draft_email
from app.tools.notes import add_note
from app.tools.reminders import set_reminder


class AssistantAgent:
    def __init__(self, llm: LLMService, memory: MemoryService) -> None:
        self.llm = llm
        self.memory = memory
        self.prompt = (Path(__file__).resolve().parents[1] / "prompts" / "assistant_prompt.txt").read_text(encoding="utf-8")

    async def respond(self, session_id: str, message: str, route_confidence: float) -> tuple[str, float, list[dict]]:
        tool_calls = self._mock_function_calls(message)
        history = await self.memory.recent_messages(session_id)
        messages = [
            {"role": "user" if item.role == "user" else "assistant", "content": item.content}
            for item in history[-10:]
        ]
        tool_context = "\n".join(str(call) for call in tool_calls) or "No function call was needed."
        messages.append({"role": "user", "content": f"Function results:\n{tool_context}\n\nUser request: {message}"})
        if tool_calls:
            response = self._confirmation(tool_calls)
        else:
            response = await self.llm.complete(self.prompt, messages)
        return response, max(route_confidence, 0.74), tool_calls

    def _mock_function_calls(self, message: str) -> list[dict]:
        lowered = message.lower()
        calls: list[dict] = []
        if "remind" in lowered or "reminder" in lowered:
            calls.append(set_reminder(message))
        if "note" in lowered or "remember" in lowered:
            calls.append(add_note(message))
        if "draft" in lowered and "email" in lowered:
            calls.append(draft_email(message))
        return calls

    def _confirmation(self, calls: list[dict]) -> str:
        names = ", ".join(call["tool"].replace("_", " ") for call in calls)
        return f"Done. I used {names} and saved the result to this session's short-term memory."
