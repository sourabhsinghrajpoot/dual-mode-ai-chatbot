import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database.session import init_db
from app.routers.chat import router as chat_router
from app.schemas import HealthResponse
from app.services.rag import RAGService


settings = get_settings()
logging.basicConfig(level=settings.log_level, format="%(asctime)s %(levelname)s %(name)s %(message)s")

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Production-ready dual-mode chatbot with support RAG, personal assistant tools, SSE, and session memory.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.on_event("startup")
async def startup() -> None:
    await init_db()
    await RAGService().ingest()


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", app=settings.app_name, environment=settings.environment)


@app.post("/ingest")
async def ingest() -> dict[str, int | str]:
    return await RAGService().ingest()
