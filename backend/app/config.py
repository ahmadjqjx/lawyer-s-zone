import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent


def _load_env_file() -> None:
    """Minimal .env loader (stdlib only) so no extra dependency is required."""
    env_path = BACKEND_DIR / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_env_file()

HOST = os.getenv("DL_HOST", "127.0.0.1")
PORT = int(os.getenv("DL_PORT", "8001"))
DB_PATH = os.getenv("DL_DB_PATH", str(BACKEND_DIR / "data.db"))
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "DL_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
    ).split(",")
    if o.strip()
]