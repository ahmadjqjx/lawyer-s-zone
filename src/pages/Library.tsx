import { useMemo, useRef, useState } from 'react'
import {
  Upload,
  Plus,
  Search,
  FileText,
  FileType2,
  ScrollText,
  Trash2,
  Clock,
  Library as LibraryIcon,
  Pencil,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button, Card, Badge, Modal, Field, Input, Select, Textarea, EmptyState, PageHeader, PhaseNotice } from '@/components/ui'
import { formatBytes, formatDate, matchesQuery } from '@/lib/utils'
import type { DocumentCategory, DocumentItem, DocumentKind } from '@/lib/types'

const CATEGORIES: DocumentCategory[] = [
  'Judgment',
  'Act / Ordinance',
  'Rules / Regulations',
  'Legal Notice',
  'Court Document',
  'Contract',
  'Other',
]

function kindFromFile(file: File): DocumentKind {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.docx')) return 'docx'
  return 'txt'
}

function KindIcon({ kind, className }: { kind: DocumentKind; className?: string }) {
  if (kind === 'pdf') return <FileType2 className={className} />
  if (kind === 'docx') return <ScrollText className={className} />
  return <FileText className={className} />
}

export default function Library() {
  const { state, addDocument, updateDocument, deleteDocument } = useApp()
  const { documents } = state
  const fileRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploadMeta, setUploadMeta] = useState({ title: '', category: 'Judgment' as DocumentCategory, tags: '' })
  const [textOpen, setTextOpen] = useState(false)
  const [textMeta, setTextMeta] = useState({ title: '', category: 'Judgment' as DocumentCategory, content: '', tags: '' })
  const [detailId, setDetailId] = useState<string | null>(null)

  const detail = documents.find((d) => d.id === detailId) ?? null

  const filtered = useMemo(
    () =>
      documents.filter(
        (d) =>
          (category === 'All' || d.category === category) &&
          matchesQuery(query, d.title, d.fileName, d.content, d.notes, d.tags.join(' ')),
      ),
    [documents, query, category],
  )

  function onFilePicked(file: File | null) {
    if (!file) return
    setPendingFile(file)
    setUploadMeta({ title: file.name.replace(/\.[^.]+$/, ''), category: 'Judgment', tags: '' })
  }

  async function confirmUpload() {
    if (!pendingFile) return
    const kind = kindFromFile(pendingFile)
    let content = ''
    if (kind === 'txt') {
      content = await pendingFile.text()
    }
    addDocument({
      title: uploadMeta.title || pendingFile.name,
      category: uploadMeta.category,
      kind,
      fileName: pendingFile.name,
      size: pendingFile.size,
      content,
      tags: uploadMeta.tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: '',
      pendingProcessing: kind !== 'txt',
    })
    setPendingFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function confirmText() {
    if (!textMeta.title.trim()) return
    addDocument({
      title: textMeta.title,
      category: textMeta.category,
      kind: 'manual',
      fileName: `${textMeta.title}.txt`,
      size: new Blob([textMeta.content]).size,
      content: textMeta.content,
      tags: textMeta.tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: '',
      pendingProcessing: false,
    })
    setTextOpen(false)
    setTextMeta({ title: '', category: 'Judgment', content: '', tags: '' })
  }

  return (
    <div>
      <PageHeader
        title="Statutory Code Explorer"
        subtitle="Upload, organise and search judgments, statutes, notices and court documents."
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => onFilePicked(e.target.files?.[0] ?? null)}
            />
            <Button variant="outline" onClick={() => setTextOpen(true)}>
              <Plus className="h-4 w-4" /> Add text
            </Button>
            <Button variant="primary" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload
            </Button>
          </>
        }
      />

      <PhaseNotice>
        TXT files are read and searchable immediately. PDF &amp; DOCX uploads are catalogued now; automatic text
        extraction (PyMuPDF / DOCX parsing) arrives in <strong>Phase 4</strong>. Use “Add text” to paste statute or
        judgment text for full-text search today.
      </PhaseNotice>

      {/* Controls */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles, tags and text…" className="pl-9" />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-56">
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<LibraryIcon className="h-8 w-8" />}
          title={documents.length === 0 ? 'Your library is empty' : 'No matching documents'}
          description={
            documents.length === 0
              ? 'Upload a PDF, DOCX or TXT file, or paste legal text to begin building your research library.'
              : 'Try a different search term or category filter.'
          }
          action={
            documents.length === 0 ? (
              <Button variant="primary" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" /> Upload a document
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <Card key={d.id} className="group flex flex-col p-4 transition-shadow hover:shadow-panel">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400">
                  <KindIcon kind={d.kind} className="h-5 w-5" />
                </div>
                <Badge>{d.category}</Badge>
              </div>
              <button onClick={() => setDetailId(d.id)} className="text-left">
                <h3 className="line-clamp-2 font-medium text-slate-900 hover:text-gold-700 dark:text-slate-50 dark:hover:text-gold-300">
                  {d.title}
                </h3>
              </button>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <span className="uppercase">{d.kind}</span>
                <span>·</span>
                <span>{formatBytes(d.size)}</span>
                <span>·</span>
                <span>{formatDate(d.createdAt)}</span>
              </div>
              {d.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {d.tags.slice(0, 4).map((t) => (
                    <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-white/[0.05] dark:text-slate-400">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/[0.04]">
                {d.pendingProcessing ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    <Clock className="h-3 w-3" /> Extraction pending
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{d.content.length.toLocaleString()} chars</span>
                )}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(d.id)} aria-label="Open">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-rose-500" onClick={() => deleteDocument(d.id)} aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload modal */}
      <Modal
        open={!!pendingFile}
        onClose={() => setPendingFile(null)}
        title="Add document to library"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingFile(null)}>Cancel</Button>
            <Button variant="primary" onClick={confirmUpload}>Add document</Button>
          </>
        }
      >
        {pendingFile && (
          <div className="space-y-4">
            <div className="panel-muted flex items-center gap-3 p-3">
              <KindIcon kind={kindFromFile(pendingFile)} className="h-5 w-5 text-gold-600 dark:text-gold-400" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{pendingFile.name}</div>
                <div className="text-xs text-slate-400">{formatBytes(pendingFile.size)}</div>
              </div>
            </div>
            <Field label="Title">
              <Input value={uploadMeta.title} onChange={(e) => setUploadMeta((m) => ({ ...m, title: e.target.value }))} />
            </Field>
            <Field label="Category">
              <Select value={uploadMeta.category} onChange={(e) => setUploadMeta((m) => ({ ...m, category: e.target.value as DocumentCategory }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Tags" hint="Comma-separated (e.g., bail, 497, Punjab)">
              <Input value={uploadMeta.tags} onChange={(e) => setUploadMeta((m) => ({ ...m, tags: e.target.value }))} />
            </Field>
            {kindFromFile(pendingFile) !== 'txt' && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                This file type will be catalogued now and its text extracted in Phase 4.
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Add text modal */}
      <Modal
        open={textOpen}
        onClose={() => setTextOpen(false)}
        title="Add legal text"
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setTextOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={confirmText} disabled={!textMeta.title.trim()}>Save to library</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input value={textMeta.title} onChange={(e) => setTextMeta((m) => ({ ...m, title: e.target.value }))} placeholder="e.g., Punjab Civil Procedure (amendment) — extract" />
            </Field>
            <Field label="Category">
              <Select value={textMeta.category} onChange={(e) => setTextMeta((m) => ({ ...m, category: e.target.value as DocumentCategory }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Text" hint="Paste the statute, judgment or document text. Stored locally and full-text searchable.">
            <Textarea rows={10} value={textMeta.content} onChange={(e) => setTextMeta((m) => ({ ...m, content: e.target.value }))} />
          </Field>
          <Field label="Tags" hint="Comma-separated">
            <Input value={textMeta.tags} onChange={(e) => setTextMeta((m) => ({ ...m, tags: e.target.value }))} />
          </Field>
        </div>
      </Modal>

      {/* Detail / edit modal */}
      <Modal open={!!detail} onClose={() => setDetailId(null)} title={detail?.title ?? 'Document'} wide>
        {detail && <DocumentDetail doc={detail} onSave={(patch) => updateDocument(detail.id, patch)} onDelete={() => { deleteDocument(detail.id); setDetailId(null) }} />}
      </Modal>
    </div>
  )
}

function DocumentDetail({ doc, onSave, onDelete }: { doc: DocumentItem; onSave: (patch: Partial<DocumentItem>) => void; onDelete: () => void }) {
  const [title, setTitle] = useState(doc.title)
  const [category, setCategory] = useState<DocumentCategory>(doc.category)
  const [notes, setNotes] = useState(doc.notes)
  const [tags, setTags] = useState(doc.tags.join(', '))
  const dirty = title !== doc.title || category !== doc.category || notes !== doc.notes || tags !== doc.tags.join(', ')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <Badge>{doc.kind.toUpperCase()}</Badge>
        <span>{doc.fileName}</span>
        <span>· {formatBytes(doc.size)}</span>
        <span>· added {formatDate(doc.createdAt)}</span>
        <span className="font-mono text-[10px] text-slate-300 dark:text-slate-600">{doc.id}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Category">
          <Select value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Tags" hint="Comma-separated"><Input value={tags} onChange={(e) => setTags(e.target.value)} /></Field>
      <Field label="Notes"><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Your annotations…" /></Field>

      <div>
        <span className="label-base">Content</span>
        {doc.pendingProcessing ? (
          <div className="panel-muted flex items-center gap-2 p-4 text-sm text-amber-700 dark:text-amber-300">
            <Clock className="h-4 w-4" /> Text extraction for {doc.kind.toUpperCase()} files is enabled in Phase 4.
          </div>
        ) : doc.content ? (
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 dark:border-ink-700 dark:bg-ink-850 dark:text-slate-300">
            {doc.content}
          </pre>
        ) : (
          <p className="text-sm text-slate-400">No text content.</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="danger" size="sm" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!dirty}
          onClick={() => onSave({ title, category, notes, tags: tags.split(',').map((t) => t.trim()).filter(Boolean) })}
        >
          Save changes
        </Button>
      </div>
    </div>
  )
}