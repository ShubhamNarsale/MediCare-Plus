// models/Product.js
// Database queries for the `products` table.
// Columns: id, name, category, description, price, stock, image,
//          status, created_at, updated_at

const pool = require('../config/db');

const Product = {
  async findAll() {
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE status = 'active' ORDER BY name ASC"
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByCategory(category) {
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE category = ? AND status = 'active' ORDER BY name ASC",
      [category]
    );
    return rows;
  },

  async search(term) {
    const likeTerm = `%${term}%`;
    const [rows] = await pool.query(
      `SELECT * FROM products
       WHERE status = 'active' AND (name LIKE ? OR category LIKE ? OR description LIKE ?)
       ORDER BY name ASC`,
      [likeTerm, likeTerm, likeTerm]
    );
    return rows;
  },

  async findAllSortedByPrice(direction = 'ASC') {
    const order = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    // order is validated above (whitelisted), safe to interpolate
    const [rows] = await pool.query(
      `SELECT * FROM products WHERE status = 'active' ORDER BY price ${order}`
    );
    return rows;
  },

  async getCategories() {
    const [rows] = await pool.query(
      "SELECT DISTINCT category FROM products WHERE status = 'active' ORDER BY category ASC"
    );
    return rows.map((row) => row.category);
  },

  async create(product) {
    const { name, category, description = null, price, stock = 0, image = null, status = 'active' } = product;
    const [result] = await pool.query(
      `INSERT INTO products (name, category, description, price, stock, image, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, category, description, price, stock, image, status]
    );
    return result.insertId;
  },

  async update(id, product) {
    const { name, category, description, price, stock, image, status } = product;
    const [result] = await pool.query(
      `UPDATE products
       SET name = ?, category = ?, description = ?, price = ?, stock = ?,
           image = COALESCE(?, image), status = ?
       WHERE id = ?`,
      [name, category, description, price, stock, image || null, status, id]
    );
    return result.affectedRows > 0;
  },

  async updateStock(id, stock) {
    const [result] = await pool.query(
      'UPDATE products SET stock = ? WHERE id = ?',
      [stock, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Atomically reduce stock by `quantity`, but only if enough stock
   * remains — used at checkout to prevent overselling.
   */
  async decrementStock(id, quantity) {
    const [result] = await pool.query(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantity, id, quantity]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async count() {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM products');
    return rows[0].total;
  }
};

module.exports = Product;
