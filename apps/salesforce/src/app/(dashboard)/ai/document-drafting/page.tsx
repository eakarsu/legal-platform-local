"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  RefreshCw,
  Wand2,
  CheckCircle,
  Database,
  Printer
} from "lucide-react"

// Sample documents with pre-filled content for each document type
const sampleDocuments = {
  motion_dismiss: {
    formData: {
      documentType: "motion_dismiss",
      jurisdiction: "State of California - Superior Court of Los Angeles County",
      clientName: "ABC Manufacturing Corp.",
      opposingParty: "XYZ Distribution Inc.",
      courtName: "Superior Court of California, County of Los Angeles",
      caseNumber: "BC-2024-123456",
      additionalContext: "Defendant moves to dismiss plaintiff's complaint for failure to state a claim. The complaint alleges breach of contract for non-delivery of goods, but fails to attach or reference the underlying contract, does not specify the terms allegedly breached, and does not plead damages with sufficient particularity. Additionally, the statute of limitations has expired as the alleged breach occurred over 5 years ago.",
    },
    sampleContent: `SUPERIOR COURT OF CALIFORNIA
COUNTY OF LOS ANGELES

ABC MANUFACTURING CORP.,          )    Case No.: BC-2024-123456
                                  )
          Defendant,              )    DEFENDANT'S MOTION TO DISMISS
                                  )    PLAINTIFF'S COMPLAINT
     vs.                          )
                                  )    Date: [DATE]
XYZ DISTRIBUTION INC.,            )    Time: 9:00 a.m.
                                  )    Dept: 45
          Plaintiff.              )
__________________________________)

TO THE COURT AND ALL PARTIES OF RECORD:

PLEASE TAKE NOTICE that Defendant ABC Manufacturing Corp. ("Defendant") hereby moves this Court for an order dismissing Plaintiff XYZ Distribution Inc.'s ("Plaintiff") Complaint pursuant to California Code of Civil Procedure § 430.10.

MEMORANDUM OF POINTS AND AUTHORITIES

I. INTRODUCTION

Plaintiff's Complaint fails to state facts sufficient to constitute a cause of action against Defendant and should be dismissed with prejudice.

II. STATEMENT OF FACTS

Plaintiff filed its Complaint on [DATE], alleging breach of contract for non-delivery of goods. However, Plaintiff's Complaint suffers from fatal deficiencies that warrant dismissal.

III. ARGUMENT

A. Plaintiff Fails to State a Cause of Action for Breach of Contract

To state a claim for breach of contract under California law, a plaintiff must allege: (1) the existence of a contract; (2) plaintiff's performance or excuse for nonperformance; (3) defendant's breach; and (4) resulting damages to plaintiff. Oasis West Realty, LLC v. Goldman, 51 Cal. 4th 811, 821 (2011).

Plaintiff's Complaint fails to satisfy these requirements because:

1. No Contract Attached or Referenced: Plaintiff fails to attach or adequately reference the alleged contract, making it impossible to determine the terms allegedly breached.

2. No Specific Terms Identified: Plaintiff does not identify which contractual provisions were allegedly breached by Defendant.

3. Insufficient Damages Pleading: Plaintiff fails to plead damages with the particularity required under California law.

B. The Statute of Limitations Has Expired

Furthermore, Plaintiff's claim is time-barred. Under California Code of Civil Procedure § 337, the statute of limitations for written contracts is four years. The alleged breach occurred over five years ago, and Plaintiff's claim is therefore barred.

IV. CONCLUSION

For the foregoing reasons, Defendant respectfully requests that this Court grant this Motion and dismiss Plaintiff's Complaint with prejudice.

DATED: [DATE]

                                        Respectfully submitted,

                                        _______________________________
                                        [Attorney Name]
                                        Attorney for Defendant
                                        ABC Manufacturing Corp.`
  },
  demand_letter: {
    formData: {
      documentType: "demand_letter",
      jurisdiction: "State of New York",
      clientName: "Johnson & Associates LLC",
      opposingParty: "Premier Services Group",
      courtName: "",
      caseNumber: "",
      additionalContext: "Client hired opposing party for IT consulting services. Contract value was $85,000. Opposing party delivered substandard work, missed multiple deadlines, and abandoned the project at 40% completion. Client seeks full refund of $34,000 already paid, plus $15,000 in remediation costs to hire replacement contractor. Demand payment within 30 days or litigation will commence.",
    },
    sampleContent: `[LAW FIRM LETTERHEAD]

[DATE]

VIA CERTIFIED MAIL AND EMAIL
Premier Services Group
[Address]
[City, State ZIP]

Re: Demand for Payment - Johnson & Associates LLC
    Breach of IT Consulting Services Agreement

Dear Sir or Madam:

This firm represents Johnson & Associates LLC ("our Client") regarding the IT consulting services agreement entered into with Premier Services Group ("your Company") on or about [DATE] (the "Agreement").

STATEMENT OF FACTS

Our Client engaged your Company to provide IT consulting services for a total contract value of $85,000.00. To date, our Client has paid $34,000.00 toward this contract.

Your Company's performance under the Agreement has been wholly inadequate:

• Substandard Work: The work product delivered failed to meet the specifications outlined in the Agreement and industry standards.

• Missed Deadlines: Your Company repeatedly failed to meet agreed-upon project milestones, causing significant delays to our Client's operations.

• Project Abandonment: Your Company abandoned the project at approximately 40% completion, leaving our Client without the contracted services and unable to utilize the partial work delivered.

DAMAGES

As a direct result of your Company's breach, our Client has suffered the following damages:

    Payments Made Under Agreement:           $34,000.00
    Remediation Costs (Replacement Contractor): $15,000.00
    ________________________________________________
    TOTAL DAMAGES:                           $49,000.00

DEMAND

On behalf of our Client, we hereby demand that Premier Services Group pay the sum of FORTY-NINE THOUSAND DOLLARS ($49,000.00) within thirty (30) days of the date of this letter.

CONSEQUENCES OF NON-PAYMENT

Should your Company fail to satisfy this demand within the specified timeframe, our Client is prepared to pursue all available legal remedies, including but not limited to:

1. Filing a civil lawsuit in the appropriate New York court;
2. Seeking recovery of all damages, including consequential damages;
3. Recovery of attorneys' fees and costs of litigation; and
4. Any other relief deemed appropriate by the Court.

We strongly encourage your Company to resolve this matter promptly to avoid the additional expense and burden of litigation.

Please direct all communications regarding this matter to our office.

                                        Very truly yours,

                                        _______________________________
                                        [Attorney Name]
                                        Counsel for Johnson & Associates LLC

cc: Johnson & Associates LLC`
  },
  nda: {
    formData: {
      documentType: "nda",
      jurisdiction: "State of Delaware",
      clientName: "TechStart Innovations Inc.",
      opposingParty: "Strategic Partners Capital",
      courtName: "",
      caseNumber: "",
      additionalContext: "Mutual NDA for potential acquisition discussions. Both parties will share confidential financial information, customer data, trade secrets, and proprietary technology. Duration should be 3 years. Include non-solicitation of employees. Carve-outs needed for information already in public domain or independently developed.",
    },
    sampleContent: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of [DATE] (the "Effective Date"), by and between:

TechStart Innovations Inc., a Delaware corporation ("TechStart")
and
Strategic Partners Capital, a Delaware limited partnership ("Strategic Partners")

(each a "Party" and collectively, the "Parties")

RECITALS

WHEREAS, the Parties wish to explore a potential business transaction, including but not limited to a potential acquisition (the "Purpose"); and

WHEREAS, in connection with the Purpose, each Party may disclose to the other certain confidential and proprietary information;

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the Parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION

"Confidential Information" means any and all non-public information, whether written, oral, electronic, visual, or in any other form, disclosed by either Party to the other, including but not limited to:

(a) Financial information, including revenue, projections, and financial statements;
(b) Customer data and customer lists;
(c) Trade secrets and proprietary technology;
(d) Business plans, strategies, and operations;
(e) Product designs, specifications, and roadmaps; and
(f) Any other information marked or identified as confidential.

2. EXCLUSIONS

Confidential Information does not include information that:

(a) Is or becomes publicly available through no fault of the receiving Party;
(b) Was rightfully in the receiving Party's possession prior to disclosure;
(c) Is independently developed by the receiving Party without use of Confidential Information; or
(d) Is rightfully obtained from a third party without restriction on disclosure.

3. OBLIGATIONS

Each Party agrees to:

(a) Hold the other Party's Confidential Information in strict confidence;
(b) Use Confidential Information solely for the Purpose;
(c) Limit disclosure to employees and advisors with a need to know;
(d) Not disclose Confidential Information to any third party without prior written consent;
(e) Protect Confidential Information using the same degree of care used to protect its own confidential information, but no less than reasonable care.

4. NON-SOLICITATION

During the term of this Agreement and for a period of two (2) years thereafter, neither Party shall, directly or indirectly, solicit, recruit, or hire any employee of the other Party with whom it came into contact in connection with the Purpose.

5. TERM

This Agreement shall remain in effect for three (3) years from the Effective Date. The obligations of confidentiality shall survive termination for an additional period of three (3) years.

6. RETURN OF INFORMATION

Upon termination or upon request, each Party shall promptly return or destroy all Confidential Information received from the other Party.

7. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.

8. MISCELLANEOUS

(a) This Agreement constitutes the entire agreement between the Parties regarding the subject matter hereof.
(b) This Agreement may only be amended in writing signed by both Parties.
(c) Neither Party may assign this Agreement without the prior written consent of the other Party.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.

TECHSTART INNOVATIONS INC.          STRATEGIC PARTNERS CAPITAL

By: _________________________       By: _________________________

Name: _______________________       Name: _______________________

Title: ______________________       Title: ______________________

Date: _______________________       Date: _______________________`
  },
  complaint: {
    formData: {
      documentType: "complaint",
      jurisdiction: "United States District Court - Southern District of New York",
      clientName: "Global Tech Solutions Inc.",
      opposingParty: "DataSecure Systems LLC",
      courtName: "United States District Court, Southern District of New York",
      caseNumber: "",
      additionalContext: "Patent infringement case. Defendant is using our client's patented cloud security technology (U.S. Patent No. 10,XXX,XXX) without authorization. Defendant's product 'SecureCloud Pro' directly infringes Claims 1-5 of the patent. Seeking injunctive relief and damages.",
    },
    sampleContent: `UNITED STATES DISTRICT COURT
SOUTHERN DISTRICT OF NEW YORK

GLOBAL TECH SOLUTIONS INC.,        )
                                   )    Civil Action No. __________
          Plaintiff,               )
                                   )    COMPLAINT FOR PATENT
     v.                            )    INFRINGEMENT
                                   )
