// models/CartItem.js
// Database queries for the `cart_items` table.
// Columns: id, cart_id, product_id, quantity
// Unique key: (cart_id, product_id) — one row per product per cart

const pool = require('../config/db');

const CartItem = {
  /**
   * All items in a cart, joined with product details for display.
   */
  async findByCart(cartId) {
    const [rows] = await pool.query(
      `SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity,
              p.name, p.price, p.image, p.stock, p.status,
              (ci.quantity * p.price) AS subtotal
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ?
       ORDER BY ci.id ASC`,
      [cartId]
    );
    return rows;
  },

  async findOne(cartId, productId) {
    const [rows] = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );
    return rows[0] || null;
  },

  /**
   * Add a product to the cart, or increase its quantity if it's
   * already there.
   */
  async addOrIncrement(cartId, productId, quantity = 1) {
    const existing = await this.findOne(cartId, productId);
    if (existing) {
      return this.updateQuantity(cartId, productId, existing.quantity + quantity);
    }
    await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
      [cartId, productId, quantity]
    );
    return true;
  },

  async updateQuantity(cartId, productId, quantity) {
    if (quantity <= 0) {
      return this.remove(cartId, productId);
    }
    const [result] = await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
      [quantity, cartId, productId]
    );
    return result.affectedRows > 0;
  },

  async remove(cartId, productId) {
    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );
    return result.affectedRows > 0;
  },

  async countItems(cartId) {
    const [rows] = await pool.query(
      'SELECT COALESCE(SUM(quantity), 0) AS total FROM cart_items WHERE cart_id = ?',
      [cartId]
    );
    return rows[0].total;
  }
};

module.exports = CartItem;
