// database/seedAdmin.js
// One-time setup script: creates (or resets) the default demo admin
// account with a properly bcrypt-hashed password.
//
// Run with:
//   node database/seedAdmin.js
//
// This keeps the admin password out of schema.sql / seed.sql (which
// would otherwise store it as plain text) and out of the application
// source code. The demo credentials are documented in README.md.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const ADMIN_NAME = 'MediCare+ Admin';
const ADMIN_EMAIL = 'admin@medicareplus.test';
const ADMIN_PASSWORD = 'Admin@123'; // demo password — documented in README.md

async function seedAdmin() {
  try {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [ADMIN_EMAIL]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE users SET password = ?, role = ? WHERE email = ?',
        [hashedPassword, 'admin', ADMIN_EMAIL]
      );
      console.log(`Existing admin account updated: ${ADMIN_EMAIL}`);
    } else {
      await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES (?, ?, ?, ?)`,
        [ADMIN_NAME, ADMIN_EMAIL, hashedPassword, 'admin']
      );
      console.log(`Admin account created: ${ADMIN_EMAIL}`);
    }

    console.log('Demo admin login:');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('(Change this password before using this project outside of a local demo.)');
  } catch (err) {
    console.error('Failed to seed admin account:', err.message);
  } finally {
    await pool.end();
  }
}

seedAdmin();
