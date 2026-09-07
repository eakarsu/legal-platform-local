# Small Law Firm AI - Complete Implementation Prompt

## Project Overview

Build a complete, production-ready Small Law Firm AI practice management system. This is a full-stack web application for small law firms (1-10 attorneys) that includes client/matter management, document management, time tracking, billing, trust accounting, calendar/deadlines, and AI-powered features.

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, Prisma ORM 5.22.0
- **Database**: PostgreSQL (already running locally, no Docker)
- **Authentication**: NextAuth.js with credentials provider
- **AI**: OpenAI GPT-4 for document drafting, legal research, contract review
- **Voice**: Twilio for voice receptionist, Deepgram for speech-to-text
- **Payments**: Stripe for payment processing
- **Email**: Nodemailer with SMTP
- **File Storage**: Local filesystem (uploads folder) or AWS S3

## Project Structure

```
small-law-firm-ai/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx (Dashboard)
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx (Client List)
│   │   │   │   ├── [id]/page.tsx (Client Detail)
│   │   │   │   └── new/page.tsx (New Client)
│   │   │   ├── matters/
│   │   │   │   ├── page.tsx (Matter List)
│   │   │   │   ├── [id]/page.tsx (Matter Detail)
│   │   │   │   └── new/page.tsx (New Matter)
│   │   │   ├── documents/
│   │   │   │   ├── page.tsx (Document Library)
│   │   │   │   └── [id]/page.tsx (Document Viewer)
│   │   │   ├── time-billing/
│   │   │   │   ├── page.tsx (Time Entries)
│   │   │   │   ├── invoices/page.tsx
│   │   │   │   └── trust/page.tsx (Trust Accounting)
│   │   │   ├── calendar/
│   │   │   │   ├── page.tsx (Calendar View)
│   │   │   │   └── deadlines/page.tsx
│   │   │   ├── contacts/
│   │   │   │   └── page.tsx (Contact Management)
│   │   │   ├── ai/
│   │   │   │   ├── document-drafting/page.tsx
│   │   │   │   ├── legal-research/page.tsx
│   │   │   │   ├── contract-review/page.tsx
│   │   │   │   └── time-capture/page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── users/page.tsx
│   │   │       ├── billing-rates/page.tsx
│   │   │       └── integrations/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── clients/route.ts
│   │   │   ├── clients/[id]/route.ts
│   │   │   ├── matters/route.ts
│   │   │   ├── matters/[id]/route.ts
│   │   │   ├── documents/route.ts
│   │   │   ├── documents/[id]/route.ts
│   │   │   ├── time-entries/route.ts
│   │   │   ├── invoices/route.ts
│   │   │   ├── trust-accounts/route.ts
│   │   │   ├── calendar/route.ts
│   │   │   ├── deadlines/route.ts
│   │   │   ├── contacts/route.ts
│   │   │   ├── ai/
│   │   │   │   ├── draft-document/route.ts
│   │   │   │   ├── legal-research/route.ts
│   │   │   │   ├── contract-review/route.ts
│   │   │   │   └── capture-time/route.ts
│   │   │   └── reports/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── clients/
│   │   │   ├── ClientCard.tsx
│   │   │   ├── ClientForm.tsx
│   │   │   └── ClientTable.tsx
│   │   ├── matters/
│   │   │   ├── MatterCard.tsx
│   │   │   ├── MatterForm.tsx
│   │   │   └── MatterTable.tsx
│   │   ├── documents/
│   │   │   ├── DocumentUploader.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   └── DocumentList.tsx
│   │   ├── time-billing/
│   │   │   ├── TimeEntryForm.tsx
│   │   │   ├── TimeEntryTable.tsx
│   │   │   ├── InvoiceGenerator.tsx
│   │   │   └── TrustLedger.tsx
│   │   ├── calendar/
│   │   │   ├── CalendarView.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── DeadlineTracker.tsx
│   │   └── ai/
│   │       ├── DocumentDrafter.tsx
│   │       ├── ResearchAssistant.tsx
│   │       └── ContractAnalyzer.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   ├── ai.ts
│   │   └── email.ts
│   └── types/
│       └── index.ts
├── public/
├── uploads/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── start.sh
```

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ AUTHENTICATION & USERS ============

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  firstName     String
  lastName      String
  role          UserRole  @default(ATTORNEY)
  barNumber     String?
  hourlyRate    Decimal?  @db.Decimal(10, 2)
  phone         String?
  avatar        String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  firm          Firm      @relation(fields: [firmId], references: [id])
  firmId        String
  timeEntries   TimeEntry[]
  matters       MatterAssignment[]
  events        CalendarEvent[]
  tasks         Task[]
  documents     Document[]
  invoices      Invoice[]
  auditLogs     AuditLog[]
}

