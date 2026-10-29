// models/Hospital.js
// Database queries for the `hospital` table (single row of site-wide info).
// Columns: id, name, description, address, phone, email, emergency_phone,
//          facilities, about, created_at

const pool = require('../config/db');

const Hospital = {
  /**
   * There is only one hospital record for this project — always return
   * the first (and only) row.
   */
  async getInfo() {
    const [rows] = await pool.query('SELECT * FROM hospital LIMIT 1');
    return rows[0] || null;
  },

  /**
   * Returns the `facilities` column split into an array, since it's
   * stored as a comma-separated string (see database/seed.sql).
   */
  async getFacilities() {
    const info = await this.getInfo();
    if (!info || !info.facilities) return [];
    return info.facilities.split(',').map((item) => item.trim()).filter(Boolean);
  },

  async update(id, { name, description, address, phone, email, emergency_phone, facilities, about }) {
    const [result] = await pool.query(
      `UPDATE hospital
       SET name = ?, description = ?, address = ?, phone = ?, email = ?,
           emergency_phone = ?, facilities = ?, about = ?
       WHERE id = ?`,
      [name, description, address, phone, email, emergency_phone, facilities, about, id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Hospital;
