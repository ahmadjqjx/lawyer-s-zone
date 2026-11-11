import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import { Plus, Send, Trash2, MessagesSquare, Bot, Sparkles, Scale, AlertTriangle, X, Loader2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button, EmptyState } from '@/components/ui'
import { cn, relativeTime } from '@/lib/utils'
import { streamChat, ChatError, type ChatTurn } from '@/lib/chat'

const SUGGESTIONS = [
  'Identify limitation for a civil appeal in Punjab',
  'Grounds for post-arrest bail under s.497 Cr.P.C.',
  'Draft a legal notice for recovery of money',
  'Distinguish ratio decidendi from obiter dicta',
]

export default function Assistant() {
  const { state, createChat, deleteChat, renameChat, addMessage } = useApp()
  const { chats, settings } = state
  const [selectedId, setSelectedId] = useState<string | null>(chats[0]?.id ?? null)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [streamChatId, setStreamChatId] = useState<string | null>(null)
  const [unreachable, setUnreachable] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => chats.find((c) => c.id === selectedId) ?? null, [chats, selectedId])

  useEffect(() => {
    if (!selectedId && chats.length) setSelectedId(chats[0].id)
    if (selectedId && !chats.some((c) => c.id === selectedId)) setSelectedId(chats[0]?.id ?? null)
  }, [chats, selectedId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selected?.messages.length, streamText])

  function handleNew() {
    const chat = createChat()
    setSelectedId(chat.id)
  }

  async function handleSend(e?: FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || streaming) return
    let chatId = selectedId
    let history: ChatTurn[] = []
    if (!chatId) {
      const chat = createChat(text.slice(0, 60))
      chatId = chat.id
      setSelectedId(chat.id)
    } else {
      const chat = chats.find((c) => c.id === chatId)
      history = (chat?.messages ?? [])
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    }
    addMessage(chatId, { role: 'user', content: text })
    setInput('')
    setUnreachable(null)
    setStreaming(true)
    setStreamChatId(chatId)
    setStreamText('')

    let full = ''
    try {
      await streamChat([...history, { role: 'user', content: text }], (delta) => {
        full += delta
        setStreamText(full)
      })
      if (full.trim()) addMessage(chatId, { role: 'assistant', content: full })
    } catch (err) {
      if (err instanceof ChatError && err.kind === 'network') {
        setUnreachable(err.message)
      } else {
        const message = err instanceof Error ? err.message : 'Unknown error'
        addMessage(chatId, { role: 'assistant', content: `**Provider error:** ${message}\n\nCheck GROQ_API_KEY in backend/.env and restart the server.` })
      }
    } finally {
      setStreaming(false)
      setStreamText('')
      setStreamChatId(null)
    }
  }

  const showStream = streaming && streamChatId === selectedId

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-4">
      {/* Sessions */}
      <div className="hidden w-64 shrink-0 flex-col panel md:flex">
        <div className="border-b border-mocha-green/20 p-3 dark:border-mocha-green/60">
          <Button variant="primary" className="w-full" onClick={handleNew}>
            <Plus className="h-4 w-4" /> New query
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-slate-400 dark:text-slate-500">No sessions yet.</p>
          )}
          {chats.map((c) => (
            <div
              key={c.id}
              className={cn(
                'group mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                c.id === selectedId
                  ? 'bg-mocha-green/10 text-mocha-green dark:bg-mocha-green dark:text-soft-sand'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.04]',
              )}
            >
              <button className="min-w-0 flex-1 text-left" onClick={() => setSelectedId(c.id)}>
                <div className="truncate font-medium">{c.title}</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  {c.messages.length} msg · {relativeTime(c.updatedAt)}
                </div>
              </button>
              <button
                onClick={() => deleteChat(c.id)}
                aria-label={`Delete ${c.title}`}
                className="opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className="flex min-w-0 flex-1 flex-col panel">
        <div className="flex items-center gap-3 border-b border-mocha-green/20 px-4 py-3 dark:border-mocha-green/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mocha-green/10 text-mocha-green dark:bg-mocha-green/40 dark:text-soft-sand">
            <Scale className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            {selected ? (
              <input
                value={selected.title}
                onChange={(e) => renameChat(selected.id, e.target.value)}
                aria-label="Session title"
                className="w-full truncate bg-transparent text-sm font-semibold text-slate-800 focus:outline-none dark:text-slate-100"
              />
            ) : (
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Lawyers Zone</div>
            )}
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              {settings.defaultJurisdiction} · {settings.province} · Pakistan-default legal framework
            </div>
          </div>
          <Button variant="outline" size="sm" className="md:hidden" onClick={handleNew}>
            <Plus className="h-3.5 w-3.5" /> New
          </Button>
        </div>

        {unreachable && (
          <div role="alert" className="mx-4 mt-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1 leading-relaxed">{unreachable}</p>
            <button onClick={() => setUnreachable(null)} aria-label="Dismiss error" className="shrink-0 hover:opacity-70">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!selected || (selected.messages.length === 0 && !showStream) ? (
            <div className="py-6">
              <EmptyState
                icon={<MessagesSquare className="h-8 w-8" />}
                title="Lawyers Zone"
                description="Structured Legal Answers Grounded in Relevant Statutes and Case Law."
              />
              <div className="mx-auto mt-5 grid max-w-2xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="flex items-center gap-2 rounded-lg border border-mocha-green/20 px-3 py-2.5 text-left text-sm text-slate-600 transition-colors hover:border-mocha-green/50 hover:bg-mocha-green/[0.04] dark:border-mocha-green/60 dark:text-slate-300 dark:hover:bg-mocha-green/20"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-mocha-green dark:text-soft-sand" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {selected?.messages.map((m) => (
                <div key={m.id} className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {m.role !== 'user' && (
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mocha-green/10 text-mocha-green dark:bg-mocha-green/40 dark:text-soft-sand">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                      m.role === 'user'
                        ? 'whitespace-pre-wrap bg-mocha-green text-soft-sand'
                        : 'bg-slate-100 text-slate-800 dark:bg-white/[0.05] dark:text-slate-100',
                    )}
                  >
                    {m.role === 'user' ? m.content : (
                      <div className="markdown"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                    )}
                  </div>
                </div>
              ))}

              {showStream && (
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mocha-green/10 text-mocha-green dark:bg-mocha-green/40 dark:text-soft-sand">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl bg-slate-100 px-4 py-2.5 text-sm leading-relaxed text-slate-800 dark:bg-white/[0.05] dark:text-slate-100">
                    {streamText ? (
                      <div className="markdown"><ReactMarkdown>{streamText}</ReactMarkdown></div>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Researching…
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <form onSubmit={handleSend} className="border-t border-mocha-green/20 p-3 dark:border-mocha-green/60">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void handleSend()
                }
              }}
              rows={1}
              placeholder="Ask Lawyers Zone a legal question..."
              aria-label="Message"
              className="input-base max-h-40 min-h-[44px] flex-1 resize-none py-3"
            />
            <Button type="submit" variant="primary" size="icon" className="h-11 w-11" disabled={!input.trim() || streaming} aria-label="Send message">
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}