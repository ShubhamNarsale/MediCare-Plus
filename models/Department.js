// models/Department.js
// Database queries for the `departments` table.
// Columns: id, name, description, image, created_at

const pool = require('../config/db');

const Department = {
  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, name, description, image, created_at FROM departments ORDER BY name ASC'
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, description, image, created_at FROM departments WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, description = null, image = null }) {
    const [result] = await pool.query(
      'INSERT INTO departments (name, description, image) VALUES (?, ?, ?)',
      [name, description, image]
    );
    return result.insertId;
  },

  async update(id, { name, description, image }) {
    const [result] = await pool.query(
      `UPDATE departments
       SET name = ?, description = ?, image = COALESCE(?, image)
       WHERE id = ?`,
      [name, description, image || null, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM departments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Department;
