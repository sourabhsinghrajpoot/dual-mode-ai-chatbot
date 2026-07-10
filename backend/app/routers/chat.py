import json
import time

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.assistant_agent import AssistantAgent
from app.agents.intent_router import IntentRouter
from app.agents.support_agent import SupportAgent
from app.config import get_settings
from app.database.session import get_db
from app.schemas import ChatRequest, ChatResponse, ResetSessionRequest
from app.services.llm import LLMService
from app.services.memory import MemoryService
from app.services.rag import RAGService

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, db: AsyncSession = Depends(get_db)) -> ChatResponse | StreamingResponse:
    settings = get_settings()
    memory = MemoryService(db, settings.memory_window)
    router_service = IntentRouter()
    route = await router_service.route(payload.message, payload.requested_mode)
    await memory.add_message(payload.session_id, "user", route.mode, payload.message, {"route": route.model_dump()})

    llm = LLMService()
    started = time.perf_counter()
    if route.mode == "support":
        agent = SupportAgent(llm, RAGService(), memory)
        response, confidence, sources, tool_calls = await agent.respond(payload.session_id, payload.message, route.confidence)
    else:
        agent = AssistantAgent(llm, memory)
        response, confidence, tool_calls = await agent.respond(payload.session_id, payload.message, route.confidence)
        sources = []

    elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
    await memory.set_mode(payload.session_id, route.mode)
    await memory.add_message(
        payload.session_id,
        "assistant",
        route.mode,
        response,
        {"confidence": confidence, "sources": sources, "tool_calls": tool_calls, "response_ms": elapsed_ms},
    )

    result = ChatResponse(
        session_id=payload.session_id,
        mode=route.mode,
        response=response,
        confidence=confidence,
        sources=sources,
        tool_calls=tool_calls,
    )
    if not payload.stream:
        return result

    async def event_stream() -> object:
        header = {"mode": result.mode, "confidence": result.confidence, "sources": result.sources, "tool_calls": result.tool_calls}
        yield f"event: meta\ndata: {json.dumps(header)}\n\n"
        async for chunk in llm.stream(result.response):
            yield f"event: token\ndata: {json.dumps({'token': chunk})}\n\n"
        yield f"event: done\ndata: {json.dumps(result.model_dump())}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/reset-session")
async def reset_session(payload: ResetSessionRequest, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    await MemoryService(db).reset(payload.session_id)
    return {"status": "reset", "session_id": payload.session_id}
