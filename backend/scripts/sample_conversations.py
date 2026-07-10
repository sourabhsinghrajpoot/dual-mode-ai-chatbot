import asyncio

import httpx


async def main() -> None:
    async with httpx.AsyncClient(base_url="http://localhost:8000", timeout=30) as client:
        for message in ["Where is my order ORD-1001?", "Remind me tomorrow at 9 AM to call John."]:
            response = await client.post("/chat", json={"session_id": "demo", "message": message})
            print(response.json())


if __name__ == "__main__":
    asyncio.run(main())
