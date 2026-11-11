from contextlib import asynccontextmanager
from typing import Any, Dict, Type

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import db
from .config import CORS_ORIGINS, DB_PATH
from .schemas import (
    AppState,
    CaseAnalysis,
    ChatSession,
    CitationItem,
    DocumentItem,
    Draft,
    Settings,
    StrategyItem,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(
    title="Lawyers Zone API",
    description="Lightweight local backend for the Lawyers Zone legal research & drafting platform.",
    version="0.2.0",
    lifespan=lifespan,
)

# Always allow the local Vite dev server, even when DL_CORS_ORIGINS is customised.
ALLOWED_ORIGINS = list(dict.fromkeys([*CORS_ORIGINS, "http://localhost:5173"]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> Dict[str, Any]:
    return {"status": "ok", "service": "lawyers-zone", "phase": 2, "database": DB_PATH}


@app.get("/api/state", response_model=AppState)
def read_state() -> Dict[str, Any]:
    return db.get_state()


@app.put("/api/state", response_model=AppState)
def write_state(state: AppState) -> Dict[str, Any]:
    return db.put_state(state.model_dump())


@app.get("/api/settings", response_model=Settings)
def read_settings() -> Dict[str, Any]:
    return db.get_settings() or Settings().model_dump()


@app.put("/api/settings", response_model=Settings)
def write_settings(settings: Settings) -> Dict[str, Any]:
    return db.put_settings(settings.model_dump())


def make_crud_router(table: str, model: Type[BaseModel]):
    from fastapi import APIRouter

    router = APIRouter(prefix=f"/api/{table}", tags=[table])

    @router.get("")
    def list_items():
        return db.list_entities(table)

    @router.post("", status_code=201)
    def create_item(item: model):
        return db.insert_entity(table, item.model_dump())

    @router.get("/{entity_id}")
    def read_item(entity_id: str):
        found = db.get_entity(table, entity_id)
        if found is None:
            raise HTTPException(status_code=404, detail=f"{table} item not found")
        return found

    @router.put("/{entity_id}")
    def update_item(entity_id: str, patch: Dict[str, Any]):
        updated = db.update_entity(table, entity_id, patch)
        if updated is None:
            raise HTTPException(status_code=404, detail=f"{table} item not found")
        return updated

    @router.delete("/{entity_id}", status_code=204)
    def delete_item(entity_id: str):
        if not db.delete_entity(table, entity_id):
            raise HTTPException(status_code=404, detail=f"{table} item not found")
        return None

    return router


for _table, _model in (
    ("documents", DocumentItem),
    ("chats", ChatSession),
    ("drafts", Draft),
    ("cases", CaseAnalysis),
    ("strategies", StrategyItem),
    ("citations", CitationItem),
):
    app.include_router(make_crud_router(_table, _model))