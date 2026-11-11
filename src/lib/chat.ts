import { CHAT_API_URL } from './api'

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export class ChatError extends Error {
  constructor(message: string, public readonly kind: 'network' | 'api') {
    super(message)
  }
}

export async function streamChat(messages: ChatTurn[], onDelta: (text: string) => void): Promise<void> {
  let res: Response
  try {
    res = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
  } catch {
    throw new ChatError(`Cannot reach the chat service (${CHAT_API_URL}). Locally start the backend on port 8001; on Vercel check the /api/chat function.`, 'network')
  }
  if (!res.ok || !res.body) {
    const detail = await res.json().catch(() => null)
    throw new ChatError(detail?.detail ?? `Chat request failed (${res.status}).`, 'api')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let sep: number
    while ((sep = buffer.indexOf('\n\n')) >= 0) {
      const frame = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      for (const line of frame.split('\n')) {
        if (!line.startsWith('data:')) continue
        const data = line.slice(5).trim()
        if (data === '[DONE]') return
        const parsed = JSON.parse(data) as { content?: string; error?: string }
        if (parsed.error) throw new ChatError(parsed.error, 'api')
        if (parsed.content) onDelta(parsed.content)
      }
    }
  }
}