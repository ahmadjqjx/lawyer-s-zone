import { Link, useNavigate } from 'react-router-dom'
import {
  FileText,
  PenLine,
  MessagesSquare,
  Scale,
  ShieldCheck,
  Swords,
  ArrowRight,
  Upload,
  Sparkles,
  Search,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button, Card, StatCard, Badge } from '@/components/ui'
import { relativeTime } from '@/lib/utils'

export default function Dashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const { documents, drafts, chats, cases, citations, strategies, settings } = state
  const verified = citations.filter((c) => c.status === 'VERIFIED').length

  const recent = [
    ...documents.map((d) => ({ id: d.id, title: d.title, kind: 'Document', to: '/library', ts: d.createdAt })),
    ...drafts.map((d) => ({ id: d.id, title: d.title, kind: 'Draft', to: '/drafting', ts: d.updatedAt })),
    ...chats.map((c) => ({ id: c.id, title: c.title, kind: 'Chat', to: '/assistant', ts: c.updatedAt })),
    ...cases.map((c) => ({ id: c.id, title: c.caseTitle || 'Untitled case', kind: 'Case', to: '/cases', ts: c.createdAt })),
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 6)

  const modules = [
    { label: 'AI Legal Assistant', to: '/assistant', ui: true, backend: 'Phase 3' },
    { label: 'Legal Research Desk', to: '/research', ui: true, backend: 'Phase 5 (RAG)' },
    { label: 'Case Law & Precedents', to: '/cases', ui: true, backend: 'Phase 6' },
    { label: 'Pleadings & Legal Drafting', to: '/drafting', ui: true, backend: 'Phase 6' },
    { label: 'Statutory Code Explorer', to: '/library', ui: true, backend: 'Phase 4' },
    { label: 'Litigation Strategy', to: '/strategy', ui: true, backend: 'Phase 3/6' },
    { label: 'Citation Verification', to: '/citations', ui: true, backend: 'Phase 5' },
  ]

  const checklist = [
    { done: true, label: 'Set default jurisdiction & province', to: '/settings' },
    { done: documents.length > 0, label: 'Upload your first legal document', to: '/library' },
    { done: drafts.length > 0, label: 'Create a court-ready draft from a template', to: '/drafting' },
    { done: citations.length > 0, label: 'Record & label an authority in the citation ledger', to: '/citations' },
    { done: false, label: 'Connect an AI provider (backend)', to: '/settings' },
  ]

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-mocha-green/40 bg-gradient-to-br from-ink-900 to-ink-850 p-6 text-slate-100 shadow-panel dark:border-soft-sand/15 sm:p-8">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="border-soft-sand/30 bg-mocha-green text-soft-sand">
              <Sparkles className="h-3 w-3" /> AI-Powered Legal Intelligence
            </Badge>
            <Badge className="border-white/15 bg-white/5 text-slate-200">
              {settings.defaultJurisdiction} · {settings.province}
            </Badge>
          </div>
          <h1 className="max-w-2xl font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Lawyers Zone
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-soft-sand">
            Structured Legal Answers Grounded in Relevant Statutes and Case Law.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button variant="primary" onClick={() => navigate('/assistant')}>
              <MessagesSquare className="h-4 w-4" /> Ask Lawyers Zone
            </Button>
            <Button variant="secondary" className="bg-white/10 hover:bg-white/15" onClick={() => navigate('/library')}>
              <Upload className="h-4 w-4" /> Upload Document
            </Button>
            <Button variant="secondary" className="bg-white/10 hover:bg-white/15" onClick={() => navigate('/drafting')}>
              <PenLine className="h-4 w-4" /> New Draft
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Documents" value={documents.length} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Drafts" value={drafts.length} icon={<PenLine className="h-5 w-5" />} />
        <StatCard label="Chat sessions" value={chats.length} icon={<MessagesSquare className="h-5 w-5" />} />
        <StatCard label="Case analyses" value={cases.length} icon={<Scale className="h-5 w-5" />} />
        <StatCard label="Citations" value={`${verified}/${citations.length}`} icon={<ShieldCheck className="h-5 w-5" />} accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Strategies" value={strategies.length} icon={<Swords className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-white/[0.06]">
            <h2 className="font-serif text-base font-semibold text-slate-900 dark:text-slate-50">Recent activity</h2>
            <Link to="/library" className="text-xs font-medium text-gold-700 hover:underline dark:text-gold-300">
              View library
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet.</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Upload a document, start a chat, or create a draft to see it here.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/library')}>
                <Upload className="h-3.5 w-3.5" /> Upload a document
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link to={r.to} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-white/[0.05] dark:text-slate-400">
                      {r.kind}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-200">{r.title}</span>
                    <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{relativeTime(r.ts)}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Getting started */}
        <Card>
          <div className="border-b border-slate-200 px-5 py-3.5 dark:border-white/[0.06]">
            <h2 className="font-serif text-base font-semibold text-slate-900 dark:text-slate-50">Getting started</h2>
          </div>
          <ul className="space-y-1 px-3 py-3">
            {checklist.map((c) => (
              <li key={c.label}>
                <Link to={c.to} className="flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  {c.done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                  )}
                  <span className={c.done ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}>
                    {c.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Module status */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-white/[0.06]">
          <h2 className="font-serif text-base font-semibold text-slate-900 dark:text-slate-50">Module status</h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">UI live · backend in progress</span>
        </div>
        <div className="grid gap-px bg-slate-100 dark:bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link key={m.label} to={m.to} className="flex items-center gap-3 bg-white px-5 py-3.5 transition-colors hover:bg-slate-50 dark:bg-ink-900 dark:hover:bg-ink-850">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{m.label}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500">AI / data: {m.backend}</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Search className="h-3 w-3" /> UI ready
              </span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}