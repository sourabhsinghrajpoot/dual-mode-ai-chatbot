from datetime import datetime


def set_reminder(text: str) -> dict:
    return {
        "tool": "set_reminder",
        "status": "scheduled",
        "request": text,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