DATASECURE SYSTEMS LLC,            )    JURY TRIAL DEMANDED
                                   )
          Defendant.               )
___________________________________)

Plaintiff Global Tech Solutions Inc. ("Plaintiff" or "Global Tech"), by and through its undersigned attorneys, brings this Complaint against Defendant DataSecure Systems LLC ("Defendant" or "DataSecure") and alleges as follows:

NATURE OF THE ACTION

1. This is an action for patent infringement arising under the Patent Laws of the United States, 35 U.S.C. § 1 et seq.

2. Plaintiff seeks injunctive relief, damages, and other relief for Defendant's infringement of United States Patent No. 10,XXX,XXX (the "'XXX Patent").

THE PARTIES

3. Plaintiff Global Tech Solutions Inc. is a corporation organized and existing under the laws of the State of Delaware, with its principal place of business at [Address].

4. Defendant DataSecure Systems LLC is a limited liability company organized under the laws of the State of California, with its principal place of business at [Address].

JURISDICTION AND VENUE

5. This Court has subject matter jurisdiction pursuant to 28 U.S.C. §§ 1331 and 1338(a).

6. Venue is proper in this District pursuant to 28 U.S.C. §§ 1391(b) and (c) and 1400(b).

THE PATENT-IN-SUIT

7. On [DATE], the United States Patent and Trademark Office duly and legally issued U.S. Patent No. 10,XXX,XXX, entitled "[Patent Title]" (the "'XXX Patent"), to Global Tech Solutions Inc. A true and correct copy of the 'XXX Patent is attached hereto as Exhibit A.

8. Global Tech is the owner by assignment of all right, title, and interest in and to the 'XXX Patent.

DEFENDANT'S INFRINGING CONDUCT

9. Upon information and belief, Defendant manufactures, uses, sells, offers to sell, and/or imports products and services that infringe one or more claims of the 'XXX Patent.

10. Specifically, Defendant's "SecureCloud Pro" product directly infringes at least Claims 1-5 of the 'XXX Patent.

COUNT I - PATENT INFRINGEMENT