enum UserRole {
  ADMIN
  PARTNER
  ATTORNEY
  PARALEGAL
  SECRETARY
  BOOKKEEPER
}

model Firm {
  id            String    @id @default(cuid())
  name          String
  address       String?
  city          String?
  state         String?
  zip           String?
  phone         String?
  email         String?
  website       String?
  logo          String?
  timezone      String    @default("America/New_York")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  users         User[]
  clients       Client[]
  matters       Matter[]
  trustAccounts TrustAccount[]
  practiceAreas PracticeArea[]
  activityCodes ActivityCode[]
  expenseCodes  ExpenseCode[]
}

// ============ CLIENTS ============

model Client {
  id              String      @id @default(cuid())
  clientNumber    String      @unique
  type            ClientType  @default(INDIVIDUAL)
  status          ClientStatus @default(ACTIVE)

  // Individual fields
  firstName       String?
  lastName        String?
  middleName      String?
  suffix          String?
  dateOfBirth     DateTime?
  ssn             String?     // Encrypted

  // Business fields
  companyName     String?
  ein             String?     // Encrypted

  // Contact info
  email           String?
  phone           String?
  mobile          String?
  fax             String?

  // Address
  address         String?
  address2        String?
  city            String?
  state           String?
  zip             String?
  country         String?     @default("USA")

  // Billing
  billingContact  String?
  billingEmail    String?
  billingAddress  String?
  paymentTerms    Int         @default(30)

  // Source
  referralSource  String?
  referredBy      String?

  notes           String?
  tags            String[]

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  firm            Firm        @relation(fields: [firmId], references: [id])
  firmId          String
  matters         Matter[]
  contacts        Contact[]
  documents       Document[]
  trustLedgers    TrustLedger[]
  communications  Communication[]
  conflictChecks  ConflictCheck[]
}

enum ClientType {
  INDIVIDUAL
  BUSINESS
  GOVERNMENT
  NONPROFIT
}

enum ClientStatus {
  ACTIVE
  INACTIVE
  PROSPECT
  ARCHIVED
}

// ============ MATTERS ============

model Matter {
  id              String        @id @default(cuid())
  matterNumber    String        @unique
  name            String
  description     String?
  status          MatterStatus  @default(OPEN)

  // Practice area
  practiceArea    PracticeArea  @relation(fields: [practiceAreaId], references: [id])
  practiceAreaId  String

  // Dates
  openDate        DateTime      @default(now())
  closeDate       DateTime?
  statuteOfLimitations DateTime?

  // Billing
  billingType     BillingType   @default(HOURLY)
  flatFee         Decimal?      @db.Decimal(10, 2)
  contingencyPct  Decimal?      @db.Decimal(5, 2)
  retainerAmount  Decimal?      @db.Decimal(10, 2)
  budgetAmount    Decimal?      @db.Decimal(10, 2)

  // Court info (if litigation)
  courtName       String?
  caseNumber      String?
  judgeName       String?
  jurisdiction    String?

  notes           String?
  tags            String[]

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  firm            Firm          @relation(fields: [firmId], references: [id])
  firmId          String
  client          Client        @relation(fields: [clientId], references: [id])
  clientId        String
  assignments     MatterAssignment[]
  timeEntries     TimeEntry[]
  expenses        Expense[]
  documents       Document[]
  invoices        Invoice[]
  deadlines       Deadline[]
  tasks           Task[]
  events          CalendarEvent[]
  trustLedgers    TrustLedger[]
  communications  Communication[]
  notes_          MatterNote[]
}

