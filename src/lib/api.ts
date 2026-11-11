import type { AppState } from './types'

// Relative by default: /api/* is served by the Vercel serverless function
// (api/index.py) in production, and proxied to the local backend in dev.
export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export const CHAT_API_URL = `${API_BASE}/api/chat`

const STATE_LISTS = ['documents', 'chats', 'drafts', 'cases', 'strategies', 'citations'] as const

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AppState>
  return (
    typeof candidate.settings === 'object' &&
    candidate.settings !== null &&
    STATE_LISTS.every((key) => Array.isArray(candidate[key]))
  )
}

export async function fetchRemoteState(): Promise<AppState | null> {
  try {
    const res = await fetch(`${API_BASE}/api/state`)
    if (!res.ok) return null
    const data: unknown = await res.json()
    return isAppState(data) ? data : null
  } catch {
    return null
  }
}

export async function pushRemoteState(state: AppState): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
    return res.ok
  } catch {
    return false
  }
}

export function hasData(state: AppState): boolean {
  return (
    state.documents.length > 0 ||
    state.chats.length > 0 ||
    state.drafts.length > 0 ||
    state.cases.length > 0 ||
    state.strategies.length > 0 ||
    state.citations.length > 0
  )
}