// models/Cart.js
// Database queries for the `cart` table (one active cart per user).
// Columns: id, user_id, created_at, updated_at

const pool = require('../config/db');

const Cart = {
  async findByUser(userId) {
    const [rows] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
    return rows[0] || null;
  },

  /**
   * Get the user's cart, creating one if it doesn't exist yet.
   * Returns the cart row.
   */
  async getOrCreateForUser(userId) {
    const existing = await this.findByUser(userId);
    if (existing) return existing;

    const [result] = await pool.query(
      'INSERT INTO cart (user_id) VALUES (?)',
      [userId]
    );
    return { id: result.insertId, user_id: userId };
  },

  async touch(cartId) {
    // Bumps updated_at — called whenever cart_items change.
    await pool.query('UPDATE cart SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [cartId]);
  },

  async clear(cartId) {
    // Removing all cart_items empties the cart without deleting the cart row.
    const [result] = await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    return result.affectedRows;
  }
};

module.exports = Cart;
