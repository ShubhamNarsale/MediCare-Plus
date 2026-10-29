// controllers/adminController.js
// Admin dashboard + CRUD management for doctors, products, appointments,
// orders, and a read-only patient list. Every route using this controller
// is mounted behind requireAuth + requireAdmin (see routes/adminRoutes.js).

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { catchAsync } = require('../middleware/errorMiddleware');

// ------------------------------------------------------------
// Dashboard
// ------------------------------------------------------------

exports.dashboard = catchAsync(async (req, res) => {
  const [totalPatients, totalDoctors, totalAppointments, totalProducts, totalOrders] = await Promise.all([
    User.countPatients(),
    Doctor.count(),
    Appointment.count(),
    Product.count(),
    Order.count()
  ]);

  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    stats: { totalPatients, totalDoctors, totalAppointments, totalProducts, totalOrders }
  });
});

// ------------------------------------------------------------
// Patients (read-only)
// ------------------------------------------------------------

exports.listPatients = catchAsync(async (req, res) => {
  const patients = await User.findAllPatients();
  res.render('admin/patients', { title: 'Patients', patients });
});

// ------------------------------------------------------------
// Doctors (CRUD)
// ------------------------------------------------------------

exports.listDoctors = catchAsync(async (req, res) => {
  const doctors = await Doctor.findAll();
  res.render('admin/doctors', { title: 'Manage Doctors', doctors });
});

exports.showAddDoctor = catchAsync(async (req, res) => {
  const departments = await Department.findAll();
  res.render('admin/doctor-form', { title: 'Add Doctor', doctor: null, departments });
});

exports.createDoctor = catchAsync(async (req, res) => {
  const {
    name, email, phone, qualification, specialization, experience,
    consultation_fee, bio, department_id, available_days, start_time, end_time
  } = req.body;

  await Doctor.create({
    name, email, phone, qualification, specialization,
    experience: experience || 0,
    consultation_fee: consultation_fee || 0,
    bio, department_id, available_days, start_time, end_time
  });

  req.flash('success', 'Doctor added successfully.');
  res.redirect('/admin/doctors');
});

exports.showEditDoctor = catchAsync(async (req, res) => {
  const [doctor, departments] = await Promise.all([
    Doctor.findById(req.params.id),
    Department.findAll()
  ]);

  if (!doctor) {
    req.flash('error', 'Doctor not found.');
    return res.redirect('/admin/doctors');
  }

  res.render('admin/doctor-form', { title: 'Edit Doctor', doctor, departments });
});

exports.updateDoctor = catchAsync(async (req, res) => {
  const {
    name, email, phone, qualification, specialization, experience,
    consultation_fee, bio, department_id, available_days, start_time, end_time
  } = req.body;

  await Doctor.update(req.params.id, {
    name, email, phone, qualification, specialization,
    experience: experience || 0,
    consultation_fee: consultation_fee || 0,
    bio, department_id, available_days, start_time, end_time
  });

  req.flash('success', 'Doctor updated successfully.');
  res.redirect('/admin/doctors');
});

exports.deleteDoctor = catchAsync(async (req, res) => {
  await Doctor.delete(req.params.id);
  req.flash('success', 'Doctor removed.');
  res.redirect('/admin/doctors');
});

// ------------------------------------------------------------
// Products (CRUD + stock)
// ------------------------------------------------------------

exports.listProducts = catchAsync(async (req, res) => {
  const products = await Product.findAll();
  res.render('admin/products', { title: 'Manage Products', products });
});

exports.showAddProduct = (req, res) => {
  res.render('admin/product-form', { title: 'Add Product', product: null });
};

exports.createProduct = catchAsync(async (req, res) => {
  const { name, category, description, price, stock, status } = req.body;

  await Product.create({
    name, category, description,
    price, stock: stock || 0,
    status: status || 'active'
  });

  req.flash('success', 'Product added successfully.');
  res.redirect('/admin/products');
});

exports.showEditProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    req.flash('error', 'Product not found.');
    return res.redirect('/admin/products');
  }

  res.render('admin/product-form', { title: 'Edit Product', product });
});

exports.updateProduct = catchAsync(async (req, res) => {
  const { name, category, description, price, stock, status } = req.body;

  await Product.update(req.params.id, {
    name, category, description,
    price, stock: stock || 0,
    status: status || 'active'
  });

  req.flash('success', 'Product updated successfully.');
  res.redirect('/admin/products');
});

exports.updateProductStock = catchAsync(async (req, res) => {
  await Product.updateStock(req.params.id, req.body.stock);
  req.flash('success', 'Stock updated.');
  res.redirect('/admin/products');
});

exports.deleteProduct = catchAsync(async (req, res) => {
  await Product.delete(req.params.id);
  req.flash('success', 'Product removed.');
  res.redirect('/admin/products');
});

// ------------------------------------------------------------
// Appointments (view, confirm, cancel, complete)
// ------------------------------------------------------------

exports.listAppointments = catchAsync(async (req, res) => {
  const appointments = await Appointment.findAll();
  res.render('admin/appointments', { title: 'Appointments', appointments });
});

exports.confirmAppointment = catchAsync(async (req, res) => {
  await Appointment.updateStatus(req.params.id, 'confirmed');
  req.flash('success', 'Appointment confirmed.');
  res.redirect('/admin/appointments');
});

exports.cancelAppointment = catchAsync(async (req, res) => {
  await Appointment.cancel(req.params.id);
  req.flash('success', 'Appointment cancelled.');
  res.redirect('/admin/appointments');
});

exports.completeAppointment = catchAsync(async (req, res) => {
  await Appointment.updateStatus(req.params.id, 'completed');
  req.flash('success', 'Appointment marked as completed.');
  res.redirect('/admin/appointments');
});

// ------------------------------------------------------------
// Orders (view, update status)
// ------------------------------------------------------------

exports.listOrders = catchAsync(async (req, res) => {
  const orders = await Order.findAll();
  res.render('admin/orders', { title: 'Orders', orders });
});

exports.updateOrderStatus = catchAsync(async (req, res) => {
  await Order.updateStatus(req.params.id, req.body.order_status);
  req.flash('success', 'Order status updated.');
  res.redirect('/admin/orders');
});
