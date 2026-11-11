import { NavLink } from 'react-router-dom'
import { Scale, Moon, Sun, X } from 'lucide-react'
import { NAV_GROUPS, NAV_ITEMS } from './nav'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, toggleTheme, backendStatus } = useApp()
  const isDark = state.settings.theme === 'dark'

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-mocha-green/20 bg-white transition-transform dark:border-mocha-green/60 dark:bg-ink-900 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mocha-green text-soft-sand shadow-sm">
              <Scale className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
                LAWYERS <span className="text-mocha-green dark:text-soft-sand">ZONE</span>
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Legal Research &amp; Drafting
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose} aria-label="Close navigation">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group} className="mb-5">
              <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                {group}
              </div>
              <div className="space-y-0.5">
                {NAV_ITEMS.filter((n) => n.group === group).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onClose}
                    className={({ isActive }) => cn('nav-item', isActive && 'nav-item-active')}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-mocha-green/20 p-3 dark:border-mocha-green/60">
          <button
            onClick={toggleTheme}
            className="nav-item w-full justify-between"
            aria-label="Toggle colour theme"
          >
            <span className="flex items-center gap-3">
              {isDark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
              {isDark ? 'Dark theme' : 'Light theme'}
            </span>
            <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 dark:border-ink-700 dark:text-slate-500">
              switch
            </span>
          </button>
          <div className="mt-2 flex items-center justify-between px-3 text-[11px] text-slate-400 dark:text-slate-500">
            <span>v0.2.0</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 font-semibold',
                backendStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : backendStatus === 'connecting'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
              )}
            >
              {backendStatus === 'connected' ? 'API online' : backendStatus === 'connecting' ? 'Connecting…' : 'API offline'}
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}