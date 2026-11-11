import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, Moon, Sun, MapPin } from 'lucide-react'
import { navItemForPath } from './nav'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui'

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { state, toggleTheme } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const current = navItemForPath(location.pathname)
  const [query, setQuery] = useState('')
  const isDark = state.settings.theme === 'dark'

  function onSearch(e: FormEvent) {
    e.preventDefault()
    navigate(`/research?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-mocha-green/20 bg-white/85 px-4 backdrop-blur dark:border-mocha-green/60 dark:bg-ink-950/80 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden min-w-0 md:block">
        <div className="truncate font-serif text-sm font-semibold text-slate-800 dark:text-slate-100">
          {current?.label ?? 'Lawyers Zone'}
        </div>
        <div className="truncate text-xs text-slate-400 dark:text-slate-500">{current?.description}</div>
      </div>

      <form onSubmit={onSearch} className="relative ml-auto w-full max-w-xs sm:max-w-sm">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your library…"
          aria-label="Search legal library"
          className="input-base h-9 pl-9"
        />
        <button
          type="submit"
          aria-label="Submit search"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-mocha-green dark:hover:text-soft-sand"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      <div className="hidden items-center gap-1.5 rounded-lg border border-mocha-green/25 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-mocha-green/60 dark:text-soft-sand xl:flex">
        <MapPin className="h-3.5 w-3.5 text-mocha-green dark:text-soft-sand" />
        {state.settings.defaultJurisdiction}
        {state.settings.province ? ` · ${state.settings.province}` : ''}
      </div>

      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle colour theme">
        {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </Button>
    </header>
  )
}