11. Plaintiff incorporates by reference the allegations in paragraphs 1-10 above.

12. Defendant has infringed and continues to infringe the 'XXX Patent by making, using, selling, offering to sell, and/or importing products covered by one or more claims of the 'XXX Patent.

13. Plaintiff has been damaged by Defendant's infringement and is entitled to recover damages adequate to compensate for such infringement.

PRAYER FOR RELIEF

WHEREFORE, Plaintiff respectfully requests that this Court:

A. Enter judgment that Defendant has infringed the 'XXX Patent;
B. Enter a permanent injunction enjoining Defendant from further infringement;
C. Award Plaintiff damages adequate to compensate for infringement;
D. Declare this case exceptional and award Plaintiff its attorneys' fees;
E. Award Plaintiff costs and expenses; and
F. Grant such other relief as the Court deems just and proper.

DEMAND FOR JURY TRIAL

Plaintiff demands a trial by jury on all issues so triable.

DATED: [DATE]

                                        Respectfully submitted,

                                        _______________________________
                                        [Attorney Name]
                                        [Law Firm]
                                        Attorneys for Plaintiff
                                        Global Tech Solutions Inc.`
  },
  settlement_agreement: {
    formData: {
      documentType: "settlement_agreement",
      jurisdiction: "State of Texas",
      clientName: "Martinez Construction Co.",
      opposingParty: "Riverdale Development Corp.",
      courtName: "District Court of Harris County, Texas",
      caseNumber: "2024-CV-45678",
      additionalContext: "Construction dispute settlement. Original contract was $2.5M. Dispute over change orders and delays. Parties agree to settle for $175,000 payment to our client. Mutual release of all claims. Confidentiality required. Payment in 3 installments over 90 days.",
    },
    sampleContent: `SETTLEMENT AGREEMENT AND MUTUAL RELEASE

This Settlement Agreement and Mutual Release ("Agreement") is entered into as of [DATE] (the "Effective Date"), by and between:

Martinez Construction Co., a Texas corporation ("Martinez")
and
Riverdale Development Corp., a Texas corporation ("Riverdale")

(each a "Party" and collectively, the "Parties")

RECITALS

A. The Parties entered into a Construction Agreement dated [DATE] for certain construction services (the "Project").

B. Disputes arose between the Parties regarding the Project, including disputes concerning change orders, project delays, and payment.

C. Martinez filed a lawsuit against Riverdale in the District Court of Harris County, Texas, Cause No. 2024-CV-45678 (the "Litigation").

D. The Parties now desire to resolve all disputes and claims between them without admission of liability.

AGREEMENT

NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, and for other good and valuable consideration, the Parties agree as follows:

1. SETTLEMENT PAYMENT

1.1 Riverdale shall pay to Martinez the total sum of ONE HUNDRED SEVENTY-FIVE THOUSAND DOLLARS ($175,000.00) (the "Settlement Amount").

1.2 The Settlement Amount shall be paid in three (3) installments as follows:
    (a) First Installment: $75,000.00 within ten (10) business days of execution;
    (b) Second Installment: $50,000.00 within forty-five (45) days of execution;
    (c) Third Installment: $50,000.00 within ninety (90) days of execution.

1.3 All payments shall be made by wire transfer to an account designated by Martinez.

2. MUTUAL RELEASE

2.1 Upon receipt of the full Settlement Amount, each Party, on behalf of itself and its affiliates, officers, directors, employees, agents, successors, and assigns, hereby releases and forever discharges the other Party from any and all claims, demands, damages, actions, and causes of action arising out of or related to the Project and the Litigation.

2.2 Each Party expressly waives any rights under California Civil Code Section 1542 or any similar statute.

3. DISMISSAL OF LITIGATION

3.1 Within five (5) business days of receipt of the first installment, the Parties shall file a joint stipulation to stay the Litigation.

3.2 Within five (5) business days of receipt of the final installment, Martinez shall file a dismissal with prejudice of the Litigation.

4. CONFIDENTIALITY

4.1 The Parties agree to keep the terms of this Agreement strictly confidential.

4.2 Neither Party shall disclose the existence or terms of this Agreement to any third party except:
    (a) As required by law;
    (b) To legal, tax, or financial advisors bound by confidentiality;
    (c) As necessary to enforce this Agreement.

5. NO ADMISSION OF LIABILITY

This Agreement is a compromise of disputed claims. Nothing herein shall be construed as an admission of liability by either Party.

6. GOVERNING LAW

This Agreement shall be governed by the laws of the State of Texas.

7. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between the Parties and supersedes all prior negotiations and agreements.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.

MARTINEZ CONSTRUCTION CO.           RIVERDALE DEVELOPMENT CORP.

By: _________________________       By: _________________________

Name: _______________________       Name: _______________________

Title: ______________________       Title: ______________________

Date: _______________________       Date: _______________________`
  },
  cease_desist: {
    formData: {
      documentType: "cease_desist",
      jurisdiction: "State of Florida",
      clientName: "Sunshine Brands LLC",
      opposingParty: "CopyCat Products Inc.",
      courtName: "",
      caseNumber: "",
      additionalContext: "Trademark infringement. Our client owns registered trademark 'SUNSHINE GLOW' for skincare products (Reg. No. 6,XXX,XXX). Defendant is selling knockoff products using 'SUNNY GLOW' branding with similar packaging. Causing consumer confusion and diluting our client's brand.",
    },
    sampleContent: `[LAW FIRM LETTERHEAD]

[DATE]

VIA CERTIFIED MAIL AND EMAIL
CopyCat Products Inc.
Attn: Legal Department
[Address]
[City, State ZIP]

Re: CEASE AND DESIST - Trademark Infringement
    Sunshine Brands LLC v. CopyCat Products Inc.
    U.S. Trademark Registration No. 6,XXX,XXX

Dear Sir or Madam:

This firm represents Sunshine Brands LLC ("our Client") in matters relating to the protection of its intellectual property rights, including its federally registered trademark "SUNSHINE GLOW" (U.S. Registration No. 6,XXX,XXX) for skincare products.

TRADEMARK RIGHTS

Our Client is the owner of the federally registered trademark "SUNSHINE GLOW," which has been in continuous use in commerce since [YEAR]. Our Client has invested substantial resources in developing and protecting the SUNSHINE GLOW brand, which has achieved significant consumer recognition in the skincare industry.

INFRINGING ACTIVITY

