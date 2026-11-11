import { useRef, useState } from 'react'
import { Moon, Sun, MapPin, Bot, Database, Download, Upload, Trash2, Info, ShieldCheck, Save } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button, Card, Field, Input, Select, Modal, PageHeader, Badge } from '@/components/ui'
import { PROVINCES } from '@/lib/storage'
import { API_BASE } from '@/lib/api'
import { cn, downloadTextFile } from '@/lib/utils'
import type { AppState } from '@/lib/types'

export default function Settings() {
  const { state, updateSettings, exportData, importData, resetData, backendStatus } = useApp()
  const { settings } = state
  const [provider, setProvider] = useState({ aiProviderBaseUrl: settings.aiProviderBaseUrl, aiModel: settings.aiModel })
  const [legal, setLegal] = useState({ defaultJurisdiction: settings.defaultJurisdiction, province: settings.province, competentCourt: settings.competentCourt })
  const [resetOpen, setResetOpen] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  function saveLegal() {
    updateSettings(legal)
    setMessage({ kind: 'ok', text: 'Legal defaults saved.' })
  }
  function saveProvider() {
    updateSettings(provider)
    setMessage({ kind: 'ok', text: 'Provider settings saved (non-secret). API keys are configured server-side in Phase 3.' })
  }
  function doExport() {
    downloadTextFile('lawyers-zone-data.json', JSON.stringify(exportData(), null, 2), 'application/json')
  }
  async function doImport(file: File | null) {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as AppState
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.documents)) {
        throw new Error('Unrecognised file format.')
      }
      importData(parsed)
      setMessage({ kind: 'ok', text: 'Data imported successfully.' })
    } catch (e) {
      setMessage({ kind: 'err', text: `Import failed: ${(e as Error).message}` })
    } finally {
      if (importRef.current) importRef.current.value = ''
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" subtitle="Configure jurisdiction defaults, appearance, AI provider and local data." />

      {message && (
        <div className={cn('mb-5 rounded-lg border px-4 py-2.5 text-sm', message.kind === 'ok' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300')}>
          {message.text}
        </div>
      )}

      <div className="space-y-5">
        {/* Appearance */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold text-slate-900 dark:text-slate-50"><Sun className="h-4 w-4 text-gold-600 dark:text-gold-400" /> Appearance</h2>
          <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
            {(['dark', 'light'] as const).map((t) => (
              <button key={t} onClick={() => updateSettings({ theme: t })} className={cn('flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-colors', settings.theme === t ? 'border-gold-500 bg-gold-500/10 text-gold-700 dark:text-gold-300' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-ink-700 dark:text-slate-300 dark:hover:bg-white/[0.03]')}>
                {t === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {t === 'dark' ? 'Dark' : 'Light'}
              </button>
            ))}
          </div>
        </Card>

        {/* Legal defaults */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold text-slate-900 dark:text-slate-50"><MapPin className="h-4 w-4 text-gold-600 dark:text-gold-400" /> Legal defaults</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Default jurisdiction" hint="Pakistan unless expressly instructed otherwise"><Input value={legal.defaultJurisdiction} onChange={(e) => setLegal((l) => ({ ...l, defaultJurisdiction: e.target.value }))} /></Field>
            <Field label="Province / territory"><Select value={legal.province} onChange={(e) => setLegal((l) => ({ ...l, province: e.target.value }))}>{PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}</Select></Field>
            <Field label="Competent court (optional)" className="sm:col-span-2"><Input value={legal.competentCourt} onChange={(e) => setLegal((l) => ({ ...l, competentCourt: e.target.value }))} placeholder="e.g., Lahore High Court — for context in answers" /></Field>
          </div>
          <Button variant="primary" size="sm" className="mt-4" onClick={saveLegal}><Save className="h-3.5 w-3.5" /> Save legal defaults</Button>
        </Card>

        {/* AI provider */}
        <Card className="p-5">
          <h2 className="mb-1 flex items-center gap-2 font-serif text-base font-semibold text-slate-900 dark:text-slate-50"><Bot className="h-4 w-4 text-gold-600 dark:text-gold-400" /> AI provider <Badge>Phase 3</Badge></h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">OpenAI-compatible endpoint. Model switching is supported. These non-secret preferences are saved now; inference connects with the backend in Phase 3.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="API base URL"><Input value={provider.aiProviderBaseUrl} onChange={(e) => setProvider((p) => ({ ...p, aiProviderBaseUrl: e.target.value }))} placeholder="https://api.openai.com/v1" /></Field>
            <Field label="Model"><Input value={provider.aiModel} onChange={(e) => setProvider((p) => ({ ...p, aiModel: e.target.value }))} placeholder="gpt-4o-mini / any compatible model" /></Field>
          </div>
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-gold-500/25 bg-gold-500/[0.06] px-4 py-3 text-sm text-gold-800 dark:text-gold-200">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>API keys are <strong>never stored in the browser or committed</strong>. In Phase 3 you will set the key server-side in <code className="rounded bg-black/10 px-1 dark:bg-white/10">backend/.env</code>.</p>
          </div>
          <Button variant="primary" size="sm" className="mt-4" onClick={saveProvider}><Save className="h-3.5 w-3.5" /> Save provider settings</Button>
        </Card>

        {/* Backend & sync */}
        <Card className="p-5">
          <h2 className="mb-1 flex items-center gap-2 font-serif text-base font-semibold text-slate-900 dark:text-slate-50"><Database className="h-4 w-4 text-gold-600 dark:text-gold-400" /> Backend &amp; sync</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold', backendStatus === 'connected' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : backendStatus === 'connecting' ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'border-slate-300 bg-slate-100 text-slate-600 dark:border-ink-700 dark:bg-white/[0.04] dark:text-slate-300')}>
              <span className={cn('h-1.5 w-1.5 rounded-full', backendStatus === 'connected' ? 'bg-emerald-500' : backendStatus === 'connecting' ? 'bg-amber-500' : 'bg-slate-400')} />
              {backendStatus === 'connected' ? 'Connected · SQLite' : backendStatus === 'connecting' ? 'Connecting…' : 'Offline · browser storage'}
            </span>
            <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-white/[0.05] dark:text-slate-300">{API_BASE}</code>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {backendStatus === 'connected'
              ? 'Your work is synced to the local FastAPI + SQLite backend. The browser keeps an offline cache as a fallback.'
              : 'No SQLite backend is connected, so changes are kept in this browser only. Run the local FastAPI backend or set VITE_API_BASE_URL to enable server-side sync.'}
          </p>
        </Card>

        {/* Data */}
        <Card className="p-5">
          <h2 className="mb-1 flex items-center gap-2 font-serif text-base font-semibold text-slate-900 dark:text-slate-50"><Database className="h-4 w-4 text-gold-600 dark:text-gold-400" /> Local data</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Export a backup, import it elsewhere, or reset. When the backend is connected, data is persisted to SQLite; the browser copy acts as an offline cache.</p>
          <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => doImport(e.target.files?.[0] ?? null)} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={doExport}><Download className="h-4 w-4" /> Export JSON</Button>
            <Button variant="outline" onClick={() => importRef.current?.click()}><Upload className="h-4 w-4" /> Import JSON</Button>
            <Button variant="danger" onClick={() => setResetOpen(true)}><Trash2 className="h-4 w-4" /> Reset all data</Button>
          </div>
        </Card>

        {/* About */}
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-base font-semibold text-slate-900 dark:text-slate-50"><Info className="h-4 w-4 text-gold-600 dark:text-gold-400" /> About</h2>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4 sm:block"><dt className="text-slate-400">Application</dt><dd className="font-medium text-slate-700 dark:text-slate-200">Lawyers Zone</dd></div>
            <div className="flex justify-between gap-4 sm:block"><dt className="text-slate-400">Version</dt><dd className="font-medium text-slate-700 dark:text-slate-200">0.2.0</dd></div>
            <div className="flex justify-between gap-4 sm:block"><dt className="text-slate-400">Stack</dt><dd className="font-medium text-slate-700 dark:text-slate-200">React · TypeScript · Vite · Tailwind</dd></div>
            <div className="flex justify-between gap-4 sm:block"><dt className="text-slate-400">Target</dt><dd className="font-medium text-slate-700 dark:text-slate-200">Lightweight · 8 GB RAM friendly</dd></div>
          </dl>
          <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-400 dark:border-white/[0.04] dark:text-slate-500">
            Lawyers Zone provides legal research and drafting assistance, not formal legal representation. It is not a
            licensed advocate. Verify all authorities against primary sources and consult a qualified local advocate
            before filing, court appearance or urgent legal action.
          </p>
        </Card>
      </div>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset all data?"
        footer={<><Button variant="ghost" onClick={() => setResetOpen(false)}>Cancel</Button><Button variant="danger" onClick={() => { resetData(); setResetOpen(false); setMessage({ kind: 'ok', text: 'All local data cleared.' }) }}>Yes, reset everything</Button></>}>
        <p className="text-sm text-slate-600 dark:text-slate-300">This permanently deletes all locally stored documents, chats, drafts, case analyses, strategies and citations from this browser. Export a backup first if needed. This cannot be undone.</p>
      </Modal>
    </div>
  )
}