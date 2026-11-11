import { useState } from 'react'
import { Plus, Scale, Trash2, Pencil, Gavel } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button, Card, Modal, Field, Input, Select, Textarea, EmptyState, PageHeader, PhaseNotice, StatusBadge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { CaseAnalysis, VerificationStatus } from '@/lib/types'

const STATUSES: VerificationStatus[] = ['VERIFIED', 'PERSUASIVE', 'UNVERIFIED', 'CONTESTED', 'INFERENCE', 'RESEARCH GAP']

type FormState = Omit<CaseAnalysis, 'id' | 'createdAt'>

const blank: FormState = {
  caseTitle: '',
  citation: '',
  court: '',
  date: '',
  facts: '',
  issues: '',
  ratio: '',
  obiter: '',
  holding: '',
  paragraphs: '',
  application: '',
  status: 'UNVERIFIED',
}

export default function Cases() {
  const { state, addCase, updateCase, deleteCase } = useApp()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(blank)

  function startNew() {
    setForm(blank)
    setEditId(null)
    setOpen(true)
  }
  function startEdit(c: CaseAnalysis) {
    const { id, createdAt, ...rest } = c
    void id
    void createdAt
    setForm(rest)
    setEditId(c.id)
    setOpen(true)
  }
  function submit() {
    if (!form.caseTitle.trim() && !form.citation.trim()) return
    if (editId) updateCase(editId, form)
    else addCase(form)
    setOpen(false)
  }
  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  return (
    <div>
      <PageHeader
        title="Case Law & Precedents"
        subtitle="Extract and structure case title, citation, court, facts, issues, ratio decidendi, obiter and holding."
        actions={<Button variant="primary" onClick={startNew}><Plus className="h-4 w-4" /> New analysis</Button>}
      />
      <PhaseNotice>
        This is a structured analysis worksheet using the mandatory case-extraction format. Automatic AI extraction
        from uploaded judgments arrives in <strong>Phase 6</strong>. Always distinguish ratio from obiter, and verify
        the citation and continuing validity before relying on any authority.
      </PhaseNotice>

      {state.cases.length === 0 ? (
        <EmptyState icon={<Scale className="h-8 w-8" />} title="No case analyses yet" description="Create a structured analysis of a judgment, or upload it in the library and analyse it here." action={<Button variant="primary" onClick={startNew}><Plus className="h-4 w-4" /> New analysis</Button>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {state.cases.map((c) => (
            <Card key={c.id} className="flex flex-col p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400"><Gavel className="h-4 w-4" /></div>
                  <div>
                    <h3 className="font-medium leading-tight text-slate-900 dark:text-slate-50">{c.caseTitle || 'Untitled case'}</h3>
                    <p className="text-xs text-slate-400">{c.citation || 'No citation'}{c.court ? ` · ${c.court}` : ''}</p>
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              {c.ratio && (
                <div className="mt-2 rounded-lg bg-slate-50 p-3 dark:bg-white/[0.03]">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Ratio decidendi</div>
                  <p className="mt-1 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{c.ratio}</p>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/[0.04]">
                <span className="text-xs text-slate-400">{c.date || formatDate(c.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => startEdit(c)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-500" onClick={() => deleteCase(c.id)} aria-label="Delete analysis"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? 'Edit case analysis' : 'New case analysis'}
        wide
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={submit}>{editId ? 'Save changes' : 'Save analysis'}</Button></>}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Case title"><Input value={form.caseTitle} onChange={(e) => set('caseTitle', e.target.value)} placeholder="[Appellant] v. [Respondent]" /></Field>
            <Field label="Reporter citation" hint="e.g., PLD 2020 SC 1 — verify before relying"><Input value={form.citation} onChange={(e) => set('citation', e.target.value)} placeholder="PLD / SCMR / CLC / YLR / MLD …" /></Field>
            <Field label="Court"><Input value={form.court} onChange={(e) => set('court', e.target.value)} placeholder="Supreme Court of Pakistan / Lahore High Court …" /></Field>
            <Field label="Decision date"><Input value={form.date} onChange={(e) => set('date', e.target.value)} placeholder="YYYY-MM-DD (if verified)" /></Field>
          </div>
          <Field label="Material facts"><Textarea value={form.facts} onChange={(e) => set('facts', e.target.value)} placeholder="Only facts necessary to understand the decision." /></Field>
          <Field label="Legal issues"><Textarea value={form.issues} onChange={(e) => set('issues', e.target.value)} placeholder="Precise questions considered by the court." /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ratio decidendi" hint="Binding principle necessary for the decision"><Textarea value={form.ratio} onChange={(e) => set('ratio', e.target.value)} /></Field>
            <Field label="Obiter dicta" hint="Observations not essential to the decision"><Textarea value={form.obiter} onChange={(e) => set('obiter', e.target.value)} /></Field>
          </div>
          <Field label="Final holding / disposition"><Textarea value={form.holding} onChange={(e) => set('holding', e.target.value)} placeholder="The court's actual conclusion and order." /></Field>
          <Field label="Relevant paragraphs" hint="Verified paragraph numbers only"><Input value={form.paragraphs} onChange={(e) => set('paragraphs', e.target.value)} placeholder="para. 12–18 (verified)" /></Field>
          <Field label="Application to present matter"><Textarea value={form.application} onChange={(e) => set('application', e.target.value)} placeholder="How this supports, limits or distinguishes your position." /></Field>
          <Field label="Verification status">
            <Select value={form.status} onChange={(e) => set('status', e.target.value as VerificationStatus)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}