enum MatterStatus {
  OPEN
  PENDING
  ON_HOLD
  CLOSED
  ARCHIVED
}

enum BillingType {
  HOURLY
  FLAT_FEE
  CONTINGENCY
  HYBRID
  PRO_BONO
}

model MatterAssignment {
  id          String   @id @default(cuid())
  role        String   // Lead Attorney, Associate, Paralegal, etc.
  hourlyRate  Decimal? @db.Decimal(10, 2)

  matter      Matter   @relation(fields: [matterId], references: [id])
  matterId    String
  user        User     @relation(fields: [userId], references: [id])
  userId      String

  createdAt   DateTime @default(now())

  @@unique([matterId, userId])
}

model PracticeArea {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String?  // For calendar/UI

  firm        Firm     @relation(fields: [firmId], references: [id])
  firmId      String
  matters     Matter[]

  @@unique([firmId, name])
}

// ============ CONTACTS ============

model Contact {
  id            String      @id @default(cuid())
  type          ContactType
  firstName     String
  lastName      String
  title         String?
  company       String?
  email         String?
  phone         String?
  mobile        String?
  fax           String?
  address       String?
  city          String?
  state         String?
  zip           String?
  notes         String?

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  client        Client?     @relation(fields: [clientId], references: [id])
  clientId      String?
}

enum ContactType {
  CLIENT_CONTACT
  OPPOSING_COUNSEL
  COURT_CONTACT
  EXPERT_WITNESS
  VENDOR
  OTHER
}

// ============ DOCUMENTS ============

model Document {
  id            String         @id @default(cuid())
  name          String
  description   String?
  type          DocumentType
  category      String?
  filePath      String
  fileSize      Int
  mimeType      String
  version       Int            @default(1)

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // Relations
  matter        Matter?        @relation(fields: [matterId], references: [id])
  matterId      String?
  client        Client?        @relation(fields: [clientId], references: [id])
  clientId      String?
  uploadedBy    User           @relation(fields: [uploadedById], references: [id])
  uploadedById  String
  versions      DocumentVersion[]
}

enum DocumentType {
  PLEADING
  MOTION
  BRIEF
  CONTRACT
  CORRESPONDENCE
  DISCOVERY
  EVIDENCE
  COURT_ORDER
  INTAKE_FORM
  ENGAGEMENT_LETTER
  INVOICE
  OTHER
}

model DocumentVersion {
  id          String   @id @default(cuid())
  version     Int
  filePath    String
  fileSize    Int
  notes       String?
  createdAt   DateTime @default(now())

  document    Document @relation(fields: [documentId], references: [id])
  documentId  String
}

// ============ TIME & BILLING ============

model TimeEntry {
  id            String     @id @default(cuid())
  date          DateTime
  hours         Decimal    @db.Decimal(5, 2)
  rate          Decimal    @db.Decimal(10, 2)
  amount        Decimal    @db.Decimal(10, 2)
  description   String
  billable      Boolean    @default(true)
  billed        Boolean    @default(false)
  status        TimeEntryStatus @default(DRAFT)

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relations
  matter        Matter     @relation(fields: [matterId], references: [id])
  matterId      String
  user          User       @relation(fields: [userId], references: [id])
  userId        String
  activityCode  ActivityCode? @relation(fields: [activityCodeId], references: [id])
  activityCodeId String?
  invoice       Invoice?   @relation(fields: [invoiceId], references: [id])
  invoiceId     String?
}

enum TimeEntryStatus {
  DRAFT
  SUBMITTED
  APPROVED
  BILLED
}

model ActivityCode {
  id          String      @id @default(cuid())
  code        String
  name        String
  description String?
  category    String?     // UTBMS category

  firm        Firm        @relation(fields: [firmId], references: [id])
  firmId      String
  timeEntries TimeEntry[]

  @@unique([firmId, code])
}

