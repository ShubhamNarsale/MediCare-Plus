// models/Order.js
// Database queries for the `orders` table.
// Columns: id, user_id, total_amount, shipping_address, payment_method,
//          payment_status, order_status, created_at

const pool = require('../config/db');

const Order = {
  async create({ user_id, total_amount, shipping_address, payment_method, payment_status = 'pending', order_status = 'placed' }) {
    const [result] = await pool.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, payment_status, order_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, total_amount, shipping_address, payment_method, payment_status, order_status]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByUser(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  async findAll() {
    const [rows] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
    return rows;
  },

  async updateStatus(id, order_status) {
    const [result] = await pool.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [order_status, id]
    );
    return result.affectedRows > 0;
  },

  async updatePaymentStatus(id, payment_status) {
    const [result] = await pool.query(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      [payment_status, id]
    );
    return result.affectedRows > 0;
  },

  async count() {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM orders');
    return rows[0].total;
  }
};

module.exports = Order;
