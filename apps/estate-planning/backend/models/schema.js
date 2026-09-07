const pool = require('../db');

async function createTables() {
  const queries = `
    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Wills (AI-assisted)
    CREATE TABLE IF NOT EXISTS wills (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      testator_name VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'draft',
      content TEXT,
      ai_suggestions TEXT,
      executor_name VARCHAR(255),
      witness_1 VARCHAR(255),
      witness_2 VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Digital Assets
    CREATE TABLE IF NOT EXISTS digital_assets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      asset_name VARCHAR(255) NOT NULL,
      asset_type VARCHAR(100) NOT NULL,
      platform VARCHAR(255),
      value_estimate DECIMAL(15,2),
      access_info TEXT,
      beneficiary VARCHAR(255),
      notes TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Beneficiaries
    CREATE TABLE IF NOT EXISTS beneficiaries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      full_name VARCHAR(255) NOT NULL,
      relationship VARCHAR(100),
      email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      share_percentage DECIMAL(5,2),
      notes TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      beneficiary_id INTEGER REFERENCES beneficiaries(id) ON DELETE SET NULL,
      notification_type VARCHAR(100) NOT NULL,
      subject VARCHAR(255),
      message TEXT,
      trigger_event VARCHAR(100),
      status VARCHAR(50) DEFAULT 'pending',
      scheduled_date TIMESTAMP,
      sent_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Document Vault
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      document_type VARCHAR(100) NOT NULL,
      description TEXT,
      file_path VARCHAR(500),
      file_size VARCHAR(50),
      is_encrypted BOOLEAN DEFAULT false,
      tags TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Power of Attorney (AI-assisted)
    CREATE TABLE IF NOT EXISTS power_of_attorney (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      poa_type VARCHAR(100) NOT NULL,
      principal_name VARCHAR(255),
      agent_name VARCHAR(255),
      powers_granted TEXT,
      ai_content TEXT,
      effective_date DATE,
      expiration_date DATE,
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Trusts (AI-assisted)
    CREATE TABLE IF NOT EXISTS trusts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      trust_name VARCHAR(255) NOT NULL,
      trust_type VARCHAR(100) NOT NULL,
      grantor_name VARCHAR(255),
      trustee_name VARCHAR(255),
      beneficiary_names TEXT,
      assets_description TEXT,
      ai_recommendations TEXT,
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Healthcare Directives (AI-assisted)
    CREATE TABLE IF NOT EXISTS healthcare_directives (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      directive_type VARCHAR(100) NOT NULL,
      principal_name VARCHAR(255),
      healthcare_agent VARCHAR(255),
      wishes TEXT,
      ai_content TEXT,
      conditions TEXT,
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Insurance Policies
    CREATE TABLE IF NOT EXISTS insurance_policies (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      policy_name VARCHAR(255) NOT NULL,
      policy_type VARCHAR(100) NOT NULL,
      provider VARCHAR(255),
      policy_number VARCHAR(100),
      coverage_amount DECIMAL(15,2),
      premium_amount DECIMAL(10,2),
      beneficiary VARCHAR(255),
      start_date DATE,
      end_date DATE,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Properties
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      property_name VARCHAR(255) NOT NULL,
      property_type VARCHAR(100) NOT NULL,
      address TEXT,
      estimated_value DECIMAL(15,2),
      mortgage_balance DECIMAL(15,2) DEFAULT 0,
      ownership_type VARCHAR(100),
      beneficiary VARCHAR(255),
      notes TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Legacy Messages (AI-assisted)
    CREATE TABLE IF NOT EXISTS legacy_messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      recipient_name VARCHAR(255),
      recipient_email VARCHAR(255),
      message_content TEXT,
      ai_enhanced_content TEXT,
      delivery_trigger VARCHAR(100),
      delivery_date TIMESTAMP,
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Estate Timeline
    CREATE TABLE IF NOT EXISTS estate_timeline (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      milestone_type VARCHAR(100),
      due_date DATE,
      completed_date DATE,
      priority VARCHAR(50) DEFAULT 'medium',
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- AI Chat History
    CREATE TABLE IF NOT EXISTS ai_chat_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      feature VARCHAR(100) NOT NULL,
      prompt TEXT NOT NULL,
      response TEXT,
      model VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Executor Tasks
    CREATE TABLE IF NOT EXISTS executor_tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      assigned_to VARCHAR(255),
      category VARCHAR(100),
      priority VARCHAR(50) DEFAULT 'medium',
      due_date DATE,
      completed_date DATE,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Digital Account Guardian
    CREATE TABLE IF NOT EXISTS digital_accounts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      account_name VARCHAR(255) NOT NULL,
      account_type VARCHAR(100) NOT NULL,
      platform VARCHAR(255),
      username VARCHAR(255),
      email_associated VARCHAR(255),
      action_on_death VARCHAR(100),
      designated_contact VARCHAR(255),
      notes TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await pool.query(queries);
  console.log('All tables created successfully');
}

module.exports = { createTables };
