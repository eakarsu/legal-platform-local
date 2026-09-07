import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { draftDocument } from '@/lib/ai'

// Sample document templates for fallback
const sampleDocuments: Record<string, string> = {
  motion_dismiss: `SUPERIOR COURT OF THE STATE OF [JURISDICTION]
COUNTY OF [COUNTY]

[CLIENT NAME],
        Defendant,
v.                                                                  Case No.: [CASE NUMBER]

[OPPOSING PARTY],
        Plaintiff.

DEFENDANT'S MOTION TO DISMISS

COMES NOW the Defendant, [CLIENT NAME], by and through undersigned counsel, and hereby moves this Honorable Court to dismiss the Plaintiff's Complaint pursuant to [applicable rules], and in support thereof states as follows:

I. INTRODUCTION

This motion seeks dismissal of Plaintiff's Complaint for failure to state a claim upon which relief can be granted. The Complaint fails to allege sufficient facts to establish the essential elements of the claims asserted.

II. STATEMENT OF FACTS

[Additional context would be inserted here based on the case specifics]

III. LEGAL ARGUMENT

A. Standard of Review
A motion to dismiss tests the legal sufficiency of the complaint. The court must accept all well-pleaded factual allegations as true but is not required to accept legal conclusions.

B. The Complaint Fails to State a Claim
[Detailed legal arguments would follow]

IV. CONCLUSION

For the foregoing reasons, Defendant respectfully requests that this Court grant this Motion to Dismiss and dismiss Plaintiff's Complaint with prejudice.

WHEREFORE, Defendant prays for such other and further relief as this Court deems just and proper.

Respectfully submitted,

_________________________
[Attorney Name]
Attorney for Defendant
[Bar Number]
[Firm Address]
[Phone/Email]

CERTIFICATE OF SERVICE

I hereby certify that on this ___ day of _______, 20__, a true and correct copy of the foregoing was served upon all counsel of record.

_________________________`,

  demand_letter: `[LAW FIRM LETTERHEAD]

[DATE]

VIA CERTIFIED MAIL AND EMAIL

[OPPOSING PARTY NAME]
[ADDRESS]

Re: Demand for Payment - [CLIENT NAME] v. [OPPOSING PARTY]

Dear Sir or Madam:

This firm represents [CLIENT NAME] in connection with the above-referenced matter. We write to demand immediate payment for damages arising from [brief description of claim].

STATEMENT OF FACTS

[Additional context would be inserted here]

DAMAGES

As a direct and proximate result of your actions/inactions, our client has suffered the following damages:

1. [Category of damages]: $[Amount]
2. [Category of damages]: $[Amount]
3. Attorney's fees and costs: To be determined

TOTAL DEMAND: $[Total Amount]

DEMAND

Accordingly, demand is hereby made for payment in the amount of $[Amount] within thirty (30) days of the date of this letter. Payment should be made payable to "[CLIENT NAME]" and sent to the address listed above.

Should you fail to satisfy this demand within the time specified, our client is prepared to pursue all available legal remedies, including but not limited to filing a civil action seeking the full amount of damages, plus interest, attorney's fees, and costs of litigation.

We trust this matter can be resolved without the necessity of litigation. Please contact the undersigned to discuss resolution.

Very truly yours,

_________________________
[Attorney Name]
[Bar Number]

cc: [Client Name]`,

  nda: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of [DATE] ("Effective Date") by and between:

DISCLOSING PARTY: [CLIENT NAME]
Address: [Address]

RECEIVING PARTY: [OPPOSING PARTY]
Address: [Address]

(collectively, the "Parties")

RECITALS

WHEREAS, the Disclosing Party possesses certain confidential and proprietary information; and

WHEREAS, the Receiving Party desires to receive certain confidential information for the purpose of [PURPOSE];

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the Parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION

"Confidential Information" means any and all information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, or by any other means, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure.

2. OBLIGATIONS OF RECEIVING PARTY

The Receiving Party agrees to:
(a) Hold the Confidential Information in strict confidence;
(b) Not disclose the Confidential Information to any third parties;
(c) Use the Confidential Information solely for the Purpose;
(d) Take reasonable measures to protect the confidentiality of the Confidential Information.

3. EXCLUSIONS

Confidential Information does not include information that:
(a) Is or becomes publicly available through no fault of the Receiving Party;
(b) Was rightfully in the Receiving Party's possession prior to disclosure;
(c) Is independently developed by the Receiving Party;
(d) Is rightfully obtained from a third party without restriction.

4. TERM

This Agreement shall remain in effect for a period of [TERM] years from the Effective Date. The obligations of confidentiality shall survive termination.

5. RETURN OF INFORMATION

Upon termination or request, the Receiving Party shall promptly return or destroy all Confidential Information.

6. REMEDIES

The Receiving Party acknowledges that breach of this Agreement may cause irreparable harm and agrees that the Disclosing Party shall be entitled to seek injunctive relief in addition to any other remedies available at law.

7. GOVERNING LAW

This Agreement shall be governed by the laws of the State of [JURISDICTION].

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.

DISCLOSING PARTY:                    RECEIVING PARTY:

_________________________           _________________________
Name:                               Name:
Title:                              Title:
Date:                               Date:`,
}

function generateSampleDocument(documentType: string, params: Record<string, string>): string {
  let template = sampleDocuments[documentType] || sampleDocuments.demand_letter

  // Replace placeholders with actual values
  template = template.replace(/\[CLIENT NAME\]/g, params.clientName || '[CLIENT NAME]')
  template = template.replace(/\[OPPOSING PARTY\]/g, params.opposingParty || '[OPPOSING PARTY]')
  template = template.replace(/\[JURISDICTION\]/g, params.jurisdiction || '[JURISDICTION]')
  template = template.replace(/\[COURT NAME\]/g, params.courtName || '[COURT]')
  template = template.replace(/\[CASE NUMBER\]/g, params.caseNumber || '[CASE NUMBER]')
  template = template.replace(/\[DATE\]/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))

  return template
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentType, jurisdiction, clientName, opposingParty, courtName, caseNumber, additionalContext } = body

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 })
    }

    try {
      const content = await draftDocument({
        documentType,
        jurisdiction,
        clientName,
        opposingParty,
        courtName,
        caseNumber,
        additionalContext,
      })
      return NextResponse.json({ content })
    } catch (aiError) {
      // Return sample document if AI fails
      console.log('AI unavailable, returning sample document')
      const content = generateSampleDocument(documentType, {
        clientName: clientName || '',
        opposingParty: opposingParty || '',
        jurisdiction: jurisdiction || '',
        courtName: courtName || '',
        caseNumber: caseNumber || '',
      })
      return NextResponse.json({ content })
    }
  } catch (error) {
    console.error('Document draft API error:', error)
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 })
  }
}
