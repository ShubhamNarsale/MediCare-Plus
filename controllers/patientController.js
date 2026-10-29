// controllers/patientController.js
// Patient-facing dashboard, profile management, and order history.
// All routes using this controller are mounted behind
// requireAuth + requirePatient (see routes/patientRoutes.js), so
// req.session.user is always present here.

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const { catchAsync } = require('../middleware/errorMiddleware');

exports.dashboard = catchAsync(async (req, res) => {
  const patientId = req.session.user.id;

  const [upcomingAppointments, totalAppointments, orders, cart] = await Promise.all([
    Appointment.findUpcomingByPatient(patientId),
    Appointment.countByPatient(patientId),
    Order.findByUser(patientId),
    Cart.getOrCreateForUser(patientId)
  ]);

  const cartItemCount = await CartItem.countItems(cart.id);

  res.render('patient/dashboard', {
    title: 'My Dashboard',
    upcomingAppointments,
    totalAppointments,
    totalOrders: orders.length,
    cartItemCount
  });
});

exports.showProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.session.user.id);
  res.render('patient/profile', { title: 'My Profile', profile: user });
});

exports.showEditProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.session.user.id);
  res.render('patient/edit-profile', { title: 'Edit Profile', profile: user });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const { name, phone, address, date_of_birth, gender } = req.body;

  await User.updateProfile(req.session.user.id, {
    name,
    phone: phone || null,
    address: address || null,
    date_of_birth: date_of_birth || null,
    gender: gender || null,
    profile_image: null // file uploads (multer) are wired up when public/ image handling is added
  });

  // Keep the session's display name in sync with the profile update.
  req.session.user.name = name;

  req.flash('success', 'Your profile has been updated.');
  res.redirect('/patient/profile');
});

exports.orderHistory = catchAsync(async (req, res) => {
  const orders = await Order.findByUser(req.session.user.id);
  res.render('patient/order-history', { title: 'Order History', orders });
});

exports.orderDetails = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order || order.user_id !== req.session.user.id) {
    req.flash('error', 'Order not found.');
    return res.redirect('/patient/orders');
  }

  const items = await OrderItem.findByOrder(order.id);
  res.render('cart/order-success', { title: `Order #${order.id}`, order, items });
});
