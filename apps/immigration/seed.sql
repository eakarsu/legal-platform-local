-- Drop tables if exist
DROP TABLE IF EXISTS status_tracking CASCADE;
DROP TABLE IF EXISTS compliance CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS billing CASCADE;
DROP TABLE IF EXISTS deadlines CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS visa_applications CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'attorney',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  nationality VARCHAR(100),
  date_of_birth DATE,
  passport_number VARCHAR(50),
  current_status VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cases table
CREATE TABLE cases (
  id SERIAL PRIMARY KEY,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  case_type VARCHAR(100) NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  assigned_attorney_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'medium',
  description TEXT,
  filing_date DATE,
  deadline DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100),
  case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending',
  file_path VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Visa Applications table
CREATE TABLE visa_applications (
  id SERIAL PRIMARY KEY,
  visa_type VARCHAR(100) NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending',
  application_date DATE,
  expiry_date DATE,
  embassy VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Deadlines table
CREATE TABLE deadlines (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Billing table
CREATE TABLE billing (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  description TEXT,
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  note_type VARCHAR(50) DEFAULT 'general',
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Forms table
CREATE TABLE forms (
  id SERIAL PRIMARY KEY,
  form_type VARCHAR(100) NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'draft',
  data JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Compliance table
CREATE TABLE compliance (
  id SERIAL PRIMARY KEY,
  check_type VARCHAR(100) NOT NULL,
  case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending',
  result TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Status Tracking table
CREATE TABLE status_tracking (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  notes TEXT,
  changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- ==================== SEED DATA ====================

-- Password is 'password123' hashed with bcrypt
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@immigrationlaw.com', '$2a$10$D6Ce9nt4xjaSalQU1Qz.D.m4j5jm4KxDa2zevHZMsJBwKUyQU4z2a', 'Sarah Johnson', 'admin'),
('attorney1@immigrationlaw.com', '$2a$10$D6Ce9nt4xjaSalQU1Qz.D.m4j5jm4KxDa2zevHZMsJBwKUyQU4z2a', 'Michael Chen', 'attorney'),
('attorney2@immigrationlaw.com', '$2a$10$D6Ce9nt4xjaSalQU1Qz.D.m4j5jm4KxDa2zevHZMsJBwKUyQU4z2a', 'Elena Rodriguez', 'attorney'),
('paralegal@immigrationlaw.com', '$2a$10$D6Ce9nt4xjaSalQU1Qz.D.m4j5jm4KxDa2zevHZMsJBwKUyQU4z2a', 'James Wilson', 'paralegal');

-- 15+ Clients
INSERT INTO clients (first_name, last_name, email, phone, nationality, date_of_birth, passport_number, current_status, address) VALUES
('Raj', 'Patel', 'raj.patel@email.com', '+1-555-0101', 'Indian', '1990-03-15', 'J8234567', 'H-1B', '123 Tech Lane, San Jose, CA 95110'),
('Maria', 'Garcia', 'maria.garcia@email.com', '+1-555-0102', 'Mexican', '1988-07-22', 'MEX12345', 'DACA', '456 Oak St, Los Angeles, CA 90001'),
('Wei', 'Zhang', 'wei.zhang@email.com', '+1-555-0103', 'Chinese', '1992-11-08', 'CN9876543', 'F-1 OPT', '789 University Ave, Boston, MA 02115'),
('Olga', 'Petrova', 'olga.petrova@email.com', '+1-555-0104', 'Russian', '1985-01-30', 'RU5551234', 'L-1A', '321 Corporate Blvd, New York, NY 10001'),
('Ahmed', 'Hassan', 'ahmed.hassan@email.com', '+1-555-0105', 'Egyptian', '1991-09-12', 'EG7778889', 'H-1B', '567 Innovation Dr, Austin, TX 78701'),
('Yuki', 'Tanaka', 'yuki.tanaka@email.com', '+1-555-0106', 'Japanese', '1993-04-18', 'JP3334445', 'E-2', '890 Market St, San Francisco, CA 94102'),
('Priya', 'Sharma', 'priya.sharma@email.com', '+1-555-0107', 'Indian', '1989-12-05', 'J1122334', 'H-4 EAD', '234 Maple Ave, Seattle, WA 98101'),
('Carlos', 'Silva', 'carlos.silva@email.com', '+1-555-0108', 'Brazilian', '1987-06-25', 'BR6667778', 'B-1/B-2', '678 Palm Dr, Miami, FL 33101'),
('Fatima', 'Al-Rashid', 'fatima.rashid@email.com', '+1-555-0109', 'Iraqi', '1994-02-14', 'IQ2223334', 'Asylee', '901 Liberty St, Chicago, IL 60601'),
('Andrei', 'Volkov', 'andrei.volkov@email.com', '+1-555-0110', 'Ukrainian', '1986-08-20', 'UA4445556', 'TPS', '345 Freedom Ave, Philadelphia, PA 19101'),
('Sun-Hee', 'Kim', 'sunhee.kim@email.com', '+1-555-0111', 'South Korean', '1995-10-01', 'KR8889990', 'F-1', '567 Campus Way, Ann Arbor, MI 48104'),
('Luis', 'Mendoza', 'luis.mendoza@email.com', '+1-555-0112', 'Guatemalan', '1983-05-17', 'GT1112223', 'U Visa', '890 Hope St, Houston, TX 77001'),
('Anya', 'Kowalski', 'anya.kowalski@email.com', '+1-555-0113', 'Polish', '1991-03-28', 'PL5556667', 'H-1B', '123 Tech Park, Denver, CO 80201'),
('Tariq', 'Mahmoud', 'tariq.mahmoud@email.com', '+1-555-0114', 'Pakistani', '1988-11-11', 'PK7778889', 'EB-2 NIW', '456 Research Ln, Cambridge, MA 02139'),
('Isabella', 'Romano', 'isabella.romano@email.com', '+1-555-0115', 'Italian', '1990-07-07', 'IT3334445', 'O-1', '789 Arts Ave, New York, NY 10012'),
('Ngozi', 'Okafor', 'ngozi.okafor@email.com', '+1-555-0116', 'Nigerian', '1992-01-23', 'NG6667778', 'F-1 STEM OPT', '321 Innovation Blvd, Atlanta, GA 30301');

-- 15+ Cases
INSERT INTO cases (case_number, case_type, client_id, assigned_attorney_id, status, priority, description, filing_date, deadline) VALUES
('IMM-2024-001', 'H-1B Petition', 1, 2, 'in_progress', 'high', 'H-1B cap registration and petition for software engineer position at TechCorp Inc.', '2024-03-01', '2024-06-30'),
('IMM-2024-002', 'DACA Renewal', 2, 3, 'in_progress', 'urgent', 'DACA renewal application - current status expiring in 60 days', '2024-02-15', '2024-04-15'),
('IMM-2024-003', 'F-1 to H-1B Change of Status', 3, 2, 'open', 'high', 'Change of status from F-1 OPT to H-1B for data scientist role', '2024-03-10', '2024-10-01'),
('IMM-2024-004', 'L-1A Extension', 4, 2, 'in_progress', 'medium', 'L-1A intracompany transferee extension for multinational manager', '2024-01-20', '2024-07-20'),
('IMM-2024-005', 'H-1B Transfer', 5, 3, 'approved', 'medium', 'H-1B transfer to new employer - AI research company', '2024-02-01', '2024-05-01'),
('IMM-2024-006', 'E-2 Treaty Investor', 6, 2, 'in_progress', 'high', 'E-2 treaty investor visa for Japanese restaurant chain expansion', '2024-03-05', '2024-09-05'),
('IMM-2024-007', 'H-4 EAD Renewal', 7, 3, 'pending_review', 'medium', 'H-4 EAD renewal application for dependent spouse', '2024-02-28', '2024-06-28'),
('IMM-2024-008', 'B-1/B-2 Extension', 8, 2, 'open', 'low', 'Extension of B-1/B-2 visitor status for business consultation', '2024-03-12', '2024-09-12'),
('IMM-2024-009', 'Asylum Application', 9, 3, 'in_progress', 'urgent', 'Affirmative asylum application - persecution based on political opinion', '2024-01-10', '2025-01-10'),
('IMM-2024-010', 'TPS Re-registration', 10, 2, 'in_progress', 'high', 'TPS re-registration for Ukrainian national under extended designation', '2024-02-20', '2024-10-20'),
('IMM-2024-011', 'F-1 Reinstatement', 11, 3, 'open', 'high', 'F-1 status reinstatement after academic program change', '2024-03-15', '2024-06-15'),
('IMM-2024-012', 'U Visa Petition', 12, 2, 'pending_review', 'urgent', 'U visa petition for victim of qualifying criminal activity', '2024-01-05', '2025-01-05'),
('IMM-2024-013', 'H-1B Amendment', 13, 3, 'in_progress', 'medium', 'H-1B amendment for material change in employment - new work location', '2024-03-08', '2024-06-08'),
('IMM-2024-014', 'EB-2 NIW', 14, 2, 'in_progress', 'high', 'Employment-based second preference National Interest Waiver petition', '2024-02-10', '2024-12-10'),
('IMM-2024-015', 'O-1 Extraordinary Ability', 15, 3, 'open', 'high', 'O-1 visa petition for internationally recognized fashion designer', '2024-03-18', '2024-09-18'),
('IMM-2024-016', 'F-1 STEM OPT Extension', 16, 2, 'in_progress', 'medium', 'STEM OPT extension application for computer science graduate', '2024-03-01', '2024-05-15');

-- 15+ Documents
INSERT INTO documents (document_name, document_type, case_id, client_id, status, file_path, notes) VALUES
('I-129 Petition', 'USCIS Form', 1, 1, 'completed', '/docs/imm-2024-001/i-129.pdf', 'H-1B petition form completed and signed'),
('Labor Condition Application', 'DOL Form', 1, 1, 'approved', '/docs/imm-2024-001/lca.pdf', 'LCA certified by DOL'),
('I-821D DACA Renewal', 'USCIS Form', 2, 2, 'submitted', '/docs/imm-2024-002/i-821d.pdf', 'DACA renewal form submitted'),
('Passport Copy - Wei Zhang', 'Identity Document', 3, 3, 'verified', '/docs/imm-2024-003/passport.pdf', 'Valid Chinese passport, expires 2028'),
('I-94 Arrival Record', 'Travel Document', 4, 4, 'verified', '/docs/imm-2024-004/i-94.pdf', 'Most recent I-94 showing L-1A status'),
('Business Plan', 'Supporting Document', 6, 6, 'completed', '/docs/imm-2024-006/business-plan.pdf', 'Detailed business plan for E-2 application'),
('Employment Verification Letter', 'Employment Document', 5, 5, 'completed', '/docs/imm-2024-005/employment-letter.pdf', 'Letter from new employer confirming position'),
('I-765 EAD Application', 'USCIS Form', 7, 7, 'submitted', '/docs/imm-2024-007/i-765.pdf', 'H-4 EAD renewal application'),
('Asylum Declaration', 'Legal Document', 9, 9, 'completed', '/docs/imm-2024-009/declaration.pdf', 'Detailed personal declaration for asylum claim'),
('Country Conditions Report', 'Supporting Document', 9, 9, 'completed', '/docs/imm-2024-009/country-report.pdf', 'Iraq country conditions documentation'),
('TPS Re-registration Form', 'USCIS Form', 10, 10, 'submitted', '/docs/imm-2024-010/tps-form.pdf', 'TPS re-registration under Ukraine designation'),
('Police Report', 'Legal Document', 12, 12, 'verified', '/docs/imm-2024-012/police-report.pdf', 'Certified police report for U visa qualification'),
('Academic Transcripts', 'Education Document', 11, 11, 'verified', '/docs/imm-2024-011/transcripts.pdf', 'University transcripts showing enrollment'),
('Research Publications', 'Supporting Document', 14, 14, 'completed', '/docs/imm-2024-014/publications.pdf', 'List of published research papers for EB-2 NIW'),
('Portfolio & Press Coverage', 'Supporting Document', 15, 15, 'completed', '/docs/imm-2024-015/portfolio.pdf', 'Fashion design portfolio and international press'),
('I-20 STEM OPT', 'Education Document', 16, 16, 'pending', '/docs/imm-2024-016/i-20.pdf', 'Updated I-20 for STEM OPT extension');

-- 15+ Visa Applications
INSERT INTO visa_applications (visa_type, client_id, status, application_date, expiry_date, embassy, notes) VALUES
('H-1B', 1, 'approved', '2024-03-01', '2027-03-01', 'USCIS Service Center', 'H-1B petition approved for 3 years'),
('DACA', 2, 'pending', '2024-02-15', '2024-06-15', 'USCIS Nebraska Service Center', 'Renewal application pending'),
('H-1B', 3, 'pending', '2024-03-10', '2027-10-01', 'USCIS California Service Center', 'Change of status pending'),
('L-1A', 4, 'approved', '2024-01-20', '2026-01-20', 'USCIS Vermont Service Center', 'Extension approved for 2 years'),
('H-1B', 5, 'approved', '2024-02-01', '2027-02-01', 'USCIS Service Center', 'Transfer approved with premium processing'),
('E-2', 6, 'pending', '2024-03-05', '2029-03-05', 'US Embassy Tokyo', 'Treaty investor visa under review'),
('H-4 EAD', 7, 'pending', '2024-02-28', '2025-02-28', 'USCIS Service Center', 'EAD renewal in process'),
('B-1/B-2', 8, 'approved', '2024-03-12', '2024-09-12', 'US Consulate Sao Paulo', 'Extension of stay approved'),
('Asylum', 9, 'pending', '2024-01-10', NULL, 'USCIS Asylum Office', 'Affirmative asylum interview scheduled'),
('TPS', 10, 'approved', '2024-02-20', '2025-04-20', 'USCIS Service Center', 'TPS under Ukraine designation'),
('F-1', 11, 'pending', '2024-03-15', '2025-06-15', 'USCIS Service Center', 'Reinstatement application pending'),
('U Visa', 12, 'pending', '2024-01-05', NULL, 'USCIS Vermont Service Center', 'Waitlisted - U visa cap reached'),
('H-1B', 13, 'approved', '2024-03-08', '2026-09-08', 'USCIS Service Center', 'Amendment approved for new location'),
('EB-2 NIW', 14, 'pending', '2024-02-10', NULL, 'USCIS Texas Service Center', 'I-140 petition under review'),
('O-1', 15, 'pending', '2024-03-18', '2027-03-18', 'USCIS Vermont Service Center', 'Extraordinary ability petition filed'),
('F-1 STEM OPT', 16, 'approved', '2024-03-01', '2026-05-01', 'USCIS Service Center', 'STEM OPT extension approved');

-- 15+ Deadlines
INSERT INTO deadlines (title, description, due_date, case_id, priority, status) VALUES
('H-1B Cap Filing Deadline', 'Submit H-1B cap petition before registration deadline', '2024-03-25', 1, 'urgent', 'pending'),
('DACA Renewal Submission', 'Submit DACA renewal 150 days before expiration', '2024-04-01', 2, 'urgent', 'completed'),
('OPT to H-1B COS Deadline', 'File change of status before OPT expiration', '2024-04-15', 3, 'high', 'pending'),
('L-1A Extension Response', 'Respond to RFE for L-1A extension', '2024-05-01', 4, 'high', 'pending'),
('E-2 Interview Preparation', 'Prepare client for E-2 visa interview at Tokyo embassy', '2024-05-15', 6, 'high', 'pending'),
('H-4 EAD Biometrics', 'Biometrics appointment for H-4 EAD renewal', '2024-04-10', 7, 'medium', 'pending'),
('Asylum Interview Prep', 'Prepare client for asylum interview', '2024-06-01', 9, 'urgent', 'pending'),
('TPS Re-registration Window', 'Submit TPS re-registration within designated period', '2024-04-20', 10, 'high', 'completed'),
('F-1 Reinstatement Documents', 'Submit all supporting documents for reinstatement', '2024-04-30', 11, 'high', 'pending'),
('U Visa Supplement Filing', 'File U visa supplement documents', '2024-05-20', 12, 'medium', 'pending'),
('EB-2 NIW Evidence Compilation', 'Compile all evidence for EB-2 NIW petition', '2024-06-15', 14, 'high', 'pending'),
('O-1 Advisory Opinion', 'Obtain peer group advisory opinion for O-1 petition', '2024-04-25', 15, 'high', 'pending'),
('STEM OPT Employer Reporting', 'Complete employer validation reporting for STEM OPT', '2024-07-01', 16, 'medium', 'pending'),
('Quarterly Case Review', 'Conduct quarterly review of all active cases', '2024-06-30', NULL, 'medium', 'pending'),
('Client Document Expiration Alert', 'Review all client documents approaching expiration', '2024-05-01', NULL, 'high', 'pending'),
('Annual Compliance Audit', 'Complete annual compliance audit for all H-1B clients', '2024-12-31', NULL, 'medium', 'pending');

-- 15+ Billing entries
INSERT INTO billing (invoice_number, client_id, case_id, amount, status, due_date, description, payment_method) VALUES
('INV-2024-001', 1, 1, 5000.00, 'paid', '2024-03-15', 'H-1B petition filing - attorney fees', 'credit_card'),
('INV-2024-002', 2, 2, 1500.00, 'paid', '2024-02-28', 'DACA renewal - legal fees', 'bank_transfer'),
('INV-2024-003', 3, 3, 4500.00, 'pending', '2024-04-10', 'F-1 to H-1B COS - full service', 'pending'),
('INV-2024-004', 4, 4, 6000.00, 'paid', '2024-02-01', 'L-1A extension - corporate billing', 'wire_transfer'),
('INV-2024-005', 5, 5, 3500.00, 'paid', '2024-02-15', 'H-1B transfer with premium processing', 'credit_card'),
('INV-2024-006', 6, 6, 8000.00, 'partial', '2024-04-05', 'E-2 treaty investor - comprehensive package', 'bank_transfer'),
('INV-2024-007', 7, 7, 1200.00, 'pending', '2024-03-28', 'H-4 EAD renewal filing', 'pending'),
('INV-2024-008', 8, 8, 2000.00, 'paid', '2024-03-25', 'B-1/B-2 extension of stay', 'credit_card'),
('INV-2024-009', 9, 9, 0.00, 'waived', '2024-01-15', 'Asylum case - pro bono', 'pro_bono'),
('INV-2024-010', 10, 10, 800.00, 'paid', '2024-03-01', 'TPS re-registration assistance', 'bank_transfer'),
('INV-2024-011', 11, 11, 3000.00, 'pending', '2024-04-15', 'F-1 reinstatement filing', 'pending'),
('INV-2024-012', 12, 12, 0.00, 'waived', '2024-01-20', 'U visa petition - pro bono', 'pro_bono'),
('INV-2024-013', 13, 13, 2500.00, 'paid', '2024-03-20', 'H-1B amendment filing', 'credit_card'),
('INV-2024-014', 14, 14, 7500.00, 'partial', '2024-03-10', 'EB-2 NIW comprehensive package', 'wire_transfer'),
('INV-2024-015', 15, 15, 6500.00, 'pending', '2024-04-18', 'O-1 extraordinary ability petition', 'pending'),
('INV-2024-016', 16, 16, 1800.00, 'paid', '2024-03-10', 'STEM OPT extension filing', 'bank_transfer');

-- 15+ Notes
INSERT INTO notes (case_id, title, content, note_type, author_id) VALUES
(1, 'Initial Consultation Notes', 'Client Raj Patel seeking H-1B sponsorship through TechCorp. Position: Senior Software Engineer. Salary: $145,000. Specialty occupation requirements met.', 'consultation', 2),
(2, 'DACA Renewal Timeline', 'Maria''s DACA expires June 15. Filed renewal 150 days in advance. All documents current. No criminal history issues.', 'deadline', 3),
(3, 'OPT Cap Gap Analysis', 'Wei has valid OPT through September. H-1B cap registration successful. Need to file COS before OPT expires. Cap gap protection applicable.', 'analysis', 2),
(4, 'RFE Response Strategy', 'USCIS issued RFE for L-1A extension questioning managerial capacity. Need org charts, job descriptions, and evidence of supervisory duties.', 'strategy', 2),
(5, 'Transfer Completion', 'H-1B transfer approved with premium processing. Client can begin employment with new employer immediately. I-797 received.', 'update', 3),
(6, 'E-2 Investment Evidence', 'Compiled evidence of $500K investment in restaurant chain. 3 locations planned. Job creation plan for 25 US workers.', 'evidence', 2),
(7, 'H-4 EAD Processing Delay', 'H-4 EAD renewal experiencing extended processing times. Current EAD expires in 60 days. May need to file expedite request.', 'concern', 3),
(9, 'Asylum Interview Preparation', 'Scheduled mock interview with Fatima. Reviewed persecution claim elements. Need to strengthen nexus to protected ground.', 'preparation', 3),
(10, 'TPS Extension Confirmed', 'Ukraine TPS designation extended through October 2025. Andrei''s re-registration accepted. EAD renewal pending.', 'update', 2),
(11, 'Reinstatement Grounds', 'Sun-Hee fell out of status due to program change. Compelling academic reasons exist. Need to show violation was not willful.', 'analysis', 3),
(12, 'U Visa Waitlist Status', 'Luis''s U visa petition approved but waitlisted due to annual cap. Currently in deferred action status. Work authorization maintained.', 'update', 2),
(13, 'Amendment Justification', 'H-1B amendment needed due to worksite change from Denver to Chicago office. Same position and duties. New LCA required.', 'filing', 3),
(14, 'NIW Evidence Strategy', 'Tariq has strong publication record (12 peer-reviewed papers). Citation count above average. Need to strengthen national interest argument.', 'strategy', 2),
(15, 'O-1 Criteria Analysis', 'Isabella meets at least 4 of 8 O-1 criteria: awards, published material, original contributions, high salary. Strong case.', 'analysis', 3),
(16, 'STEM OPT Compliance', 'Employer registered in E-Verify. Training plan completed. Self-evaluation schedule set for 12 and 24 months.', 'compliance', 2);

-- 15+ Forms
INSERT INTO forms (form_type, form_name, case_id, client_id, status, data, notes) VALUES
('I-129', 'Petition for Nonimmigrant Worker', 1, 1, 'filed', '{"petitioner": "TechCorp Inc", "beneficiary": "Raj Patel", "classification": "H-1B"}', 'H-1B petition filed with premium processing'),
('I-821D', 'Consideration of DACA', 2, 2, 'filed', '{"initial_approval_date": "2014-08-15", "renewal_number": 5}', 'Fifth DACA renewal application'),
('I-129', 'Petition for H-1B COS', 3, 3, 'draft', '{"current_status": "F-1", "requested_status": "H-1B"}', 'Change of status petition in preparation'),
('I-129', 'L-1A Extension Petition', 4, 4, 'filed', '{"extension_period": "2 years", "company": "Global Corp"}', 'L-1A extension with RFE pending'),
('I-129', 'H-1B Transfer Petition', 5, 5, 'approved', '{"new_employer": "AI Research Labs", "premium": true}', 'Transfer approved with premium processing'),
('DS-156E', 'E-2 Treaty Investor Application', 6, 6, 'draft', '{"investment_amount": 500000, "employees_planned": 25}', 'E-2 consular processing application'),
('I-765', 'Application for EAD', 7, 7, 'filed', '{"category": "H-4 Dependent", "renewal": true}', 'H-4 EAD renewal application'),
('I-539', 'Extension of Stay', 8, 8, 'filed', '{"current_status": "B-1/B-2", "extension_months": 6}', 'Extension of visitor status'),
('I-589', 'Asylum Application', 9, 9, 'filed', '{"basis": "Political Opinion", "country": "Iraq"}', 'Affirmative asylum application'),
('I-821', 'TPS Application', 10, 10, 'filed', '{"designation": "Ukraine", "re_registration": true}', 'TPS re-registration under Ukraine designation'),
('I-539', 'F-1 Reinstatement', 11, 11, 'draft', '{"reason": "Program Change", "new_program": "Computer Engineering"}', 'Reinstatement application in preparation'),
('I-918', 'U Visa Petition', 12, 12, 'filed', '{"crime_type": "Domestic Violence", "certification": true}', 'U visa petition with law enforcement certification'),
('I-129', 'H-1B Amendment', 13, 13, 'filed', '{"change_type": "Worksite", "new_location": "Chicago, IL"}', 'Amendment for worksite change'),
('I-140', 'EB-2 NIW Petition', 14, 14, 'draft', '{"category": "NIW", "field": "Biomedical Research"}', 'National Interest Waiver petition'),
('I-129', 'O-1 Petition', 15, 15, 'draft', '{"classification": "O-1B", "field": "Arts - Fashion Design"}', 'O-1B petition for fashion designer'),
('I-765', 'STEM OPT EAD', 16, 16, 'approved', '{"degree": "MS Computer Science", "employer": "DataTech Inc"}', 'STEM OPT extension EAD approved');

-- 15+ Compliance records
INSERT INTO compliance (check_type, case_id, client_id, status, result, notes) VALUES
('LCA Compliance', 1, 1, 'compliant', 'Employer meets prevailing wage requirements. Public access file maintained.', 'Annual LCA compliance review completed'),
('DACA Eligibility', 2, 2, 'compliant', 'Continuous residence verified. No disqualifying criminal history.', 'DACA renewal eligibility confirmed'),
('F-1 Status Verification', 3, 3, 'needs_review', 'OPT end date approaching. SEVIS record needs update.', 'Status verification before COS filing'),
('L-1A Qualifying Relationship', 4, 4, 'compliant', 'Parent-subsidiary relationship verified. Qualifying managerial role confirmed.', 'Corporate structure documentation reviewed'),
('H-1B Wage Compliance', 5, 5, 'compliant', 'Actual wage exceeds prevailing wage at Level 3.', 'Wage compliance verified for transfer'),
('E-2 Investment Substantiality', 6, 6, 'compliant', 'Investment of $500K is substantial for restaurant business. Marginality test passed.', 'Investment analysis completed'),
('H-4 EAD Eligibility', 7, 7, 'compliant', 'Principal H-1B holder has approved I-140. H-4 EAD eligibility confirmed.', 'Dependent status eligibility verified'),
('B-1/B-2 Nonimmigrant Intent', 8, 8, 'needs_review', 'Extended stay raises dual intent concerns. Need stronger ties documentation.', 'Review of nonimmigrant intent evidence'),
('Asylum One-Year Filing', 9, 9, 'compliant', 'Filed within one year of last arrival. No filing deadline exceptions needed.', 'One-year filing deadline met'),
('TPS Eligibility', 10, 10, 'compliant', 'Continuous residence since designation date verified. No criminal bars.', 'TPS eligibility requirements met'),
('F-1 Full Course Load', 11, 11, 'non_compliant', 'Student dropped below full course load. Reinstatement required.', 'Status violation documented'),
('U Visa Certification', 12, 12, 'compliant', 'Law enforcement certification obtained. Substantial abuse threshold met.', 'I-918B certification verified'),
('H-1B Specialty Occupation', 13, 13, 'compliant', 'Position requires minimum bachelor''s degree in specific field.', 'Specialty occupation criteria verified'),
('EB-2 Advanced Degree', 14, 14, 'compliant', 'PhD in Biomedical Engineering from accredited institution verified.', 'Advanced degree requirement met'),
('O-1 Extraordinary Ability', 15, 15, 'needs_review', 'Need to verify 3 additional criteria. Currently meets 4 of 8.', 'Criteria assessment in progress'),
('STEM OPT Employer E-Verify', 16, 16, 'compliant', 'Employer enrolled in E-Verify program. Valid E-Verify number confirmed.', 'E-Verify enrollment verified');

-- 15+ Status Tracking entries
INSERT INTO status_tracking (case_id, old_status, new_status, notes, changed_by) VALUES
(1, 'open', 'in_progress', 'H-1B cap registration submitted. Proceeding with petition preparation.', 2),
(2, 'open', 'in_progress', 'DACA renewal application filed with USCIS.', 3),
(3, NULL, 'open', 'New case created for F-1 to H-1B change of status.', 2),
(4, 'open', 'in_progress', 'L-1A extension petition filed. Receipt notice received.', 2),
(5, 'in_progress', 'approved', 'H-1B transfer approved. I-797A approval notice received.', 3),
(6, 'open', 'in_progress', 'E-2 application submitted to US Embassy Tokyo.', 2),
(7, 'open', 'pending_review', 'H-4 EAD renewal submitted. Awaiting biometrics notice.', 3),
(8, NULL, 'open', 'New case opened for B-1/B-2 extension of stay.', 2),
(9, 'open', 'in_progress', 'Asylum application filed. Interview scheduling pending.', 3),
(10, 'open', 'in_progress', 'TPS re-registration accepted during open registration period.', 2),
(11, NULL, 'open', 'Reinstatement case opened after program change.', 3),
(12, 'open', 'pending_review', 'U visa petition filed. Placed on waitlist.', 2),
(13, 'open', 'in_progress', 'H-1B amendment filed for worksite change.', 3),
(14, 'open', 'in_progress', 'EB-2 NIW petition preparation commenced. Evidence compilation underway.', 2),
(15, NULL, 'open', 'O-1 case opened. Gathering evidence for extraordinary ability.', 3),
(16, 'open', 'in_progress', 'STEM OPT extension application submitted.', 2);
