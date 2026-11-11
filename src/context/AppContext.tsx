import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type {
  AppState,
  CaseAnalysis,
  ChatMessage,
  ChatSession,
  CitationItem,
  DocumentItem,
  Draft,
  Settings,
  StrategyItem,
} from '@/lib/types'
import { clearState, defaultState, loadState, saveState } from '@/lib/storage'
import { fetchRemoteState, pushRemoteState, hasData } from '@/lib/api'
import { uid } from '@/lib/utils'

export type BackendStatus = 'connecting' | 'connected' | 'offline'

interface AppContextValue {
  state: AppState
  backendStatus: BackendStatus
  // settings
  updateSettings: (patch: Partial<Settings>) => void
  toggleTheme: () => void
  // documents
  addDocument: (doc: Omit<DocumentItem, 'id' | 'createdAt'>) => DocumentItem
  updateDocument: (id: string, patch: Partial<DocumentItem>) => void
  deleteDocument: (id: string) => void
  // chats
  createChat: (title?: string) => ChatSession
  deleteChat: (id: string) => void
  renameChat: (id: string, title: string) => void
  addMessage: (chatId: string, msg: Omit<ChatMessage, 'id' | 'createdAt'>) => void
  // drafts
  addDraft: (draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>) => Draft
  updateDraft: (id: string, patch: Partial<Draft>) => void
  deleteDraft: (id: string) => void
  // case analyses
  addCase: (item: Omit<CaseAnalysis, 'id' | 'createdAt'>) => CaseAnalysis
  updateCase: (id: string, patch: Partial<CaseAnalysis>) => void
  deleteCase: (id: string) => void
  // strategies
  addStrategy: (item: Omit<StrategyItem, 'id' | 'createdAt'>) => StrategyItem
  updateStrategy: (id: string, patch: Partial<StrategyItem>) => void
  deleteStrategy: (id: string) => void
  // citations
  addCitation: (item: Omit<CitationItem, 'id' | 'createdAt'>) => CitationItem
  updateCitation: (id: string, patch: Partial<CitationItem>) => void
  deleteCitation: (id: string) => void
  // data management
  exportData: () => AppState
  importData: (data: AppState) => void
  resetData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('connecting')
  const [hydrated, setHydrated] = useState(false)
  const firstRun = useRef(true)

