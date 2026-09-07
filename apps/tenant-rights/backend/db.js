const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        state VARCHAR(100),
        city VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tenancies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        landlord_name VARCHAR(255),
        property_address TEXT NOT NULL,
        state VARCHAR(100) NOT NULL,
        monthly_rent NUMERIC(12,2),
        lease_start DATE,
        lease_end DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS issues (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenancy_id UUID REFERENCES tenancies(id) ON DELETE CASCADE,
        issue_type VARCHAR(100) NOT NULL,
        description TEXT,
        reported_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'open',
        ai_analysis JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenancy_id UUID REFERENCES tenancies(id) ON DELETE CASCADE,
        notice_type VARCHAR(100),
        content JSONB,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rent_checks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenancy_id UUID REFERENCES tenancies(id) ON DELETE CASCADE,
        current_rent NUMERIC(12,2),
        proposed_rent NUMERIC(12,2),
        address TEXT,
        jurisdiction_data JSONB,
        ai_verdict JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenancy_id UUID REFERENCES tenancies(id) ON DELETE CASCADE,
        doc_type VARCHAR(100),
        content JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        endpoint VARCHAR(100),
        input_data JSONB,
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, initDatabase };
