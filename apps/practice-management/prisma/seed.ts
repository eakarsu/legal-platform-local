import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with comprehensive data...')

  const hashedPassword = await bcrypt.hash('password123', 12)

  // ==================== USERS (15+) ====================
  console.log('Creating users...')

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@lawfirm.com' },
      update: {},
      create: {
        email: 'admin@lawfirm.com',
        name: 'John Smith',
        password: hashedPassword,
        role: 'ADMIN',
        barNumber: 'BAR100001',
        hourlyRate: 450,
        department: 'Administration',
        phone: '(555) 100-0001'
      }
    }),
    prisma.user.upsert({
      where: { email: 'sarah.mitchell@lawfirm.com' },
      update: {},
      create: {
        email: 'sarah.mitchell@lawfirm.com',
        name: 'Sarah Mitchell',
        password: hashedPassword,
        role: 'PARTNER',
        barNumber: 'BAR100002',
        hourlyRate: 500,
        department: 'Litigation',
        phone: '(555) 100-0002'
      }
    }),
    prisma.user.upsert({
      where: { email: 'attorney@lawfirm.com' },
      update: {},
      create: {
        email: 'attorney@lawfirm.com',
        name: 'Michael Johnson',
        password: hashedPassword,
        role: 'ATTORNEY',
        barNumber: 'BAR100003',
        hourlyRate: 350,
        department: 'Civil Litigation',
        phone: '(555) 100-0003'
      }
    }),
    prisma.user.upsert({
      where: { email: 'paralegal@lawfirm.com' },
      update: {},
      create: {
        email: 'paralegal@lawfirm.com',
        name: 'Jennifer Martinez',
        password: hashedPassword,
        role: 'PARALEGAL',
        hourlyRate: 150,
        department: 'Litigation',
        phone: '(555) 100-0004'
      }
    }),
    prisma.user.upsert({
      where: { email: 'partner1@lawfirm.com' },
      update: {},
      create: {
        email: 'partner1@lawfirm.com',
        name: 'Sarah Johnson',
        password: hashedPassword,
        role: 'PARTNER',
        barNumber: 'BAR100005',
        hourlyRate: 500,
        department: 'Litigation',
        phone: '(555) 100-0005'
      }
    }),
    prisma.user.upsert({
      where: { email: 'partner2@lawfirm.com' },
      update: {},
      create: {
        email: 'partner2@lawfirm.com',
        name: 'Michael Chen',
        password: hashedPassword,
        role: 'PARTNER',
        barNumber: 'BAR100006',
        hourlyRate: 475,
        department: 'Corporate',
        phone: '(555) 100-0006'
      }
    }),
    prisma.user.upsert({
      where: { email: 'attorney1@lawfirm.com' },
      update: {},
      create: {
        email: 'attorney1@lawfirm.com',
        name: 'Emily Davis',
        password: hashedPassword,
        role: 'ATTORNEY',
        barNumber: 'BAR100007',
        hourlyRate: 350,
        department: 'Family Law',
        phone: '(555) 100-0007'
      }
    }),
    prisma.user.upsert({
      where: { email: 'attorney2@lawfirm.com' },
      update: {},
      create: {
        email: 'attorney2@lawfirm.com',
        name: 'James Wilson',
        password: hashedPassword,
        role: 'ATTORNEY',
        barNumber: 'BAR100008',
        hourlyRate: 325,
        department: 'Real Estate',
        phone: '(555) 100-0008'
      }
    }),
    prisma.user.upsert({
      where: { email: 'attorney3@lawfirm.com' },
      update: {},
      create: {
        email: 'attorney3@lawfirm.com',
        name: 'Amanda Martinez',
        password: hashedPassword,
        role: 'ATTORNEY',
        barNumber: 'BAR100009',
        hourlyRate: 300,
        department: 'Criminal Defense',
        phone: '(555) 100-0009'
      }
    }),
    prisma.user.upsert({
      where: { email: 'attorney4@lawfirm.com' },
      update: {},
      create: {
        email: 'attorney4@lawfirm.com',
        name: 'Robert Taylor',
        password: hashedPassword,
        role: 'ATTORNEY',
        barNumber: 'BAR100010',
        hourlyRate: 275,
        department: 'Immigration',
        phone: '(555) 100-0010'
      }
    }),
    prisma.user.upsert({
      where: { email: 'attorney5@lawfirm.com' },
      update: {},
      create: {
        email: 'attorney5@lawfirm.com',
        name: 'Lisa Anderson',
        password: hashedPassword,
        role: 'ATTORNEY',
        barNumber: 'BAR100011',
        hourlyRate: 325,
        department: 'Employment',
        phone: '(555) 100-0011'
      }
    }),
    prisma.user.upsert({
      where: { email: 'paralegal1@lawfirm.com' },
      update: {},
      create: {
        email: 'paralegal1@lawfirm.com',
        name: 'Jennifer Brown',
        password: hashedPassword,
        role: 'PARALEGAL',
        hourlyRate: 150,
        department: 'Litigation',
        phone: '(555) 100-0012'
      }
    }),
    prisma.user.upsert({
      where: { email: 'paralegal2@lawfirm.com' },
      update: {},
      create: {
        email: 'paralegal2@lawfirm.com',
        name: 'David Lee',
        password: hashedPassword,
        role: 'PARALEGAL',
        hourlyRate: 125,
        department: 'Corporate',
        phone: '(555) 100-0013'
      }
    }),
    prisma.user.upsert({
      where: { email: 'paralegal3@lawfirm.com' },
      update: {},
      create: {
        email: 'paralegal3@lawfirm.com',
        name: 'Maria Garcia',
        password: hashedPassword,
        role: 'PARALEGAL',
        hourlyRate: 135,
        department: 'Family Law',
        phone: '(555) 100-0014'
      }
    }),
    prisma.user.upsert({
      where: { email: 'secretary1@lawfirm.com' },
      update: {},
      create: {
        email: 'secretary1@lawfirm.com',
        name: 'Patricia White',
        password: hashedPassword,
        role: 'SECRETARY',
        hourlyRate: 75,
        department: 'Administration',
        phone: '(555) 100-0015'
      }
    }),
    prisma.user.upsert({
      where: { email: 'secretary2@lawfirm.com' },
      update: {},
      create: {
        email: 'secretary2@lawfirm.com',
        name: 'Nancy Thompson',
        password: hashedPassword,
        role: 'SECRETARY',
        hourlyRate: 70,
        department: 'Litigation',
        phone: '(555) 100-0016'
      }
    }),
    prisma.user.upsert({
      where: { email: 'billing1@lawfirm.com' },
      update: {},
      create: {
        email: 'billing1@lawfirm.com',
        name: 'Susan Clark',
        password: hashedPassword,
        role: 'BILLING',
        hourlyRate: 85,
        department: 'Finance',
        phone: '(555) 100-0017'
      }
    }),
    prisma.user.upsert({
      where: { email: 'billing2@lawfirm.com' },
      update: {},
      create: {
        email: 'billing2@lawfirm.com',
        name: 'Karen Rodriguez',
        password: hashedPassword,
        role: 'BILLING',
        hourlyRate: 80,
        department: 'Finance',
        phone: '(555) 100-0018'
      }
    })
  ])

  console.log(`Created ${users.length} users`)

  // ==================== CLIENTS (20+) ====================
  console.log('Creating clients...')

  const clientsData = [
    { num: 'C2024-0001', type: 'INDIVIDUAL', first: 'Robert', last: 'Brown', email: 'robert.brown@email.com', phone: '(555) 200-0001', city: 'New York', state: 'NY' },
    { num: 'C2024-0002', type: 'COMPANY', company: 'TechCorp Industries', email: 'legal@techcorp.com', phone: '(555) 200-0002', city: 'San Francisco', state: 'CA' },
    { num: 'C2024-0003', type: 'INDIVIDUAL', first: 'Jennifer', last: 'Williams', email: 'jwilliams@email.com', phone: '(555) 200-0003', city: 'Los Angeles', state: 'CA' },
    { num: 'C2024-0004', type: 'COMPANY', company: 'Global Ventures LLC', email: 'info@globalventures.com', phone: '(555) 200-0004', city: 'Chicago', state: 'IL' },
    { num: 'C2024-0005', type: 'INDIVIDUAL', first: 'Michael', last: 'Johnson', email: 'mjohnson@email.com', phone: '(555) 200-0005', city: 'Houston', state: 'TX' },
    { num: 'C2024-0006', type: 'COMPANY', company: 'Healthcare Partners Inc', email: 'legal@healthcarepartners.com', phone: '(555) 200-0006', city: 'Boston', state: 'MA' },
    { num: 'C2024-0007', type: 'INDIVIDUAL', first: 'Sarah', last: 'Davis', email: 'sdavis@email.com', phone: '(555) 200-0007', city: 'Phoenix', state: 'AZ' },
    { num: 'C2024-0008', type: 'GOVERNMENT', company: 'City of Springfield', email: 'legal@springfield.gov', phone: '(555) 200-0008', city: 'Springfield', state: 'IL' },
    { num: 'C2024-0009', type: 'INDIVIDUAL', first: 'David', last: 'Miller', email: 'dmiller@email.com', phone: '(555) 200-0009', city: 'Philadelphia', state: 'PA' },
    { num: 'C2024-0010', type: 'COMPANY', company: 'Innovation Labs', email: 'counsel@innovationlabs.com', phone: '(555) 200-0010', city: 'Seattle', state: 'WA' },
    { num: 'C2024-0011', type: 'INDIVIDUAL', first: 'Emily', last: 'Wilson', email: 'ewilson@email.com', phone: '(555) 200-0011', city: 'Denver', state: 'CO' },
    { num: 'C2024-0012', type: 'NON_PROFIT', company: 'Community Foundation', email: 'legal@commfound.org', phone: '(555) 200-0012', city: 'Atlanta', state: 'GA' },
    { num: 'C2024-0013', type: 'INDIVIDUAL', first: 'James', last: 'Anderson', email: 'janderson@email.com', phone: '(555) 200-0013', city: 'Miami', state: 'FL' },
    { num: 'C2024-0014', type: 'COMPANY', company: 'Real Estate Holdings Corp', email: 'legal@reholdings.com', phone: '(555) 200-0014', city: 'Dallas', state: 'TX' },
    { num: 'C2024-0015', type: 'INDIVIDUAL', first: 'Amanda', last: 'Taylor', email: 'ataylor@email.com', phone: '(555) 200-0015', city: 'San Diego', state: 'CA' },
    { num: 'C2024-0016', type: 'COMPANY', company: 'Manufacturing Solutions Inc', email: 'legal@mansolutions.com', phone: '(555) 200-0016', city: 'Detroit', state: 'MI' },
    { num: 'C2024-0017', type: 'INDIVIDUAL', first: 'Christopher', last: 'Thomas', email: 'cthomas@email.com', phone: '(555) 200-0017', city: 'Portland', state: 'OR' },
    { num: 'C2024-0018', type: 'COMPANY', company: 'Financial Services Group', email: 'counsel@finservgroup.com', phone: '(555) 200-0018', city: 'Charlotte', state: 'NC' },
    { num: 'C2024-0019', type: 'INDIVIDUAL', first: 'Jessica', last: 'Martinez', email: 'jmartinez@email.com', phone: '(555) 200-0019', city: 'Austin', state: 'TX' },
    { num: 'C2024-0020', type: 'COMPANY', company: 'Retail Enterprises LLC', email: 'legal@retailent.com', phone: '(555) 200-0020', city: 'Nashville', state: 'TN' }
  ]

  const clients = await Promise.all(
    clientsData.map(c =>
      prisma.client.upsert({
        where: { clientNumber: c.num },
        update: {},
        create: {
          clientNumber: c.num,
          type: c.type as any,
          status: 'ACTIVE',
          firstName: c.first || null,
          lastName: c.last || null,
          companyName: c.company || null,
          email: c.email,
          phone: c.phone,
          address: `${Math.floor(Math.random() * 9999) + 100} Main Street`,
          city: c.city,
          state: c.state,
          zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          country: 'USA',
          billingRate: Math.floor(Math.random() * 200) + 200,
          billingMethod: ['HOURLY', 'FLAT_FEE', 'RETAINER'][Math.floor(Math.random() * 3)] as any,
          portalEnabled: Math.random() > 0.5,
          createdById: users[0].id
        }
      })
    )
  )

  console.log(`Created ${clients.length} clients`)

  // ==================== MATTERS (20+) ====================
  console.log('Creating matters...')

  const caseTypes = ['CIVIL_LITIGATION', 'CRIMINAL_DEFENSE', 'FAMILY_LAW', 'REAL_ESTATE', 'CORPORATE', 'INTELLECTUAL_PROPERTY', 'BANKRUPTCY', 'EMPLOYMENT', 'IMMIGRATION', 'PERSONAL_INJURY', 'ESTATE_PLANNING', 'TAX', 'ENVIRONMENTAL']
  const courts = ['New York Supreme Court', 'California Superior Court', 'US District Court - SDNY', 'US District Court - ND CA', 'Texas District Court', 'Illinois Circuit Court', 'Florida Circuit Court', 'US Bankruptcy Court']

  const mattersData = [
    { num: 'M2024-0001', name: 'Brown v. ABC Corp - Personal Injury', type: 'PERSONAL_INJURY', priority: 'HIGH' },
    { num: 'M2024-0002', name: 'TechCorp - Contract Dispute', type: 'CIVIL_LITIGATION', priority: 'MEDIUM' },
    { num: 'M2024-0003', name: 'Williams Divorce Proceedings', type: 'FAMILY_LAW', priority: 'HIGH' },
    { num: 'M2024-0004', name: 'Global Ventures - Merger Agreement', type: 'CORPORATE', priority: 'URGENT' },
    { num: 'M2024-0005', name: 'Johnson Criminal Defense', type: 'CRIMINAL_DEFENSE', priority: 'URGENT' },
    { num: 'M2024-0006', name: 'Healthcare Partners - FDA Compliance', type: 'CORPORATE', priority: 'HIGH' },
    { num: 'M2024-0007', name: 'Davis Estate Planning', type: 'ESTATE_PLANNING', priority: 'MEDIUM' },
    { num: 'M2024-0008', name: 'City of Springfield - Zoning Appeal', type: 'REAL_ESTATE', priority: 'MEDIUM' },
    { num: 'M2024-0009', name: 'Miller Workers Comp Claim', type: 'EMPLOYMENT', priority: 'HIGH' },
    { num: 'M2024-0010', name: 'Innovation Labs - Patent Filing', type: 'INTELLECTUAL_PROPERTY', priority: 'HIGH' },
    { num: 'M2024-0011', name: 'Wilson Immigration - H1B Visa', type: 'IMMIGRATION', priority: 'MEDIUM' },
    { num: 'M2024-0012', name: 'Community Foundation - Tax Exemption', type: 'TAX', priority: 'LOW' },
    { num: 'M2024-0013', name: 'Anderson Personal Injury - Auto Accident', type: 'PERSONAL_INJURY', priority: 'HIGH' },
    { num: 'M2024-0014', name: 'RE Holdings - Property Acquisition', type: 'REAL_ESTATE', priority: 'MEDIUM' },
    { num: 'M2024-0015', name: 'Taylor Custody Dispute', type: 'FAMILY_LAW', priority: 'URGENT' },
    { num: 'M2024-0016', name: 'Manufacturing Solutions - Environmental', type: 'ENVIRONMENTAL', priority: 'HIGH' },
    { num: 'M2024-0017', name: 'Thomas Bankruptcy Filing', type: 'BANKRUPTCY', priority: 'HIGH' },
    { num: 'M2024-0018', name: 'Financial Services - SEC Investigation', type: 'CORPORATE', priority: 'URGENT' },
    { num: 'M2024-0019', name: 'Martinez Employment Discrimination', type: 'EMPLOYMENT', priority: 'HIGH' },
    { num: 'M2024-0020', name: 'Retail Enterprises - Lease Dispute', type: 'CIVIL_LITIGATION', priority: 'MEDIUM' }
  ]

  const matters = await Promise.all(
    mattersData.map((m, i) =>
      prisma.matter.upsert({
        where: { matterNumber: m.num },
        update: {},
        create: {
          matterNumber: m.num,
          name: m.name,
          description: `Legal matter for ${clients[i % clients.length].companyName || clients[i % clients.length].firstName + ' ' + clients[i % clients.length].lastName}`,
          clientId: clients[i % clients.length].id,
          leadAttorneyId: users[Math.floor(Math.random() * 8)].id,
          caseType: m.type as any,
          status: ['OPEN', 'OPEN', 'OPEN', 'PENDING'][Math.floor(Math.random() * 4)] as any,
          priority: m.priority as any,
          courtName: courts[Math.floor(Math.random() * courts.length)],
          caseNumber: `2024-CV-${String(Math.floor(Math.random() * 9999) + 1000).padStart(4, '0')}`,
          judge: `Hon. ${['Patricia Williams', 'Robert Thompson', 'Maria Santos', 'John Mitchell', 'Susan Lee'][Math.floor(Math.random() * 5)]}`,
          billingMethod: ['HOURLY', 'FLAT_FEE', 'CONTINGENCY', 'RETAINER'][Math.floor(Math.random() * 4)] as any,
          estimatedValue: Math.floor(Math.random() * 900000) + 100000,
          statuteOfLimitations: new Date(Date.now() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)
        }
      })
    )
  )

  console.log(`Created ${matters.length} matters`)

  // ==================== TASKS (25+) ====================
  console.log('Creating tasks...')

  const taskTitles = [
    'Review discovery documents',
    'Prepare motion for summary judgment',
    'Draft interrogatories',
    'Research case law precedents',
    'Interview witnesses',
    'Prepare deposition outline',
    'File court documents',
    'Review contract terms',
    'Client meeting preparation',
    'Draft settlement proposal',
    'Review opposing counsel brief',
    'Prepare trial exhibits',
    'Update case timeline',
    'Review medical records',
    'Draft demand letter',
    'Prepare witness list',
    'Review discovery responses',
    'Draft motion to compel',
    'Prepare for hearing',
    'Client status update',
    'Review expert reports',
    'Draft appeal brief',
    'File motions',
    'Prepare closing arguments',
    'Document review session'
  ]

  const tasks = await Promise.all(
    taskTitles.map((title, i) =>
      prisma.task.create({
        data: {
          title,
          description: `Task details for: ${title}`,
          matterId: matters[i % matters.length].id,
          createdById: users[0].id,
          assigneeId: users[Math.floor(Math.random() * users.length)].id,
          priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'][Math.floor(Math.random() * 4)] as any,
          status: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'][Math.floor(Math.random() * 4)] as any,
          dueDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
        }
      })
    )
  )

  console.log(`Created ${tasks.length} tasks`)

  // ==================== CALENDAR EVENTS (20+) ====================
  console.log('Creating calendar events...')

  const eventTypes = ['MEETING', 'COURT_DATE', 'DEPOSITION', 'HEARING', 'TRIAL', 'DEADLINE', 'CONFERENCE_CALL', 'CLIENT_MEETING']
  const eventTitles = [
    'Client Consultation',
    'Court Hearing',
    'Deposition - Plaintiff',
    'Settlement Conference',
    'Trial Preparation Meeting',
    'Expert Witness Meeting',
    'Motion Hearing',
    'Case Strategy Session',
    'Document Review Meeting',
    'Mediation Session',
    'Pre-trial Conference',
    'Witness Preparation',
    'Discovery Planning',
    'Client Update Call',
    'Partner Meeting',
    'Deposition - Defendant',
    'Filing Deadline Review',
    'Team Case Review',
    'Court Appearance',
    'Arbitration Hearing'
  ]

  const events = await Promise.all(
    eventTitles.map((title, i) => {
      const startDate = new Date(Date.now() + Math.floor(Math.random() * 60 - 30) * 24 * 60 * 60 * 1000)
      startDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0)
      const endDate = new Date(startDate.getTime() + (Math.floor(Math.random() * 3) + 1) * 60 * 60 * 1000)

      return prisma.calendarEvent.create({
        data: {
          title,
          description: `${title} - ${matters[i % matters.length].name}`,
          matterId: matters[i % matters.length].id,
          userId: users[Math.floor(Math.random() * users.length)].id,
          eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)] as any,
          location: ['Conference Room A', 'Conference Room B', 'Courtroom 5A', 'Zoom', 'Client Office', 'Main Office'][Math.floor(Math.random() * 6)],
          startTime: startDate,
          endTime: endDate,
          allDay: Math.random() > 0.9,
          reminderMinutes: [15, 30, 60, 1440][Math.floor(Math.random() * 4)]
        }
      })
    })
  )

  console.log(`Created ${events.length} calendar events`)

  // ==================== DEADLINES (20+) ====================
  console.log('Creating deadlines...')

  const deadlineTypes = ['FILING', 'RESPONSE', 'DISCOVERY', 'MOTION', 'STATUTE_OF_LIMITATIONS', 'APPEAL', 'COURT_DATE']
  const deadlineTitles = [
    'Response to Motion to Dismiss',
    'Discovery Deadline',
    'Answer to Complaint',
    'Expert Disclosure Deadline',
    'Motion for Summary Judgment',
    'Pre-trial Brief Due',
    'Jury Instructions Due',
    'Witness List Deadline',
    'Exhibit List Due',
    'Appeal Filing Deadline',
    'Discovery Response Due',
    'Amended Complaint Filing',
    'Opposition Brief Due',
    'Reply Brief Due',
    'Statute of Limitations',
    'Mediation Deadline',
    'Settlement Offer Response',
    'Deposition Notice Deadline',
    'Trial Date',
    'Final Judgment Entry'
  ]

  const deadlines = await Promise.all(
    deadlineTitles.map((title, i) =>
      prisma.deadline.create({
        data: {
          title,
          description: `${title} for matter ${matters[i % matters.length].matterNumber}`,
          matterId: matters[i % matters.length].id,
          deadlineType: deadlineTypes[Math.floor(Math.random() * deadlineTypes.length)] as any,
          dueDate: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
          status: ['PENDING', 'PENDING', 'PENDING', 'COMPLETED'][Math.floor(Math.random() * 4)] as any,
          reminderDays: [3, 7, 14, 30][Math.floor(Math.random() * 4)]
        }
      })
    )
  )

  console.log(`Created ${deadlines.length} deadlines`)

  // ==================== TIME ENTRIES (30+) ====================
  console.log('Creating time entries...')

  const timeDescriptions = [
    'Review and analysis of discovery documents',
    'Legal research on applicable case law',
    'Draft correspondence to opposing counsel',
    'Client telephone conference',
    'Prepare motion documents',
    'Court appearance',
    'Deposition preparation',
    'Document review and organization',
    'Draft contract amendments',
    'Review medical records',
    'Witness interview',
    'Settlement negotiation call',
    'Trial preparation',
    'Expert consultation',
    'Brief drafting'
  ]

  const timeEntries = []
  for (let i = 0; i < 30; i++) {
    const user = users[Math.floor(Math.random() * 8)]
    const hours = Math.round((Math.random() * 4 + 0.5) * 10) / 10
    const rate = Number(user.hourlyRate) || 250

    timeEntries.push(
      prisma.timeEntry.create({
        data: {
          matterId: matters[Math.floor(Math.random() * matters.length)].id,
          userId: user.id,
          date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          hours,
          description: timeDescriptions[Math.floor(Math.random() * timeDescriptions.length)],
          activityCode: `A${Math.floor(Math.random() * 9) + 1}0${Math.floor(Math.random() * 9) + 1}`,
          billableStatus: ['BILLABLE', 'BILLABLE', 'BILLABLE', 'NON_BILLABLE'][Math.floor(Math.random() * 4)] as any,
          rate,
          amount: hours * rate
        }
      })
    )
  }

  await Promise.all(timeEntries)
  console.log(`Created ${timeEntries.length} time entries`)

  // ==================== EXPENSES (20+) ====================
  console.log('Creating expenses...')

  const expenseCategories = ['FILING_FEE', 'COURT_COST', 'EXPERT_WITNESS', 'DEPOSITION', 'TRAVEL', 'COPYING', 'POSTAGE', 'COURIER', 'RESEARCH']
  const expenseDescriptions = [
    'Court filing fee',
    'Expert witness consultation',
    'Deposition transcript',
    'Travel to court',
    'Document copying',
    'FedEx delivery',
    'Westlaw research',
    'Process server fee',
    'Court reporter fee',
    'Mediation fee',
    'Expert report',
    'Translation services',
    'Conference room rental',
    'Hotel accommodation',
    'Parking fees',
    'Certified mail',
    'Background check',
    'Record retrieval',
    'Conference call service',
    'Printing costs'
  ]

  const expenses = await Promise.all(
    expenseDescriptions.map((desc, i) =>
      prisma.expense.create({
        data: {
          matterId: matters[i % matters.length].id,
          date: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
          description: desc,
          amount: Math.floor(Math.random() * 2000) + 50,
          category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)] as any,
          vendor: ['ABC Services', 'Court Services Inc', 'Legal Support Co', 'Express Delivery', 'Research Plus'][Math.floor(Math.random() * 5)],
          billableStatus: 'BILLABLE'
        }
      })
    )
  )

  console.log(`Created ${expenses.length} expenses`)

  // ==================== INVOICES (15+) ====================
  console.log('Creating invoices...')

  const invoices = []
  for (let i = 0; i < 15; i++) {
    const matter = matters[i % matters.length]
    const subtotal = Math.floor(Math.random() * 15000) + 1000
    const taxRate = 0
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount
    const status = ['DRAFT', 'SENT', 'PAID', 'PARTIAL', 'OVERDUE'][Math.floor(Math.random() * 5)]

    const invoiceNumber = `INV-2024${String(i + 1).padStart(4, '0')}`
    invoices.push(
      prisma.invoice.upsert({
        where: { invoiceNumber },
        update: {},
        create: {
          invoiceNumber,
          clientId: matter.clientId,
          matterId: matter.id,
          issueDate: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          subtotal,
          taxRate,
          taxAmount,
          total,
          status: status as any,
          paidAmount: status === 'PAID' ? total : status === 'PARTIAL' ? total * 0.5 : 0,
          paidDate: status === 'PAID' ? new Date() : null,
          notes: `Invoice for legal services - ${matter.name}`
        }
      })
    )
  }

  await Promise.all(invoices)
  console.log(`Created ${invoices.length} invoices`)

  // ==================== COURT FILINGS (20+) ====================
  console.log('Creating court filings...')

  const filingTypes = ['INITIAL', 'RESPONSE', 'MOTION', 'BRIEF', 'EXHIBIT', 'ORDER', 'NOTICE']
  const filingNames = [
    'Complaint',
    'Answer to Complaint',
    'Motion to Dismiss',
    'Opposition to Motion to Dismiss',
    'Motion for Summary Judgment',
    'Reply Brief',
    'Discovery Request',
    'Response to Discovery',
    'Motion to Compel',
    'Pre-trial Brief',
    'Jury Instructions',
    'Notice of Appeal',
    'Appellate Brief',
    'Motion for Extension',
    'Stipulation',
    'Settlement Agreement',
    'Final Judgment',
    'Motion for New Trial',
    'Post-trial Brief',
    'Notice of Hearing'
  ]

  const filings = await Promise.all(
    filingNames.map((name, i) => {
      const matter = matters[i % matters.length]
      return prisma.courtFiling.create({
        data: {
          matterId: matter.id,
          documentName: name,
          documentType: 'PLEADING',
          filingType: filingTypes[Math.floor(Math.random() * filingTypes.length)] as any,
          courtName: matter.courtName || 'District Court',
          caseNumber: matter.caseNumber,
          filingDate: Math.random() > 0.5 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : null,
          dueDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          status: ['DRAFT', 'READY', 'SUBMITTED', 'FILED'][Math.floor(Math.random() * 4)] as any,
          filingFee: Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 50 : null,
          feePaid: Math.random() > 0.5,
          serviceRequired: Math.random() > 0.5
        }
      })
    })
  )

  console.log(`Created ${filings.length} court filings`)

  // ==================== MESSAGES (20+) ====================
  console.log('Creating messages...')

  const messageSubjects = [
    'Case Update Required',
    'Document Request',
    'Meeting Confirmation',
    'Settlement Discussion',
    'Court Date Reminder',
    'Invoice Question',
    'Document Review Complete',
    'Signature Required',
    'Deadline Approaching',
    'Case Status Update',
    'Evidence Submission',
    'Witness Information',
    'Schedule Change',
    'Fee Agreement',
    'Discovery Response',
    'Motion Filed',
    'Hearing Results',
    'Client Instructions',
    'Expert Report Ready',
    'Appeal Decision'
  ]

  const messages = await Promise.all(
    messageSubjects.map((subject, i) => {
      const client = clients[i % clients.length]
      return prisma.message.create({
        data: {
          senderId: users[Math.floor(Math.random() * users.length)].id,
          clientId: client.id,
          type: ['EMAIL', 'PORTAL_MESSAGE', 'SMS'][Math.floor(Math.random() * 3)] as any,
          subject,
          content: `This is a message regarding: ${subject}. Please review and respond at your earliest convenience.`,
          isSecure: true,
          isRead: Math.random() > 0.3,
          toEmail: client.email
        }
      })
    })
  )

  console.log(`Created ${messages.length} messages`)

  // ==================== DOCUMENTS (20+) ====================
  console.log('Creating documents...')

  const docCategories = ['PLEADING', 'MOTION', 'BRIEF', 'CONTRACT', 'CORRESPONDENCE', 'DISCOVERY', 'EVIDENCE', 'COURT_ORDER', 'TRANSCRIPT']
  const documentNames = [
    'Initial Complaint',
    'Answer to Complaint',
    'Motion to Dismiss',
    'Discovery Request',
    'Interrogatories',
    'Deposition Transcript',
    'Expert Report',
    'Settlement Agreement',
    'Court Order',
    'Pre-trial Brief',
    'Exhibit List',
    'Witness Statement',
    'Medical Records',
    'Financial Disclosure',
    'Employment Contract',
    'Lease Agreement',
    'Partnership Agreement',
    'Confidentiality Agreement',
    'Demand Letter',
    'Response Brief'
  ]

  const documents = await Promise.all(
    documentNames.map((name, i) => {
      const matter = matters[i % matters.length]
      return prisma.document.create({
        data: {
          name,
          description: `${name} for ${matter.name}`,
          fileName: `${name.toLowerCase().replace(/ /g, '_')}.pdf`,
          fileType: 'application/pdf',
          fileSize: Math.floor(Math.random() * 5000000) + 100000,
          filePath: `/uploads/${name.toLowerCase().replace(/ /g, '_')}.pdf`,
          matterId: matter.id,
          clientId: matter.clientId,
          uploadedById: users[Math.floor(Math.random() * users.length)].id,
          category: docCategories[Math.floor(Math.random() * docCategories.length)] as any,
          status: ['DRAFT', 'FINAL', 'FILED'][Math.floor(Math.random() * 3)] as any
        }
      })
    })
  )

  console.log(`Created ${documents.length} documents`)

  // ==================== DOCUMENT TEMPLATES (15+) ====================
  console.log('Creating document templates...')

  const templates = [
    { name: 'Demand Letter', cat: 'CORRESPONDENCE', content: 'Standard demand letter template for civil matters...' },
    { name: 'Motion for Summary Judgment', cat: 'MOTION', content: 'Motion for summary judgment template...' },
    { name: 'Answer to Complaint', cat: 'PLEADING', content: 'Standard answer to civil complaint...' },
    { name: 'Discovery Request', cat: 'DISCOVERY', content: 'Interrogatories and document request template...' },
    { name: 'Settlement Agreement', cat: 'CONTRACT', content: 'Settlement and release agreement template...' },
    { name: 'Engagement Letter', cat: 'CORRESPONDENCE', content: 'Client engagement and fee agreement...' },
    { name: 'Motion to Dismiss', cat: 'MOTION', content: 'Motion to dismiss for failure to state a claim...' },
    { name: 'Subpoena', cat: 'DISCOVERY', content: 'Subpoena for documents and testimony...' },
    { name: 'Confidentiality Agreement', cat: 'CONTRACT', content: 'NDA and confidentiality agreement template...' },
    { name: 'Power of Attorney', cat: 'CONTRACT', content: 'General power of attorney form...' },
    { name: 'Deposition Notice', cat: 'DISCOVERY', content: 'Notice of deposition template...' },
    { name: 'Pre-trial Brief', cat: 'BRIEF', content: 'Pre-trial brief and memorandum template...' },
    { name: 'Appeal Brief', cat: 'BRIEF', content: 'Appellate brief template...' },
    { name: 'Client Intake Form', cat: 'CLIENT_FILE', content: 'New client intake questionnaire...' },
    { name: 'Fee Agreement', cat: 'CONTRACT', content: 'Attorney fee agreement template...' }
  ]

  await Promise.all(
    templates.map(t =>
      prisma.documentTemplate.create({
        data: {
          name: t.name,
          description: `Template for ${t.name}`,
          category: t.cat as any,
          content: t.content,
          isActive: true
        }
      })
    )
  )

  console.log(`Created ${templates.length} document templates`)

  // ==================== COURT RULES (15+) ====================
  console.log('Creating court rules...')

  const courtRules = [
    { jur: 'Federal', num: 'FRCP 12(a)(1)', name: 'Answer Deadline', days: 21, trigger: 'Service of Complaint' },
    { jur: 'Federal', num: 'FRCP 12(b)', name: 'Motion to Dismiss', days: 21, trigger: 'Service of Complaint' },
    { jur: 'Federal', num: 'FRCP 26(f)', name: 'Discovery Conference', days: 90, trigger: 'Filing of Complaint' },
    { jur: 'Federal', num: 'FRCP 33', name: 'Interrogatory Response', days: 30, trigger: 'Service of Interrogatories' },
    { jur: 'Federal', num: 'FRCP 34', name: 'Document Production', days: 30, trigger: 'Service of Request' },
    { jur: 'Federal', num: 'FRCP 36', name: 'Admission Response', days: 30, trigger: 'Service of Request' },
    { jur: 'Federal', num: 'FRCP 56', name: 'Summary Judgment Motion', days: 30, trigger: 'Close of Discovery' },
    { jur: 'California', num: 'CCP 430.40', name: 'Demurrer', days: 30, trigger: 'Service of Complaint' },
    { jur: 'California', num: 'CCP 2030.260', name: 'Interrogatory Response', days: 30, trigger: 'Service of Interrogatories' },
    { jur: 'California', num: 'CCP 2031.260', name: 'Document Response', days: 30, trigger: 'Service of Demand' },
    { jur: 'New York', num: 'CPLR 3012', name: 'Answer Deadline', days: 20, trigger: 'Service of Summons' },
    { jur: 'New York', num: 'CPLR 3212', name: 'Summary Judgment', days: 120, trigger: 'Note of Issue' },
    { jur: 'Texas', num: 'TRCP 99', name: 'Answer Deadline', days: 20, trigger: 'Service of Citation' },
    { jur: 'Texas', num: 'TRCP 196', name: 'Discovery Response', days: 30, trigger: 'Service of Request' },
    { jur: 'Florida', num: 'FRCP 1.140', name: 'Answer/Motion Deadline', days: 20, trigger: 'Service of Process' }
  ]

  await Promise.all(
    courtRules.map(r =>
      prisma.courtRule.create({
        data: {
          jurisdiction: r.jur,
          ruleNumber: r.num,
          ruleName: r.name,
          description: `${r.name} - ${r.days} days from ${r.trigger}`,
          daysToAdd: r.days,
          daysType: 'CALENDAR',
          triggerEvent: r.trigger,
          isActive: true
        }
      })
    )
  )

  console.log(`Created ${courtRules.length} court rules`)

  // ==================== TRUST ACCOUNTS (3) ====================
  console.log('Creating trust accounts...')

  await Promise.all([
    prisma.trustAccount.create({
      data: {
        accountName: 'Client Trust Account - IOLTA',
        accountNumber: '****1234',
        bankName: 'First National Bank',
        balance: 125000,
        ioltaAccount: true,
        isActive: true
      }
    }),
    prisma.trustAccount.create({
      data: {
        accountName: 'Retainer Trust Account',
        accountNumber: '****5678',
        bankName: 'First National Bank',
        balance: 75000,
        ioltaAccount: false,
        isActive: true
      }
    }),
    prisma.trustAccount.create({
      data: {
        accountName: 'Settlement Trust Account',
        accountNumber: '****9012',
        bankName: 'Community Bank',
        balance: 250000,
        ioltaAccount: true,
        isActive: true
      }
    })
  ])

  console.log('Created 3 trust accounts')

  // ==================== CONFLICT CHECKS (15+) ====================
  console.log('Creating conflict checks...')

  const conflictChecks = await Promise.all(
    clients.slice(0, 15).map((client, i) =>
      prisma.conflictCheck.create({
        data: {
          clientId: client.id,
          matterId: matters[i % matters.length].id,
          searchTerms: `${client.firstName || ''} ${client.lastName || ''} ${client.companyName || ''}`.trim(),
          status: ['CLEARED', 'CLEARED', 'CLEARED', 'PENDING'][Math.floor(Math.random() * 4)] as any,
          result: ['NO_CONFLICT', 'NO_CONFLICT', 'POTENTIAL_CONFLICT'][Math.floor(Math.random() * 3)] as any,
          details: 'Conflict check performed on client and related parties',
          aiChecked: Math.random() > 0.5
        }
      })
    )
  )

  console.log(`Created ${conflictChecks.length} conflict checks`)

  // ==================== CALL LOGS (15+) ====================
  console.log('Creating call logs...')

  const callTypes = ['INCOMING', 'OUTGOING', 'MISSED', 'VOICEMAIL']
  const callLogs = await Promise.all(
    Array.from({ length: 15 }, (_, i) => {
      const client = clients[i % clients.length]
      return prisma.callLog.create({
        data: {
          userId: users[Math.floor(Math.random() * users.length)].id,
          callerName: client.companyName || `${client.firstName} ${client.lastName}`,
          callerPhone: client.phone || '(555) 000-0000',
          callType: callTypes[Math.floor(Math.random() * callTypes.length)] as any,
          duration: Math.floor(Math.random() * 30) + 1,
          notes: `Call regarding case matters`,
          matterId: matters[i % matters.length].id
        }
      })
    })
  )

  console.log(`Created ${callLogs.length} call logs`)

  // ==================== NOTIFICATIONS (25+) ====================
  console.log('Creating notifications...')

  const notificationData = [
    // Admin user notifications (unread)
    { userId: users[0].id, type: 'DEADLINE', title: 'Deadline Approaching', message: 'Response to Motion to Dismiss is due in 3 days', link: '/deadlines', isRead: false },
    { userId: users[0].id, type: 'DEADLINE', title: 'Urgent: Overdue Deadline', message: 'Discovery Deadline for Brown v. ABC Corp has passed', link: '/deadlines', isRead: false },
    { userId: users[0].id, type: 'TASK', title: 'New Task Assigned', message: 'Review discovery documents for TechCorp case', link: '/tasks', isRead: false },
    { userId: users[0].id, type: 'TASK', title: 'Task Due Today', message: 'Prepare motion for summary judgment is due today', link: '/tasks', isRead: false },
    { userId: users[0].id, type: 'MESSAGE', title: 'New Client Message', message: 'Robert Brown sent a message regarding his case', link: '/messages', isRead: false },
    { userId: users[0].id, type: 'CALENDAR', title: 'Meeting Reminder', message: 'Client meeting with TechCorp in 1 hour', link: '/calendar', isRead: false },
    { userId: users[0].id, type: 'DOCUMENT', title: 'Document Uploaded', message: 'New expert report uploaded for Williams case', link: '/documents', isRead: false },
    { userId: users[0].id, type: 'BILLING', title: 'Invoice Overdue', message: 'Invoice INV-20240003 is 15 days overdue', link: '/billing', isRead: false },
    // Admin user notifications (read)
    { userId: users[0].id, type: 'SYSTEM', title: 'System Update', message: 'New features available: Expenses and Deadlines tracking', link: '/dashboard', isRead: true },
    { userId: users[0].id, type: 'DEADLINE', title: 'Deadline Completed', message: 'Answer to Complaint was filed successfully', link: '/deadlines', isRead: true },
    { userId: users[0].id, type: 'BILLING', title: 'Payment Received', message: 'Payment of $5,000 received for INV-20240001', link: '/billing', isRead: true },
    { userId: users[0].id, type: 'TASK', title: 'Task Completed', message: 'Document review session has been completed', link: '/tasks', isRead: true },
    { userId: users[0].id, type: 'MESSAGE', title: 'Message Read', message: 'Your message to Jennifer Williams was read', link: '/messages', isRead: true },
    // Other user notifications
    { userId: users[1].id, type: 'DEADLINE', title: 'Filing Due Tomorrow', message: 'Motion for Extension filing due tomorrow', link: '/deadlines', isRead: false },
    { userId: users[1].id, type: 'TASK', title: 'Task Assigned', message: 'New research task assigned by John Smith', link: '/tasks', isRead: false },
    { userId: users[2].id, type: 'CALENDAR', title: 'Deposition Scheduled', message: 'Deposition for Anderson case scheduled for next week', link: '/calendar', isRead: false },
    { userId: users[2].id, type: 'DOCUMENT', title: 'Document Review Required', message: 'Settlement Agreement needs your review', link: '/documents', isRead: false },
    { userId: users[3].id, type: 'MESSAGE', title: 'New Message', message: 'You have a new secure message from a client', link: '/messages', isRead: false },
    { userId: users[3].id, type: 'BILLING', title: 'Time Entry Reminder', message: 'Please submit your time entries for this week', link: '/time', isRead: false },
    { userId: users[4].id, type: 'DEADLINE', title: 'Statute of Limitations Alert', message: 'Statute expires in 30 days for Miller case', link: '/deadlines', isRead: false },
    { userId: users[5].id, type: 'SYSTEM', title: 'Password Expiring', message: 'Your password will expire in 7 days', link: '/settings', isRead: false },
    { userId: users[6].id, type: 'TASK', title: 'Task Overdue', message: 'Interview witnesses task is overdue', link: '/tasks', isRead: false },
    { userId: users[7].id, type: 'CALENDAR', title: 'Court Date Reminder', message: 'Court appearance scheduled for Friday', link: '/calendar', isRead: false },
    { userId: users[8].id, type: 'DOCUMENT', title: 'Document Signed', message: 'Engagement letter has been signed by client', link: '/documents', isRead: true },
    { userId: users[9].id, type: 'BILLING', title: 'New Invoice Created', message: 'Invoice INV-20240015 has been generated', link: '/billing', isRead: true },
  ]

  const notifications = await Promise.all(
    notificationData.map(n =>
      prisma.notification.create({
        data: {
          userId: n.userId,
          type: n.type as any,
          title: n.title,
          message: n.message,
          link: n.link,
          isRead: n.isRead
        }
      })
    )
  )

  console.log(`Created ${notifications.length} notifications`)

  console.log('')
  console.log('==========================================')
  console.log('  Database seeding completed successfully!')
  console.log('==========================================')
  console.log('')
  console.log('Summary:')
  console.log(`  - Users: ${users.length}`)
  console.log(`  - Clients: ${clients.length}`)
  console.log(`  - Matters: ${matters.length}`)
  console.log(`  - Tasks: ${tasks.length}`)
  console.log(`  - Calendar Events: ${events.length}`)
  console.log(`  - Deadlines: ${deadlines.length}`)
  console.log(`  - Time Entries: ${timeEntries.length}`)
  console.log(`  - Expenses: ${expenses.length}`)
  console.log(`  - Invoices: ${invoices.length}`)
  console.log(`  - Court Filings: ${filings.length}`)
  console.log(`  - Messages: ${messages.length}`)
  console.log(`  - Documents: ${documents.length}`)
  console.log('')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
