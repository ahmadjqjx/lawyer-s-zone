import { useState } from 'react'
import { Plus, Swords, Trash2, Pencil } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button, Card, Modal, Field, Input, Textarea, EmptyState, PageHeader, PhaseNotice, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { StrategyItem } from '@/lib/types'

type FormState = Omit<StrategyItem, 'id' | 'createdAt'>

const blank: FormState = {
  matter: '',
  forum: '',
  petitionerPosition: '',
  respondentPosition: '',
  grounds: '',
  objections: '',
  proceduralDefects: '',
  adversePrecedents: '',
  remedies: '',
  assessment: '',
}

export default function Strategy() {
  const { state, addStrategy, updateStrategy, deleteStrategy } = useApp()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(blank)

  function startNew() { setForm(blank); setEditId(null); setOpen(true) }
  function startEdit(s: StrategyItem) {
    const { id, createdAt, ...rest } = s
    void id; void createdAt
    setForm(rest); setEditId(s.id); setOpen(true)
  }
  function submit() {
    if (!form.matter.trim()) return
    if (editId) updateStrategy(editId, form)
    else addStrategy(form)
    setOpen(false)
  }
  function set<K extends keyof FormState>(key: K, val: string) { setForm((f) => ({ ...f, [key]: val })) }

  return (
    <div>
      <PageHeader
        title="Litigation Strategy"
        subtitle="Think like litigation counsel: strongest grounds, anticipated objections, procedural risks and available remedies."
        actions={<Button variant="primary" onClick={startNew}><Plus className="h-4 w-4" /> New matter</Button>}
      />
      <PhaseNotice>
        A structured both-sides worksheet. AI-assisted adversarial analysis (grounds, adverse precedents, procedural
        vulnerabilities) connects in <strong>Phases 3 &amp; 6</strong>. No litigation outcome is guaranteed.
      </PhaseNotice>

      {state.strategies.length === 0 ? (
        <EmptyState icon={<Swords className="h-8 w-8" />} title="No matters yet" description="Create a strategy worksheet to assess both parties' positions, grounds, objections and remedies." action={<Button variant="primary" onClick={startNew}><Plus className="h-4 w-4" /> New matter</Button>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {state.strategies.map((s) => (
            <Card key={s.id} className="flex flex-col p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400"><Swords className="h-4 w-4" /></div>
                  <div>
                    <h3 className="font-medium leading-tight text-slate-900 dark:text-slate-50">{s.matter}</h3>
                    {s.forum && <p className="text-xs text-slate-400">{s.forum}</p>}
                  </div>
                </div>
                <Badge>{formatDate(s.createdAt)}</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-emerald-500/[0.06] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Petitioner / Plaintiff</div>
                  <p className="mt-1 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{s.petitionerPosition || '—'}</p>
                </div>
                <div className="rounded-lg bg-rose-500/[0.06] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-400">Respondent / Defendant</div>
                  <p className="mt-1 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{s.respondentPosition || '—'}</p>
                </div>
              </div>
              {s.assessment && <p className="mt-3 line-clamp-2 text-sm italic text-slate-500 dark:text-slate-400">Assessment: {s.assessment}</p>}
              <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-3 dark:border-white/[0.04]">
                <Button variant="outline" size="sm" onClick={() => startEdit(s)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-500" onClick={() => deleteStrategy(s.id)} aria-label="Delete matter"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit matter' : 'New litigation strategy'} wide
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={submit}>{editId ? 'Save changes' : 'Save matter'}</Button></>}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Matter / case title"><Input value={form.matter} onChange={(e) => set('matter', e.target.value)} placeholder="[Title of the matter]" /></Field>
            <Field label="Competent forum"><Input value={form.forum} onChange={(e) => set('forum', e.target.value)} placeholder="Court / tribunal & jurisdiction" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Petitioner / Plaintiff position" hint="Grounds, provisions, supporting precedents, evidence, relief"><Textarea rows={5} value={form.petitionerPosition} onChange={(e) => set('petitionerPosition', e.target.value)} /></Field>
            <Field label="Respondent / Defendant position" hint="Preliminary objections, jurisdiction, maintainability, rebuttals"><Textarea rows={5} value={form.respondentPosition} onChange={(e) => set('respondentPosition', e.target.value)} /></Field>
          </div>
          <Field label="Strongest legal grounds"><Textarea value={form.grounds} onChange={(e) => set('grounds', e.target.value)} /></Field>
          <Field label="Anticipated objections"><Textarea value={form.objections} onChange={(e) => set('objections', e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Procedural defects / vulnerabilities" hint="Limitation, jurisdiction, maintainability, parties"><Textarea value={form.proceduralDefects} onChange={(e) => set('proceduralDefects', e.target.value)} /></Field>
            <Field label="Adverse / distinguishable precedents"><Textarea value={form.adversePrecedents} onChange={(e) => set('adversePrecedents', e.target.value)} /></Field>
          </div>
          <Field label="Available remedies"><Textarea value={form.remedies} onChange={(e) => set('remedies', e.target.value)} placeholder="Statutory, constitutional, interim relief…" /></Field>
          <Field label="Overall assessment" hint="Reasoned and balanced — no guaranteed outcome"><Textarea value={form.assessment} onChange={(e) => set('assessment', e.target.value)} /></Field>
        </div>
      </Modal>
    </div>
  )
}