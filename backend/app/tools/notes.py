from datetime import datetime


def add_note(text: str) -> dict:
    return {
        "tool": "add_note",
        "status": "saved",
        "note": text,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