It has come to our attention that your company, CopyCat Products Inc., is manufacturing, distributing, marketing, and/or selling skincare products bearing the mark "SUNNY GLOW" with packaging that is confusingly similar to our Client's products.

Your use of the "SUNNY GLOW" mark constitutes:

1. Trademark Infringement under 15 U.S.C. § 1114, as your mark is confusingly similar to our Client's registered trademark;

2. False Designation of Origin under 15 U.S.C. § 1125(a), as your packaging and branding are likely to cause consumer confusion regarding the source of your products;

3. Trademark Dilution under 15 U.S.C. § 1125(c), as your use dilutes the distinctive quality of our Client's famous mark.

DEMAND

On behalf of our Client, we hereby demand that CopyCat Products Inc. immediately:

1. CEASE AND DESIST from any and all use of "SUNNY GLOW" or any other mark confusingly similar to "SUNSHINE GLOW";

2. CEASE AND DESIST from using any packaging, trade dress, or marketing materials that imitate our Client's products;

3. RECALL all products bearing the infringing mark from all distribution channels;

4. DESTROY all inventory, packaging, and marketing materials bearing the infringing mark;

5. PROVIDE a written accounting of all sales of infringing products; and

6. CONFIRM in writing within fourteen (14) days of this letter that you have complied with these demands.

CONSEQUENCES OF NON-COMPLIANCE

Should you fail to comply with these demands, our Client is prepared to pursue all available legal remedies, including:

• Seeking a temporary restraining order and preliminary injunction;
• Filing a federal lawsuit for trademark infringement, unfair competition, and related claims;
• Recovery of actual damages, defendant's profits, and statutory damages up to $2,000,000 per counterfeit mark;
• Recovery of attorneys' fees and costs; and
• Seizure and destruction of all infringing goods.

This letter is not intended to be a complete statement of our Client's rights and remedies, all of which are expressly reserved.

We expect your prompt response.

                                        Very truly yours,

                                        _______________________________
                                        [Attorney Name]
                                        Counsel for Sunshine Brands LLC

cc: Sunshine Brands LLC`
  },
  answer: {
    formData: {
      documentType: "answer",
      jurisdiction: "State of Illinois - Circuit Court of Cook County",
      clientName: "Riverside Properties LLC",
      opposingParty: "Thompson Family Trust",
      courtName: "Circuit Court of Cook County, Illinois",
      caseNumber: "2024-L-005678",
      additionalContext: "Plaintiff alleges breach of commercial lease agreement. Our client denies all allegations. Lease was properly terminated due to plaintiff's failure to pay rent for 3 consecutive months. Asserting affirmative defenses of failure to mitigate damages and unclean hands.",
    },
    sampleContent: `IN THE CIRCUIT COURT OF COOK COUNTY, ILLINOIS
COUNTY DEPARTMENT, LAW DIVISION

THOMPSON FAMILY TRUST,             )
                                   )    Case No.: 2024-L-005678
          Plaintiff,               )
                                   )    ANSWER TO COMPLAINT
     v.                            )
                                   )
RIVERSIDE PROPERTIES LLC,          )
                                   )
          Defendant.               )
___________________________________)

Defendant Riverside Properties LLC ("Defendant"), by and through its attorneys, answers Plaintiff's Complaint as follows:

GENERAL DENIAL

Defendant denies each and every allegation contained in Plaintiff's Complaint except those specifically admitted herein.

SPECIFIC RESPONSES

1. Defendant admits that it is a limited liability company organized under the laws of the State of Illinois.

2. Defendant admits that a commercial lease agreement existed between the parties.

3. Defendant denies that it breached any terms of the lease agreement.

4. Defendant denies that Plaintiff is entitled to any damages.

5. Defendant affirmatively states that the lease was properly terminated due to Plaintiff's material breach, specifically Plaintiff's failure to pay rent for three (3) consecutive months.

AFFIRMATIVE DEFENSES

FIRST AFFIRMATIVE DEFENSE - Failure to Mitigate Damages

Plaintiff failed to take reasonable steps to mitigate its alleged damages by failing to seek alternative tenants or otherwise minimize its losses.

SECOND AFFIRMATIVE DEFENSE - Unclean Hands

Plaintiff comes to this Court with unclean hands, having itself breached the lease agreement by failing to pay rent as required.

THIRD AFFIRMATIVE DEFENSE - Failure to State a Claim

Plaintiff's Complaint fails to state a claim upon which relief can be granted.

PRAYER FOR RELIEF

WHEREFORE, Defendant respectfully requests that this Court:

A. Dismiss Plaintiff's Complaint with prejudice;
B. Award Defendant its costs and attorneys' fees; and
C. Grant such other relief as the Court deems just and proper.

DATED: [DATE]

                                        Respectfully submitted,

                                        _______________________________
                                        [Attorney Name]
                                        Attorney for Defendant
                                        Riverside Properties LLC`
  },
  motion_summary: {
    formData: {
      documentType: "motion_summary",
      jurisdiction: "United States District Court - District of Massachusetts",
      clientName: "Beacon Financial Services Inc.",
      opposingParty: "Atlantic Investment Group",
      courtName: "United States District Court, District of Massachusetts",
      caseNumber: "1:24-cv-10234-ABC",
      additionalContext: "Contract dispute over investment advisory services. Undisputed facts show plaintiff failed to provide required notice before termination. Contract requires 90-day written notice. Plaintiff provided only 15 days notice. No genuine dispute of material fact exists.",
    },
    sampleContent: `UNITED STATES DISTRICT COURT
DISTRICT OF MASSACHUSETTS

ATLANTIC INVESTMENT GROUP,         )
                                   )    Civil Action No. 1:24-cv-10234-ABC
          Plaintiff,               )
                                   )    DEFENDANT'S MOTION FOR
     v.                            )    SUMMARY JUDGMENT
                                   )
BEACON FINANCIAL SERVICES INC.,    )
                                   )
          Defendant.               )
___________________________________)

Defendant Beacon Financial Services Inc. ("Beacon") respectfully moves this Court pursuant to Federal Rule of Civil Procedure 56 for summary judgment on all claims.

INTRODUCTION

This case should be resolved on summary judgment because there is no genuine dispute as to any material fact. The undisputed evidence establishes that Plaintiff Atlantic Investment Group ("Atlantic") breached the Investment Advisory Agreement by failing to provide the contractually required 90-day written notice before termination.

STATEMENT OF UNDISPUTED FACTS

