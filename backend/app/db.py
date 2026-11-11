import json
import sqlite3
import time
import uuid
from contextlib import contextmanager
from typing import Any, Dict, List, Optional

from .config import DB_PATH

TABLES = ("documents", "chats", "drafts", "cases", "strategies", "citations")


def now_ms() -> int:
    return int(time.time() * 1000)


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with get_conn() as conn:
        for table in TABLES:
            conn.execute(
                f"CREATE TABLE IF NOT EXISTS {table} ("
                "id TEXT PRIMARY KEY, payload TEXT NOT NULL, "
                "created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)"
            )
        conn.execute(
            "CREATE TABLE IF NOT EXISTS settings ("
            "id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL)"
        )


def _normalize(table: str, entity: Dict[str, Any]) -> Dict[str, Any]:
    e = dict(entity)
    ts = now_ms()
    e.setdefault("id", new_id(table[:4]))
    e.setdefault("createdAt", ts)
    if table in ("chats", "drafts"):
        e.setdefault("updatedAt", e.get("createdAt", ts))
    return e


def list_entities(table: str) -> List[Dict[str, Any]]:
    with get_conn() as conn:
        rows = conn.execute(f"SELECT payload FROM {table} ORDER BY created_at DESC").fetchall()
    return [json.loads(r["payload"]) for r in rows]


def get_entity(table: str, entity_id: str) -> Optional[Dict[str, Any]]:
    with get_conn() as conn:
        row = conn.execute(f"SELECT payload FROM {table} WHERE id = ?", (entity_id,)).fetchone()
    return json.loads(row["payload"]) if row else None


def insert_entity(table: str, entity: Dict[str, Any]) -> Dict[str, Any]:
    e = _normalize(table, entity)
    ts = now_ms()
    with get_conn() as conn:
        conn.execute(
            f"INSERT INTO {table} (id, payload, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (e["id"], json.dumps(e), e.get("createdAt", ts), ts),
        )
    return e


def update_entity(table: str, entity_id: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    existing = get_entity(table, entity_id)
    if existing is None:
        return None
    merged = {**existing, **patch, "id": entity_id}
    if table in ("chats", "drafts"):
        merged["updatedAt"] = now_ms()
    with get_conn() as conn:
        conn.execute(
            f"UPDATE {table} SET payload = ?, updated_at = ? WHERE id = ?",
            (json.dumps(merged), now_ms(), entity_id),
        )
    return merged


def delete_entity(table: str, entity_id: str) -> bool:
    with get_conn() as conn:
        cur = conn.execute(f"DELETE FROM {table} WHERE id = ?", (entity_id,))
    return cur.rowcount > 0


def get_settings() -> Dict[str, Any]:
    with get_conn() as conn:
        row = conn.execute("SELECT payload FROM settings WHERE id = 1").fetchone()
    return json.loads(row["payload"]) if row else {}


def put_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO settings (id, payload) VALUES (1, ?) "
            "ON CONFLICT(id) DO UPDATE SET payload = excluded.payload",
            (json.dumps(settings),),
        )
    return settings


def get_state() -> Dict[str, Any]:
    state: Dict[str, Any] = {table: list_entities(table) for table in TABLES}
    state["settings"] = get_settings()
    return state


def put_state(state: Dict[str, Any]) -> Dict[str, Any]:
    """Full-state sync (single-user local app). Replaces all collections atomically."""
    ts = now_ms()
    with get_conn() as conn:
        for table in TABLES:
            conn.execute(f"DELETE FROM {table}")
            for entity in state.get(table, []):
                e = _normalize(table, entity)
                conn.execute(
                    f"INSERT INTO {table} (id, payload, created_at, updated_at) VALUES (?, ?, ?, ?)",
                    (e["id"], json.dumps(e), e.get("createdAt", ts), ts),
                )
        conn.execute(
            "INSERT INTO settings (id, payload) VALUES (1, ?) "
            "ON CONFLICT(id) DO UPDATE SET payload = excluded.payload",
            (json.dumps(state.get("settings", {})),),
        )
    return get_state()