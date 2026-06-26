const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zaptaste_db',
    multipleStatements: true
  });

  try {
    console.log('🌱 Starting database seeding...');
    const seedSql = fs.readFileSync(path.join(__dirname, '../../database/seed.sql'), 'utf8');
    await connection.query(seedSql);
    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await connection.end();
  }
}

seed();