model Expense {
  id            String     @id @default(cuid())
  date          DateTime
  amount        Decimal    @db.Decimal(10, 2)
  description   String
  vendor        String?
  billable      Boolean    @default(true)
  billed        Boolean    @default(false)
  receiptPath   String?

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relations
  matter        Matter     @relation(fields: [matterId], references: [id])
  matterId      String
  expenseCode   ExpenseCode? @relation(fields: [expenseCodeId], references: [id])
  expenseCodeId String?
  invoice       Invoice?   @relation(fields: [invoiceId], references: [id])
  invoiceId     String?
}

model ExpenseCode {
  id          String    @id @default(cuid())
  code        String
  name        String
  description String?

  firm        Firm      @relation(fields: [firmId], references: [id])
  firmId      String
  expenses    Expense[]

  @@unique([firmId, code])
}

model Invoice {
  id            String        @id @default(cuid())
  invoiceNumber String        @unique
  status        InvoiceStatus @default(DRAFT)

  // Dates
  issueDate     DateTime      @default(now())
  dueDate       DateTime
  paidDate      DateTime?

  // Amounts
  subtotal      Decimal       @db.Decimal(10, 2)
  taxAmount     Decimal       @db.Decimal(10, 2) @default(0)
  totalAmount   Decimal       @db.Decimal(10, 2)
  paidAmount    Decimal       @db.Decimal(10, 2) @default(0)
  balanceDue    Decimal       @db.Decimal(10, 2)

  notes         String?
  terms         String?

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  matter        Matter        @relation(fields: [matterId], references: [id])
  matterId      String
  createdBy     User          @relation(fields: [createdById], references: [id])
  createdById   String
  timeEntries   TimeEntry[]
  expenses      Expense[]
  payments      Payment[]
}

enum InvoiceStatus {
  DRAFT
  SENT
  VIEWED
  PARTIAL
  PAID
  OVERDUE
  VOID
}

model Payment {
  id            String      @id @default(cuid())
  amount        Decimal     @db.Decimal(10, 2)
  method        PaymentMethod
  reference     String?     // Check number, transaction ID, etc.
  date          DateTime    @default(now())
  notes         String?

  invoice       Invoice     @relation(fields: [invoiceId], references: [id])
  invoiceId     String
}

enum PaymentMethod {
  CHECK
  CREDIT_CARD
  ACH
  WIRE
  CASH
  TRUST_TRANSFER
}

// ============ TRUST ACCOUNTING ============

model TrustAccount {
  id            String        @id @default(cuid())
  name          String
  accountNumber String
  bankName      String
  routingNumber String?
  balance       Decimal       @db.Decimal(12, 2) @default(0)
  isIOLTA       Boolean       @default(true)
  isActive      Boolean       @default(true)

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  firm          Firm          @relation(fields: [firmId], references: [id])
  firmId        String
  ledgers       TrustLedger[]
  transactions  TrustTransaction[]
}

model TrustLedger {
  id            String        @id @default(cuid())
  balance       Decimal       @db.Decimal(12, 2) @default(0)

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  client        Client        @relation(fields: [clientId], references: [id])
  clientId      String
  matter        Matter?       @relation(fields: [matterId], references: [id])
  matterId      String?
  trustAccount  TrustAccount  @relation(fields: [trustAccountId], references: [id])
  trustAccountId String
  transactions  TrustTransaction[]

  @@unique([clientId, matterId, trustAccountId])
}

model TrustTransaction {
  id            String              @id @default(cuid())
  type          TrustTransactionType
  amount        Decimal             @db.Decimal(12, 2)
  runningBalance Decimal            @db.Decimal(12, 2)
  description   String
  reference     String?             // Check number, wire reference, etc.
  date          DateTime            @default(now())

  createdAt     DateTime            @default(now())

  trustAccount  TrustAccount        @relation(fields: [trustAccountId], references: [id])
  trustAccountId String
  ledger        TrustLedger         @relation(fields: [ledgerId], references: [id])
  ledgerId      String
}

