// models/Appointment.js
// Database queries for the `appointments` table.
// Columns: id, patient_id, doctor_id, appointment_date, appointment_time,
//          reason, status, created_at, booking_slot (generated column)
//
// NOTE on double-booking: the table has a unique index on the generated
// `booking_slot` column (see database/schema.sql). That column is NULL
// whenever status = 'cancelled', so a cancelled appointment automatically
// frees its slot. isSlotAvailable() below mirrors that same rule at the
// application level, and create() also catches the DB-level duplicate-key
// error as a safety net against race conditions.

const pool = require('../config/db');

const APPOINTMENT_DETAILED_SELECT = `
  SELECT a.id, a.patient_id, a.doctor_id, a.appointment_date, a.appointment_time,
         a.reason, a.status, a.created_at,
         u.name AS patient_name, u.email AS patient_email,
         doc.name AS doctor_name, doc.specialization, doc.consultation_fee,
         dept.name AS department_name
  FROM appointments a
  JOIN users u ON u.id = a.patient_id
  JOIN doctors doc ON doc.id = a.doctor_id
  JOIN departments dept ON dept.id = doc.department_id
`;

const Appointment = {
  /**
   * True if this doctor/date/time is free to book — i.e. there is no
   * existing appointment in that slot that isn't cancelled.
   */
  async isSlotAvailable(doctorId, appointmentDate, appointmentTime) {
    const [rows] = await pool.query(
      `SELECT id FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?
         AND status != 'cancelled'`,
      [doctorId, appointmentDate, appointmentTime]
    );
    return rows.length === 0;
  },

  /**
   * Create a new appointment. Returns the new appointment id, or throws
   * a normal Error with a friendly message if the slot was just taken
   * (handles the rare race condition where two requests book at once).
   */
  async create({ patient_id, doctor_id, appointment_date, appointment_time, reason = null }) {
    try {
      const [result] = await pool.query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [patient_id, doctor_id, appointment_date, appointment_time, reason]
      );
      return result.insertId;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('This appointment slot was just booked by someone else. Please choose another slot.');
      }
      throw err;
    }
  },

  async findById(id) {
    const [rows] = await pool.query(`${APPOINTMENT_DETAILED_SELECT} WHERE a.id = ?`, [id]);
    return rows[0] || null;
  },

  async findByPatient(patientId) {
    const [rows] = await pool.query(
      `${APPOINTMENT_DETAILED_SELECT} WHERE a.patient_id = ? ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [patientId]
    );
    return rows;
  },

  async findUpcomingByPatient(patientId) {
    const [rows] = await pool.query(
      `${APPOINTMENT_DETAILED_SELECT}
       WHERE a.patient_id = ? AND a.status IN ('pending', 'confirmed')
         AND a.appointment_date >= CURDATE()
       ORDER BY a.appointment_date ASC, a.appointment_time ASC`,
      [patientId]
    );
    return rows;
  },

  async findAll() {
    const [rows] = await pool.query(`${APPOINTMENT_DETAILED_SELECT} ORDER BY a.appointment_date DESC`);
    return rows;
  },

  /**
   * Already-booked (non-cancelled) time slots for a doctor on a given date.
   * Used to compute which slots are still available to show the patient.
   */
  async getBookedSlots(doctorId, appointmentDate) {
    const [rows] = await pool.query(
      `SELECT appointment_time FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'`,
      [doctorId, appointmentDate]
    );
    return rows.map((row) => row.appointment_time);
  },

  async updateStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  },

  async cancel(id, patientId = null) {
    // patientId, when provided, ensures a patient can only cancel their own appointment.
    const params = patientId ? [id, patientId] : [id];
    const whereClause = patientId ? 'id = ? AND patient_id = ?' : 'id = ?';
    const [result] = await pool.query(
      `UPDATE appointments SET status = 'cancelled' WHERE ${whereClause}`,
      params
    );
    return result.affectedRows > 0;
  },

  async count() {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM appointments');
    return rows[0].total;
  },

  async countByPatient(patientId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM appointments WHERE patient_id = ?',
      [patientId]
    );
    return rows[0].total;
  }
};

module.exports = Appointment;
