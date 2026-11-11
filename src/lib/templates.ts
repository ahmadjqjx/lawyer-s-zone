import type { DraftType } from './types'

export interface TemplateField {
  key: string
  label: string
  placeholder: string
  multiline?: boolean
}

export interface TemplateDef {
  type: DraftType
  label: string
  description: string
  fields: TemplateField[]
  body: string
}

// Genuine court-document skeletons. All case names, citations, sections and dates
// are placeholders to be completed and verified by counsel — nothing is fabricated.
export const TEMPLATES: TemplateDef[] = [
  {
    type: 'Constitutional Petition',
    label: 'Constitutional / Writ Petition',
    description: 'Petition under Article 199 of the Constitution before the High Court.',
    fields: [
      { key: 'court', label: 'Court', placeholder: 'Lahore High Court, Lahore' },
      { key: 'petitioner', label: 'Petitioner', placeholder: '[Name, son/daughter of, resident of]' },
      { key: 'respondent', label: 'Respondents', placeholder: '[List respondents with official capacity]' },
      { key: 'subject', label: 'Subject / grievance', placeholder: '[Brief nature of the grievance]' },
      { key: 'provision', label: 'Impugned action / provision', placeholder: '[Order, notification or action dated …]' },
      { key: 'grounds', label: 'Grounds', placeholder: '[Ground A … Ground B …]', multiline: true },
      { key: 'prayer', label: 'Prayer', placeholder: '[Relief sought]', multiline: true },
    ],
    body: `IN THE {{court}}

Constitutional Petition No. ________ of {{year}}

{{petitioner}} .................................................... Petitioner

VERSUS

{{respondent}} ................................................ Respondents

PETITION UNDER ARTICLE 199 OF THE CONSTITUTION OF THE ISLAMIC REPUBLIC OF PAKISTAN, 1973

Respectfully Sheweth:

1. That the petitioner is aggrieved by {{provision}} and approaches this Honourable Court on the following grounds, among others:

GROUNDS

{{grounds}}

2. That the petitioner has no other adequate, efficacious or alternate remedy provided by law.

3. That the impugned action is without lawful authority, jurisdiction and of no legal effect.

PRAYER

{{prayer}}

Any other relief which this Honourable Court deems just and appropriate may also be granted.

Petitioner
Through Counsel: [Advocate name, enrolment no., address]

Place: ____________
Date: ____________

VERIFICATION
Verified on oath at ____ on this ____ day of ____ that the contents of the above petition are true and correct to the best of the petitioner's knowledge and belief and nothing material has been concealed.

DEPONENT

INDEX OF ANNEXURES
Annexure A — [description]
Annexure B — [description]

NOTE: Complete every placeholder, verify each cited provision and authority against primary sources, and confirm the competent bench, limitation and court rules before filing.`,
  },
  {
    type: 'Civil Suit',
    label: 'Civil Suit (Plaint)',
    description: 'Plaint under Order VII, Code of Civil Procedure 1908.',
    fields: [
      { key: 'court', label: 'Court', placeholder: 'Court of the Senior Civil Judge, [City]' },
      { key: 'plaintiff', label: 'Plaintiff', placeholder: '[Name, parentage, residence]' },
      { key: 'defendant', label: 'Defendant', placeholder: '[Name, parentage, residence]' },
      { key: 'nature', label: 'Nature of suit', placeholder: '[e.g., suit for recovery / declaration / specific performance]' },
      { key: 'facts', label: 'Material facts', placeholder: '[Chronological facts]', multiline: true },
      { key: 'cause', label: 'Cause of action', placeholder: '[When and where it accrued]' },
      { key: 'jurisdiction', label: 'Jurisdiction & valuation', placeholder: '[Territorial/pecuniary jurisdiction; court fee]' },
      { key: 'prayer', label: 'Prayer', placeholder: '[Relief sought]', multiline: true },
    ],
    body: `IN THE COURT OF {{court}}

Civil Suit No. ________ of {{year}}

{{plaintiff}} .................................................... Plaintiff

VERSUS

{{defendant}} ................................................ Defendant

SUIT FOR {{nature}}

Respectfully Sheweth:

1. That the parties are described as above and are within the jurisdiction of this Honourable Court.

2. FACTS
{{facts}}

3. That the cause of action accrued in favour of the plaintiff and against the defendant on {{cause}}.

4. That this Honourable Court has territorial and pecuniary jurisdiction to try this suit. {{jurisdiction}}

5. That the requisite court fee is affixed / payable as per law.

6. That the suit is within limitation.

PRAYER
{{prayer}}

Costs of the suit may also be awarded.

Plaintiff
Through Counsel: [Advocate name]

Place: ____________
Date: ____________

VERIFICATION
Verified at ____ on ____ that the contents of paragraphs 1–__ are true to the plaintiff's knowledge and paragraphs __–__ are believed to be true on information received; nothing material has been concealed.

DEPONENT`,
  },
  {
    type: 'Written Statement',
    label: 'Written Statement (Defence)',
    description: "Defendant's reply under Order VIII, CPC 1908.",
    fields: [
      { key: 'court', label: 'Court', placeholder: 'Court of the Senior Civil Judge, [City]' },
      { key: 'plaintiff', label: 'Plaintiff', placeholder: '[Name]' },
      { key: 'defendant', label: 'Defendant', placeholder: '[Name]' },
      { key: 'objections', label: 'Preliminary objections', placeholder: '[Maintainability, jurisdiction, limitation, locus standi …]', multiline: true },
      { key: 'reply', label: 'Paragraph-wise reply on merits', placeholder: '[Para 1: denied … Para 2: admitted …]', multiline: true },
      { key: 'defence', label: 'Additional defence', placeholder: '[Specific defence and facts]', multiline: true },
      { key: 'prayer', label: 'Prayer', placeholder: '[Dismissal of suit with costs]', multiline: true },
    ],
    body: `IN THE COURT OF {{court}}

Civil Suit No. ________ of {{year}}

{{plaintiff}} .................................................... Plaintiff
VERSUS
{{defendant}} ................................................ Defendant

WRITTEN STATEMENT ON BEHALF OF THE DEFENDANT

PRELIMINARY OBJECTIONS
{{objections}}

REPLY ON MERITS
{{reply}}

ADDITIONAL DEFENCE
{{defence}}

PRAYER
{{prayer}}

Defendant
Through Counsel: [Advocate name]

Place: ____________
Date: ____________

VERIFICATION
Verified at ____ on ____ that the contents of this written statement are true and correct to the best of the defendant's knowledge and belief.

DEPONENT`,
  },
  {
    type: 'Bail Application',
    label: 'Bail Application',
    description: 'Post-arrest bail under Section 497 Cr.P.C. (adapt forum/provision as applicable).',
    fields: [
      { key: 'court', label: 'Court', placeholder: 'Court of the Sessions Judge, [City]' },
      { key: 'applicant', label: 'Applicant / accused', placeholder: '[Name, parentage]' },
      { key: 'fir', label: 'FIR details', placeholder: 'FIR No. __, dated __, PS __, offences u/s __' },
      { key: 'grounds', label: 'Grounds for bail', placeholder: '[Further inquiry, no recovery, mala fide, delay …]', multiline: true },
      { key: 'prayer', label: 'Prayer', placeholder: '[Grant of post-arrest bail]', multiline: true },
    ],
    body: `IN THE COURT OF {{court}}

Criminal Misc. Application No. ________ of {{year}}

{{applicant}} .................................................... Applicant / Accused

VERSUS

The State .................................................... Respondent

APPLICATION FOR GRANT OF POST-ARREST BAIL
FIR: {{fir}}

Respectfully Sheweth:

1. That the applicant is innocent and has been falsely implicated.

2. GROUNDS
{{grounds}}

3. That the applicant is ready to furnish solvent surety bonds to the satisfaction of this Honourable Court and undertakes to attend proceedings.

4. That no incriminating recovery is to be effected from the applicant and custodial interrogation is not required.

PRAYER
{{prayer}}

Applicant
Through Counsel: [Advocate name]

Place: ____________
Date: ____________

NOTE: Confirm the correct provision (pre-arrest s.498 / post-arrest s.497 Cr.P.C.), forum, and current case law before filing. Verify all citations.`,
  },
  {
    type: 'Appeal',
    label: 'Appeal',
    description: 'Memorandum of appeal (civil or criminal — adapt provision/forum).',
    fields: [
      { key: 'court', label: 'Appellate court', placeholder: '[Appellate forum]' },
      { key: 'appellant', label: 'Appellant', placeholder: '[Name]' },
      { key: 'respondent', label: 'Respondent', placeholder: '[Name]' },
      { key: 'impugned', label: 'Impugned judgment/order', placeholder: '[Judgment/order dated __ passed by __ in __]' },
      { key: 'grounds', label: 'Grounds of appeal', placeholder: '[Ground A … Ground B …]', multiline: true },
      { key: 'limitation', label: 'Limitation', placeholder: '[Date of knowledge; days; condonation if any]' },
      { key: 'prayer', label: 'Prayer', placeholder: '[Set aside / modify impugned judgment]', multiline: true },
    ],
    body: `IN THE {{court}}

Appeal No. ________ of {{year}}

{{appellant}} .................................................... Appellant
VERSUS
{{respondent}} ................................................ Respondent

APPEAL AGAINST {{impugned}}

Respectfully Sheweth:

1. That the appellant is aggrieved by the impugned judgment/order and prefers this appeal on the following grounds:

GROUNDS OF APPEAL
{{grounds}}

2. LIMITATION
{{limitation}}

3. That the impugned judgment/order is contrary to law, evidence and the settled principles of justice.

PRAYER
{{prayer}}

Appellant
Through Counsel: [Advocate name]

Place: ____________
Date: ____________

NOTE: Identify the exact enabling provision and limitation period; do not assume. Verify before filing.`,
  },
  {
    type: 'Revision Petition',
    label: 'Revision Petition',
    description: 'Revisional jurisdiction (civil s.115 CPC / criminal ss.435–439 Cr.P.C. as applicable).',
    fields: [
      { key: 'court', label: 'Court', placeholder: '[High Court / Sessions Court]' },
      { key: 'petitioner', label: 'Petitioner', placeholder: '[Name]' },
      { key: 'respondent', label: 'Respondent', placeholder: '[Name]' },
      { key: 'impugned', label: 'Impugned order', placeholder: '[Order dated __ of __]' },
      { key: 'grounds', label: 'Grounds (jurisdictional error / material irregularity)', placeholder: '[Grounds]', multiline: true },
      { key: 'prayer', label: 'Prayer', placeholder: '[Set aside impugned order]', multiline: true },
    ],
    body: `IN THE {{court}}

Revision Petition No. ________ of {{year}}

{{petitioner}} .................................................... Petitioner
VERSUS
{{respondent}} ................................................ Respondent

REVISION AGAINST {{impugned}}

Respectfully Sheweth:

1. That the subordinate court has exercised jurisdiction not vested in it / failed to exercise jurisdiction vested in it / acted with material irregularity.

GROUNDS
{{grounds}}

2. That no appeal lies against the impugned order and this revision is maintainable.

PRAYER
{{prayer}}

Petitioner
Through Counsel: [Advocate name]

Place: ____________
Date: ____________`,
  },
  {
    type: 'Legal Notice',
    label: 'Legal Notice',
    description: 'Formal demand notice before litigation.',
    fields: [
      { key: 'sender', label: 'Sender / client', placeholder: '[Name, address]' },
      { key: 'recipient', label: 'Recipient', placeholder: '[Name, address]' },
      { key: 'relationship', label: 'Relationship / background', placeholder: '[Contractual or statutory relationship]' },
      { key: 'facts', label: 'Chronology of facts', placeholder: '[Material facts with dates]', multiline: true },
      { key: 'violation', label: 'Legal violations', placeholder: '[Provisions breached — verify]', multiline: true },
      { key: 'demand', label: 'Specific demands', placeholder: '[What the recipient must do]', multiline: true },
      { key: 'deadline', label: 'Compliance deadline', placeholder: '[e.g., 14 days from receipt]' },
      { key: 'consequence', label: 'Consequences of non-compliance', placeholder: '[Legal proceedings at recipient\'s risk]' },
    ],
    body: `LEGAL NOTICE

From: {{sender}}
Through Counsel: [Advocate name, address, contact]

To: {{recipient}}

Date: ____________

Subject: LEGAL NOTICE FOR {{demand}}

Under instructions from and on behalf of my client, {{sender}}, I hereby serve upon you the following legal notice:

1. BACKGROUND
{{relationship}}

2. FACTS
{{facts}}

3. LEGAL VIOLATIONS
{{violation}}

4. DEMAND
You are called upon to: {{demand}}

5. DEADLINE
Within {{deadline}} of receipt of this notice.

6. CONSEQUENCES
Failing compliance, my client shall be constrained to initiate appropriate legal proceedings, {{consequence}}, entirely at your risk, cost and consequence.

A copy of this notice is retained in my office for record and further necessary action.

[Advocate name]
Counsel for {{sender}}

NOTE: This notice is without prejudice to my client's rights and remedies, all of which are expressly reserved.`,
  },
  {
    type: 'Contract',
    label: 'Contract / Agreement',
    description: 'General agreement skeleton (adapt to the specific transaction).',
    fields: [
      { key: 'title', label: 'Agreement title', placeholder: '[e.g., Service Agreement]' },
      { key: 'date', label: 'Effective date', placeholder: '[Date]' },
      { key: 'partyA', label: 'First party', placeholder: '[Name, parentage/registration, address]' },
      { key: 'partyB', label: 'Second party', placeholder: '[Name, parentage/registration, address]' },
      { key: 'recitals', label: 'Recitals / background', placeholder: '[WHEREAS clauses]', multiline: true },
      { key: 'terms', label: 'Operative terms', placeholder: '[Scope, consideration, obligations, term …]', multiline: true },
      { key: 'dispute', label: 'Dispute resolution & governing law', placeholder: '[Arbitration/courts; governing law of Pakistan]' },
    ],
    body: `{{title}}

This {{title}} ("Agreement") is made and entered into on {{date}} by and between:

{{partyA}} ("First Party"); and
{{partyB}} ("Second Party").

The First Party and the Second Party are individually referred to as a "Party" and collectively as the "Parties".

RECITALS
{{recitals}}

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the Parties agree as follows:

TERMS AND CONDITIONS
{{terms}}

DISPUTE RESOLUTION & GOVERNING LAW
{{dispute}}

GENERAL
- Entire Agreement: this Agreement constitutes the entire understanding between the Parties.
- Amendment: no amendment is effective unless in writing and signed by both Parties.
- Severability: if any provision is held invalid, the remainder shall continue in force.
- Notices: all notices shall be in writing to the addresses above.

IN WITNESS WHEREOF, the Parties have executed this Agreement on the date first written above.

____________________            ____________________
First Party                     Second Party

Witness 1: ____________         Witness 2: ____________`,
  },
  {
    type: 'Application',
    label: 'Application / Misc. Petition',
    description: 'General interlocutory or miscellaneous application.',
    fields: [
      { key: 'court', label: 'Court / authority', placeholder: '[Forum]' },
      { key: 'applicant', label: 'Applicant', placeholder: '[Name]' },
      { key: 'respondent', label: 'Respondent', placeholder: '[Name / State]' },
      { key: 'matter', label: 'Main case / matter', placeholder: '[Title & no. of the main proceedings]' },
      { key: 'relief', label: 'Relief applied for', placeholder: '[e.g., interim injunction / exemption / impleading]' },
      { key: 'grounds', label: 'Grounds', placeholder: '[Grounds with factual & legal basis]', multiline: true },
      { key: 'prayer', label: 'Prayer', placeholder: '[Specific order sought]', multiline: true },
    ],
    body: `IN THE {{court}}

Misc. Application No. ________ of {{year}}
In: {{matter}}

{{applicant}} .................................................... Applicant
VERSUS
{{respondent}} ................................................ Respondent

APPLICATION FOR {{relief}}

Respectfully Sheweth:

1. That the applicant is a party to the above-titled matter and is entitled to the relief sought.

GROUNDS
{{grounds}}

2. That the application is bona fide and in the interest of justice.

PRAYER
{{prayer}}

Applicant
Through Counsel: [Advocate name]

Place: ____________
Date: ____________

AFFIDAVIT
An affidavit in support of this application is annexed.`,
  },
  {
    type: 'Affidavit',
    label: 'Affidavit',
    description: 'Sworn statement of facts (Oaths / court rules as applicable).',
    fields: [
      { key: 'deponent', label: 'Deponent', placeholder: '[Name, son/daughter of, resident of, CNIC]' },
      { key: 'matter', label: 'Matter / proceeding', placeholder: '[Title of the case]' },
      { key: 'statements', label: 'Sworn statements (numbered)', placeholder: '1. That …\n2. That …', multiline: true },
      { key: 'place', label: 'Place', placeholder: '[City]' },
    ],
    body: `IN THE MATTER OF: {{matter}}

AFFIDAVIT

I, {{deponent}}, do hereby solemnly affirm and declare on oath as under:

{{statements}}

Whatever is stated above is true and correct to the best of my knowledge and belief and nothing material has been concealed therefrom.

DEPONENT

Identified by: [Advocate name]

Solemnly affirmed at {{place}} on this ____ day of ____________ before me.

[Oath Commissioner / Notary / Magistrate]

NOTE: Contents must be confined to facts within the deponent's knowledge; legal arguments should not be sworn as facts.`,
  },
]

export function getTemplate(type: DraftType): TemplateDef {
  return TEMPLATES.find((t) => t.type === type) ?? TEMPLATES[0]
}

export function renderTemplate(body: string, values: Record<string, string>): string {
  const withYear: Record<string, string> = { year: String(new Date().getFullYear()), ...values }
  return body.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => {
    const v = withYear[key]
    return v && v.trim() ? v : `[${key.toUpperCase()}]`
  })
}