enum TrustTransactionType {
  DEPOSIT
  DISBURSEMENT
  TRANSFER_IN
  TRANSFER_OUT
  REFUND
  INTEREST
}

// ============ CALENDAR & DEADLINES ============

model CalendarEvent {
  id            String        @id @default(cuid())
  title         String
  description   String?
  type          EventType     @default(MEETING)
  location      String?

  startTime     DateTime
  endTime       DateTime
  allDay        Boolean       @default(false)

  // Recurrence
  recurring     Boolean       @default(false)
  recurrenceRule String?      // RRULE format

  // Reminders
  reminderMinutes Int[]       @default([30])

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  matter        Matter?       @relation(fields: [matterId], references: [id])
  matterId      String?
  user          User          @relation(fields: [userId], references: [id])
  userId        String
  attendees     EventAttendee[]
}

enum EventType {
  MEETING
  COURT_DATE
  DEPOSITION
  DEADLINE
  TASK
  REMINDER
  OUT_OF_OFFICE
}

model EventAttendee {
  id        String   @id @default(cuid())
  email     String
  name      String?
  status    String   @default("pending") // pending, accepted, declined

  event     CalendarEvent @relation(fields: [eventId], references: [id])
  eventId   String
}

model Deadline {
  id            String         @id @default(cuid())
  title         String
  description   String?
  dueDate       DateTime
  type          DeadlineType
  priority      Priority       @default(MEDIUM)
  status        DeadlineStatus @default(PENDING)

  // Rule-based calculation
  triggerEvent  String?        // e.g., "service_date", "filing_date"
  triggerDate   DateTime?
  daysFromTrigger Int?
  businessDays  Boolean        @default(true)

  completedAt   DateTime?

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // Relations
  matter        Matter         @relation(fields: [matterId], references: [id])
  matterId      String
}

enum DeadlineType {
  FILING
  RESPONSE
  DISCOVERY
  MOTION
  APPEAL
  STATUTE_OF_LIMITATIONS
  CUSTOM
}

