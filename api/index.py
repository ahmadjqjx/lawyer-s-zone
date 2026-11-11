"""Vercel serverless API for Lawyers Zone.

Single function deployment: vercel.json rewrites /api/(.*) here, so any POST
path is treated as the chat endpoint and health probes are served on GET.
There is deliberately no /api/state: serverless functions have no persistent
disk, so the frontend keeps state in browser storage. The Groq key is read
from the server environment only (never the browser).
"""
import json
import os

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

SYSTEM_PROMPT = """You are Lawyers Zone, a legal research and drafting assistant. Pakistan is the default jurisdiction unless the user specifies otherwise; identify the province and competent forum when relevant.

Integrity rules:
- Never fabricate case citations (PLD, SCMR, CLC, YLR, MLD), statutory sections, judgment dates, paragraph numbers, or quotations. Label anything you cannot verify as "UNVERIFIED — confirm against the primary source before relying on it".
- Distinguish binding precedent (Supreme Court, Article 189; High Court, Article 201) from persuasive authority, and ratio decidendi from obiter dicta.
- Separate user-provided facts from assumptions; flag missing information instead of inventing it.
- Address counterarguments, limitation, jurisdiction, and maintainability where relevant.
- Never guarantee outcomes; recommend review by a qualified advocate before filing or urgent action.

Structure substantive answers in markdown with exactly these sections:
## Executive Summary
## Statutory Provisions
## Precedents
## Actionable Steps
Be concise and precise. For simple conversational messages, reply briefly without the full structure."""

app = FastAPI(title="Lawyers Zone API")


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1)


@app.post("/{path:path}")
async def chat(path: str, req: ChatRequest):
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not set. Add it in your Vercel project environment variables.",
        )
    history = [m.model_dump() for m in req.messages if m.role in ("user", "assistant")]
    payload = {
        "model": GROQ_MODEL,
        "temperature": 0.2,
        "stream": True,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}, *history],
    }

    async def event_stream():
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0)) as client:
                async with client.stream(
                    "POST",
                    GROQ_URL,
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                    json=payload,
                ) as upstream:
                    if upstream.status_code != 200:
                        body = (await upstream.aread()).decode("utf-8", "replace")
                        yield f"data: {json.dumps({'error': f'Groq returned {upstream.status_code}: {body[:300]}'})}\n\n"
                        return
                    async for line in upstream.aiter_lines():
                        if not line.startswith("data:"):
                            continue
                        data = line[5:].strip()
                        if data == "[DONE]":
                            break
                        try:
                            delta = json.loads(data)["choices"][0]["delta"].get("content")
                        except (KeyError, IndexError, TypeError, json.JSONDecodeError):
                            continue
                        if delta:
                            yield f"data: {json.dumps({'content': delta})}\n\n"
        except httpx.HTTPError as exc:
            yield f"data: {json.dumps({'error': f'AI provider unreachable: {exc}'})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/{path:path}")
async def health(path: str):
    if path not in ("", "health", "api", "api/health", "api/index"):
        raise HTTPException(status_code=404, detail="Not found")
    return {"status": "ok", "service": "lawyers-zone", "model": GROQ_MODEL}