1. On January 15, 2022, the parties entered into an Investment Advisory Agreement (the "Agreement"). (Ex. A)

2. Section 8.1 of the Agreement states: "Either party may terminate this Agreement upon ninety (90) days prior written notice to the other party." (Ex. A, § 8.1)

3. On March 1, 2024, Atlantic sent Beacon a termination letter. (Ex. B)

4. The termination letter stated that Atlantic was terminating the Agreement effective March 15, 2024. (Ex. B)

5. Atlantic provided only fifteen (15) days notice, not the required ninety (90) days. (Compare Ex. B with Ex. A, § 8.1)

ARGUMENT

I. LEGAL STANDARD

Summary judgment is appropriate when "there is no genuine dispute as to any material fact and the movant is entitled to judgment as a matter of law." Fed. R. Civ. P. 56(a).

II. ATLANTIC BREACHED THE AGREEMENT

The undisputed facts establish that Atlantic breached the Agreement. The contract unambiguously requires 90 days written notice for termination. Atlantic provided only 15 days notice. This is a clear breach.

III. BEACON IS ENTITLED TO DAMAGES

As a direct result of Atlantic's breach, Beacon is entitled to damages equal to the fees it would have earned during the 75-day shortfall period, totaling $187,500.

CONCLUSION

For the foregoing reasons, Defendant respectfully requests that this Court grant summary judgment in its favor.

DATED: [DATE]

                                        Respectfully submitted,

                                        _______________________________
                                        [Attorney Name]
                                        Attorney for Defendant
                                        Beacon Financial Services Inc.`
  },
  discovery_interrogatories: {
    formData: {
      documentType: "discovery_interrogatories",
      jurisdiction: "State of Georgia - Superior Court of Fulton County",
      clientName: "Peachtree Medical Group",
      opposingParty: "HealthFirst Insurance Co.",
      courtName: "Superior Court of Fulton County, Georgia",
      caseNumber: "2024-CV-123456",
      additionalContext: "Medical billing dispute. Insurance company denied claims for covered services. Need information about claim processing procedures, basis for denials, communications with other providers, and corporate policies.",
    },
    sampleContent: `IN THE SUPERIOR COURT OF FULTON COUNTY
STATE OF GEORGIA

PEACHTREE MEDICAL GROUP,           )
                                   )    Civil Action File No.: 2024-CV-123456
          Plaintiff,               )
                                   )    PLAINTIFF'S FIRST SET OF
     v.                            )    INTERROGATORIES TO DEFENDANT
                                   )
HEALTHFIRST INSURANCE CO.,         )
                                   )
          Defendant.               )
___________________________________)

TO: HEALTHFIRST INSURANCE CO., Defendant

Plaintiff Peachtree Medical Group hereby propounds the following Interrogatories to Defendant HealthFirst Insurance Co., to be answered under oath within thirty (30) days pursuant to O.C.G.A. § 9-11-33.

DEFINITIONS

1. "You" or "Defendant" refers to HealthFirst Insurance Co. and its agents, employees, and representatives.

2. "Document" includes all written, printed, or electronic materials.

3. "Communication" includes all oral, written, and electronic exchanges.

INTERROGATORIES

INTERROGATORY NO. 1:
Identify all persons involved in the decision to deny Plaintiff's claims at issue in this litigation, including their names, job titles, and roles in the denial process.

INTERROGATORY NO. 2:
Describe in detail the claims processing procedures used by Defendant when evaluating claims submitted by Plaintiff.

INTERROGATORY NO. 3:
State the specific basis for each denial of Plaintiff's claims, including all policy provisions, medical necessity determinations, or other grounds relied upon.

INTERROGATORY NO. 4:
Identify all documents reviewed in connection with each claim denial at issue in this litigation.

INTERROGATORY NO. 5:
State whether Defendant has denied similar claims from other healthcare providers in Georgia during the past three (3) years, and if so, identify the number of such denials.

INTERROGATORY NO. 6:
Describe all communications between Defendant and any third-party administrators, medical reviewers, or consultants regarding Plaintiff's claims.

INTERROGATORY NO. 7:
Identify all corporate policies, guidelines, or procedures governing the review and denial of claims for the medical services at issue.

INTERROGATORY NO. 8:
State the total dollar amount of claims submitted by Plaintiff that Defendant has denied during the relevant time period.

INTERROGATORY NO. 9:
Identify all persons with knowledge of facts relevant to this litigation and describe the nature of their knowledge.

INTERROGATORY NO. 10:
Describe any appeals or internal reviews conducted regarding Plaintiff's denied claims and state the outcome of each.

DATED: [DATE]

                                        Respectfully submitted,

                                        _______________________________
                                        [Attorney Name]
                                        Attorney for Plaintiff
                                        Peachtree Medical Group`
  },
  discovery_production: {
    formData: {
      documentType: "discovery_production",
      jurisdiction: "State of Arizona - Superior Court of Maricopa County",
      clientName: "Desert Sun Construction Inc.",
      opposingParty: "Valley Development Partners",
      courtName: "Superior Court of Maricopa County, Arizona",
      caseNumber: "CV2024-001234",
      additionalContext: "Construction defect case. Need all project documents, communications, inspection reports, change orders, payment records, and expert reports related to the commercial building project.",
    },
    sampleContent: `IN THE SUPERIOR COURT OF THE STATE OF ARIZONA
IN AND FOR THE COUNTY OF MARICOPA

DESERT SUN CONSTRUCTION INC.,      )
                                   )    Case No.: CV2024-001234
          Plaintiff,               )
                                   )    PLAINTIFF'S FIRST REQUEST
     v.                            )    FOR PRODUCTION OF DOCUMENTS
                                   )
VALLEY DEVELOPMENT PARTNERS,       )
                                   )
          Defendant.               )
___________________________________)

TO: VALLEY DEVELOPMENT PARTNERS, Defendant

Plaintiff Desert Sun Construction Inc. hereby requests that Defendant produce the following documents for inspection and copying within thirty (30) days pursuant to Arizona Rule of Civil Procedure 34.

DEFINITIONS

1. "Project" refers to the commercial building construction at 1500 Commerce Drive, Phoenix, Arizona.

2. "Document" includes all writings, drawings, photographs, recordings, and electronically stored information.

REQUESTS FOR PRODUCTION

REQUEST NO. 1:
All contracts, subcontracts, and agreements relating to the Project.

REQUEST NO. 2:
All change orders, amendments, or modifications to any contract relating to the Project.

