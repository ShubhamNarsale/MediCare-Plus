// config/db.js
// MySQL connection pool using mysql2 (promise-based API)

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medicare_plus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Quick sanity check on startup (does not crash the app if it fails —
// just logs a clear message so students can see what's wrong).
pool.getConnection()
  .then((connection) => {
    console.log('MySQL connected successfully.');
    connection.release();
  })
  .catch((err) => {
    console.error('MySQL connection failed:', err.message);
    console.error('Check your .env file and make sure MySQL is running.');
  });

module.exports = pool;
