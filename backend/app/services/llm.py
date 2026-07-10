import asyncio
import logging
from collections.abc import AsyncGenerator

from app.config import get_settings

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def complete(self, system_prompt: str, messages: list[dict[str, str]], max_tokens: int = 800) -> str:
        if self.settings.anthropic_api_key:
            try:
                return await self._anthropic_complete(system_prompt, messages, max_tokens)
            except Exception:
                logger.exception("Anthropic request failed; using local fallback response.")
        return self._local_complete(system_prompt, messages)

    async def stream(self, text: str) -> AsyncGenerator[str, None]:
        for token in text.split(" "):
            await asyncio.sleep(0.015)
            yield token + " "

    async def _anthropic_complete(self, system_prompt: str, messages: list[dict[str, str]], max_tokens: int) -> str:
        from anthropic import AsyncAnthropic

        client = AsyncAnthropic(api_key=self.settings.anthropic_api_key)
        response = await client.messages.create(
            model=self.settings.anthropic_model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=messages,
        )
        return "".join(block.text for block in response.content if getattr(block, "type", "") == "text")

    def _local_complete(self, system_prompt: str, messages: list[dict[str, str]]) -> str:
        latest = messages[-1]["content"] if messages else ""
        if "customer support" in system_prompt.lower():
            return (
                "Based on the available support knowledge, here is the safest answer: "
                f"{latest}\n\nI can help with orders, refunds, returns, account access, subscriptions, "
                "warranty, and contacting support. Share an order ID or account email if you want me to check mock records."
            )
        return (
            "Done. I handled that as your personal assistant and kept the relevant context in this session. "
            f"Request noted: {latest}"
        )
