from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    app_name: str = "Dual Mode AI Chatbot"
    environment: str = "development"
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://localhost:80",
            "https://*.vercel.app",  # Allow all Vercel deployments
        ]
    )
    database_url: str = f"sqlite+aiosqlite:///{BASE_DIR / 'chatbot.db'}"
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-3-5-sonnet-20241022"
    chroma_path: str = str(BASE_DIR / "chroma")
    faq_path: str = str(BASE_DIR / "app" / "data" / "faq")
    memory_window: int = 12
    support_confidence_threshold: float = 0.58
    intent_confidence_threshold: float = 0.55
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
