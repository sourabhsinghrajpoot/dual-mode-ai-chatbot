from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import ChatMessage, ChatSession


class MemoryService:
    def __init__(self, db: AsyncSession, window: int = 12) -> None:
        self.db = db
        self.window = window

    async def get_or_create_session(self, session_id: str) -> ChatSession:
        session = await self.db.get(ChatSession, session_id)
        if session:
            return session
        session = ChatSession(id=session_id, user_profile={})
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def set_mode(self, session_id: str, mode: str) -> None:
        session = await self.get_or_create_session(session_id)
        session.current_mode = mode
        await self.db.commit()

    async def add_message(self, session_id: str, role: str, mode: str, content: str, meta: dict | None = None) -> None:
        await self.get_or_create_session(session_id)
        self.db.add(ChatMessage(session_id=session_id, role=role, mode=mode, content=content, meta=meta or {}))
        await self.db.commit()

    async def recent_messages(self, session_id: str, limit: int | None = None) -> list[ChatMessage]:
        stmt = (
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.desc(), ChatMessage.id.desc())
            .limit(limit or self.window)
        )
        result = await self.db.execute(stmt)
        return list(reversed(result.scalars().all()))

    async def reset(self, session_id: str) -> None:
        await self.db.execute(delete(ChatMessage).where(ChatMessage.session_id == session_id))
        session = await self.db.get(ChatSession, session_id)
        if session:
            session.current_mode = "assistant"
            session.user_profile = {}
        await self.db.commit()
