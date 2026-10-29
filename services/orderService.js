// services/orderService.js
// Business logic for checkout.
//
// WHY THIS FILE USES RAW QUERIES FOR THE WRITE STEP:
// Checkout has to do four things together — insert the order, insert the
// order_items, decrement stock on every product, and empty the cart — and
// either all of them happen or none of them do. That requires a single
// MySQL transaction (one connection, BEGIN...COMMIT/ROLLBACK).
//
// models/Order.js, models/OrderItem.js, models/Product.js, and
// models/Cart.js were built (Phase 2) to use the shared connection pool
// directly and don't accept an external connection — so calling them here
// would run each write on its own auto-committed connection and defeat
// the whole point of a transaction. Per this phase's instructions the
// existing models are not being modified, so this service opens its own
// transaction and performs the same inserts/updates using the exact same
// table and column names as database/schema.sql and the model files.
// Everything else in Phase 3 (reads, and every other write) goes through
// the models as usual.

const pool = require('../config/db');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const { calculateCartTotals } = require('../utils/helpers');

class CheckoutError extends Error {
  constructor(message) {
    super(message);
    this.status = 409;
  }
}

/**
 * Places an order from the patient's current cart contents.
 * Returns the new order's id.
 * Throws CheckoutError (safe to show to the user) for empty-cart or
 * insufficient-stock problems.
 */
async function placeOrder(userId, { shipping_address, payment_method }) {
  const cart = await Cart.getOrCreateForUser(userId);
  const items = await CartItem.findByCart(cart.id);

  if (!items.length) {
    throw new CheckoutError('Your cart is empty.');
  }

  for (const item of items) {
    if (item.status !== 'active') {
      throw new CheckoutError(`"${item.name}" is no longer available. Please remove it from your cart.`);
    }
    if (item.quantity > item.stock) {
      throw new CheckoutError(`Only ${item.stock} unit(s) of "${item.name}" are left in stock.`);
    }
  }

  // Use the exact same calculation the cart/checkout views display
  // (subtotal + delivery), so the stored order total never diverges
  // from what the patient was shown before placing the order.
  const { total: totalAmount } = calculateCartTotals(items);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, payment_status, order_status)
       VALUES (?, ?, ?, ?, 'pending', 'placed')`,
      [userId, totalAmount.toFixed(2), shipping_address, payment_method]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      // Same guarded UPDATE as Product.decrementStock — never lets stock go negative.
      const [stockResult] = await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [item.quantity, item.product_id, item.quantity]
      );
      if (stockResult.affectedRows === 0) {
        throw new CheckoutError(`"${item.name}" just went out of stock. Please update your cart.`);
      }

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);

    await connection.commit();
    return orderId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = { placeOrder, CheckoutError };
