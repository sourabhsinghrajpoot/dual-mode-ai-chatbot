from typing import Literal

from pydantic import BaseModel, Field


Mode = Literal["support", "assistant"]


class ChatRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=128)
    message: str = Field(..., min_length=1)
    requested_mode: Mode | None = None
    stream: bool = False


class ChatResponse(BaseModel):
    session_id: str
    mode: Mode
    response: str
    confidence: float
    sources: list[str] = Field(default_factory=list)
    tool_calls: list[dict] = Field(default_factory=list)


class ResetSessionRequest(BaseModel):
    session_id: str


class IntentResult(BaseModel):
    mode: Mode
    confidence: float
    reason: str = ""


class HealthResponse(BaseModel):
    status: str
    app: str
    environment: str
