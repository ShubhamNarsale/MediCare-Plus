// controllers/orderController.js
// Checkout flow and post-order confirmation. Order history lives in
// patientController.js (patient/order-history) since it's part of the
// patient module; this controller owns the checkout process itself.

const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const orderService = require('../services/orderService');
const { catchAsync } = require('../middleware/errorMiddleware');
const { calculateCartTotals } = require('../utils/helpers');

exports.showCheckout = catchAsync(async (req, res) => {
  const cart = await Cart.getOrCreateForUser(req.session.user.id);
  const items = await CartItem.findByCart(cart.id);

  if (!items.length) {
    req.flash('error', 'Your cart is empty.');
    return res.redirect('/cart');
  }

  const totals = calculateCartTotals(items);
  res.render('cart/checkout', { title: 'Checkout', items, totals });
});

exports.placeOrder = catchAsync(async (req, res) => {
  const { fullName, phone, address, city, state, pincode, paymentMethod } = req.body;

  const shippingAddress = `${fullName}, ${address}, ${city}, ${state} - ${pincode} (Phone: ${phone})`;

  let orderId;
  try {
    orderId = await orderService.placeOrder(req.session.user.id, {
      shipping_address: shippingAddress,
      payment_method: paymentMethod
    });
  } catch (err) {
    if (err instanceof orderService.CheckoutError) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    throw err;
  }

  req.flash('success', 'Your order has been placed successfully!');
  res.redirect(`/orders/${orderId}`);
});

exports.showOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order || order.user_id !== req.session.user.id) {
    req.flash('error', 'Order not found.');
    return res.redirect('/patient/orders');
  }

  const items = await OrderItem.findByOrder(order.id);
  res.render('cart/order-success', { title: `Order #${order.id}`, order, items });
});