REQUEST NO. 3:
All correspondence, emails, text messages, and other communications between the parties relating to the Project.

REQUEST NO. 4:
All inspection reports, punch lists, and quality control documents relating to the Project.

REQUEST NO. 5:
All photographs, videos, or other visual documentation of the Project taken during construction.

REQUEST NO. 6:
All invoices, payment records, and financial documents relating to the Project.

REQUEST NO. 7:
All expert reports, engineering studies, or technical analyses relating to the alleged construction defects.

REQUEST NO. 8:
All meeting minutes, progress reports, and project schedules relating to the Project.

REQUEST NO. 9:
All insurance policies providing coverage for claims arising from the Project.

REQUEST NO. 10:
All documents relating to any repairs, remediation, or corrective work performed on the Project.

REQUEST NO. 11:
All permits, certificates of occupancy, and governmental approvals relating to the Project.

REQUEST NO. 12:
All documents identified in or relied upon in Defendant's initial disclosures.

DATED: [DATE]

                                        Respectfully submitted,

                                        _______________________________
                                        [Attorney Name]
                                        Attorney for Plaintiff
                                        Desert Sun Construction Inc.`
  },
  discovery_admissions: {
    formData: {
      documentType: "discovery_admissions",
      jurisdiction: "State of Washington - King County Superior Court",
      clientName: "Emerald City Software LLC",
      opposingParty: "Northwest Tech Solutions",
      courtName: "King County Superior Court, Washington",
      caseNumber: "24-2-12345-6 SEA",
      additionalContext: "Software licensing dispute. Defendant using our client's proprietary software without valid license. Need admissions regarding use of software, expiration of license, receipt of cease and desist letter, and continued unauthorized use.",
    },
    sampleContent: `IN THE SUPERIOR COURT OF WASHINGTON
FOR KING COUNTY

EMERALD CITY SOFTWARE LLC,         )
                                   )    Case No.: 24-2-12345-6 SEA
          Plaintiff,               )
                                   )    PLAINTIFF'S FIRST REQUESTS
     v.                            )    FOR ADMISSIONS
                                   )
NORTHWEST TECH SOLUTIONS,          )
                                   )
          Defendant.               )
___________________________________)

TO: NORTHWEST TECH SOLUTIONS, Defendant

Plaintiff Emerald City Software LLC hereby requests that Defendant admit or deny the following matters within thirty (30) days pursuant to CR 36.

REQUESTS FOR ADMISSION

REQUEST FOR ADMISSION NO. 1:
Admit that Defendant entered into a Software License Agreement with Plaintiff dated June 1, 2021.

REQUEST FOR ADMISSION NO. 2:
Admit that the Software License Agreement had a term of two (2) years.

REQUEST FOR ADMISSION NO. 3:
Admit that the Software License Agreement expired on June 1, 2023.

REQUEST FOR ADMISSION NO. 4:
Admit that Defendant did not renew the Software License Agreement.

REQUEST FOR ADMISSION NO. 5:
Admit that Defendant continued to use Plaintiff's software after June 1, 2023.

REQUEST FOR ADMISSION NO. 6:
Admit that Defendant received a cease and desist letter from Plaintiff dated July 15, 2023.

REQUEST FOR ADMISSION NO. 7:
Admit that Defendant continued to use Plaintiff's software after receiving the cease and desist letter.

REQUEST FOR ADMISSION NO. 8:
Admit that Plaintiff's software is protected by U.S. Copyright Registration No. TX-XXX-XXX.

REQUEST FOR ADMISSION NO. 9:
Admit that Defendant did not have authorization to use Plaintiff's software after June 1, 2023.

REQUEST FOR ADMISSION NO. 10:
Admit that the annual license fee for Plaintiff's software is $50,000.

REQUEST FOR ADMISSION NO. 11:
Admit that Defendant has installed Plaintiff's software on at least ten (10) computers.

REQUEST FOR ADMISSION NO. 12:
Admit that the document attached as Exhibit A is a true and correct copy of the Software License Agreement between the parties.

DATED: [DATE]

                                        Respectfully submitted,

                                        _______________________________
                                        [Attorney Name]
                                        Attorney for Plaintiff
                                        Emerald City Software LLC`
  },
  subpoena: {
    formData: {
      documentType: "subpoena",
      jurisdiction: "State of Nevada - District Court of Clark County",
      clientName: "Silver State Enterprises",
      opposingParty: "Casino Gaming Corp.",
      courtName: "Eighth Judicial District Court, Clark County, Nevada",
      caseNumber: "A-24-123456-C",
      additionalContext: "Employment discrimination case. Need to subpoena HR records from former employer including personnel file, performance reviews, emails regarding termination decision, and comparative data on other employees.",
    },
    sampleContent: `EIGHTH JUDICIAL DISTRICT COURT
CLARK COUNTY, NEVADA

SILVER STATE ENTERPRISES,          )
                                   )    Case No.: A-24-123456-C
          Plaintiff,               )    Dept. No.: XV
                                   )
     v.                            )    SUBPOENA DUCES TECUM
                                   )
CASINO GAMING CORP.,               )
                                   )
          Defendant.               )
___________________________________)

THE STATE OF NEVADA TO: Records Custodian
                        Casino Gaming Corp.
                        Human Resources Department
                        3000 Las Vegas Blvd South
                        Las Vegas, NV 89109

YOU ARE COMMANDED to produce the documents described below at the law offices of [Law Firm Name], [Address], Las Vegas, Nevada, on [DATE] at 10:00 a.m., or to mail copies of such documents to said address at least three (3) days before said date.

DOCUMENTS TO BE PRODUCED

1. The complete personnel file of [Employee Name], including but not limited to:
   a. Employment application and resume
   b. Offer letter and employment agreement
   c. All performance evaluations and reviews
   d. Disciplinary records and warnings
   e. Attendance records
   f. Training records

2. All emails, memoranda, and other communications regarding the termination of [Employee Name].

3. All documents relating to the decision to terminate [Employee Name].

4. Comparative employment data for all employees in [Employee Name]'s department, including hire dates, termination dates, and reasons for termination.

5. All policies and procedures regarding employee discipline and termination in effect from [DATE] to present.

6. All complaints or grievances filed by or against [Employee Name].

DISOBEDIENCE OF THIS SUBPOENA may be punished as contempt of court.

WITNESS my hand and seal of the Court this ___ day of _________, 2024.

                                        _______________________________
                                        Clerk of the Court

                                        By: ___________________________
                                            Deputy Clerk

