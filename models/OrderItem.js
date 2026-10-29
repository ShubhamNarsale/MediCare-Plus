// models/OrderItem.js
// Database queries for the `order_items` table.
// Columns: id, order_id, product_id, quantity, price
// `price` stores the product's price at the time of purchase.

const pool = require('../config/db');

const OrderItem = {
  async create({ order_id, product_id, quantity, price }) {
    const [result] = await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES (?, ?, ?, ?)`,
      [order_id, product_id, quantity, price]
    );
    return result.insertId;
  },

  /**
   * Insert several order items at once (used right after an order is
   * created from the current cart contents).
   */
  async createMany(orderId, items) {
    // items: [{ product_id, quantity, price }, ...]
    const values = items.map((item) => [orderId, item.product_id, item.quantity, item.price]);
    const [result] = await pool.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
      [values]
    );
    return result.affectedRows;
  },

  async findByOrder(orderId) {
    const [rows] = await pool.query(
      `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price,
              p.name, p.image,
              (oi.quantity * oi.price) AS subtotal
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    return rows;
  }
};

module.exports = OrderItem;