  // Hydrate from the backend on mount; fall back to local storage when offline.
  useEffect(() => {
    let cancelled = false
    fetchRemoteState().then((remote) => {
      if (cancelled) return
      if (remote) {
        const local = loadState()
        if (hasData(remote) || !hasData(local)) {
          setState(remote)
        } else {
          // Backend is empty but this browser has data: migrate local -> SQLite once.
          void pushRemoteState(local)
        }
        setBackendStatus('connected')
      } else {
        setBackendStatus('offline')
      }
      setHydrated(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Persist to local cache always; debounce-sync to the backend when connected.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    saveState(state)
    if (!hydrated || backendStatus !== 'connected') return
    const t = window.setTimeout(() => {
      void pushRemoteState(state)
    }, 600)
    return () => window.clearTimeout(t)
  }, [state, hydrated, backendStatus])

  // Apply theme to <html>.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', state.settings.theme === 'dark')
  }, [state.settings.theme])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const toggleTheme = useCallback(() => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, theme: s.settings.theme === 'dark' ? 'light' : 'dark' },
    }))
  }, [])

  // Documents
  const addDocument = useCallback((doc: Omit<DocumentItem, 'id' | 'createdAt'>) => {
    const full: DocumentItem = { ...doc, id: uid('doc'), createdAt: Date.now() }
    setState((s) => ({ ...s, documents: [full, ...s.documents] }))
    return full
  }, [])
  const updateDocument = useCallback((id: string, patch: Partial<DocumentItem>) => {
    setState((s) => ({ ...s, documents: s.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)) }))
  }, [])
  const deleteDocument = useCallback((id: string) => {
    setState((s) => ({ ...s, documents: s.documents.filter((d) => d.id !== id) }))
  }, [])

  // Chats
  const createChat = useCallback((title = 'New legal query') => {
    const now = Date.now()
    const chat: ChatSession = { id: uid('chat'), title, messages: [], createdAt: now, updatedAt: now }
    setState((s) => ({ ...s, chats: [chat, ...s.chats] }))
    return chat
  }, [])
  const deleteChat = useCallback((id: string) => {
    setState((s) => ({ ...s, chats: s.chats.filter((c) => c.id !== id) }))
  }, [])
  const renameChat = useCallback((id: string, title: string) => {
    setState((s) => ({ ...s, chats: s.chats.map((c) => (c.id === id ? { ...c, title, updatedAt: Date.now() } : c)) }))
  }, [])
  const addMessage = useCallback((chatId: string, msg: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    const full: ChatMessage = { ...msg, id: uid('msg'), createdAt: Date.now() }
    setState((s) => ({
      ...s,
      chats: s.chats.map((c) =>
        c.id === chatId ? { ...c, messages: [...c.messages, full], updatedAt: Date.now() } : c,
      ),
    }))
  }, [])

  // Drafts
  const addDraft = useCallback((draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now()
    const full: Draft = { ...draft, id: uid('draft'), createdAt: now, updatedAt: now }
    setState((s) => ({ ...s, drafts: [full, ...s.drafts] }))
    return full
  }, [])
  const updateDraft = useCallback((id: string, patch: Partial<Draft>) => {
    setState((s) => ({ ...s, drafts: s.drafts.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d)) }))
  }, [])
  const deleteDraft = useCallback((id: string) => {
    setState((s) => ({ ...s, drafts: s.drafts.filter((d) => d.id !== id) }))
  }, [])

  // Case analyses
  const addCase = useCallback((item: Omit<CaseAnalysis, 'id' | 'createdAt'>) => {
    const full: CaseAnalysis = { ...item, id: uid('case'), createdAt: Date.now() }
    setState((s) => ({ ...s, cases: [full, ...s.cases] }))
    return full
  }, [])
  const updateCase = useCallback((id: string, patch: Partial<CaseAnalysis>) => {
    setState((s) => ({ ...s, cases: s.cases.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
  }, [])
  const deleteCase = useCallback((id: string) => {
    setState((s) => ({ ...s, cases: s.cases.filter((c) => c.id !== id) }))
  }, [])

  // Strategies
  const addStrategy = useCallback((item: Omit<StrategyItem, 'id' | 'createdAt'>) => {
    const full: StrategyItem = { ...item, id: uid('strat'), createdAt: Date.now() }
    setState((s) => ({ ...s, strategies: [full, ...s.strategies] }))
    return full
  }, [])
  const updateStrategy = useCallback((id: string, patch: Partial<StrategyItem>) => {
    setState((s) => ({ ...s, strategies: s.strategies.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  }, [])
  const deleteStrategy = useCallback((id: string) => {
    setState((s) => ({ ...s, strategies: s.strategies.filter((x) => x.id !== id) }))
  }, [])

  // Citations
  const addCitation = useCallback((item: Omit<CitationItem, 'id' | 'createdAt'>) => {
    const full: CitationItem = { ...item, id: uid('cite'), createdAt: Date.now() }
    setState((s) => ({ ...s, citations: [full, ...s.citations] }))
    return full
  }, [])
  const updateCitation = useCallback((id: string, patch: Partial<CitationItem>) => {
    setState((s) => ({ ...s, citations: s.citations.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
  }, [])
  const deleteCitation = useCallback((id: string) => {
    setState((s) => ({ ...s, citations: s.citations.filter((c) => c.id !== id) }))
  }, [])

  // Data management
  const exportData = useCallback(() => state, [state])
  const importData = useCallback((data: AppState) => {
    setState({
      ...structuredClone(defaultState),
      ...data,
      settings: { ...defaultState.settings, ...data.settings, aiApiKey: undefined },
    })
  }, [])
  const resetData = useCallback(() => {
    clearState()
    setState(structuredClone(defaultState))
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      backendStatus,
      updateSettings,
      toggleTheme,
      addDocument,
      updateDocument,
      deleteDocument,
      createChat,
      deleteChat,
      renameChat,
      addMessage,
      addDraft,
      updateDraft,
      deleteDraft,
      addCase,
      updateCase,
      deleteCase,
      addStrategy,
      updateStrategy,
      deleteStrategy,
      addCitation,
      updateCitation,
      deleteCitation,
      exportData,
      importData,
      resetData,
    }),
    [
      state,
      backendStatus,
      updateSettings,
      toggleTheme,
      addDocument,
      updateDocument,
      deleteDocument,
      createChat,
      deleteChat,
      renameChat,
      addMessage,
      addDraft,
      updateDraft,
      deleteDraft,
      addCase,
      updateCase,
      deleteCase,
      addStrategy,
      updateStrategy,
      deleteStrategy,
      addCitation,
      updateCitation,
      deleteCitation,
      exportData,
      importData,
      resetData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}