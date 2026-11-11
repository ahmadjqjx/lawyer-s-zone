import type { AppState, Settings } from './types'

const STORAGE_KEY = 'lawyers-zone.state.v1'

export const defaultSettings: Settings = {
  theme: 'dark',
  defaultJurisdiction: 'Pakistan',
  province: 'Punjab',
  competentCourt: '',
  aiProviderBaseUrl: '',
  aiModel: '',
}

export const defaultState: AppState = {
  documents: [],
  chats: [],
  drafts: [],
  cases: [],
  strategies: [],
  citations: [],
  settings: defaultSettings,
}

export const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
]

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(defaultState)
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      ...structuredClone(defaultState),
      ...parsed,
      settings: { ...defaultSettings, ...(parsed.settings ?? {}), aiApiKey: undefined },
    }
  } catch {
    return structuredClone(defaultState)
  }
}

export function saveState(state: AppState) {
  try {
    // Never persist secrets to the browser.
    const { aiApiKey: _omit, ...safeSettings } = state.settings
    void _omit
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, settings: safeSettings }))
  } catch (err) {
    // Storage may be full (large documents). Surface a console warning; UI still works in-memory.
    console.warn('[Lawyers Zone] Could not persist local data:', err)
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY)
}