Requested by:
[Attorney Name]
Attorney for Plaintiff
[Address]
[Phone]`
  },
  contract: {
    formData: {
      documentType: "contract",
      jurisdiction: "State of Colorado",
      clientName: "Mountain View Consulting Group",
      opposingParty: "Alpine Technology Inc.",
      courtName: "",
      caseNumber: "",
      additionalContext: "Professional services agreement for IT consulting. Scope includes system assessment, implementation, and training. Fixed fee of $150,000 payable in milestones. 12-month term with option to renew. Include confidentiality, IP ownership, limitation of liability, and termination provisions.",
    },
    sampleContent: `PROFESSIONAL SERVICES AGREEMENT

This Professional Services Agreement ("Agreement") is entered into as of [DATE] (the "Effective Date"), by and between:

Mountain View Consulting Group, a Colorado corporation ("Consultant")
and
Alpine Technology Inc., a Colorado corporation ("Client")

1. SERVICES

1.1 Scope. Consultant shall provide the following professional services (the "Services"):
    (a) IT systems assessment and analysis
    (b) System design and implementation
    (c) Staff training and documentation
    (d) Post-implementation support

1.2 Schedule. Consultant shall perform the Services according to the project schedule attached as Exhibit A.

2. COMPENSATION

2.1 Fees. Client shall pay Consultant a total fixed fee of ONE HUNDRED FIFTY THOUSAND DOLLARS ($150,000.00) for the Services.

2.2 Payment Schedule. Fees shall be paid according to the following milestones:
    (a) $37,500 upon execution of this Agreement
    (b) $37,500 upon completion of assessment phase
    (c) $50,000 upon completion of implementation
    (d) $25,000 upon completion of training and final acceptance

2.3 Expenses. Client shall reimburse Consultant for pre-approved travel and out-of-pocket expenses.

3. TERM AND TERMINATION

3.1 Term. This Agreement shall commence on the Effective Date and continue for twelve (12) months, unless earlier terminated.

3.2 Renewal. This Agreement may be renewed for additional one-year terms upon mutual written agreement.

3.3 Termination for Convenience. Either party may terminate this Agreement upon thirty (30) days written notice.

3.4 Termination for Cause. Either party may terminate immediately upon material breach that remains uncured for fifteen (15) days after written notice.

4. CONFIDENTIALITY

4.1 Each party agrees to maintain the confidentiality of the other party's confidential information and not to disclose such information to third parties.

4.2 Confidential information does not include information that is publicly available or independently developed.

5. INTELLECTUAL PROPERTY

5.1 Pre-Existing IP. Each party retains ownership of its pre-existing intellectual property.

5.2 Work Product. All work product created specifically for Client under this Agreement shall be owned by Client upon full payment.

5.3 Consultant Tools. Consultant retains ownership of its tools, methodologies, and general know-how.

6. WARRANTIES

6.1 Consultant warrants that the Services will be performed in a professional and workmanlike manner.

6.2 EXCEPT AS EXPRESSLY SET FORTH HEREIN, CONSULTANT MAKES NO OTHER WARRANTIES, EXPRESS OR IMPLIED.

7. LIMITATION OF LIABILITY

7.1 NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.

7.2 CONSULTANT'S TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID UNDER THIS AGREEMENT.

8. GENERAL PROVISIONS

8.1 Governing Law. This Agreement shall be governed by the laws of the State of Colorado.

8.2 Entire Agreement. This Agreement constitutes the entire agreement between the parties.

8.3 Amendment. This Agreement may only be amended in writing signed by both parties.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

MOUNTAIN VIEW CONSULTING GROUP     ALPINE TECHNOLOGY INC.

By: _________________________      By: _________________________

Name: _______________________      Name: _______________________

Title: ______________________      Title: ______________________

Date: _______________________      Date: _______________________`
  },
  affidavit: {
    formData: {
      documentType: "affidavit",
      jurisdiction: "State of Michigan - Wayne County Circuit Court",
      clientName: "Great Lakes Manufacturing Co.",
      opposingParty: "Midwest Suppliers Inc.",
      courtName: "Wayne County Circuit Court, Michigan",
      caseNumber: "24-012345-CK",
      additionalContext: "Affidavit in support of motion for summary judgment. Affiant is company CFO who has personal knowledge of contract terms, payment history, and defendant's breach. Need to establish undisputed facts about the business relationship and damages.",
    },
    sampleContent: `STATE OF MICHIGAN
COUNTY OF WAYNE

IN THE CIRCUIT COURT FOR THE COUNTY OF WAYNE

GREAT LAKES MANUFACTURING CO.,     )
                                   )    Case No.: 24-012345-CK
          Plaintiff,               )
                                   )    AFFIDAVIT OF JAMES WILSON
     v.                            )    IN SUPPORT OF PLAINTIFF'S
                                   )    MOTION FOR SUMMARY JUDGMENT
MIDWEST SUPPLIERS INC.,            )
                                   )
          Defendant.               )
___________________________________)

STATE OF MICHIGAN    )
                     ) ss.
COUNTY OF WAYNE      )

I, James Wilson, being duly sworn, depose and state as follows:

1. I am over the age of eighteen (18) years and competent to testify to the matters stated herein.

2. I am the Chief Financial Officer of Great Lakes Manufacturing Co. ("Plaintiff" or "Great Lakes"). I have held this position since January 2018.

3. I have personal knowledge of the facts stated in this Affidavit based on my review of business records maintained by Great Lakes in the ordinary course of business and my personal involvement in the matters described herein.

4. On or about March 15, 2022, Great Lakes and Midwest Suppliers Inc. ("Defendant" or "Midwest") entered into a Supply Agreement (the "Agreement"). A true and correct copy of the Agreement is attached hereto as Exhibit A.

5. Pursuant to Section 3 of the Agreement, Midwest agreed to supply Great Lakes with industrial components at specified prices for a term of three (3) years.

6. Section 5 of the Agreement required Midwest to deliver components within thirty (30) days of each purchase order.

7. Between March 2022 and December 2023, Great Lakes submitted twenty-four (24) purchase orders to Midwest under the Agreement.

8. Beginning in January 2024, Midwest failed to deliver components as required by the Agreement.

9. Great Lakes issued Purchase Order No. 2024-001 on January 5, 2024, for $125,000 worth of components.

10. Despite repeated requests, Midwest failed to deliver the components ordered under Purchase Order No. 2024-001.

