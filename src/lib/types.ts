// Shared domain types for Lawyers Zone.

export type Theme = 'dark' | 'light'

export type VerificationStatus =
  | 'VERIFIED'
  | 'PERSUASIVE'
  | 'UNVERIFIED'
  | 'CONTESTED'
  | 'INFERENCE'
  | 'RESEARCH GAP'

export type DocumentCategory =
  | 'Judgment'
  | 'Act / Ordinance'
  | 'Rules / Regulations'
  | 'Legal Notice'
  | 'Court Document'
  | 'Contract'
  | 'Other'

export type DocumentKind = 'pdf' | 'docx' | 'txt' | 'manual'

export interface DocumentItem {
  id: string
  title: string
  category: DocumentCategory
  kind: DocumentKind
  fileName: string
  size: number
  /** Extracted/plain text. PDF & DOCX text extraction arrives in Phase 4. */
  content: string
  tags: string[]
  notes: string
  /** True when the file is stored as metadata only, awaiting backend extraction. */
  pendingProcessing: boolean
  createdAt: number
}

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: number
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export type DraftType =
  | 'Constitutional Petition'
  | 'Civil Suit'
  | 'Written Statement'
  | 'Bail Application'
  | 'Appeal'
  | 'Revision Petition'
  | 'Legal Notice'
  | 'Contract'
  | 'Application'
  | 'Affidavit'

export interface Draft {
  id: string
  title: string
  type: DraftType
  content: string
  createdAt: number
  updatedAt: number
}

export interface CaseAnalysis {
  id: string
  caseTitle: string
  citation: string
  court: string
  date: string
  facts: string
  issues: string
  ratio: string
  obiter: string
  holding: string
  paragraphs: string
  application: string
  status: VerificationStatus
  createdAt: number
}

export interface StrategyItem {
  id: string
  matter: string
  forum: string
  petitionerPosition: string
  respondentPosition: string
  grounds: string
  objections: string
  proceduralDefects: string
  adversePrecedents: string
  remedies: string
  assessment: string
  createdAt: number
}

export type CitationType = 'Judicial' | 'Statutory' | 'Constitutional'

export interface CitationItem {
  id: string
  citation: string
  type: CitationType
  proposition: string
  status: VerificationStatus
  source: string
  court: string
  notes: string
  createdAt: number
}

export interface Settings {
  theme: Theme
  defaultJurisdiction: string
  province: string
  competentCourt: string
  aiProviderBaseUrl: string
  aiModel: string
  /** Never persisted to the browser; sent to backend in Phase 3. */
  aiApiKey?: string
}

export interface AppState {
  documents: DocumentItem[]
  chats: ChatSession[]
  drafts: Draft[]
  cases: CaseAnalysis[]
  strategies: StrategyItem[]
  citations: CitationItem[]
  settings: Settings
}