const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined
});

pool.on('error', (error) => {
  console.error('Error inesperado en el pool de PostgreSQL:', error);
});

module.exports = pool;