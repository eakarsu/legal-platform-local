import { PrismaClient, UserRole, ClientType, ClientStatus, MatterStatus, BillingType, ContactType, DocumentType, TimeEntryStatus, InvoiceStatus, TrustTransactionType, EventType, DeadlineType, DeadlineStatus, Priority, TaskStatus, CommunicationType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.auditLog.deleteMany()
  await prisma.matterNote.deleteMany()
  await prisma.conflictCheck.deleteMany()
  await prisma.communication.deleteMany()
  await prisma.eventAttendee.deleteMany()
  await prisma.calendarEvent.deleteMany()
  await prisma.deadline.deleteMany()
  await prisma.task.deleteMany()
  await prisma.trustTransaction.deleteMany()
  await prisma.trustLedger.deleteMany()
  await prisma.trustAccount.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.timeEntry.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.documentVersion.deleteMany()
  await prisma.document.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.matterAssignment.deleteMany()
  await prisma.matter.deleteMany()
  await prisma.client.deleteMany()
  await prisma.practiceArea.deleteMany()
  await prisma.activityCode.deleteMany()
  await prisma.expenseCode.deleteMany()
  await prisma.user.deleteMany()
  await prisma.firm.deleteMany()

  // 1. Create Firm
  const firm = await prisma.firm.create({
    data: {
      name: 'Smith & Associates Law Firm',
      address: '123 Legal Plaza, Suite 500',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '(212) 555-0100',
      email: 'info@smithlaw.com',
      website: 'https://www.smithlaw.com',
      timezone: 'America/New_York',
    },
  })

  console.log('Created firm:', firm.name)

  // 2. Create Users (5 users)
  const hashedPassword = await bcrypt.hash('password123', 10)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.smith@smithlaw.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Smith',
        role: UserRole.ADMIN,
        barNumber: 'NY12345',
        hourlyRate: 450,
        phone: '(212) 555-0101',
        firmId: firm.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.johnson@smithlaw.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: UserRole.ATTORNEY,
        barNumber: 'NY23456',
        hourlyRate: 275,
        phone: '(212) 555-0102',
        firmId: firm.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'michael.brown@smithlaw.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Brown',
        role: UserRole.ATTORNEY,
        barNumber: 'NY34567',
        hourlyRate: 250,
        phone: '(212) 555-0103',
        firmId: firm.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'emily.davis@smithlaw.com',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Davis',
        role: UserRole.PARALEGAL,
        hourlyRate: 125,
        phone: '(212) 555-0104',
        firmId: firm.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jessica.wilson@smithlaw.com',
        password: hashedPassword,
        firstName: 'Jessica',
        lastName: 'Wilson',
        role: UserRole.SECRETARY,
        phone: '(212) 555-0105',
        firmId: firm.id,
      },
    }),
  ])

  console.log('Created', users.length, 'users')

  // 3. Create Practice Areas (6 areas)
  const practiceAreas = await Promise.all([
    prisma.practiceArea.create({ data: { name: 'Family Law', description: 'Divorce, custody, adoption', color: '#E91E63', firmId: firm.id } }),
    prisma.practiceArea.create({ data: { name: 'Personal Injury', description: 'Auto accidents, slip and fall, medical malpractice', color: '#F44336', firmId: firm.id } }),
    prisma.practiceArea.create({ data: { name: 'Business Law', description: 'Contracts, formation, compliance', color: '#2196F3', firmId: firm.id } }),
    prisma.practiceArea.create({ data: { name: 'Estate Planning', description: 'Wills, trusts, probate', color: '#4CAF50', firmId: firm.id } }),
    prisma.practiceArea.create({ data: { name: 'Criminal Defense', description: 'Misdemeanors, felonies, DUI', color: '#9C27B0', firmId: firm.id } }),
    prisma.practiceArea.create({ data: { name: 'Real Estate', description: 'Residential, commercial transactions', color: '#FF9800', firmId: firm.id } }),
  ])

  console.log('Created', practiceAreas.length, 'practice areas')

  // 4. Create Activity Codes (UTBMS codes)
  const activityCodes = await Promise.all([
    prisma.activityCode.create({ data: { code: 'A101', name: 'Plan and prepare for trial', category: 'Litigation', firmId: firm.id } }),
    prisma.activityCode.create({ data: { code: 'A102', name: 'Written discovery', category: 'Discovery', firmId: firm.id } }),
    prisma.activityCode.create({ data: { code: 'A103', name: 'Document review', category: 'Discovery', firmId: firm.id } }),
    prisma.activityCode.create({ data: { code: 'A104', name: 'Depositions', category: 'Discovery', firmId: firm.id } }),
    prisma.activityCode.create({ data: { code: 'A105', name: 'Court appearances', category: 'Litigation', firmId: firm.id } }),
    prisma.activityCode.create({ data: { code: 'A106', name: 'Research', category: 'General', firmId: firm.id } }),
    prisma.activityCode.create({ data: { code: 'A107', name: 'Draft pleadings', category: 'Litigation', firmId: firm.id } }),
    prisma.activityCode.create({ data: { code: 'A108', name: 'Client communications', category: 'General', firmId: firm.id } }),
    prisma.activityCode.create({ data: { code: 'A109', name: 'Internal conferences', category: 'General', firmId: firm.id } }),
    prisma.activityCode.create({ data: { code: 'A110', name: 'Negotiations', category: 'General', firmId: firm.id } }),
  ])

  console.log('Created', activityCodes.length, 'activity codes')

  // 5. Create Expense Codes
  const expenseCodes = await Promise.all([
    prisma.expenseCode.create({ data: { code: 'E101', name: 'Filing fees', firmId: firm.id } }),
    prisma.expenseCode.create({ data: { code: 'E102', name: 'Service of process', firmId: firm.id } }),
    prisma.expenseCode.create({ data: { code: 'E103', name: 'Court reporter fees', firmId: firm.id } }),
    prisma.expenseCode.create({ data: { code: 'E104', name: 'Expert witness fees', firmId: firm.id } }),
    prisma.expenseCode.create({ data: { code: 'E105', name: 'Copying/printing', firmId: firm.id } }),
    prisma.expenseCode.create({ data: { code: 'E106', name: 'Postage/delivery', firmId: firm.id } }),
    prisma.expenseCode.create({ data: { code: 'E107', name: 'Travel expenses', firmId: firm.id } }),
  ])

  console.log('Created', expenseCodes.length, 'expense codes')

  // 6. Create Clients (15 clients)
  const clients = await Promise.all([
    // Individuals
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-001',
        type: ClientType.INDIVIDUAL,
        status: ClientStatus.ACTIVE,
        displayName: 'Robert Anderson',
        firstName: 'Robert',
        lastName: 'Anderson',
        email: 'robert.anderson@email.com',
        phone: '(212) 555-1001',
        mobile: '(917) 555-1001',
        address: '456 Park Avenue',
        city: 'New York',
        state: 'NY',
        zip: '10022',
        referralSource: 'Website',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-002',
        type: ClientType.INDIVIDUAL,
        status: ClientStatus.ACTIVE,
        displayName: 'Maria Garcia',
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@email.com',
        phone: '(212) 555-1002',
        address: '789 Broadway',
        city: 'New York',
        state: 'NY',
        zip: '10003',
        referralSource: 'Referral',
        referredBy: 'Robert Anderson',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-003',
        type: ClientType.INDIVIDUAL,
        status: ClientStatus.ACTIVE,
        displayName: 'James Wilson',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@email.com',
        phone: '(718) 555-1003',
        address: '321 Atlantic Ave',
        city: 'Brooklyn',
        state: 'NY',
        zip: '11201',
        referralSource: 'Bar Association',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-004',
        type: ClientType.INDIVIDUAL,
        status: ClientStatus.ACTIVE,
        displayName: 'Jennifer Martinez',
        firstName: 'Jennifer',
        lastName: 'Martinez',
        email: 'jennifer.martinez@email.com',
        phone: '(212) 555-1004',
        address: '555 Fifth Avenue',
        city: 'New York',
        state: 'NY',
        zip: '10017',
        referralSource: 'Google Search',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-005',
        type: ClientType.INDIVIDUAL,
        status: ClientStatus.PROSPECT,
        displayName: 'David Thompson',
        firstName: 'David',
        lastName: 'Thompson',
        email: 'david.thompson@email.com',
        phone: '(917) 555-1005',
        address: '888 Madison Avenue',
        city: 'New York',
        state: 'NY',
        zip: '10021',
        referralSource: 'Social Media',
        firmId: firm.id,
      },
    }),
    // Businesses
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-006',
        type: ClientType.BUSINESS,
        status: ClientStatus.ACTIVE,
        displayName: 'Tech Innovations LLC',
        companyName: 'Tech Innovations LLC',
        email: 'legal@techinnovations.com',
        phone: '(212) 555-2001',
        address: '100 Technology Drive',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        billingContact: 'Sarah Chen',
        billingEmail: 'billing@techinnovations.com',
        referralSource: 'LinkedIn',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-007',
        type: ClientType.BUSINESS,
        status: ClientStatus.ACTIVE,
        displayName: 'Manhattan Properties Inc.',
        companyName: 'Manhattan Properties Inc.',
        email: 'legal@manhattanproperties.com',
        phone: '(212) 555-2002',
        address: '200 Real Estate Plaza',
        city: 'New York',
        state: 'NY',
        zip: '10007',
        billingContact: 'Michael Ross',
        referralSource: 'Referral',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-008',
        type: ClientType.BUSINESS,
        status: ClientStatus.ACTIVE,
        displayName: 'Green Energy Solutions',
        companyName: 'Green Energy Solutions',
        email: 'legal@greenenergy.com',
        phone: '(212) 555-2003',
        address: '300 Sustainable Way',
        city: 'New York',
        state: 'NY',
        zip: '10012',
        referralSource: 'Conference',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-009',
        type: ClientType.NONPROFIT,
        status: ClientStatus.ACTIVE,
        displayName: 'Community Legal Aid Foundation',
        companyName: 'Community Legal Aid Foundation',
        email: 'director@communitylegalaid.org',
        phone: '(212) 555-3001',
        address: '400 Charity Lane',
        city: 'New York',
        state: 'NY',
        zip: '10002',
        referralSource: 'Pro Bono Network',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-010',
        type: ClientType.INDIVIDUAL,
        status: ClientStatus.INACTIVE,
        displayName: 'Patricia Lee',
        firstName: 'Patricia',
        lastName: 'Lee',
        email: 'patricia.lee@email.com',
        phone: '(212) 555-1010',
        address: '999 Lexington Avenue',
        city: 'New York',
        state: 'NY',
        zip: '10065',
        referralSource: 'Former Client',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-011',
        type: ClientType.INDIVIDUAL,
        status: ClientStatus.ACTIVE,
        displayName: 'Anthony Russo',
        firstName: 'Anthony',
        lastName: 'Russo',
        email: 'anthony.russo@email.com',
        phone: '(718) 555-1011',
        mobile: '(917) 555-1011',
        address: '45 Court Street',
        city: 'Brooklyn',
        state: 'NY',
        zip: '11201',
        referralSource: 'Referral',
        referredBy: 'James Wilson',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-012',
        type: ClientType.BUSINESS,
        status: ClientStatus.ACTIVE,
        displayName: 'Brooklyn Brewing Co.',
        companyName: 'Brooklyn Brewing Co.',
        email: 'legal@brooklynbrewing.com',
        phone: '(718) 555-2004',
        address: '150 Wythe Avenue',
        city: 'Brooklyn',
        state: 'NY',
        zip: '11249',
        billingContact: 'Daniel O\'Brien',
        billingEmail: 'billing@brooklynbrewing.com',
        referralSource: 'Website',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-013',
        type: ClientType.INDIVIDUAL,
        status: ClientStatus.PROSPECT,
        displayName: 'Samantha Nguyen',
        firstName: 'Samantha',
        lastName: 'Nguyen',
        email: 'samantha.nguyen@email.com',
        phone: '(347) 555-1013',
        address: '88 Queens Boulevard',
        city: 'Queens',
        state: 'NY',
        zip: '11373',
        referralSource: 'Google Search',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-014',
        type: ClientType.BUSINESS,
        status: ClientStatus.PROSPECT,
        displayName: 'Harlem Renaissance Gallery LLC',
        companyName: 'Harlem Renaissance Gallery LLC',
        email: 'info@harlemgallery.com',
        phone: '(212) 555-2005',
        address: '275 Lenox Avenue',
        city: 'New York',
        state: 'NY',
        zip: '10027',
        billingContact: 'Marcus Washington',
        referralSource: 'Social Media',
        firmId: firm.id,
      },
    }),
    prisma.client.create({
      data: {
        clientNumber: 'C-2024-015',
        type: ClientType.INDIVIDUAL,
        status: ClientStatus.ACTIVE,
        displayName: 'Frank DiMaggio',
        firstName: 'Frank',
        lastName: 'DiMaggio',
        email: 'frank.dimaggio@email.com',
        phone: '(718) 555-1015',
        mobile: '(917) 555-1015',
        address: '320 Victory Boulevard',
        city: 'Staten Island',
        state: 'NY',
        zip: '10301',
        referralSource: 'Bar Association',
        firmId: firm.id,
      },
    }),
  ])

  console.log('Created', clients.length, 'clients')

  // 7. Create Matters (15 matters)
  const matters = await Promise.all([
    // Family Law matters
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-001',
        title: 'Anderson Divorce',
        name: 'Anderson Divorce',
        description: 'Contested divorce with property division and custody issues',
        status: MatterStatus.OPEN,
        practiceAreaId: practiceAreas[0].id,
        billingType: BillingType.HOURLY,
        budgetAmount: 25000,
        courtName: 'NY Supreme Court - Family Division',
        caseNumber: '2024-FAM-0123',
        judgeName: 'Hon. Patricia Williams',
        jurisdiction: 'New York County',
        clientId: clients[0].id,
        firmId: firm.id,
      },
    }),
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-002',
        title: 'Garcia Custody Modification',
        name: 'Garcia Custody Modification',
        description: 'Modification of existing custody arrangement',
        status: MatterStatus.OPEN,
        practiceAreaId: practiceAreas[0].id,
        billingType: BillingType.HOURLY,
        budgetAmount: 10000,
        courtName: 'NY Family Court',
        caseNumber: '2024-CUS-0456',
        clientId: clients[1].id,
        firmId: firm.id,
      },
    }),
    // Personal Injury matters
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-003',
        title: 'Wilson v. Metro Transit',
        name: 'Wilson v. Metro Transit',
        description: 'Personal injury - bus accident resulting in back injury',
        status: MatterStatus.OPEN,
        practiceAreaId: practiceAreas[1].id,
        billingType: BillingType.CONTINGENCY,
        contingencyPct: 33.33,
        courtName: 'NY Supreme Court',
        caseNumber: '2024-PI-0789',
        judgeName: 'Hon. Robert Chen',
        jurisdiction: 'Kings County',
        clientId: clients[2].id,
        firmId: firm.id,
      },
    }),
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-004',
        title: 'Martinez Slip & Fall',
        name: 'Martinez Slip & Fall',
        description: 'Premises liability - slip and fall at retail store',
        status: MatterStatus.PENDING,
        practiceAreaId: practiceAreas[1].id,
        billingType: BillingType.CONTINGENCY,
        contingencyPct: 33.33,
        statuteOfLimitations: new Date('2027-06-15'),
        clientId: clients[3].id,
        firmId: firm.id,
      },
    }),
    // Business Law matters
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-005',
        title: 'Tech Innovations - Series A Financing',
        name: 'Tech Innovations - Series A Financing',
        description: 'Venture capital financing documentation and negotiation',
        status: MatterStatus.OPEN,
        practiceAreaId: practiceAreas[2].id,
        billingType: BillingType.HOURLY,
        budgetAmount: 50000,
        retainerAmount: 15000,
        clientId: clients[5].id,
        firmId: firm.id,
      },
    }),
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-006',
        title: 'Tech Innovations - Employment Agreements',
        name: 'Tech Innovations - Employment Agreements',
        description: 'Drafting executive employment and equity agreements',
        status: MatterStatus.OPEN,
        practiceAreaId: practiceAreas[2].id,
        billingType: BillingType.FLAT_FEE,
        flatFee: 7500,
        clientId: clients[5].id,
        firmId: firm.id,
      },
    }),
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-007',
        title: 'Manhattan Properties - Commercial Lease Dispute',
        name: 'Manhattan Properties - Commercial Lease Dispute',
        description: 'Dispute with commercial tenant over lease terms',
        status: MatterStatus.OPEN,
        practiceAreaId: practiceAreas[2].id,
        billingType: BillingType.HOURLY,
        budgetAmount: 30000,
        courtName: 'NY Civil Court',
        caseNumber: '2024-CIV-0321',
        clientId: clients[6].id,
        firmId: firm.id,
      },
    }),
    // Estate Planning matters
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-008',
        title: 'Anderson Estate Plan',
        name: 'Anderson Estate Plan',
        description: 'Comprehensive estate planning including will, trust, and POA',
        status: MatterStatus.OPEN,
        practiceAreaId: practiceAreas[3].id,
        billingType: BillingType.FLAT_FEE,
        flatFee: 5000,
        clientId: clients[0].id,
        firmId: firm.id,
      },
    }),
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-009',
        title: 'Lee Probate Administration',
        name: 'Lee Probate Administration',
        description: 'Probate of estate and distribution to heirs',
        status: MatterStatus.CLOSED,
        practiceAreaId: practiceAreas[3].id,
        billingType: BillingType.HOURLY,
        openDate: new Date('2024-01-15'),
        closeDate: new Date('2024-09-30'),
        clientId: clients[9].id,
        firmId: firm.id,
      },
    }),
    // Criminal Defense matters
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-010',
        title: 'Thompson DUI Defense',
        name: 'Thompson DUI Defense',
        description: 'First offense DUI defense',
        status: MatterStatus.OPEN,
        practiceAreaId: practiceAreas[4].id,
        billingType: BillingType.FLAT_FEE,
        flatFee: 7500,
        retainerAmount: 5000,
        courtName: 'NY Criminal Court',
        caseNumber: '2024-CR-0567',
        judgeName: 'Hon. Maria Santos',
        jurisdiction: 'New York County',
        clientId: clients[4].id,
        firmId: firm.id,
      },
    }),
    // Real Estate matters
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-011',
        title: 'Manhattan Properties - 500 Broadway Acquisition',
        name: 'Manhattan Properties - 500 Broadway Acquisition',
        description: 'Commercial property acquisition and due diligence',
        status: MatterStatus.OPEN,
        practiceAreaId: practiceAreas[5].id,
        billingType: BillingType.HOURLY,
        budgetAmount: 75000,
        clientId: clients[6].id,
        firmId: firm.id,
      },
    }),
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-012',
        title: 'Garcia Home Purchase',
        name: 'Garcia Home Purchase',
        description: 'Residential real estate closing',
        status: MatterStatus.PENDING,
        practiceAreaId: practiceAreas[5].id,
        billingType: BillingType.FLAT_FEE,
        flatFee: 2500,
        clientId: clients[1].id,
        firmId: firm.id,
      },
    }),
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-013',
        title: 'Green Energy - Lease Negotiations',
        name: 'Green Energy - Lease Negotiations',
        description: 'Commercial lease negotiation for new headquarters',
        status: MatterStatus.OPEN,
        practiceAreaId: practiceAreas[5].id,
        billingType: BillingType.HOURLY,
        budgetAmount: 20000,
        clientId: clients[7].id,
        firmId: firm.id,
      },
    }),
    // Pro Bono
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-014',
        title: 'Community Legal Aid - Immigration Cases',
        name: 'Community Legal Aid - Immigration Cases',
        description: 'Pro bono immigration assistance',
        status: MatterStatus.OPEN,
        practiceAreaId: practiceAreas[0].id,
        billingType: BillingType.PRO_BONO,
        clientId: clients[8].id,
        firmId: firm.id,
      },
    }),
    prisma.matter.create({
      data: {
        matterNumber: 'M-2024-015',
        title: 'Wilson Workers Comp',
        name: 'Wilson Workers Comp',
        description: 'Workers compensation claim',
        status: MatterStatus.ON_HOLD,
        practiceAreaId: practiceAreas[1].id,
        billingType: BillingType.CONTINGENCY,
        contingencyPct: 25,
        clientId: clients[2].id,
        firmId: firm.id,
      },
    }),
  ])

  console.log('Created', matters.length, 'matters')

  // 8. Create Matter Assignments
  await Promise.all([
    // Matter 1 - Anderson Divorce
    prisma.matterAssignment.create({ data: { matterId: matters[0].id, userId: users[0].id, role: 'Lead Attorney', hourlyRate: 450 } }),
    prisma.matterAssignment.create({ data: { matterId: matters[0].id, userId: users[3].id, role: 'Paralegal', hourlyRate: 125 } }),
    // Matter 3 - Wilson PI
    prisma.matterAssignment.create({ data: { matterId: matters[2].id, userId: users[1].id, role: 'Lead Attorney', hourlyRate: 275 } }),
    prisma.matterAssignment.create({ data: { matterId: matters[2].id, userId: users[2].id, role: 'Associate', hourlyRate: 250 } }),
    // Matter 5 - Tech Innovations Financing
    prisma.matterAssignment.create({ data: { matterId: matters[4].id, userId: users[0].id, role: 'Lead Attorney', hourlyRate: 450 } }),
    prisma.matterAssignment.create({ data: { matterId: matters[4].id, userId: users[1].id, role: 'Associate', hourlyRate: 275 } }),
  ])

  console.log('Created matter assignments')

  // 9. Create Time Entries (50 entries over last 3 months)
  const timeEntries = []
  const today = new Date()

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 90)
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)

    const matter = matters[Math.floor(Math.random() * matters.length)]
    const user = users[Math.floor(Math.random() * 4)] // Exclude secretary
    const activityCode = activityCodes[Math.floor(Math.random() * activityCodes.length)]
    const hours = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4][Math.floor(Math.random() * 9)]
    const rate = Number(user.hourlyRate) || 200
    const billable = Math.random() > 0.1

    const descriptions = [
      'Reviewed and analyzed documents',
      'Client telephone conference',
      'Legal research on applicable statutes',
      'Drafted correspondence',
      'Prepared court filing',
      'Attended court hearing',
      'Deposition preparation',
      'Internal case strategy meeting',
      'Document review and analysis',
      'Contract negotiation call',
    ]

    timeEntries.push({
      date,
      hours,
      rate,
      amount: hours * rate,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      billable,
      billed: Math.random() > 0.7,
      status: TimeEntryStatus.APPROVED,
      matterId: matter.id,
      userId: user.id,
      activityCodeId: activityCode.id,
      firmId: firm.id,
    })
  }

  await prisma.timeEntry.createMany({ data: timeEntries })
  console.log('Created', timeEntries.length, 'time entries')

  // 10. Create Expenses (20 expenses)
  const expenses = []

  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 90)
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)

    const matter = matters[Math.floor(Math.random() * matters.length)]
    const expenseCode = expenseCodes[Math.floor(Math.random() * expenseCodes.length)]
    const amounts = [25, 50, 75, 100, 150, 250, 500, 750, 1000, 2500]

    expenses.push({
      date,
      amount: amounts[Math.floor(Math.random() * amounts.length)],
      description: expenseCode.name,
      vendor: ['ABC Filing Service', 'Metro Courier', 'Legal Copy Center', 'Expert Consultants Inc.'][Math.floor(Math.random() * 4)],
      billable: true,
      billed: Math.random() > 0.6,
      matterId: matter.id,
      expenseCodeId: expenseCode.id,
    })
  }

  await prisma.expense.createMany({ data: expenses })
  console.log('Created', expenses.length, 'expenses')

  // 11. Create Invoices (15 invoices)
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-001',
        status: InvoiceStatus.PAID,
        issueDate: new Date('2024-09-01'),
        dueDate: new Date('2024-10-01'),
        paidDate: new Date('2024-09-25'),
        subtotal: 12500,
        taxAmount: 0,
        totalAmount: 12500,
        paidAmount: 12500,
        balanceDue: 0,
        matterId: matters[0].id,
        createdById: users[0].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-002',
        status: InvoiceStatus.PAID,
        issueDate: new Date('2024-09-15'),
        dueDate: new Date('2024-10-15'),
        paidDate: new Date('2024-10-10'),
        subtotal: 8750,
        taxAmount: 0,
        totalAmount: 8750,
        paidAmount: 8750,
        balanceDue: 0,
        matterId: matters[4].id,
        createdById: users[0].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-003',
        status: InvoiceStatus.SENT,
        issueDate: new Date('2024-10-01'),
        dueDate: new Date('2024-11-01'),
        subtotal: 15000,
        taxAmount: 0,
        totalAmount: 15000,
        paidAmount: 0,
        balanceDue: 15000,
        matterId: matters[6].id,
        createdById: users[0].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-004',
        status: InvoiceStatus.PARTIAL,
        issueDate: new Date('2024-10-15'),
        dueDate: new Date('2024-11-15'),
        subtotal: 10000,
        taxAmount: 0,
        totalAmount: 10000,
        paidAmount: 5000,
        balanceDue: 5000,
        matterId: matters[10].id,
        createdById: users[0].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-005',
        status: InvoiceStatus.OVERDUE,
        issueDate: new Date('2024-08-01'),
        dueDate: new Date('2024-09-01'),
        subtotal: 7500,
        taxAmount: 0,
        totalAmount: 7500,
        paidAmount: 0,
        balanceDue: 7500,
        matterId: matters[1].id,
        createdById: users[1].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-006',
        status: InvoiceStatus.DRAFT,
        issueDate: new Date(),
        dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 5500,
        taxAmount: 0,
        totalAmount: 5500,
        paidAmount: 0,
        balanceDue: 5500,
        matterId: matters[4].id,
        createdById: users[0].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-007',
        status: InvoiceStatus.PAID,
        issueDate: new Date('2024-07-15'),
        dueDate: new Date('2024-08-15'),
        paidDate: new Date('2024-08-10'),
        subtotal: 5000,
        taxAmount: 0,
        totalAmount: 5000,
        paidAmount: 5000,
        balanceDue: 0,
        matterId: matters[7].id,
        createdById: users[0].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-008',
        status: InvoiceStatus.SENT,
        issueDate: new Date('2024-11-01'),
        dueDate: new Date('2024-12-01'),
        subtotal: 3500,
        taxAmount: 0,
        totalAmount: 3500,
        paidAmount: 0,
        balanceDue: 3500,
        matterId: matters[12].id,
        createdById: users[1].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-009',
        status: InvoiceStatus.PAID,
        issueDate: new Date('2024-06-01'),
        dueDate: new Date('2024-07-01'),
        paidDate: new Date('2024-06-28'),
        subtotal: 2500,
        taxAmount: 0,
        totalAmount: 2500,
        paidAmount: 2500,
        balanceDue: 0,
        matterId: matters[11].id,
        createdById: users[0].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-010',
        status: InvoiceStatus.VOID,
        issueDate: new Date('2024-05-01'),
        dueDate: new Date('2024-06-01'),
        subtotal: 1500,
        taxAmount: 0,
        totalAmount: 1500,
        paidAmount: 0,
        balanceDue: 0,
        matterId: matters[8].id,
        createdById: users[0].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-011',
        status: InvoiceStatus.DRAFT,
        issueDate: new Date(),
        dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 4200,
        taxAmount: 0,
        totalAmount: 4200,
        paidAmount: 0,
        balanceDue: 4200,
        matterId: matters[2].id,
        createdById: users[1].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-012',
        status: InvoiceStatus.SENT,
        issueDate: new Date('2024-11-15'),
        dueDate: new Date('2024-12-15'),
        subtotal: 18500,
        taxAmount: 0,
        totalAmount: 18500,
        paidAmount: 0,
        balanceDue: 18500,
        matterId: matters[9].id,
        createdById: users[0].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-013',
        status: InvoiceStatus.PAID,
        issueDate: new Date('2024-10-01'),
        dueDate: new Date('2024-11-01'),
        paidDate: new Date('2024-10-28'),
        subtotal: 7500,
        taxAmount: 0,
        totalAmount: 7500,
        paidAmount: 7500,
        balanceDue: 0,
        matterId: matters[5].id,
        createdById: users[0].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-014',
        status: InvoiceStatus.OVERDUE,
        issueDate: new Date('2024-09-01'),
        dueDate: new Date('2024-10-01'),
        subtotal: 6000,
        taxAmount: 0,
        totalAmount: 6000,
        paidAmount: 0,
        balanceDue: 6000,
        matterId: matters[3].id,
        createdById: users[1].id,
        firmId: firm.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-015',
        status: InvoiceStatus.PARTIAL,
        issueDate: new Date('2024-11-01'),
        dueDate: new Date('2024-12-01'),
        subtotal: 22000,
        taxAmount: 0,
        totalAmount: 22000,
        paidAmount: 8000,
        balanceDue: 14000,
        matterId: matters[14].id,
        createdById: users[0].id,
        firmId: firm.id,
      },
    }),
  ])

  console.log('Created', invoices.length, 'invoices')

  // 12. Create Payments
  await Promise.all([
    prisma.payment.create({ data: { amount: 12500, paymentMethod: 'CHECK', reference: 'CHK-12345', invoiceId: invoices[0].id, firmId: firm.id, recordedById: users[0].id } }),
    prisma.payment.create({ data: { amount: 8750, paymentMethod: 'ACH', reference: 'ACH-67890', invoiceId: invoices[1].id, firmId: firm.id, recordedById: users[0].id } }),
    prisma.payment.create({ data: { amount: 5000, paymentMethod: 'CREDIT_CARD', reference: 'CC-11111', invoiceId: invoices[3].id, firmId: firm.id, recordedById: users[0].id } }),
    prisma.payment.create({ data: { amount: 5000, paymentMethod: 'WIRE', reference: 'WIRE-22222', invoiceId: invoices[6].id, firmId: firm.id, recordedById: users[0].id } }),
    prisma.payment.create({ data: { amount: 2500, paymentMethod: 'CHECK', reference: 'CHK-33333', invoiceId: invoices[8].id, firmId: firm.id, recordedById: users[0].id } }),
  ])

  console.log('Created payments')

  // 13. Create Trust Accounts (2 accounts)
  const trustAccounts = await Promise.all([
    prisma.trustAccount.create({
      data: {
        name: 'Main IOLTA Account',
        accountNumber: '****4567',
        bankName: 'First National Bank',
        routingNumber: '021000021',
        balance: 125000,
        isIOLTA: true,
        firmId: firm.id,
      },
    }),
    prisma.trustAccount.create({
      data: {
        name: 'Client Trust Account',
        accountNumber: '****8901',
        bankName: 'First National Bank',
        routingNumber: '021000021',
        balance: 75000,
        isIOLTA: false,
        firmId: firm.id,
      },
    }),
  ])

  console.log('Created', trustAccounts.length, 'trust accounts')

  // 14. Create Trust Ledgers and Transactions
  const ledger1 = await prisma.trustLedger.create({
    data: {
      balance: 15000,
      clientId: clients[0].id,
      matterId: matters[0].id,
      trustAccountId: trustAccounts[0].id,
    },
  })

  const ledger2 = await prisma.trustLedger.create({
    data: {
      balance: 25000,
      clientId: clients[5].id,
      matterId: matters[4].id,
      trustAccountId: trustAccounts[0].id,
    },
  })

  const ledger3 = await prisma.trustLedger.create({
    data: {
      balance: 10000,
      clientId: clients[6].id,
      matterId: matters[6].id,
      trustAccountId: trustAccounts[1].id,
    },
  })

  // Trust Transactions (20+ transactions)
  await Promise.all([
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DEPOSIT, amount: 25000, runningBalance: 25000, description: 'Initial retainer deposit', reference: 'DEP-001', trustAccountId: trustAccounts[0].id, ledgerId: ledger1.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DISBURSEMENT, amount: 5000, runningBalance: 20000, description: 'Filing fees payment', reference: 'CHK-1001', trustAccountId: trustAccounts[0].id, ledgerId: ledger1.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DISBURSEMENT, amount: 5000, runningBalance: 15000, description: 'Expert witness fee', reference: 'CHK-1002', trustAccountId: trustAccounts[0].id, ledgerId: ledger1.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DEPOSIT, amount: 50000, runningBalance: 50000, description: 'Series A retainer', reference: 'WIRE-001', trustAccountId: trustAccounts[0].id, ledgerId: ledger2.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DISBURSEMENT, amount: 15000, runningBalance: 35000, description: 'Legal fees - September', reference: 'TRF-001', trustAccountId: trustAccounts[0].id, ledgerId: ledger2.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DISBURSEMENT, amount: 10000, runningBalance: 25000, description: 'Legal fees - October', reference: 'TRF-002', trustAccountId: trustAccounts[0].id, ledgerId: ledger2.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DEPOSIT, amount: 20000, runningBalance: 20000, description: 'Retainer deposit', reference: 'CHK-2001', trustAccountId: trustAccounts[1].id, ledgerId: ledger3.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DISBURSEMENT, amount: 7500, runningBalance: 12500, description: 'September fees', reference: 'TRF-003', trustAccountId: trustAccounts[1].id, ledgerId: ledger3.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DISBURSEMENT, amount: 2500, runningBalance: 10000, description: 'Court costs', reference: 'CHK-2002', trustAccountId: trustAccounts[1].id, ledgerId: ledger3.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.INTEREST, amount: 125, runningBalance: 15125, description: 'Monthly interest', trustAccountId: trustAccounts[0].id, ledgerId: ledger1.id } }),
    // Additional trust transactions
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DEPOSIT, amount: 10000, runningBalance: 25125, description: 'Additional retainer', reference: 'DEP-002', trustAccountId: trustAccounts[0].id, ledgerId: ledger1.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DISBURSEMENT, amount: 3500, runningBalance: 21625, description: 'Deposition costs', reference: 'CHK-1003', trustAccountId: trustAccounts[0].id, ledgerId: ledger1.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DEPOSIT, amount: 15000, runningBalance: 40000, description: 'Supplemental retainer', reference: 'WIRE-002', trustAccountId: trustAccounts[0].id, ledgerId: ledger2.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DISBURSEMENT, amount: 8000, runningBalance: 32000, description: 'Legal fees - November', reference: 'TRF-004', trustAccountId: trustAccounts[0].id, ledgerId: ledger2.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DEPOSIT, amount: 5000, runningBalance: 15000, description: 'Cost advance', reference: 'CHK-2003', trustAccountId: trustAccounts[1].id, ledgerId: ledger3.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DISBURSEMENT, amount: 1200, runningBalance: 13800, description: 'Process server fees', reference: 'CHK-2004', trustAccountId: trustAccounts[1].id, ledgerId: ledger3.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.INTEREST, amount: 75, runningBalance: 13875, description: 'Quarterly interest', trustAccountId: trustAccounts[1].id, ledgerId: ledger3.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DISBURSEMENT, amount: 4500, runningBalance: 27500, description: 'Mediation costs', reference: 'CHK-1004', trustAccountId: trustAccounts[0].id, ledgerId: ledger2.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DEPOSIT, amount: 30000, runningBalance: 57500, description: 'Settlement advance', reference: 'WIRE-003', trustAccountId: trustAccounts[0].id, ledgerId: ledger2.id } }),
    prisma.trustTransaction.create({ data: { type: TrustTransactionType.DISBURSEMENT, amount: 2000, runningBalance: 19625, description: 'Court reporter fees', reference: 'CHK-1005', trustAccountId: trustAccounts[0].id, ledgerId: ledger1.id } }),
  ])

  console.log('Created trust transactions')

  // 15. Create Calendar Events (20 events in next 30 days)
  const events = []
  const eventTypes = [
    { type: EventType.MEETING, titles: ['Client meeting', 'Team meeting', 'Strategy session'] },
    { type: EventType.COURT_DATE, titles: ['Court hearing', 'Motion hearing', 'Status conference'] },
    { type: EventType.DEPOSITION, titles: ['Deposition of plaintiff', 'Deposition of defendant', 'Expert deposition'] },
    { type: EventType.DEADLINE, titles: ['Filing deadline', 'Response deadline', 'Discovery deadline'] },
  ]

  for (let i = 0; i < 20; i++) {
    const daysFromNow = Math.floor(Math.random() * 30)
    const startHour = 9 + Math.floor(Math.random() * 8)
    const startTime = new Date(today)
    startTime.setDate(startTime.getDate() + daysFromNow)
    startTime.setHours(startHour, 0, 0, 0)

    const endTime = new Date(startTime)
    endTime.setHours(startHour + 1)

    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const matter = Math.random() > 0.3 ? matters[Math.floor(Math.random() * matters.length)] : null
    const user = users[Math.floor(Math.random() * 4)]

    events.push({
      title: eventType.titles[Math.floor(Math.random() * eventType.titles.length)],
      description: matter ? `Related to ${matter.name}` : 'General firm business',
      type: eventType.type,
      location: eventType.type === EventType.COURT_DATE ? 'NY Supreme Court' : '123 Legal Plaza, Suite 500',
      startTime,
      endTime,
      matterId: matter?.id,
      userId: user.id,
      firmId: firm.id,
    })
  }

  await prisma.calendarEvent.createMany({ data: events })
  console.log('Created', events.length, 'calendar events')

  // 16. Create Deadlines (15 deadlines)
  const deadlines = []
  const deadlineTypes = [
    { type: DeadlineType.FILING, titles: ['File motion for summary judgment', 'File answer to complaint', 'File amended complaint'] },
    { type: DeadlineType.RESPONSE, titles: ['Response to discovery', 'Response to motion', 'Opposition brief due'] },
    { type: DeadlineType.DISCOVERY, titles: ['Produce documents', 'Serve interrogatories', 'Complete depositions'] },
    { type: DeadlineType.MOTION, titles: ['Motion to compel', 'Motion for extension', 'Motion in limine'] },
  ]

  for (let i = 0; i < 15; i++) {
    const daysFromNow = Math.floor(Math.random() * 60) - 10 // Some past, some future
    const dueDate = new Date(today)
    dueDate.setDate(dueDate.getDate() + daysFromNow)

    const deadlineType = deadlineTypes[Math.floor(Math.random() * deadlineTypes.length)]
    const matter = matters[Math.floor(Math.random() * matters.length)]
    const priorities = [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL]
    const status = daysFromNow < 0
      ? (Math.random() > 0.3 ? DeadlineStatus.COMPLETED : DeadlineStatus.MISSED)
      : DeadlineStatus.PENDING

    deadlines.push({
      title: deadlineType.titles[Math.floor(Math.random() * deadlineType.titles.length)],
      description: `Deadline for ${matter.name}`,
      dueDate,
      type: deadlineType.type,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status,
      completedAt: status === DeadlineStatus.COMPLETED ? dueDate : null,
      matterId: matter.id,
      firmId: firm.id,
    })
  }

  await prisma.deadline.createMany({ data: deadlines })
  console.log('Created', deadlines.length, 'deadlines')

  // 17. Create Tasks (20 tasks)
  const tasks = []
  const taskTitles = [
    'Review contract draft',
    'Prepare discovery responses',
    'Schedule client meeting',
    'Draft settlement proposal',
    'Research case law',
    'Prepare trial exhibits',
    'Review billing entries',
    'Update case file',
    'Send engagement letter',
    'Follow up with expert',
  ]

  for (let i = 0; i < 20; i++) {
    const daysFromNow = Math.floor(Math.random() * 30) - 5
    const dueDate = new Date(today)
    dueDate.setDate(dueDate.getDate() + daysFromNow)

    const matter = Math.random() > 0.2 ? matters[Math.floor(Math.random() * matters.length)] : null
    const assignee = users[Math.floor(Math.random() * 4)]
    const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    tasks.push({
      title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
      description: matter ? `Task for ${matter.name}` : 'General firm task',
      priority: [Priority.LOW, Priority.MEDIUM, Priority.HIGH][Math.floor(Math.random() * 3)],
      status,
      dueDate,
      completedAt: status === TaskStatus.COMPLETED ? new Date() : null,
      matterId: matter?.id,
      assignedToId: assignee.id,
    })
  }

  await prisma.task.createMany({ data: tasks })
  console.log('Created', tasks.length, 'tasks')

  // 18. Create Contacts (15 contacts)
  const contacts = await Promise.all([
    // Opposing Counsel
    prisma.contact.create({ data: { type: ContactType.OPPOSING_COUNSEL, firstName: 'Thomas', lastName: 'Reynolds', title: 'Partner', company: 'Reynolds & Associates', email: 'treynolds@reynoldslaw.com', phone: '(212) 555-3001', clientId: clients[0].id, firmId: firm.id } }),
    prisma.contact.create({ data: { type: ContactType.OPPOSING_COUNSEL, firstName: 'Amanda', lastName: 'Sterling', title: 'Senior Associate', company: 'Sterling Law Group', email: 'asterling@sterlinglaw.com', phone: '(212) 555-3002', clientId: clients[2].id, firmId: firm.id } }),
    prisma.contact.create({ data: { type: ContactType.OPPOSING_COUNSEL, firstName: 'Marcus', lastName: 'Webb', title: 'Partner', company: 'Webb & Partners', email: 'mwebb@webblaw.com', phone: '(718) 555-3003', clientId: clients[6].id, firmId: firm.id } }),
    // Court Contacts
    prisma.contact.create({ data: { type: ContactType.COURT_CONTACT, firstName: 'Patricia', lastName: 'Williams', title: 'Judge', company: 'NY Supreme Court', phone: '(212) 555-4001', firmId: firm.id } }),
    prisma.contact.create({ data: { type: ContactType.COURT_CONTACT, firstName: 'Sandra', lastName: 'Mitchell', title: 'Court Clerk', company: 'NY Supreme Court', email: 'smitchell@nycourts.gov', phone: '(212) 555-4002', firmId: firm.id } }),
    prisma.contact.create({ data: { type: ContactType.COURT_CONTACT, firstName: 'Robert', lastName: 'Chen', title: 'Judge', company: 'NY Supreme Court - Kings County', phone: '(718) 555-4003', firmId: firm.id } }),
    // Expert Witnesses
    prisma.contact.create({ data: { type: ContactType.EXPERT_WITNESS, firstName: 'Dr. Elizabeth', lastName: 'Warren', title: 'Forensic Accountant', company: 'Warren Financial Consulting', email: 'ewarren@warrenfc.com', phone: '(212) 555-5001', firmId: firm.id } }),
    prisma.contact.create({ data: { type: ContactType.EXPERT_WITNESS, firstName: 'Dr. Michael', lastName: 'Park', title: 'Medical Expert', company: 'Park Medical Consulting', email: 'mpark@parkmedical.com', phone: '(212) 555-5002', firmId: firm.id } }),
    prisma.contact.create({ data: { type: ContactType.EXPERT_WITNESS, firstName: 'Dr. Jennifer', lastName: 'Adams', title: 'Real Estate Appraiser', company: 'Adams Appraisal Services', email: 'jadams@adamsappraisal.com', phone: '(212) 555-5003', firmId: firm.id } }),
    // Vendors
    prisma.contact.create({ data: { type: ContactType.VENDOR, firstName: 'James', lastName: 'Cooper', title: 'Manager', company: 'Legal Copy Center', email: 'jcooper@legalcopy.com', phone: '(212) 555-6001', firmId: firm.id } }),
    prisma.contact.create({ data: { type: ContactType.VENDOR, firstName: 'Lisa', lastName: 'Morgan', title: 'Account Rep', company: 'Metro Process Service', email: 'lmorgan@metroprocess.com', phone: '(212) 555-6002', firmId: firm.id } }),
    prisma.contact.create({ data: { type: ContactType.VENDOR, firstName: 'David', lastName: 'Kim', title: 'IT Manager', company: 'LegalTech Solutions', email: 'dkim@legaltech.com', phone: '(212) 555-6003', firmId: firm.id } }),
    // Client Contacts
    prisma.contact.create({ data: { type: ContactType.CLIENT_CONTACT, firstName: 'Sarah', lastName: 'Chen', title: 'CFO', company: 'Tech Innovations LLC', email: 'schen@techinnovations.com', phone: '(212) 555-7001', clientId: clients[5].id, firmId: firm.id } }),
    prisma.contact.create({ data: { type: ContactType.CLIENT_CONTACT, firstName: 'Michael', lastName: 'Ross', title: 'CEO', company: 'Manhattan Properties Inc.', email: 'mross@manhattanproperties.com', phone: '(212) 555-7002', clientId: clients[6].id, firmId: firm.id } }),
    prisma.contact.create({ data: { type: ContactType.CLIENT_CONTACT, firstName: 'Jennifer', lastName: 'Liu', title: 'General Counsel', company: 'Green Energy Solutions', email: 'jliu@greenenergy.com', phone: '(212) 555-7003', clientId: clients[7].id, firmId: firm.id } }),
  ])

  console.log('Created', contacts.length, 'contacts')

  // 19. Create Documents (25 documents)
  const documents = []
  const docTypes = [
    { type: DocumentType.PLEADING, names: ['Complaint', 'Answer', 'Amended Complaint'] },
    { type: DocumentType.MOTION, names: ['Motion for Summary Judgment', 'Motion to Compel', 'Motion to Dismiss'] },
    { type: DocumentType.CONTRACT, names: ['Engagement Letter', 'Settlement Agreement', 'Lease Agreement'] },
    { type: DocumentType.CORRESPONDENCE, names: ['Demand Letter', 'Response Letter', 'Settlement Offer'] },
    { type: DocumentType.DISCOVERY, names: ['Interrogatories', 'Document Request', 'Deposition Transcript'] },
  ]

  for (let i = 0; i < 25; i++) {
    const docType = docTypes[Math.floor(Math.random() * docTypes.length)]
    const matter = matters[Math.floor(Math.random() * matters.length)]
    const uploader = users[Math.floor(Math.random() * 4)]

    documents.push({
      name: `${docType.names[Math.floor(Math.random() * docType.names.length)]} - ${matter.matterNumber}`,
      description: `Document for ${matter.name}`,
      type: docType.type,
      category: docType.type,
      filePath: `/uploads/${matter.matterNumber}/${Date.now()}-document.pdf`,
      fileSize: Math.floor(Math.random() * 500000) + 10000,
      mimeType: 'application/pdf',
      matterId: matter.id,
      clientId: matter.clientId,
      uploadedById: uploader.id,
      firmId: firm.id,
    })
  }

  await prisma.document.createMany({ data: documents })
  console.log('Created', documents.length, 'documents')

  // 20. Create Communications
  await Promise.all([
    prisma.communication.create({ data: { type: CommunicationType.EMAIL, direction: 'outbound', subject: 'Case Update', body: 'Dear Client, here is an update on your case...', from: 'john.smith@smithlaw.com', to: 'robert.anderson@email.com', clientId: clients[0].id, matterId: matters[0].id } }),
    prisma.communication.create({ data: { type: CommunicationType.PHONE, direction: 'inbound', subject: 'Client call', body: 'Discussed settlement options', duration: 1800, clientId: clients[0].id, matterId: matters[0].id } }),
    prisma.communication.create({ data: { type: CommunicationType.EMAIL, direction: 'inbound', subject: 'Documents Received', from: 'maria.garcia@email.com', to: 'sarah.johnson@smithlaw.com', clientId: clients[1].id, matterId: matters[1].id } }),
    prisma.communication.create({ data: { type: CommunicationType.MEETING, direction: 'outbound', subject: 'Initial Consultation', body: 'Met with client to discuss case details', duration: 3600, clientId: clients[5].id, matterId: matters[4].id } }),
  ])

  console.log('Created communications')

  // 21. Create Matter Notes
  await Promise.all([
    prisma.matterNote.create({ data: { content: 'Initial consultation completed. Client is seeking full custody.', matterId: matters[0].id } }),
    prisma.matterNote.create({ data: { content: 'Opposing counsel is difficult to work with. Consider motion to compel.', matterId: matters[0].id } }),
    prisma.matterNote.create({ data: { content: 'Medical records received. Need expert review.', matterId: matters[2].id } }),
    prisma.matterNote.create({ data: { content: 'Term sheet negotiations ongoing. Client wants accelerated vesting.', matterId: matters[4].id } }),
    prisma.matterNote.create({ data: { content: 'Property inspection scheduled for next week.', matterId: matters[10].id } }),
  ])

  console.log('Created matter notes')

  console.log('\n✅ Database seeding completed successfully!')
  console.log('\nTest accounts:')
  console.log('- Admin: john.smith@smithlaw.com / password123')
  console.log('- Attorney: sarah.johnson@smithlaw.com / password123')
  console.log('- Attorney: michael.brown@smithlaw.com / password123')
  console.log('- Paralegal: emily.davis@smithlaw.com / password123')
  console.log('- Secretary: jessica.wilson@smithlaw.com / password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
