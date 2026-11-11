import { useEffect, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VerificationStatus } from '@/lib/types'

/* ------------------------------- Button ------------------------------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const variants: Record<Variant, string> = {
  primary:
    'bg-mocha-green text-soft-sand hover:bg-mocha-green/90 focus-visible:ring-mocha-green/40 font-semibold shadow-sm',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15 focus-visible:ring-slate-500/40',
  outline:
    'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-ink-700 dark:text-slate-200 dark:hover:bg-white/[0.04] focus-visible:ring-slate-500/30',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.05] focus-visible:ring-slate-500/30',
  danger:
    'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500/40 font-medium',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9 justify-center',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'secondary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

/* -------------------------------- Card -------------------------------- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('panel', className)}>{children}</div>
}

/* ------------------------------- Badge -------------------------------- */
export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:border-soft-sand/20 dark:bg-mocha-green/20 dark:text-soft-sand',
        className,
      )}
    >
      {children}
    </span>
  )
}

const statusStyles: Record<VerificationStatus, string> = {
  VERIFIED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  PERSUASIVE: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  UNVERIFIED: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  CONTESTED: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
  INFERENCE: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  'RESEARCH GAP': 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300',
}

export function StatusBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        statusStyles[status],
      )}
    >
      {status}
    </span>
  )
}

/* ------------------------- Inputs & fields ---------------------------- */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('input-base', className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('input-base min-h-[96px] resize-y leading-relaxed', className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn('input-base appearance-none pr-8', className)} {...props}>
      {children}
    </select>
  )
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="label-base">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
    </label>
  )
}

/* ----------------------------- PageHeader ----------------------------- */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ----------------------------- EmptyState ----------------------------- */
export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-ink-700">
      {icon && <div className="mb-3 text-slate-400 dark:text-slate-500">{icon}</div>}
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* -------------------------------- Modal ------------------------------- */
export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('panel my-8 w-full animate-slide-up shadow-panel', wide ? 'max-w-3xl' : 'max-w-lg')}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-white/[0.06]">
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3.5 dark:border-white/[0.06]">{footer}</div>}
      </div>
    </div>
  )
}

/* ------------------------------ StatCard ------------------------------ */
export function StatCard({ label, value, icon, accent }: { label: string; value: ReactNode; icon?: ReactNode; accent?: string }) {
  return (
    <div className="panel flex items-center gap-4 p-4">
      {icon && (
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', accent ?? 'bg-mocha-green/10 text-mocha-green dark:bg-mocha-green/40 dark:text-soft-sand')}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">{value}</div>
        <div className="truncate text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  )
}

/* --------------------------- Phase notice ----------------------------- */
export function PhaseNotice({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-gold-500/25 bg-gold-500/[0.07] px-4 py-3 text-sm text-gold-800 dark:text-gold-200">
      <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-gold-500" />
      <p className="leading-relaxed">{children}</p>
    </div>
  )
}