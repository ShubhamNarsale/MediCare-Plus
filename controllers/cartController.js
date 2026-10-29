// controllers/cartController.js
// Shopping cart: view, add, update quantity, remove.
// One cart per user (Cart.getOrCreateForUser), enforced by uq_cart_user
// in database/schema.sql.

const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const { catchAsync } = require('../middleware/errorMiddleware');
const { calculateCartTotals } = require('../utils/helpers');

exports.showCart = catchAsync(async (req, res) => {
  const cart = await Cart.getOrCreateForUser(req.session.user.id);
  const items = await CartItem.findByCart(cart.id);
  const totals = calculateCartTotals(items);

  res.render('cart/cart', { title: 'My Cart', items, totals });
});

exports.addToCart = catchAsync(async (req, res) => {
  const productId = req.body.product_id;
  const quantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);

  const product = await Product.findById(productId);
  if (!product || product.status !== 'active') {
    req.flash('error', 'That product is not available.');
    return res.redirect('/products');
  }

  const cart = await Cart.getOrCreateForUser(req.session.user.id);
  const existing = await CartItem.findOne(cart.id, productId);
  const requestedTotal = (existing ? existing.quantity : 0) + quantity;

  if (requestedTotal > product.stock) {
    req.flash('error', `Only ${product.stock} unit(s) of "${product.name}" are in stock.`);
    return res.redirect(`/products/${productId}`);
  }

  await CartItem.addOrIncrement(cart.id, productId, quantity);
  await Cart.touch(cart.id);

  req.flash('success', `${product.name} added to your cart.`);
  res.redirect('/cart');
});

exports.updateCartItem = catchAsync(async (req, res) => {
  const productId = req.body.product_id;
  const quantity = parseInt(req.body.quantity, 10);

  const cart = await Cart.getOrCreateForUser(req.session.user.id);

  if (quantity > 0) {
    const product = await Product.findById(productId);
    if (product && quantity > product.stock) {
      req.flash('error', `Only ${product.stock} unit(s) of "${product.name}" are in stock.`);
      return res.redirect('/cart');
    }
  }

  await CartItem.updateQuantity(cart.id, productId, quantity);
  await Cart.touch(cart.id);

  res.redirect('/cart');
});

exports.removeCartItem = catchAsync(async (req, res) => {
  const cart = await Cart.getOrCreateForUser(req.session.user.id);
  await CartItem.remove(cart.id, req.body.product_id);
  await Cart.touch(cart.id);

  req.flash('success', 'Item removed from your cart.');
  res.redirect('/cart');
});
