def draft_email(text: str) -> dict:
    return {
        "tool": "draft_email",
        "status": "drafted",
        "subject": "Draft prepared by assistant",
        "body": text,
    }
