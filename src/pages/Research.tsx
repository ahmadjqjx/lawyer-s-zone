import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, BookOpen, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Input, Select, Badge, EmptyState, PageHeader, PhaseNotice, Button } from '@/components/ui'
import { formatDate, matchesQuery } from '@/lib/utils'
import type { DocumentItem } from '@/lib/types'

function snippet(content: string, query: string, len = 220): string {
  if (!content) return ''
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const lower = content.toLowerCase()
  let idx = -1
  for (const t of terms) {
    const i = lower.indexOf(t)
    if (i >= 0 && (idx < 0 || i < idx)) idx = i
  }
  if (idx < 0) return content.slice(0, len) + (content.length > len ? '…' : '')
  const start = Math.max(0, idx - 80)
  const end = Math.min(content.length, start + len)
  return (start > 0 ? '…' : '') + content.slice(start, end).replace(/\s+/g, ' ') + (end < content.length ? '…' : '')
}

export default function Research() {
  const { state } = useApp()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [category, setCategory] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)

  const categories = useMemo(() => ['All', ...Array.from(new Set(state.documents.map((d) => d.category)))], [state.documents])

  const results = useMemo(
    () =>
      state.documents.filter(
        (d) => (category === 'All' || d.category === category) && matchesQuery(query, d.title, d.content, d.tags.join(' '), d.notes),
      ),
    [state.documents, query, category],
  )

  function setQuery(q: string) {
    setParams(q ? { q } : {}, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title="Legal Research Desk"
        subtitle="Full-text search across your uploaded judgments, statutes, notices and notes."
      />

      <PhaseNotice>
        Searching <strong>your local library</strong> now. Retrieval-Augmented Generation over a legislation &amp;
        case-law corpus — with citation and paragraph referencing — arrives in <strong>Phase 5</strong>. Retrieved
        documents are used as evidence; the model's memory is never treated as an authoritative legal database.
      </PhaseNotice>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms, sections, case names, citations…"
            className="pl-9"
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-56">
          {categories.map((c) => <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>)}
        </Select>
      </div>

      <div className="mb-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          {results.length} {results.length === 1 ? 'result' : 'results'}
          {query && <> for <strong className="text-slate-700 dark:text-slate-200">“{query}”</strong></>}
        </span>
        {query && <Button variant="ghost" size="sm" onClick={() => setQuery('')}>Clear</Button>}
      </div>

      {state.documents.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="Nothing to search yet"
          description="Add documents to your library first. Paste statute or judgment text via “Add text” for immediate full-text search."
          action={<Link to="/library" className="text-sm font-medium text-gold-700 hover:underline dark:text-gold-300">Go to Document Library →</Link>}
        />
      ) : results.length === 0 ? (
        <EmptyState icon={<Search className="h-8 w-8" />} title="No matches" description="Try different keywords, or add more documents to your library." />
      ) : (
        <div className="space-y-3">
          {results.map((d) => (
            <ResultCard key={d.id} doc={d} query={query} expanded={expanded === d.id} onToggle={() => setExpanded(expanded === d.id ? null : d.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ResultCard({ doc, query, expanded, onToggle }: { doc: DocumentItem; query: string; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="panel p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-slate-900 dark:text-slate-50">{doc.title}</h3>
            <Badge>{doc.category}</Badge>
            {doc.pendingProcessing && <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">text pending</Badge>}
          </div>
          <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            {doc.fileName} · {formatDate(doc.createdAt)}
          </div>
          {doc.content ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{snippet(doc.content, query)}</p>
          ) : (
            <p className="mt-2 text-sm italic text-slate-400 dark:text-slate-500">
              No extracted text yet (Phase 4). Title, tags and notes are searchable.
            </p>
          )}
          {doc.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {doc.tags.map((t) => (
                <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-white/[0.05] dark:text-slate-400">{t}</span>
              ))}
            </div>
          )}
          {doc.content && (
            <button onClick={onToggle} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold-700 hover:underline dark:text-gold-300">
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Hide full text' : 'Show full text'}
            </button>
          )}
          {expanded && (
            <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:border-ink-700 dark:bg-ink-850 dark:text-slate-300">
              {doc.content}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}