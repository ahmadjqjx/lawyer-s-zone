import { Link, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Assistant from '@/pages/Assistant'
import Research from '@/pages/Research'
import Cases from '@/pages/Cases'
import Strategy from '@/pages/Strategy'
import Citations from '@/pages/Citations'
import Drafting from '@/pages/Drafting'
import Library from '@/pages/Library'
import Settings from '@/pages/Settings'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="font-serif text-5xl font-bold text-gold-600 dark:text-gold-400">404</div>
      <p className="mt-3 text-slate-500 dark:text-slate-400">This page could not be found.</p>
      <Link to="/" className="mt-5 text-sm font-medium text-gold-700 hover:underline dark:text-gold-300">← Back to Dashboard</Link>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/research" element={<Research />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/strategy" element={<Strategy />} />
        <Route path="/citations" element={<Citations />} />
        <Route path="/drafting" element={<Drafting />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}