enum DeadlineStatus {
  PENDING
  COMPLETED
  EXTENDED
  MISSED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

// ============ TASKS ============

model Task {
  id            String      @id @default(cuid())
  title         String
  description   String?
  priority      Priority    @default(MEDIUM)
  status        TaskStatus  @default(TODO)
  dueDate       DateTime?
  completedAt   DateTime?

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relations
  matter        Matter?     @relation(fields: [matterId], references: [id])
  matterId      String?
  assignedTo    User?       @relation(fields: [assignedToId], references: [id])
  assignedToId  String?
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  COMPLETED
  CANCELLED
}

// ============ COMMUNICATIONS ============

model Communication {
  id            String            @id @default(cuid())
  type          CommunicationType
  direction     String            // inbound, outbound
  subject       String?
  body          String?
  from          String?
  to            String?
  date          DateTime          @default(now())

  // For calls
  duration      Int?              // seconds
  recordingUrl  String?

  createdAt     DateTime          @default(now())

  client        Client?           @relation(fields: [clientId], references: [id])
  clientId      String?
  matter        Matter?           @relation(fields: [matterId], references: [id])
  matterId      String?
}

enum CommunicationType {
  EMAIL
  PHONE
  SMS
  LETTER
  FAX
  MEETING
}

// ============ CONFLICT CHECKING ============

model ConflictCheck {
  id            String      @id @default(cuid())
  searchTerms   String[]
  results       Json        // Stores conflict check results
  status        String      @default("pending") // pending, clear, conflict
  notes         String?

  createdAt     DateTime    @default(now())

  client        Client      @relation(fields: [clientId], references: [id])
  clientId      String
}

// ============ MATTER NOTES ============

model MatterNote {
  id          String   @id @default(cuid())
  content     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  matter      Matter   @relation(fields: [matterId], references: [id])
  matterId    String
}

// ============ AUDIT LOG ============

model AuditLog {
  id          String   @id @default(cuid())
  action      String   // CREATE, UPDATE, DELETE, VIEW
  entity      String   // Client, Matter, Document, etc.
  entityId    String
  changes     Json?
  ipAddress   String?
  userAgent   String?

  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
  userId      String
}
```

## Seed Data (prisma/seed.ts)

Create comprehensive seed data including:

1. **Firm**: "Smith & Associates Law Firm"

2. **Users** (5 users):
   - John Smith (Partner, Admin) - $450/hr
   - Sarah Johnson (Associate Attorney) - $275/hr
   - Michael Brown (Associate Attorney) - $250/hr
   - Emily Davis (Paralegal) - $125/hr
   - Jessica Wilson (Secretary)

3. **Practice Areas** (6 areas):
   - Family Law (color: #E91E63)
   - Personal Injury (color: #F44336)
   - Business Law (color: #2196F3)
   - Estate Planning (color: #4CAF50)
   - Criminal Defense (color: #9C27B0)
   - Real Estate (color: #FF9800)

4. **Activity Codes** (UTBMS codes):
   - A101 - Plan and prepare for trial
   - A102 - Written discovery
   - A103 - Document review
   - A104 - Depositions
   - A105 - Court appearances
   - A106 - Research
   - A107 - Draft pleadings
   - A108 - Client communications
   - A109 - Internal conferences
   - A110 - Negotiations

5. **Expense Codes**:
   - E101 - Filing fees
   - E102 - Service of process
   - E103 - Court reporter fees
   - E104 - Expert witness fees
   - E105 - Copying/printing
   - E106 - Postage/delivery
   - E107 - Travel expenses

6. **Clients** (10 clients):
   - Mix of individuals and businesses
   - Include full contact info, addresses
   - Various statuses (active, prospect)

7. **Matters** (15 matters):
   - Various practice areas
   - Mix of open, pending, closed
   - Include court info for litigation matters
   - Various billing types

8. **Documents** (25 documents):
   - Pleadings, contracts, correspondence
   - Associated with matters

9. **Time Entries** (50 entries):
   - Spread across last 3 months
   - Various users and matters
   - Mix of billable and non-billable

10. **Expenses** (20 expenses):
    - Filing fees, copying, travel

11. **Invoices** (10 invoices):
    - Various statuses (draft, sent, paid)

12. **Trust Accounts** (2 accounts):
    - Main IOLTA Account
    - Client Trust Account

13. **Trust Transactions** (15 transactions):
    - Deposits, disbursements

14. **Calendar Events** (20 events):
    - Court dates, meetings, deadlines
    - Next 30 days

15. **Deadlines** (15 deadlines):
    - Filing deadlines, responses
    - Various priorities

16. **Tasks** (20 tasks):
    - Various matters and assignees

17. **Contacts** (15 contacts):
    - Opposing counsel, experts, vendors

## API Endpoints

### Clients API (/api/clients)

```typescript
// GET /api/clients - List all clients with pagination, search, filters
// POST /api/clients - Create new client
// GET /api/clients/[id] - Get client by ID with matters, documents
// PUT /api/clients/[id] - Update client
// DELETE /api/clients/[id] - Soft delete client
// POST /api/clients/[id]/conflict-check - Run conflict check
```

### Matters API (/api/matters)

```typescript
// GET /api/matters - List matters with filters
// POST /api/matters - Create new matter
// GET /api/matters/[id] - Get matter with all related data
// PUT /api/matters/[id] - Update matter
// DELETE /api/matters/[id] - Close/archive matter
// GET /api/matters/[id]/timeline - Get activity timeline
// POST /api/matters/[id]/assignments - Add team member
```

### Documents API (/api/documents)

```typescript
// GET /api/documents - List documents
// POST /api/documents - Upload document
// GET /api/documents/[id] - Get document
// PUT /api/documents/[id] - Update document metadata
// DELETE /api/documents/[id] - Delete document
// GET /api/documents/[id]/download - Download file
// POST /api/documents/[id]/version - Upload new version
```

### Time Entries API (/api/time-entries)

```typescript
// GET /api/time-entries - List time entries with filters
// POST /api/time-entries - Create time entry
// PUT /api/time-entries/[id] - Update time entry
// DELETE /api/time-entries/[id] - Delete time entry
// POST /api/time-entries/bulk - Bulk operations
// GET /api/time-entries/summary - Get summary by date range
```

### Invoices API (/api/invoices)

```typescript
// GET /api/invoices - List invoices
// POST /api/invoices - Generate invoice from unbilled time/expenses
// GET /api/invoices/[id] - Get invoice with line items
// PUT /api/invoices/[id] - Update invoice
// POST /api/invoices/[id]/send - Send invoice to client
// POST /api/invoices/[id]/payment - Record payment
// GET /api/invoices/[id]/pdf - Generate PDF
```

### Trust API (/api/trust-accounts)

```typescript
// GET /api/trust-accounts - List trust accounts
// POST /api/trust-accounts - Create trust account
// GET /api/trust-accounts/[id]/ledgers - Get client ledgers
// POST /api/trust-accounts/[id]/deposit - Record deposit
// POST /api/trust-accounts/[id]/disbursement - Record disbursement
// GET /api/trust-accounts/[id]/reconciliation - Generate reconciliation
```

### Calendar API (/api/calendar)

```typescript
// GET /api/calendar/events - Get events by date range
// POST /api/calendar/events - Create event
// PUT /api/calendar/events/[id] - Update event
// DELETE /api/calendar/events/[id] - Delete event
// GET /api/calendar/sync - Sync with external calendars
```

### Deadlines API (/api/deadlines)

```typescript
// GET /api/deadlines - List deadlines
// POST /api/deadlines - Create deadline
// PUT /api/deadlines/[id] - Update deadline
// POST /api/deadlines/calculate - Calculate deadlines from rules
// GET /api/deadlines/upcoming - Get upcoming deadlines
```

### AI APIs (/api/ai/*)

```typescript
// POST /api/ai/draft-document - Draft document using AI
// POST /api/ai/legal-research - Perform legal research
// POST /api/ai/contract-review - Analyze contract
// POST /api/ai/capture-time - AI-suggested time entries
// POST /api/ai/enhance-description - Improve time entry descriptions
```

## UI Components

### Dashboard Page
- Summary cards: Open matters, unbilled time, outstanding invoices, upcoming deadlines
- Recent activity timeline
- Upcoming calendar events
- Task list
- Quick actions: New client, New matter, Timer

### Clients Page
- Data table with search, sort, filter
- Client cards view option
- Click row to view client detail
- New client button opens form modal
- Bulk actions: Export, Archive

### Client Detail Page
- Client info header with edit button
- Tabs: Overview, Matters, Documents, Billing, Communications, Timeline
- Related matters table with click to view
- Quick add matter button

### Matters Page
- Kanban or table view
- Filter by status, practice area, attorney
- Click to view matter detail
- New matter button with client selector

### Matter Detail Page
- Matter header with status badge
- Tabs: Overview, Team, Documents, Time & Billing, Calendar, Tasks, Notes
- Time entry quick add
- Document upload drag & drop
- Deadline tracker widget

### Documents Page
- File browser interface
- Folder structure by matter
- Upload button with drag & drop
- Preview panel
- Version history

### Time & Billing Page
- Time entry list with running timer
- Calendar view of time
- Unbilled time summary
- Generate invoice button
- Timer widget (always visible)

### Invoices Page
- Invoice list with status filters
- Click to view/edit invoice
- Send invoice action
- Record payment modal
- PDF preview

### Trust Accounting Page
- Account summary cards
- Client ledger list
- Transaction history
- Deposit/Disbursement buttons
- Three-way reconciliation report

### Calendar Page
- Month/Week/Day views
- Event type color coding
- Click to create event
- Drag to reschedule
- Deadline overlay

### AI Document Drafting Page
- Document type selector (dropdown populated from DB)
- Matter selector (dropdown populated from DB)
- Input fields based on document type
- Generate button
- Rich text editor for result
- Save to matter button

### AI Legal Research Page
- Research query input
- Jurisdiction selector
- Search results with citations
- Save to matter notes
- Generate memo option

### AI Contract Review Page
- Document upload/select
- Analysis results panel
- Risk score display
- Clause-by-clause breakdown
- Export report button

## Implementation Requirements

1. **All Buttons Must Work**: Every button must have a working click handler. No "Not Implemented" messages.

2. **All Dropdowns Populated**: Every dropdown must be populated from database. Use React Query or SWR for data fetching.

3. **All Forms Functional**: Every form must validate and submit correctly.

4. **Row Click Handlers**: Clicking any table row navigates to detail page.

5. **Card Click Handlers**: Clicking any card navigates to detail page.

6. **New Entry Forms**: Every "New" button opens a working form that creates database records.

7. **Delete Confirmations**: All delete actions show confirmation dialog.

8. **Loading States**: Show loading spinners during data fetch.

9. **Error Handling**: Display toast notifications for errors.

10. **Responsive Design**: Works on desktop, tablet, mobile.

## start.sh Script

```bash
#!/bin/bash

echo "Starting Small Law Firm AI..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update .env with your database credentials"
    exit 1
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Check if database is seeded
echo "Checking if database needs seeding..."
SEED_CHECK=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\"" 2>/dev/null || echo "0")
if [ "$SEED_CHECK" = "0" ] || [ -z "$SEED_CHECK" ]; then
    echo "Seeding database..."
    npx prisma db seed
