import pytest
from httpx import ASGITransport, AsyncClient

from app.database.session import init_db
from app.main import app


@pytest.mark.asyncio
async def test_health() -> None:
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_support_chat_routes_to_support() -> None:
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/chat", json={"session_id": "test-support", "message": "Where is my order ORD-1001?"})
    body = response.json()
    assert response.status_code == 200
    assert body["mode"] == "support"
    assert body["confidence"] > 0


@pytest.mark.asyncio
async def test_assistant_reminder_calls_tool() -> None:
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/chat", json={"session_id": "test-assistant", "message": "Remind me tomorrow at 9 AM to call John."})
    body = response.json()
    assert response.status_code == 200
    assert body["mode"] == "assistant"
    assert body["tool_calls"][0]["tool"] == "set_reminder"
