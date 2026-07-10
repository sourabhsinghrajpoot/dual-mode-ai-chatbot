import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


def _load(name: str) -> list[dict]:
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))


def lookup_order(order_id: str) -> dict | None:
    normalized = order_id.strip().upper()
    return next((order for order in _load("mock_orders.json") if order["order_id"].upper() == normalized), None)


def lookup_account(email: str) -> dict | None:
    normalized = email.strip().lower()
    return next((user for user in _load("mock_users.json") if user["email"].lower() == normalized), None)


def extract_order_id(text: str) -> str | None:
    match = re.search(r"\b(?:ORD|ORDER)[-\s]?\d{4,8}\b", text, flags=re.IGNORECASE)
    return match.group(0).replace(" ", "-").upper() if match else None


def extract_email(text: str) -> str | None:
    match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
    return match.group(0) if match else None
