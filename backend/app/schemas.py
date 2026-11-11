from typing import List, Literal, Optional

from pydantic import BaseModel, Field

VerificationStatus = Literal[
    "VERIFIED", "PERSUASIVE", "UNVERIFIED", "CONTESTED", "INFERENCE", "RESEARCH GAP"
]
DocumentKind = Literal["pdf", "docx", "txt", "manual"]
DraftType = Literal[
    "Constitutional Petition",
    "Civil Suit",
    "Written Statement",
    "Bail Application",
    "Appeal",
    "Revision Petition",
    "Legal Notice",
    "Contract",
    "Application",
    "Affidavit",
]
CitationType = Literal["Judicial", "Statutory", "Constitutional"]
ChatRole = Literal["user", "assistant", "system"]
Theme = Literal["dark", "light"]


class DocumentItem(BaseModel):
    id: Optional[str] = None
    title: str
    category: str = "Other"
    kind: DocumentKind = "manual"
    fileName: str = ""
    size: int = 0
    content: str = ""
    tags: List[str] = Field(default_factory=list)
    notes: str = ""
    pendingProcessing: bool = False
    createdAt: Optional[int] = None


class ChatMessage(BaseModel):
    id: Optional[str] = None
    role: ChatRole = "user"
    content: str
    createdAt: Optional[int] = None


class ChatSession(BaseModel):
    id: Optional[str] = None
    title: str = "New legal query"
    messages: List[ChatMessage] = Field(default_factory=list)
    createdAt: Optional[int] = None
    updatedAt: Optional[int] = None


class Draft(BaseModel):
    id: Optional[str] = None
    title: str
    type: DraftType = "Application"
    content: str = ""
    createdAt: Optional[int] = None
    updatedAt: Optional[int] = None


class CaseAnalysis(BaseModel):
    id: Optional[str] = None
    caseTitle: str = ""
    citation: str = ""
    court: str = ""
    date: str = ""
    facts: str = ""
    issues: str = ""
    ratio: str = ""
    obiter: str = ""
    holding: str = ""
    paragraphs: str = ""
    application: str = ""
    status: VerificationStatus = "UNVERIFIED"
    createdAt: Optional[int] = None


class StrategyItem(BaseModel):
    id: Optional[str] = None
    matter: str
    forum: str = ""
    petitionerPosition: str = ""
    respondentPosition: str = ""
    grounds: str = ""
    objections: str = ""
    proceduralDefects: str = ""
    adversePrecedents: str = ""
    remedies: str = ""
    assessment: str = ""
    createdAt: Optional[int] = None


class CitationItem(BaseModel):
    id: Optional[str] = None
    citation: str
    type: CitationType = "Judicial"
    proposition: str = ""
    status: VerificationStatus = "UNVERIFIED"
    source: str = ""
    court: str = ""
    notes: str = ""
    createdAt: Optional[int] = None


class Settings(BaseModel):
    theme: Theme = "dark"
    defaultJurisdiction: str = "Pakistan"
    province: str = "Punjab"
    competentCourt: str = ""
    aiProviderBaseUrl: str = ""
    aiModel: str = ""


class AppState(BaseModel):
    documents: List[DocumentItem] = Field(default_factory=list)
    chats: List[ChatSession] = Field(default_factory=list)
    drafts: List[Draft] = Field(default_factory=list)
    cases: List[CaseAnalysis] = Field(default_factory=list)
    strategies: List[StrategyItem] = Field(default_factory=list)
    citations: List[CitationItem] = Field(default_factory=list)
    settings: Settings = Field(default_factory=Settings)