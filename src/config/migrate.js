require('dotenv').config();
const { pool } = require('./database');

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('🔄 Running migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        status      VARCHAR(50)  NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'in_progress', 'done')),
        priority    VARCHAR(20)  NOT NULL DEFAULT 'medium'
                      CHECK (priority IN ('low', 'medium', 'high')),
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS set_updated_at ON tasks;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status   ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    `);

    console.log('✅ Migrations complete.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
