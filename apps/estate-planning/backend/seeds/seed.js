const pool = require('../db');
const bcrypt = require('bcryptjs');
const { createTables } = require('../models/schema');

async function seed() {
  try {
    await createTables();
    console.log('Tables created. Seeding data...');

    // Create demo user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userResult = await pool.query(
      `INSERT INTO users (email, password, full_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET password = $2, full_name = $3
       RETURNING id`,
      ['admin@estateplanning.com', hashedPassword, 'John Estate']
    );
    const userId = userResult.rows[0].id;

    // Seed Wills (15 items)
    const wills = [
      ['Last Will and Testament', 'John Estate', 'draft', 'I, John Estate, being of sound mind...', 'Sarah Estate', 'Michael Brown', 'Lisa White'],
      ['Living Will', 'John Estate', 'active', 'This living will declares my wishes...', 'Sarah Estate', 'Tom Green', 'Amy Black'],
      ['Joint Will - Spouse', 'John & Sarah Estate', 'draft', 'We, John and Sarah Estate, jointly declare...', 'Michael Estate Jr', 'Robert Smith', 'Jane Doe'],
      ['Holographic Will - Backup', 'John Estate', 'archived', 'Handwritten backup will dated 2023...', 'Sarah Estate', null, null],
      ['Conditional Will', 'John Estate', 'draft', 'This will takes effect only if...', 'David Estate', 'Mark Wilson', 'Chris Lee'],
      ['Mutual Will', 'John & Sarah Estate', 'review', 'Mutual agreement between spouses...', 'Children Trust', 'Peter Johnson', 'Karen Adams'],
      ['Pour-Over Will', 'John Estate', 'active', 'All remaining assets pour into the family trust...', 'Family Trust Trustee', 'Sam Davis', 'Nancy Clark'],
      ['Testamentary Trust Will', 'John Estate', 'draft', 'Establishes trust upon death for minor children...', 'Guardian Trust Co', 'Bill Taylor', 'Sue Miller'],
      ['Simple Will - Personal Property', 'John Estate', 'active', 'Distribution of personal property items...', 'Sarah Estate', 'Dan White', 'Mary Brown'],
      ['Digital Assets Will', 'John Estate', 'draft', 'Specific provisions for digital asset distribution...', 'Tech Executor LLC', 'Alex Turner', 'Pat Quinn'],
      ['Charitable Will', 'John Estate', 'review', 'Donations to specified charities...', 'Sarah Estate', 'Charity Witness 1', 'Charity Witness 2'],
      ['Business Succession Will', 'John Estate', 'draft', 'Provisions for business ownership transfer...', 'VP Operations', 'Legal Witness 1', 'Legal Witness 2'],
      ['International Assets Will', 'John Estate', 'draft', 'Will covering international property...', 'International Executor', 'Foreign Witness 1', 'Foreign Witness 2'],
      ['Emergency Will', 'John Estate', 'active', 'Quick emergency provisions...', 'Sarah Estate', 'Emergency W1', 'Emergency W2'],
      ['Codicil to Main Will', 'John Estate', 'draft', 'Amendment to the last will and testament...', 'Sarah Estate', 'Michael Brown', 'Lisa White'],
    ];
    for (const w of wills) {
      await pool.query(
        `INSERT INTO wills (user_id, title, testator_name, status, content, executor_name, witness_1, witness_2)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
        [userId, ...w]
      );
    }

    // Seed Digital Assets (15 items)
    const digitalAssets = [
      ['Bitcoin Wallet', 'cryptocurrency', 'Coinbase', 45000.00, 'Hardware wallet in safe', 'Sarah Estate', 'Primary BTC holdings', 'active'],
      ['Ethereum Holdings', 'cryptocurrency', 'MetaMask', 12000.00, 'Seed phrase in vault', 'Michael Estate Jr', 'ETH and ERC-20 tokens', 'active'],
      ['NFT Collection', 'digital_collectible', 'OpenSea', 8500.00, 'Connected to MetaMask', 'Sarah Estate', 'Art NFTs collection', 'active'],
      ['Netflix Subscription', 'subscription', 'Netflix', 15.99, 'Email login', 'Family', 'Family plan', 'active'],
      ['Spotify Premium', 'subscription', 'Spotify', 9.99, 'Email login', 'Family', 'Family plan', 'active'],
      ['Adobe Creative Suite', 'subscription', 'Adobe', 54.99, 'Business email', 'Business Partner', 'Annual license', 'active'],
      ['Gmail Account', 'email_account', 'Google', 0, 'Primary email', 'Sarah Estate', '15 years of emails', 'active'],
      ['iCloud Storage', 'cloud_storage', 'Apple', 2.99, 'Apple ID', 'Sarah Estate', '200GB plan with photos', 'active'],
      ['GitHub Repository', 'code_repository', 'GitHub', 0, 'SSH key access', 'Dev Team', 'Private repos', 'active'],
      ['Domain Names Portfolio', 'domain', 'GoDaddy', 2500.00, 'Account credentials in vault', 'Business Partner', '12 domains', 'active'],
      ['YouTube Channel', 'social_media', 'YouTube', 500.00, 'Google account', 'Sarah Estate', 'Monetized channel', 'active'],
      ['AWS Account', 'cloud_service', 'Amazon', 150.00, 'IAM credentials', 'Dev Team', 'Business infrastructure', 'active'],
      ['Robinhood Portfolio', 'investment', 'Robinhood', 35000.00, 'App login', 'Sarah Estate', 'Stock portfolio', 'active'],
      ['PayPal Balance', 'payment', 'PayPal', 1200.00, 'Email login', 'Sarah Estate', 'Business PayPal', 'active'],
      ['Solana Holdings', 'cryptocurrency', 'Phantom Wallet', 5600.00, 'Seed phrase in vault', 'Michael Estate Jr', 'SOL tokens', 'active'],
    ];
    for (const a of digitalAssets) {
      await pool.query(
        `INSERT INTO digital_assets (user_id, asset_name, asset_type, platform, value_estimate, access_info, beneficiary, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
        [userId, ...a]
      );
    }

    // Seed Beneficiaries (15 items)
    const beneficiaries = [
      ['Sarah Estate', 'Spouse', 'sarah@estate.com', '555-0101', '123 Main St, New York, NY', 40.00, 'Primary beneficiary', 'active'],
      ['Michael Estate Jr', 'Son', 'michael@estate.com', '555-0102', '456 Oak Ave, Boston, MA', 15.00, 'College trust fund recipient', 'active'],
      ['Emily Estate', 'Daughter', 'emily@estate.com', '555-0103', '789 Pine Rd, Chicago, IL', 15.00, 'Medical school fund', 'active'],
      ['Robert Estate', 'Brother', 'robert@estate.com', '555-0104', '321 Elm St, Denver, CO', 5.00, 'Family heirloom recipient', 'active'],
      ['Mary Johnson', 'Mother', 'mary@johnson.com', '555-0105', '654 Maple Dr, Miami, FL', 5.00, 'Care fund', 'active'],
      ['St. Jude Hospital', 'Charity', 'donations@stjude.org', '555-0106', '262 Danny Thomas Pl, Memphis, TN', 3.00, 'Annual charitable donation', 'active'],
      ['Red Cross Foundation', 'Charity', 'info@redcross.org', '555-0107', '430 17th St NW, Washington, DC', 2.00, 'Disaster relief fund', 'active'],
      ['James Estate', 'Son', 'james@estate.com', '555-0108', '987 Birch Ln, Seattle, WA', 10.00, 'Business succession', 'active'],
      ['Anna Williams', 'Niece', 'anna@williams.com', '555-0109', '147 Cedar Ct, Portland, OR', 2.00, 'Education fund', 'active'],
      ['David Chen', 'Business Partner', 'david@chen.biz', '555-0110', '258 Business Park, San Jose, CA', 3.00, 'Business share transfer', 'active'],
      ['Lisa Park', 'Friend', 'lisa@park.com', '555-0111', '369 Sunset Blvd, LA, CA', 0.00, 'Specific bequest - art collection', 'active'],
      ['Estate of John Sr', 'Father Estate', null, null, 'Deceased - trust distributions', 0.00, 'Conditional distribution', 'inactive'],
      ['Grace Church Foundation', 'Charity', 'admin@gracechurch.org', '555-0113', '500 Faith Ave, Nashville, TN', 0.00, 'Memorial donation', 'active'],
      ['Pet Trust Fund', 'Trust', null, null, null, 0.00, 'Care for pets after passing', 'active'],
      ['Stanford University', 'Charity', 'giving@stanford.edu', '555-0115', 'Stanford, CA 94305', 0.00, 'Scholarship endowment', 'active'],
    ];
    for (const b of beneficiaries) {
      await pool.query(
        `INSERT INTO beneficiaries (user_id, full_name, relationship, email, phone, address, share_percentage, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
        [userId, ...b]
      );
    }

    // Seed Notifications (15 items)
    const notifications = [
      ['email', 'Estate Plan Updated', 'Your estate plan has been updated with new provisions.', 'plan_update', 'sent', '2024-01-15', '2024-01-15'],
      ['email', 'Annual Review Reminder', 'Time for your annual estate plan review.', 'annual_review', 'pending', '2024-06-01', null],
      ['sms', 'Document Expiry Alert', 'Your power of attorney expires in 30 days.', 'document_expiry', 'pending', '2024-05-01', null],
      ['email', 'Beneficiary Added', 'A new beneficiary has been added to your estate.', 'beneficiary_change', 'sent', '2024-02-10', '2024-02-10'],
      ['email', 'Will Signing Reminder', 'Your will is ready for signing. Please schedule.', 'signing_reminder', 'pending', '2024-04-15', null],
      ['sms', 'Property Valuation Update', 'New property valuations available for review.', 'valuation_update', 'sent', '2024-03-01', '2024-03-01'],
      ['email', 'Trust Document Ready', 'Your family trust document is ready for review.', 'document_ready', 'pending', '2024-04-20', null],
      ['email', 'Insurance Policy Renewal', 'Life insurance policy renewal due next month.', 'policy_renewal', 'pending', '2024-07-01', null],
      ['sms', 'Emergency Contact Update', 'Please verify your emergency contacts.', 'contact_verify', 'sent', '2024-01-20', '2024-01-20'],
      ['email', 'Digital Asset Alert', 'Crypto portfolio value changed significantly.', 'asset_alert', 'pending', '2024-05-15', null],
      ['email', 'Healthcare Directive Reminder', 'Review your healthcare directive annually.', 'directive_review', 'pending', '2024-06-15', null],
      ['email', 'Executor Notification', 'Executor has been notified of their responsibilities.', 'executor_notify', 'sent', '2024-02-20', '2024-02-20'],
      ['sms', 'Legacy Message Scheduled', 'Legacy message delivery confirmed for trigger event.', 'message_scheduled', 'pending', '2024-08-01', null],
      ['email', 'Tax Document Ready', 'Estate tax documents are ready for review.', 'tax_document', 'pending', '2024-04-01', null],
      ['email', 'Milestone Completed', 'Congratulations! Estate planning milestone achieved.', 'milestone', 'sent', '2024-03-15', '2024-03-15'],
    ];
    for (const n of notifications) {
      await pool.query(
        `INSERT INTO notifications (user_id, beneficiary_id, notification_type, subject, message, trigger_event, status, scheduled_date, sent_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
        [userId, 1, ...n]
      );
    }

    // Seed Documents (15 items)
    const documents = [
      ['Last Will and Testament', 'will', 'Primary will document signed 2024', '/vault/will_2024.pdf', '2.1 MB', true, 'will,primary,signed'],
      ['Living Trust Agreement', 'trust', 'Family living trust document', '/vault/living_trust.pdf', '3.5 MB', true, 'trust,family,legal'],
      ['Power of Attorney - Financial', 'poa', 'Financial POA granting Sarah authority', '/vault/poa_financial.pdf', '1.8 MB', true, 'poa,financial'],
      ['Healthcare Directive', 'directive', 'Advance healthcare directive', '/vault/healthcare_directive.pdf', '1.2 MB', true, 'healthcare,directive'],
      ['Life Insurance Policy', 'insurance', 'MetLife policy #ML-2024-001', '/vault/life_insurance.pdf', '4.2 MB', false, 'insurance,life,metlife'],
      ['Property Deed - Main Home', 'deed', 'Deed for 123 Main St residence', '/vault/deed_main.pdf', '1.5 MB', true, 'deed,property,home'],
      ['Birth Certificate', 'identity', 'Certified copy of birth certificate', '/vault/birth_cert.pdf', '0.8 MB', true, 'identity,birth'],
      ['Marriage Certificate', 'identity', 'Marriage certificate with Sarah', '/vault/marriage_cert.pdf', '0.6 MB', true, 'identity,marriage'],
      ['Tax Returns 2023', 'tax', 'Federal and state tax returns', '/vault/tax_2023.pdf', '5.1 MB', true, 'tax,2023,federal'],
      ['Business Operating Agreement', 'business', 'LLC operating agreement', '/vault/business_agreement.pdf', '3.2 MB', true, 'business,llc,agreement'],
      ['Vehicle Titles', 'title', 'Titles for all vehicles', '/vault/vehicle_titles.pdf', '1.1 MB', false, 'vehicle,title'],
      ['Beneficiary Designation Forms', 'beneficiary', 'All beneficiary designation forms', '/vault/beneficiary_forms.pdf', '2.0 MB', false, 'beneficiary,forms'],
      ['Prenuptial Agreement', 'legal', 'Prenuptial agreement document', '/vault/prenup.pdf', '1.7 MB', true, 'legal,prenuptial'],
      ['Retirement Account Statements', 'financial', '401k and IRA statements', '/vault/retirement.pdf', '3.8 MB', true, 'financial,retirement,401k'],
      ['Guardianship Designation', 'legal', 'Guardian designation for minor children', '/vault/guardianship.pdf', '1.3 MB', true, 'legal,guardian,children'],
    ];
    for (const d of documents) {
      await pool.query(
        `INSERT INTO documents (user_id, title, document_type, description, file_path, file_size, is_encrypted, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
        [userId, ...d]
      );
    }

    // Seed Power of Attorney (15 items)
    const poas = [
      ['General Power of Attorney', 'general', 'John Estate', 'Sarah Estate', 'All financial and legal decisions', 'draft', '2024-01-01', '2025-12-31'],
      ['Financial POA', 'financial', 'John Estate', 'Sarah Estate', 'Banking, investments, tax matters', 'active', '2024-01-01', null],
      ['Healthcare POA', 'healthcare', 'John Estate', 'Sarah Estate', 'Medical decisions when incapacitated', 'active', '2024-01-01', null],
      ['Limited POA - Real Estate', 'limited', 'John Estate', 'David Chen', 'Sale of 456 Oak Ave property only', 'active', '2024-03-01', '2024-12-31'],
      ['Springing POA', 'springing', 'John Estate', 'Robert Estate', 'Activates upon incapacitation', 'draft', null, null],
      ['Durable POA', 'durable', 'John Estate', 'Sarah Estate', 'Survives incapacity of principal', 'active', '2024-01-01', null],
      ['Special POA - Tax', 'special', 'John Estate', 'CPA James Wright', 'File and manage tax returns', 'active', '2024-01-01', '2024-12-31'],
      ['Vehicle POA', 'limited', 'John Estate', 'Michael Estate Jr', 'Vehicle registration and sale', 'draft', '2024-06-01', '2024-12-31'],
      ['Business POA', 'business', 'John Estate', 'David Chen', 'Business operations and contracts', 'active', '2024-01-01', null],
      ['Child Care POA', 'childcare', 'John Estate', 'Mary Johnson', 'Temporary guardianship decisions', 'active', '2024-01-01', '2025-01-01'],
      ['Banking POA', 'financial', 'John Estate', 'Sarah Estate', 'Bank account management only', 'active', '2024-02-01', null],
      ['Insurance POA', 'limited', 'John Estate', 'Sarah Estate', 'Insurance claims and management', 'draft', '2024-01-01', null],
      ['Travel POA for Minor', 'childcare', 'John Estate', 'Robert Estate', 'Travel authorization for children', 'active', '2024-06-01', '2024-08-31'],
      ['Digital Assets POA', 'special', 'John Estate', 'Tech Executor LLC', 'Digital asset management', 'draft', null, null],
      ['Military POA', 'military', 'John Estate', 'Sarah Estate', 'All matters during deployment', 'archived', '2020-01-01', '2021-01-01'],
    ];
    for (const p of poas) {
      await pool.query(
        `INSERT INTO power_of_attorney (user_id, title, poa_type, principal_name, agent_name, powers_granted, status, effective_date, expiration_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
        [userId, ...p]
      );
    }

    // Seed Trusts (15 items)
    const trusts = [
      ['Estate Family Trust', 'revocable_living', 'John Estate', 'Sarah Estate', 'Sarah, Michael, Emily', 'All family assets', 'draft'],
      ['Children Education Trust', 'irrevocable', 'John Estate', 'First National Bank', 'Michael, Emily, James', '$500K education fund', 'active'],
      ['Charitable Remainder Trust', 'charitable', 'John Estate', 'Community Foundation', 'St. Jude, Red Cross', 'Investment portfolio', 'draft'],
      ['Special Needs Trust', 'special_needs', 'John Estate', 'Sarah Estate', 'Family members with needs', 'Supplemental care funds', 'draft'],
      ['Pet Trust', 'pet', 'John Estate', 'Mary Johnson', 'Pet care provider', '$50K pet care fund', 'active'],
      ['Spendthrift Trust', 'spendthrift', 'John Estate', 'First National Bank', 'James Estate', 'Structured distributions', 'draft'],
      ['Life Insurance Trust', 'irrevocable_life', 'John Estate', 'Insurance Trust Co', 'Sarah, Children', 'Life insurance policies', 'active'],
      ['QTIP Trust', 'qtip', 'John Estate', 'Estate Attorney', 'Sarah Estate', 'Marital property', 'draft'],
      ['Generation Skipping Trust', 'generation_skip', 'John Estate', 'Trust & Estate Bank', 'Grandchildren', 'Long-term wealth transfer', 'draft'],
      ['Real Estate Trust', 'land', 'John Estate', 'Sarah Estate', 'Family members', 'All real property', 'review'],
      ['Business Succession Trust', 'business', 'John Estate', 'David Chen', 'Business partners', 'Business ownership shares', 'draft'],
      ['Medicaid Trust', 'medicaid', 'John Estate', 'Elder Law Trust Co', 'John Estate', 'Asset protection for Medicaid', 'draft'],
      ['Blind Trust', 'blind', 'John Estate', 'Independent Trustee', 'John Estate', 'Investment assets', 'active'],
      ['Totten Trust', 'totten', 'John Estate', 'N/A (bank POD)', 'Sarah Estate', 'Bank accounts', 'active'],
      ['Dynasty Trust', 'dynasty', 'John Estate', 'Dynasty Trust Co', 'Future generations', 'Multi-generational wealth', 'draft'],
    ];
    for (const t of trusts) {
      await pool.query(
        `INSERT INTO trusts (user_id, trust_name, trust_type, grantor_name, trustee_name, beneficiary_names, assets_description, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
        [userId, ...t]
      );
    }

    // Seed Healthcare Directives (15 items)
    const directives = [
      ['Advance Directive - General', 'advance_directive', 'John Estate', 'Sarah Estate', 'Full life support preferred', 'Terminal illness, permanent unconsciousness'],
      ['DNR Order', 'dnr', 'John Estate', 'Sarah Estate', 'Do not resuscitate if terminal', 'Cardiac or respiratory arrest'],
      ['Living Will - Life Support', 'living_will', 'John Estate', 'Sarah Estate', 'Withdraw life support if brain dead', 'Persistent vegetative state'],
      ['Mental Health Directive', 'mental_health', 'John Estate', 'Sarah Estate', 'Preferred treatment facilities', 'Mental health crisis'],
      ['Organ Donation Directive', 'organ_donation', 'John Estate', 'N/A', 'Donate all viable organs', 'Upon death'],
      ['Pain Management Directive', 'pain_management', 'John Estate', 'Sarah Estate', 'Aggressive pain management', 'Terminal illness with pain'],
      ['Feeding Tube Directive', 'nutrition', 'John Estate', 'Sarah Estate', 'No artificial nutrition if terminal', 'Permanent unconsciousness'],
      ['Ventilator Directive', 'ventilator', 'John Estate', 'Sarah Estate', 'Time-limited ventilator use', 'Respiratory failure'],
      ['Dialysis Directive', 'dialysis', 'John Estate', 'Sarah Estate', 'Continue dialysis unless terminal', 'Kidney failure'],
      ['Hospice Care Preference', 'hospice', 'John Estate', 'Sarah Estate', 'Prefer home hospice care', 'Terminal diagnosis < 6 months'],
      ['Religious Considerations', 'religious', 'John Estate', 'Sarah Estate', 'Request chaplain services', 'End of life care'],
      ['Pediatric Directive - Minor Children', 'pediatric', 'John Estate', 'Mary Johnson', 'Full treatment for minors', 'Emergency medical situations'],
      ['Travel Medical Directive', 'travel', 'John Estate', 'Sarah Estate', 'Evacuation to home country', 'Medical emergency abroad'],
      ['Dementia Care Plan', 'dementia', 'John Estate', 'Sarah Estate', 'Preferred memory care facility', 'Cognitive decline diagnosis'],
      ['Emergency Contact Protocol', 'emergency', 'John Estate', 'Sarah Estate', 'Contact priority list defined', 'Any medical emergency'],
    ];
    for (const d of directives) {
      await pool.query(
        `INSERT INTO healthcare_directives (user_id, title, directive_type, principal_name, healthcare_agent, wishes, conditions)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
        [userId, ...d]
      );
    }

    // Seed Insurance Policies (15 items)
    const policies = [
      ['MetLife Term Life', 'term_life', 'MetLife', 'ML-2024-001', 1000000.00, 150.00, 'Sarah Estate', '2024-01-01', '2044-01-01', 'active'],
      ['Prudential Whole Life', 'whole_life', 'Prudential', 'PR-2020-445', 500000.00, 300.00, 'Children', '2020-06-01', null, 'active'],
      ['State Farm Home Insurance', 'homeowners', 'State Farm', 'SF-HOME-789', 450000.00, 120.00, 'Mortgage Company', '2024-01-01', '2025-01-01', 'active'],
      ['GEICO Auto Insurance', 'auto', 'GEICO', 'GK-AUTO-321', 100000.00, 80.00, 'N/A', '2024-03-01', '2025-03-01', 'active'],
      ['Aetna Health Insurance', 'health', 'Aetna', 'AE-HEALTH-555', 0, 450.00, 'N/A', '2024-01-01', '2024-12-31', 'active'],
      ['Hartford Disability', 'disability', 'Hartford', 'HT-DIS-222', 5000.00, 75.00, 'Self', '2024-01-01', '2025-01-01', 'active'],
      ['Umbrella Policy', 'umbrella', 'State Farm', 'SF-UMB-999', 2000000.00, 50.00, 'N/A', '2024-01-01', '2025-01-01', 'active'],
      ['Long Term Care', 'long_term_care', 'Genworth', 'GW-LTC-111', 300000.00, 200.00, 'Self', '2022-01-01', null, 'active'],
      ['Business Liability', 'business', 'Travelers', 'TR-BIZ-444', 1000000.00, 250.00, 'Business', '2024-01-01', '2025-01-01', 'active'],
      ['Dental Insurance', 'dental', 'Delta Dental', 'DD-DENT-666', 2000.00, 35.00, 'N/A', '2024-01-01', '2024-12-31', 'active'],
      ['Vision Insurance', 'vision', 'VSP', 'VSP-VIS-777', 500.00, 15.00, 'N/A', '2024-01-01', '2024-12-31', 'active'],
      ['Flood Insurance', 'flood', 'NFIP', 'NF-FLD-333', 250000.00, 85.00, 'Mortgage Company', '2024-01-01', '2025-01-01', 'active'],
      ['Jewelry Rider', 'rider', 'State Farm', 'SF-JWL-888', 50000.00, 25.00, 'Sarah Estate', '2024-01-01', '2025-01-01', 'active'],
      ['Professional Liability', 'professional', 'Hiscox', 'HX-PRO-246', 1000000.00, 175.00, 'N/A', '2024-01-01', '2025-01-01', 'active'],
      ['Travel Insurance', 'travel', 'Allianz', 'AL-TRV-135', 100000.00, 30.00, 'N/A', '2024-06-01', '2024-07-01', 'expired'],
    ];
    for (const p of policies) {
      await pool.query(
        `INSERT INTO insurance_policies (user_id, policy_name, policy_type, provider, policy_number, coverage_amount, premium_amount, beneficiary, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT DO NOTHING`,
        [userId, ...p]
      );
    }

    // Seed Properties (15 items)
    const properties = [
      ['Main Residence', 'residential', '123 Main St, New York, NY 10001', 850000.00, 320000.00, 'Joint Tenancy', 'Sarah Estate', 'Primary family home', 'active'],
      ['Beach House', 'vacation', '456 Ocean Dr, Malibu, CA 90265', 1200000.00, 450000.00, 'Joint Tenancy', 'Sarah Estate', 'Vacation property', 'active'],
      ['Mountain Cabin', 'vacation', '789 Pine Trail, Aspen, CO 81611', 650000.00, 0, 'Sole Ownership', 'Children', 'Paid off cabin', 'active'],
      ['Downtown Condo', 'investment', '321 Urban Pl #15A, Chicago, IL 60601', 420000.00, 280000.00, 'LLC Owned', 'Business LLC', 'Rental property', 'active'],
      ['Office Space', 'commercial', '555 Business Park, San Jose, CA 95110', 750000.00, 400000.00, 'LLC Owned', 'David Chen', 'Company office', 'active'],
      ['Vacant Land - Texas', 'land', '40 Acres, Ranch Rd, Austin, TX 78701', 200000.00, 0, 'Sole Ownership', 'James Estate', 'Investment land', 'active'],
      ['Storage Unit Complex', 'commercial', '100 Storage Way, Phoenix, AZ 85001', 500000.00, 250000.00, 'Partnership', 'Business Partner', 'Income property', 'active'],
      ['Townhouse', 'residential', '222 Townhouse Ln, Boston, MA 02101', 380000.00, 200000.00, 'Sole Ownership', 'Michael Estate Jr', 'Sons residence', 'active'],
      ['Farm Property', 'agricultural', '1000 Farm Rd, Iowa City, IA 52240', 450000.00, 100000.00, 'Trust Owned', 'Family Trust', 'Agricultural income', 'active'],
      ['Parking Garage', 'commercial', '50 Parking Plaza, Manhattan, NY 10016', 2000000.00, 1200000.00, 'LLC Owned', 'Business LLC', 'Commercial parking', 'active'],
      ['Lake House', 'vacation', '75 Lakeside Dr, Lake Tahoe, CA 96150', 900000.00, 350000.00, 'Joint Tenancy', 'Sarah Estate', 'Summer retreat', 'active'],
      ['Retail Strip', 'commercial', '800 Retail Row, Dallas, TX 75201', 1500000.00, 800000.00, 'LLC Owned', 'Business LLC', 'Multi-tenant retail', 'active'],
      ['Duplex', 'investment', '44 Duplex St, Portland, OR 97201', 350000.00, 200000.00, 'Sole Ownership', 'Emily Estate', 'Rental income', 'active'],
      ['Warehouse', 'industrial', '999 Industrial Blvd, Atlanta, GA 30301', 600000.00, 350000.00, 'LLC Owned', 'Business LLC', 'Storage and distribution', 'active'],
      ['Foreign Property - Italy', 'international', 'Via Roma 10, Florence, Italy', 300000.00, 0, 'Sole Ownership', 'Sarah Estate', 'Vacation villa', 'active'],
    ];
    for (const p of properties) {
      await pool.query(
        `INSERT INTO properties (user_id, property_name, property_type, address, estimated_value, mortgage_balance, ownership_type, beneficiary, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT DO NOTHING`,
        [userId, ...p]
      );
    }

    // Seed Legacy Messages (15 items)
    const messages = [
      ['To My Beloved Wife', 'Sarah Estate', 'sarah@estate.com', 'My dearest Sarah, if you are reading this...', 'upon_death', 'draft'],
      ['To My Son Michael', 'Michael Estate Jr', 'michael@estate.com', 'Michael, I am so proud of the man you have become...', 'upon_death', 'draft'],
      ['To My Daughter Emily', 'Emily Estate', 'emily@estate.com', 'Emily, your creativity and kindness inspire me...', 'upon_death', 'draft'],
      ['To My Son James', 'James Estate', 'james@estate.com', 'James, the business is now in your capable hands...', 'upon_death', 'draft'],
      ['To My Brother Robert', 'Robert Estate', 'robert@estate.com', 'Robert, thank you for being my rock...', 'upon_death', 'draft'],
      ['To My Mother', 'Mary Johnson', 'mary@johnson.com', 'Mom, everything I am is because of you...', 'upon_death', 'draft'],
      ['To My Business Partner', 'David Chen', 'david@chen.biz', 'David, our partnership built something amazing...', 'upon_death', 'draft'],
      ['Birthday Message - Michael 30th', 'Michael Estate Jr', 'michael@estate.com', 'Happy 30th birthday, son! Here is some wisdom...', 'specific_date', 'scheduled'],
      ['Wedding Day Message - Emily', 'Emily Estate', 'emily@estate.com', 'On your wedding day, remember these words...', 'life_event', 'draft'],
      ['Graduation Message - James', 'James Estate', 'james@estate.com', 'Congratulations on your graduation! The world awaits...', 'life_event', 'draft'],
      ['Annual Family Message', 'Family', 'sarah@estate.com', 'To my wonderful family, another year together...', 'annual', 'active'],
      ['Emergency Message', 'Sarah Estate', 'sarah@estate.com', 'If you receive this, access the document vault...', 'emergency', 'active'],
      ['Forgiveness Letter', 'Estate of John Sr', null, 'Dad, I forgive everything and I understand now...', 'upon_death', 'draft'],
      ['Gratitude to Friends', 'Lisa Park', 'lisa@park.com', 'Lisa, your friendship meant the world to me...', 'upon_death', 'draft'],
      ['Future Grandchildren', 'Future Family', null, 'To my grandchildren I may never meet...', 'upon_death', 'draft'],
    ];
    for (const m of messages) {
      await pool.query(
        `INSERT INTO legacy_messages (user_id, title, recipient_name, recipient_email, message_content, delivery_trigger, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
        [userId, ...m]
      );
    }

    // Seed Estate Timeline (15 items)
    const timeline = [
      ['Create Initial Will Draft', 'Draft the first version of the will', 'document', '2024-02-01', '2024-01-28', 'high', 'completed'],
      ['Inventory All Digital Assets', 'Complete inventory of all digital assets', 'inventory', '2024-03-01', '2024-02-25', 'high', 'completed'],
      ['Set Up Family Trust', 'Establish the family living trust', 'legal', '2024-04-15', null, 'high', 'in_progress'],
      ['Review Insurance Coverage', 'Annual insurance policy review', 'review', '2024-05-01', null, 'medium', 'pending'],
      ['Update Beneficiary Designations', 'Ensure all beneficiaries are current', 'update', '2024-05-15', null, 'high', 'pending'],
      ['Execute Power of Attorney', 'Sign and notarize POA documents', 'legal', '2024-06-01', null, 'high', 'pending'],
      ['Healthcare Directive Signing', 'Complete healthcare directive signing', 'legal', '2024-06-15', null, 'high', 'pending'],
      ['Property Appraisals', 'Get updated property appraisals', 'valuation', '2024-07-01', null, 'medium', 'pending'],
      ['Legacy Messages Review', 'Review and finalize legacy messages', 'personal', '2024-08-01', null, 'low', 'pending'],
      ['Business Succession Plan', 'Finalize business succession details', 'business', '2024-09-01', null, 'high', 'pending'],
      ['Tax Planning Review', 'Annual estate tax planning session', 'financial', '2024-10-01', null, 'medium', 'pending'],
      ['Document Vault Audit', 'Verify all documents are current and secured', 'audit', '2024-11-01', null, 'medium', 'pending'],
      ['Annual Estate Plan Review', 'Comprehensive annual review', 'review', '2024-12-01', null, 'high', 'pending'],
      ['Beneficiary Notification Test', 'Test notification automation system', 'technical', '2024-06-30', null, 'medium', 'pending'],
      ['Meet with Estate Attorney', 'Quarterly meeting with estate attorney', 'meeting', '2024-04-01', null, 'high', 'in_progress'],
    ];
    for (const t of timeline) {
      await pool.query(
        `INSERT INTO estate_timeline (user_id, title, description, milestone_type, due_date, completed_date, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
        [userId, ...t]
      );
    }

    // Seed Executor Tasks (15 items)
    const executorTasks = [
      ['Obtain Death Certificates', 'Order 15 certified copies of death certificate', 'Sarah Estate', 'administrative', 'high', '2024-01-15', null, 'pending'],
      ['Notify Social Security', 'Report death to Social Security Administration', 'Sarah Estate', 'government', 'high', '2024-01-20', null, 'pending'],
      ['Contact Life Insurance Companies', 'File claims with all life insurance providers', 'Sarah Estate', 'financial', 'high', '2024-01-25', null, 'pending'],
      ['Secure Properties', 'Change locks, check security on all properties', 'Robert Estate', 'property', 'high', '2024-01-10', null, 'pending'],
      ['Inventory Safe Deposit Box', 'Open and inventory safe deposit box contents', 'Sarah Estate', 'inventory', 'medium', '2024-02-01', null, 'pending'],
      ['Notify Banks and Financial Institutions', 'Contact all banks to freeze accounts', 'Sarah Estate', 'financial', 'high', '2024-01-15', null, 'pending'],
      ['File Probate Petition', 'File the will with the probate court', 'Estate Attorney', 'legal', 'high', '2024-02-15', null, 'pending'],
      ['Cancel Subscriptions', 'Cancel all non-essential subscriptions', 'Michael Estate Jr', 'administrative', 'low', '2024-03-01', null, 'pending'],
      ['Transfer Vehicle Titles', 'Transfer ownership of all vehicles', 'Michael Estate Jr', 'property', 'medium', '2024-04-01', null, 'pending'],
      ['Distribute Personal Property', 'Distribute personal items per will', 'Sarah Estate', 'distribution', 'medium', '2024-05-01', null, 'pending'],
      ['File Final Tax Return', 'Prepare and file the final tax return', 'CPA James Wright', 'tax', 'high', '2024-04-15', null, 'pending'],
      ['Pay Outstanding Debts', 'Settle all outstanding debts and obligations', 'Sarah Estate', 'financial', 'high', '2024-03-01', null, 'pending'],
      ['Notify Credit Agencies', 'Report death to credit bureaus', 'Sarah Estate', 'administrative', 'medium', '2024-02-01', null, 'pending'],
      ['Close Digital Accounts', 'Close or memorialize online accounts', 'Michael Estate Jr', 'digital', 'medium', '2024-03-15', null, 'pending'],
      ['Final Distribution', 'Execute final distribution to beneficiaries', 'Sarah Estate', 'distribution', 'high', '2024-06-01', null, 'pending'],
    ];
    for (const e of executorTasks) {
      await pool.query(
        `INSERT INTO executor_tasks (user_id, title, description, assigned_to, category, priority, due_date, completed_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
        [userId, ...e]
      );
    }

    // Seed Digital Accounts (15 items)
    const digitalAccounts = [
      ['Gmail Account', 'email', 'Google', 'johnestate', 'john@estate.com', 'memorialize', 'Sarah Estate', 'Primary email - 15 years', 'active'],
      ['Facebook Profile', 'social_media', 'Facebook', 'john.estate', 'john@estate.com', 'memorialize', 'Sarah Estate', 'Memorialized account', 'active'],
      ['LinkedIn Profile', 'professional', 'LinkedIn', 'johnestate', 'john@estate.com', 'delete', 'Sarah Estate', 'Professional network', 'active'],
      ['Twitter/X Account', 'social_media', 'X (Twitter)', '@johnestate', 'john@estate.com', 'delete', 'Michael Estate Jr', 'Personal tweets', 'active'],
      ['Instagram Account', 'social_media', 'Instagram', 'john.estate', 'john@estate.com', 'memorialize', 'Emily Estate', 'Photo memories', 'active'],
      ['Amazon Account', 'shopping', 'Amazon', 'john@estate.com', 'john@estate.com', 'close', 'Sarah Estate', 'Prime membership', 'active'],
      ['Apple ID', 'technology', 'Apple', 'john@estate.com', 'john@estate.com', 'transfer', 'Sarah Estate', 'iCloud, Apple Music', 'active'],
      ['Microsoft Account', 'technology', 'Microsoft', 'john@estate.com', 'john@estate.com', 'transfer', 'Sarah Estate', 'OneDrive, Office 365', 'active'],
      ['Dropbox Business', 'cloud_storage', 'Dropbox', 'john@estate.com', 'john@estate.com', 'transfer', 'David Chen', 'Business files', 'active'],
      ['WordPress Blog', 'website', 'WordPress', 'johnestate', 'john@estate.com', 'maintain', 'Michael Estate Jr', 'Personal blog', 'active'],
      ['Slack Workspace', 'communication', 'Slack', 'john@estate.com', 'john@estate.com', 'deactivate', 'David Chen', 'Business communication', 'active'],
      ['Zoom Account', 'communication', 'Zoom', 'john@estate.com', 'john@estate.com', 'close', 'N/A', 'Pro subscription', 'active'],
      ['Reddit Account', 'social_media', 'Reddit', 'u/johnestate', 'john@estate.com', 'delete', 'N/A', 'Anonymous account', 'active'],
      ['Pinterest Account', 'social_media', 'Pinterest', 'johnestate', 'john@estate.com', 'delete', 'Emily Estate', 'Shared boards', 'active'],
      ['Discord Server', 'communication', 'Discord', 'JohnEstate#1234', 'john@estate.com', 'transfer', 'James Estate', 'Gaming community admin', 'active'],
    ];
    for (const a of digitalAccounts) {
      await pool.query(
        `INSERT INTO digital_accounts (user_id, account_name, account_type, platform, username, email_associated, action_on_death, designated_contact, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT DO NOTHING`,
        [userId, ...a]
      );
    }

    console.log('All seed data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
