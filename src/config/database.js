const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'taskdb',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'yourpassword',
  max:      parseInt(process.env.DB_POOL_MAX)    || 10,
  idleTimeoutMillis:    parseInt(process.env.DB_POOL_IDLE)    || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_ACQUIRE) || 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error:', err);
});

const testConnection = async () => {
  const client = await pool.connect();
  console.log(`✅ PostgreSQL connected to "${process.env.DB_NAME || 'taskdb'}" on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
  client.release();
};

module.exports = { pool, testConnection };
