import asyncio

from app.services.rag import RAGService


async def main() -> None:
    print(await RAGService().ingest())


if __name__ == "__main__":
    asyncio.run(main())
