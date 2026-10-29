// models/Doctor.js
// Database queries for the `doctors` table.
// Columns: id, name, email, phone, qualification, specialization,
//          experience, consultation_fee, bio, image, department_id,
//          available_days, start_time, end_time, created_at

const pool = require('../config/db');

const DOCTOR_WITH_DEPARTMENT_SELECT = `
  SELECT d.id, d.name, d.email, d.phone, d.qualification, d.specialization,
         d.experience, d.consultation_fee, d.bio, d.image, d.department_id,
         d.available_days, d.start_time, d.end_time, d.created_at,
         dept.name AS department_name
  FROM doctors d
  JOIN departments dept ON dept.id = d.department_id
`;

const Doctor = {
  async findAll() {
    const [rows] = await pool.query(`${DOCTOR_WITH_DEPARTMENT_SELECT} ORDER BY d.name ASC`);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`${DOCTOR_WITH_DEPARTMENT_SELECT} WHERE d.id = ?`, [id]);
    return rows[0] || null;
  },

  async findByDepartment(departmentId) {
    const [rows] = await pool.query(
      `${DOCTOR_WITH_DEPARTMENT_SELECT} WHERE d.department_id = ? ORDER BY d.name ASC`,
      [departmentId]
    );
    return rows;
  },

  /**
   * Search doctors by name or specialization (used by the doctor
   * search page). `term` is matched with a case-insensitive LIKE.
   */
  async search(term) {
    const likeTerm = `%${term}%`;
    const [rows] = await pool.query(
      `${DOCTOR_WITH_DEPARTMENT_SELECT}
       WHERE d.name LIKE ? OR d.specialization LIKE ?
       ORDER BY d.name ASC`,
      [likeTerm, likeTerm]
    );
    return rows;
  },

  async create(doctor) {
    const {
      name, email, phone = null, qualification = null, specialization,
      experience = 0, consultation_fee = 0.0, bio = null, image = null,
      department_id, available_days = null, start_time = null, end_time = null
    } = doctor;

    const [result] = await pool.query(
      `INSERT INTO doctors
        (name, email, phone, qualification, specialization, experience,
         consultation_fee, bio, image, department_id, available_days,
         start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, qualification, specialization, experience,
        consultation_fee, bio, image, department_id, available_days,
        start_time, end_time]
    );
    return result.insertId;
  },

  async update(id, doctor) {
    const {
      name, email, phone, qualification, specialization, experience,
      consultation_fee, bio, image, department_id, available_days,
      start_time, end_time
    } = doctor;

    const [result] = await pool.query(
      `UPDATE doctors
       SET name = ?, email = ?, phone = ?, qualification = ?, specialization = ?,
           experience = ?, consultation_fee = ?, bio = ?, image = COALESCE(?, image),
           department_id = ?, available_days = ?, start_time = ?, end_time = ?
       WHERE id = ?`,
      [name, email, phone, qualification, specialization, experience,
        consultation_fee, bio, image || null, department_id, available_days,
        start_time, end_time, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM doctors WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async count() {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM doctors');
    return rows[0].total;
  }
};

module.exports = Doctor;
