const { Pool } = require('pg');
require('dotenv').config();

let pool;

const createConnection = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
};

const testConnection = async () => {
  try {
    const connection = createConnection();
    const client = await connection.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    console.log('✅ Database connection successful');
    console.log('✅ Current time from DB:', result.rows[0].now);
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
};

const createTables = async () => {
  try {
    const pool = createConnection();
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create inventory table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        quantity INTEGER DEFAULT 0,
        unit_price DECIMAL(10,2) DEFAULT 0.00,
        category VARCHAR(100),
        supplier VARCHAR(255),
        min_stock_level INTEGER DEFAULT 0,
        location VARCHAR(255),
        sku VARCHAR(100) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

module.exports = {
  createConnection,
  testConnection,
  createTables,
  getPool: () => pool
};