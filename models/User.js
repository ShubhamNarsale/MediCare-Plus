// models/User.js
// Database queries for the `users` table.
// Columns: id, name, email, password, phone, address, date_of_birth,
//          gender, role, profile_image, created_at, updated_at

const pool = require('../config/db');

const User = {
  /**
   * Create a new patient/admin user.
   * `password` must already be hashed (bcrypt) before calling this.
   */
  async create({ name, email, password, phone = null, address = null, role = 'patient' }) {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, phone, address, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password, phone, address, role]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, name, email, password, phone, address, date_of_birth,
              gender, role, profile_image, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT id, name, email, password, phone, address, date_of_birth,
              gender, role, profile_image, created_at, updated_at
       FROM users WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  },

  async emailExists(email) {
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0;
  },

  /**
   * Update editable profile fields. Only the fields provided are updated.
   */
  async updateProfile(id, { name, phone, address, date_of_birth, gender, profile_image }) {
    const [result] = await pool.query(
      `UPDATE users
       SET name = ?, phone = ?, address = ?, date_of_birth = ?, gender = ?,
           profile_image = COALESCE(?, profile_image)
       WHERE id = ?`,
      [name, phone, address, date_of_birth, gender, profile_image || null, id]
    );
    return result.affectedRows > 0;
  },

  async updatePassword(id, hashedPassword) {
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  },

  async findAllPatients() {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, address, gender, created_at
       FROM users WHERE role = 'patient' ORDER BY created_at DESC`
    );
    return rows;
  },

  async countPatients() {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'patient'"
    );
    return rows[0].total;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = User;
