import { useMemo, useState } from 'react'
import { Plus, ShieldCheck, Trash2, Pencil, ExternalLink, Search } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button, Card, Modal, Field, Input, Select, Textarea, EmptyState, PageHeader, PhaseNotice, StatusBadge, Badge } from '@/components/ui'
import { cn, formatDate, matchesQuery } from '@/lib/utils'
import type { CitationItem, CitationType, VerificationStatus } from '@/lib/types'

const STATUSES: VerificationStatus[] = ['VERIFIED', 'PERSUASIVE', 'UNVERIFIED', 'CONTESTED', 'INFERENCE', 'RESEARCH GAP']
const TYPES: CitationType[] = ['Judicial', 'Statutory', 'Constitutional']

type FormState = Omit<CitationItem, 'id' | 'createdAt'>
const blank: FormState = { citation: '', type: 'Judicial', proposition: '', status: 'UNVERIFIED', source: '', court: '', notes: '' }

export default function Citations() {
  const { state, addCitation, updateCitation, deleteCitation } = useApp()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(blank)
  const [filter, setFilter] = useState<string>('All')
  const [query, setQuery] = useState('')

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: state.citations.length }
    for (const s of STATUSES) c[s] = state.citations.filter((x) => x.status === s).length
    return c
  }, [state.citations])

  const filtered = useMemo(
    () => state.citations.filter((c) => (filter === 'All' || c.status === filter) && matchesQuery(query, c.citation, c.proposition, c.court, c.notes, c.source)),
    [state.citations, filter, query],
  )

  function startNew() { setForm(blank); setEditId(null); setOpen(true) }
  function startEdit(c: CitationItem) {
    const { id, createdAt, ...rest } = c
    void id; void createdAt
    setForm(rest); setEditId(c.id); setOpen(true)
  }
  function submit() {
    if (!form.citation.trim()) return
    if (editId) updateCitation(editId, form)
    else addCitation(form)
    setOpen(false)
  }
  function set<K extends keyof FormState>(key: K, val: FormState[K]) { setForm((f) => ({ ...f, [key]: val })) }

  return (
    <div>
      <PageHeader
        title="Citation Verification"
        subtitle="A ledger of authorities — verified vs. unverified — with source references. Never invent a citation."
        actions={<Button variant="primary" onClick={startNew}><Plus className="h-4 w-4" /> Add authority</Button>}
      />
      <PhaseNotice>
        Every authority is labelled <strong>VERIFIED / PERSUASIVE / UNVERIFIED / CONTESTED / INFERENCE / RESEARCH GAP</strong>.
        Record the primary source for each. Automated verification against official judgments &amp; legislative texts
        arrives in <strong>Phase 5</strong>; until then, confirm against primary sources yourself.
      </PhaseNotice>

      {/* Status filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {['All', ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors', filter === s ? 'border-gold-500 bg-gold-500/10 text-gold-700 dark:text-gold-300' : 'border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-ink-700 dark:text-slate-400 dark:hover:bg-white/[0.04]')}>
            {s} <span className="tabular-nums opacity-60">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search citations, propositions, courts…" className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ShieldCheck className="h-8 w-8" />} title={state.citations.length === 0 ? 'No authorities recorded' : 'No matching authorities'} description={state.citations.length === 0 ? 'Add a statute, constitutional provision or judgment and label its verification status with a primary source.' : 'Adjust the status filter or search.'} action={state.citations.length === 0 ? <Button variant="primary" onClick={startNew}><Plus className="h-4 w-4" /> Add authority</Button> : undefined} />
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-slate-50">{c.citation}</span>
                    <Badge>{c.type}</Badge>
                    <StatusBadge status={c.status} />
                  </div>
                  {c.proposition && <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{c.proposition}</p>}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    {c.court && <span>{c.court}</span>}
                    <span>Added {formatDate(c.createdAt)}</span>
                    {c.source && (
                      /^https?:\/\//i.test(c.source) ? (
                        <a href={c.source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold-700 hover:underline dark:text-gold-300">
                          <ExternalLink className="h-3 w-3" /> Source
                        </a>
                      ) : <span>Source: {c.source}</span>
                    )}
                  </div>
                  {c.notes && <p className="mt-1.5 text-xs italic text-slate-400 dark:text-slate-500">{c.notes}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => startEdit(c)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-500" onClick={() => deleteCitation(c.id)} aria-label="Delete authority"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit authority' : 'Add authority'} wide
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={submit} disabled={!form.citation.trim()}>{editId ? 'Save changes' : 'Add authority'}</Button></>}>
        <div className="space-y-4">
          <Field label="Citation" hint="Full, accurate citation. Do not fabricate — leave blank if unknown."><Input value={form.citation} onChange={(e) => set('citation', e.target.value)} placeholder="Case title, reporter citation, court / Act, year, section" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type"><Select value={form.type} onChange={(e) => set('type', e.target.value as CitationType)}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</Select></Field>
            <Field label="Verification status"><Select value={form.status} onChange={(e) => set('status', e.target.value as VerificationStatus)}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
          </div>
          <Field label="Legal proposition" hint="The proposition this authority is said to support"><Textarea value={form.proposition} onChange={(e) => set('proposition', e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Court / source body"><Input value={form.court} onChange={(e) => set('court', e.target.value)} placeholder="Supreme Court of Pakistan / Legislature" /></Field>
            <Field label="Primary source / link" hint="Official judgment URL or gazette reference"><Input value={form.source} onChange={(e) => set('source', e.target.value)} placeholder="https://… or gazette ref." /></Field>
          </div>
          <Field label="Notes" hint="Subsequent treatment, paragraph verified, caveats"><Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
        </div>
      </Modal>
    </div>
  )
}