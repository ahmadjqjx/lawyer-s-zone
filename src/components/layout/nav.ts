import {
  LayoutDashboard,
  MessagesSquare,
  Search,
  Scale,
  PenLine,
  Library,
  Swords,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  group: string
  description: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Workspace', description: 'Overview & quick actions' },
  { to: '/assistant', label: 'AI Legal Assistant', icon: MessagesSquare, group: 'Workspace', description: 'Structured legal answers' },
  { to: '/research', label: 'Legal Research Desk', icon: Search, group: 'Workspace', description: 'Search statutes & case law' },
  { to: '/cases', label: 'Case Law & Precedents', icon: Scale, group: 'Analysis', description: 'Ratio, obiter & holdings' },
  { to: '/strategy', label: 'Litigation Strategy', icon: Swords, group: 'Analysis', description: 'Both-sides assessment' },
  { to: '/citations', label: 'Citation Verification', icon: ShieldCheck, group: 'Analysis', description: 'Verified vs. unverified' },
  { to: '/drafting', label: 'Pleadings & Legal Drafting', icon: PenLine, group: 'Documents', description: 'Court-ready pleadings & documents' },
  { to: '/library', label: 'Statutory Code Explorer', icon: Library, group: 'Documents', description: 'Browse codes & legal documents' },
  { to: '/settings', label: 'Settings', icon: Settings, group: 'System', description: 'Jurisdiction, AI & data' },
]

export const NAV_GROUPS = ['Workspace', 'Analysis', 'Documents', 'System']

export function navItemForPath(pathname: string): NavItem | undefined {
  if (pathname === '/') return NAV_ITEMS[0]
  return NAV_ITEMS.find((n) => n.to !== '/' && pathname.startsWith(n.to))
}