11. As a result of Midwest's failure to deliver, Great Lakes was forced to obtain components from an alternative supplier at a cost of $175,000, resulting in additional costs of $50,000.

12. Great Lakes has fully performed all of its obligations under the Agreement.

13. To date, Midwest has not cured its breach or provided any explanation for its failure to perform.

FURTHER AFFIANT SAYETH NOT.

                                        _______________________________
                                        James Wilson

Subscribed and sworn to before me this ___ day of _________, 2024.

_______________________________
Notary Public, State of Michigan
County of Wayne
My Commission Expires: ___________`
  }
}

// Document type definitions - all have samples now
const documentTypesWithSamples = [
  { value: "complaint", label: "Complaint", category: "Litigation" },
  { value: "answer", label: "Answer to Complaint", category: "Litigation" },
  { value: "motion_dismiss", label: "Motion to Dismiss", category: "Litigation" },
  { value: "motion_summary", label: "Motion for Summary Judgment", category: "Litigation" },
  { value: "affidavit", label: "Affidavit", category: "Litigation" },
  { value: "discovery_interrogatories", label: "Interrogatories", category: "Discovery" },
  { value: "discovery_production", label: "Request for Production", category: "Discovery" },
  { value: "discovery_admissions", label: "Request for Admissions", category: "Discovery" },
  { value: "subpoena", label: "Subpoena", category: "Discovery" },
  { value: "settlement_agreement", label: "Settlement Agreement", category: "Transactional" },
  { value: "contract", label: "Contract", category: "Transactional" },
  { value: "nda", label: "Non-Disclosure Agreement", category: "Transactional" },
  { value: "demand_letter", label: "Demand Letter", category: "Correspondence" },
  { value: "cease_desist", label: "Cease and Desist Letter", category: "Correspondence" },
]

export default function DocumentDraftingPage() {
  const [loading, setLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [selectedSampleType, setSelectedSampleType] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    documentType: "",
    jurisdiction: "",
    clientName: "",
    opposingParty: "",
    courtName: "",
    caseNumber: "",
    additionalContext: "",
  })

  // Auto-load sample when document type is selected
  const handleDocumentTypeChange = (type: string) => {
    const sample = sampleDocuments[type as keyof typeof sampleDocuments]
    if (sample) {
      // Auto-fill all fields with sample data
      setFormData(sample.formData)
      setGeneratedContent(sample.sampleContent)
      setSelectedSampleType(type)
      setActiveTab("preview")
    } else {
      // No sample available, just set the document type
      setFormData(prev => ({
        ...prev,
        documentType: type,
        jurisdiction: "",
        clientName: "",
        opposingParty: "",
        courtName: "",
        caseNumber: "",
        additionalContext: "",
      }))
      setGeneratedContent("")
      setSelectedSampleType(null)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/document-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setGeneratedContent(data.content)
        setActiveTab("preview")
      }
    } catch (error) {
      console.error("Failed to generate document:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formData.documentType || "document"}-draft.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${documentTypesWithSamples.find(d => d.value === formData.documentType)?.label || 'Document'} Draft</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
              pre { white-space: pre-wrap; font-family: inherit; }
            </style>
          </head>
          <body>
            <pre>${generatedContent}</pre>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Document Drafting</h1>
          <p className="text-muted-foreground">
            Generate professional legal document drafts using AI assistance
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-500" />
              Document Parameters
            </CardTitle>
            <CardDescription>
              Provide details to generate your document draft
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type * <span className="text-xs text-muted-foreground">(auto-fills sample data)</span></Label>
              <Select
                value={formData.documentType}
                onValueChange={handleDocumentTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {["Litigation", "Discovery", "Transactional", "Correspondence"].map((category) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                        {category}
                      </div>
                      {documentTypesWithSamples
                        .filter((type) => type.category === category)
                        .map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jurisdiction</Label>
              <Input
                value={formData.jurisdiction}
                onChange={(e) => setFormData((prev) => ({ ...prev, jurisdiction: e.target.value }))}
                placeholder="e.g., State of New York, Federal - SDNY"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Client name"
                />
              </div>
              <div className="space-y-2">
                <Label>Opposing Party</Label>
                <Input
                  value={formData.opposingParty}
                  onChange={(e) => setFormData((prev) => ({ ...prev, opposingParty: e.target.value }))}
                  placeholder="Opposing party name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Court Name</Label>
                <Input
                  value={formData.courtName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, courtName: e.target.value }))}
                  placeholder="Court name"
                />
              </div>
              <div className="space-y-2">
                <Label>Case Number</Label>
                <Input
                  value={formData.caseNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, caseNumber: e.target.value }))}
                  placeholder="Case number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Context & Instructions</Label>
              <Textarea
                value={formData.additionalContext}
                onChange={(e) => setFormData((prev) => ({ ...prev, additionalContext: e.target.value }))}
                placeholder="Provide any additional details, facts, or specific instructions..."
                rows={5}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !formData.documentType}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Document...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Draft
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Output */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Draft</CardTitle>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <CardDescription>
              AI-generated document draft for your review and editing
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {generatedContent ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="h-[400px] overflow-auto">
                  <div className="bg-white border rounded-lg p-6 shadow-inner whitespace-pre-wrap font-serif text-sm leading-relaxed">
                    {generatedContent}
                  </div>
                </TabsContent>
                <TabsContent value="edit" className="h-[400px]">
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="h-full font-mono text-sm resize-none"
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center text-muted-foreground bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
                <Sparkles className="h-16 w-16 mb-4 text-blue-300" />
                <p className="font-medium text-gray-700">Click a document type above to see a sample</p>
                <p className="text-sm mt-1 text-gray-500">Or fill in the parameters and generate a custom draft</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center max-w-sm">
                  <Badge variant="outline" className="bg-white">Motion to Dismiss</Badge>
                  <Badge variant="outline" className="bg-white">Demand Letter</Badge>
                  <Badge variant="outline" className="bg-white">NDA</Badge>
                  <Badge variant="outline" className="bg-white">Complaint</Badge>
                  <Badge variant="outline" className="bg-white">Settlement</Badge>
                  <Badge variant="outline" className="bg-white">Cease & Desist</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">Important Disclaimer</p>
              <p className="text-sm text-amber-700 mt-1">
                AI-generated documents are drafts only and require thorough review by a qualified attorney before use.
                Always verify legal citations, ensure compliance with local rules, and adapt content to the specific facts of your case.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