fi

# Start the development server
echo "Starting Next.js development server..."
npm run dev
```

## Environment Variables (.env.example)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/small_law_firm_ai"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (for AI features)
OPENAI_API_KEY="sk-..."

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Twilio (for voice)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

# File uploads
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"
```

## Package.json Dependencies

```json
{
  "name": "small-law-firm-ai",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@prisma/client": "^5.22.0",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^5.8.4",
    "@tanstack/react-table": "^8.10.7",
    "bcryptjs": "^2.4.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "next": "14.0.3",
    "next-auth": "^4.24.5",
    "nodemailer": "^6.9.7",
    "openai": "^4.20.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.2",
    "react-big-calendar": "^1.8.5",
    "recharts": "^2.10.1",
    "stripe": "^14.5.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.9.0",
    "@types/nodemailer": "^6.4.14",
    "@types/react": "^18.2.37",
    "@types/react-big-calendar": "^1.8.6",
    "@types/react-dom": "^18.2.15",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-config-next": "14.0.3",
    "postcss": "^8.4.31",
    "prisma": "^5.22.0",
    "tailwindcss": "^3.3.5",
    "ts-node": "^10.9.1",
    "typescript": "^5.2.2"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

## Key Features to Implement

### 1. Client Intake with Conflict Check
- New client form with all fields
- Automatic conflict check on save
- Flag potential conflicts before opening matter

### 2. Matter Management
- Full lifecycle from open to close
- Team assignments with role-based billing rates
- Budget tracking
- Status workflow

### 3. Time Tracking
- Running timer in header
- Quick time entry from any page
- AI-suggested entries from calendar/email
- LEDES export

### 4. Trust Accounting
- Client ledger management
- Three-way reconciliation
- Automatic balance alerts
- Full audit trail

### 5. Calendar with Deadlines
- Court rule-based deadline calculation
- Multiple calendar views
- Reminder system
- Deadline dashboard

### 6. Document Management
- Upload with drag & drop
- Version control
- Category organization
- Full-text search

### 7. Invoicing
- Generate from unbilled time/expenses
- Multiple invoice formats
- Email delivery
- Payment tracking

### 8. AI Features
- Document drafting from templates
- Legal research assistant
- Contract analysis
- Automatic time capture

## Color Scheme

- Primary: Blue (#2563EB)
- Secondary: Slate (#64748B)
- Success: Green (#22C55E)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)
- Background: White (#FFFFFF)
- Surface: Gray (#F8FAFC)
- Text: Slate (#0F172A)

## Typography

- Headings: Inter (font-sans)
- Body: Inter (font-sans)
- Monospace: JetBrains Mono (for code/numbers)

Build this complete application with all features working, all buttons functional, all dropdowns populated from database, and comprehensive seed data.
