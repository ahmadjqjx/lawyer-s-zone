import { useState } from 'react'
import {
  PenLine,
  ArrowLeft,
  Save,
  Download,
  Printer,
  Trash2,
  LayoutTemplate,
  Eye,
  Pencil,
  FileText,
  Wand2,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button, Card, Badge, Field, Input, Select, EmptyState, PageHeader, PhaseNotice } from '@/components/ui'
import { TEMPLATES, getTemplate, renderTemplate } from '@/lib/templates'
import { cn, downloadTextFile, formatDate, slugify } from '@/lib/utils'
import type { Draft, DraftType } from '@/lib/types'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface EditingState {
  id?: string
  title: string
  type: DraftType
  content: string
}

export default function Drafting() {
  const { state, addDraft, updateDraft, deleteDraft } = useApp()
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [saved, setSaved] = useState(false)

  function startTemplate(type: DraftType) {
    const tpl = getTemplate(type)
    setValues({})
    setEditing({ title: tpl.label, type, content: renderTemplate(tpl.body, {}) })
    setTab('edit')
    setSaved(false)
  }

  function openDraft(d: Draft) {
    setValues({})
    setEditing({ id: d.id, title: d.title, type: d.type, content: d.content })
    setTab('edit')
    setSaved(true)
  }

  function applyFields() {
    if (!editing) return
    const tpl = getTemplate(editing.type)
    setEditing({ ...editing, content: renderTemplate(tpl.body, values) })
    setSaved(false)
  }

  function save() {
    if (!editing) return
    if (editing.id) {
      updateDraft(editing.id, { title: editing.title, type: editing.type, content: editing.content })
    } else {
      const d = addDraft({ title: editing.title, type: editing.type, content: editing.content })
      setEditing({ ...editing, id: d.id })
    }
    setSaved(true)
  }

  function exportFile(ext: 'txt' | 'md') {
    if (!editing) return
    downloadTextFile(`${slugify(editing.title)}.${ext}`, editing.content, ext === 'md' ? 'text/markdown' : 'text/plain')
  }

  function printDraft() {
    if (!editing) return
    const w = window.open('', '_blank', 'width=820,height=900')
    if (!w) return
    w.document.write(`<!doctype html><html><head><title>${escapeHtml(editing.title)}</title>
      <style>body{font-family:Georgia,'Times New Roman',serif;font-size:12.5pt;line-height:1.75;color:#000;margin:48px 64px;white-space:pre-wrap}h1{font-size:15pt}</style>
      </head><body>${escapeHtml(editing.content)}</body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 250)
  }

  /* ------------------------------ Gallery ------------------------------ */
  if (!editing) {
    return (
      <div>
        <PageHeader title="Pleadings & Legal Drafting" subtitle="Create professionally structured, court-ready documents from verified-format templates." />
        <PhaseNotice>
          Templates provide genuine document skeletons with placeholders — no case names, citations or sections are
          fabricated. Complete and verify every placeholder before filing. AI-assisted drafting arrives in <strong>Phase 6</strong>.
        </PhaseNotice>

        <h2 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">
          <LayoutTemplate className="h-4 w-4 text-gold-600 dark:text-gold-400" /> Choose a template
        </h2>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button key={t.type} onClick={() => startTemplate(t.type)} className="panel group p-4 text-left transition-shadow hover:shadow-panel">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10 text-gold-600 transition-colors group-hover:bg-gold-500 group-hover:text-ink-950 dark:text-gold-400">
                <PenLine className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-slate-900 dark:text-slate-50">{t.label}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t.description}</p>
            </button>
          ))}
        </div>

        <h2 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">
          <FileText className="h-4 w-4 text-gold-600 dark:text-gold-400" /> Saved drafts
          <Badge>{state.drafts.length}</Badge>
        </h2>
        {state.drafts.length === 0 ? (
          <EmptyState icon={<FileText className="h-8 w-8" />} title="No saved drafts" description="Pick a template above to create your first document. Drafts are saved locally." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.drafts.map((d) => (
              <Card key={d.id} className="flex flex-col p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Badge>{d.type}</Badge>
                  <span className="text-xs text-slate-400">{formatDate(d.updatedAt)}</span>
                </div>
                <button onClick={() => openDraft(d)} className="text-left">
                  <h3 className="line-clamp-2 font-medium text-slate-900 hover:text-gold-700 dark:text-slate-50 dark:hover:text-gold-300">{d.title}</h3>
                </button>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400 dark:text-slate-500">{d.content.slice(0, 120)}…</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/[0.04]">
                  <Button variant="outline" size="sm" onClick={() => openDraft(d)}><Pencil className="h-3.5 w-3.5" /> Open</Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-rose-500" onClick={() => deleteDraft(d.id)} aria-label="Delete draft"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ------------------------------- Editor ------------------------------ */
  const tpl = getTemplate(editing.type)
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setEditing(null)} aria-label="Back to templates"><ArrowLeft className="h-4 w-4" /></Button>
          <div className="min-w-0">
            <Input
              value={editing.title}
              onChange={(e) => { setEditing({ ...editing, title: e.target.value }); setSaved(false) }}
              className="h-9 max-w-md font-serif text-base font-semibold"
              aria-label="Draft title"
            />
            <div className="mt-1 flex items-center gap-2">
              <Badge>{editing.type}</Badge>
              <span className="text-xs text-slate-400">{saved ? 'Saved' : 'Unsaved changes'}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={editing.type} onChange={(e) => { setEditing({ ...editing, type: e.target.value as DraftType }); setSaved(false) }} className="h-9 w-48">
            {TEMPLATES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
          </Select>
          <Button variant="outline" size="sm" onClick={() => exportFile('txt')}><Download className="h-3.5 w-3.5" /> .txt</Button>
          <Button variant="outline" size="sm" onClick={() => exportFile('md')}><Download className="h-3.5 w-3.5" /> .md</Button>
          <Button variant="outline" size="sm" onClick={printDraft}><Printer className="h-3.5 w-3.5" /> Print</Button>
          <Button variant="primary" size="sm" onClick={save}><Save className="h-3.5 w-3.5" /> Save</Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Fields */}
        <Card className="h-fit p-4">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Wand2 className="h-4 w-4 text-gold-600 dark:text-gold-400" /> Template fields
          </h3>
          <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">Fill these, then apply to regenerate the draft body. Manual edits in the editor are preserved until you apply.</p>
          <div className="space-y-3">
            {tpl.fields.map((f) => (
              <Field key={f.key} label={f.label}>
                {f.multiline ? (
                  <textarea
                    className="input-base min-h-[72px] resize-y text-sm"
                    placeholder={f.placeholder}
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                ) : (
                  <Input
                    placeholder={f.placeholder}
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                )}
              </Field>
            ))}
          </div>
          <Button variant="secondary" className="mt-4 w-full" onClick={applyFields}><Wand2 className="h-4 w-4" /> Apply fields to draft</Button>
        </Card>

        {/* Editor / preview */}
        <Card className="flex min-h-[60vh] flex-col overflow-hidden">
          <div className="flex items-center gap-1 border-b border-slate-200 px-3 py-2 dark:border-white/[0.06]">
            <button onClick={() => setTab('edit')} className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium', tab === 'edit' ? 'bg-gold-500/10 text-gold-700 dark:text-gold-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.04]')}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={() => setTab('preview')} className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium', tab === 'preview' ? 'bg-gold-500/10 text-gold-700 dark:text-gold-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.04]')}>
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
            <span className="ml-auto text-xs text-slate-400">{editing.content.length.toLocaleString()} chars</span>
          </div>
          {tab === 'edit' ? (
            <textarea
              value={editing.content}
              onChange={(e) => { setEditing({ ...editing, content: e.target.value }); setSaved(false) }}
              spellCheck
              className="min-h-[60vh] flex-1 resize-none bg-transparent p-5 font-mono text-[13px] leading-relaxed text-slate-800 focus:outline-none dark:text-slate-200"
              aria-label="Draft body"
            />
          ) : (
            <div className="flex-1 overflow-auto bg-slate-200/50 p-6 dark:bg-ink-950/40">
              <div className="mx-auto max-w-3xl whitespace-pre-wrap rounded-sm bg-white p-10 font-serif text-[13px] leading-[1.8] text-slate-900 shadow-panel">
                {editing.content}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}