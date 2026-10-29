// app.js
// MediCare+ - Main application entry point

require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// ------------------------------
// View engine setup
// ------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ------------------------------
// Core middleware
// ------------------------------
app.use(helmet({
  contentSecurityPolicy: false // disabled for simplicity in a college project (Bootstrap/CDN assets)
}));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------
// Session setup
// ------------------------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    httpOnly: true
  }
}));

// ------------------------------
// Flash messages
// ------------------------------
app.use(flash());

// ------------------------------
// Global locals (available in every EJS view)
// ------------------------------
const { formatCurrency, formatDate, formatTime } = require('./utils/helpers');

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  // Formatting helpers available in every view (views/ was added in Phase 4)
  res.locals.formatCurrency = formatCurrency;
  res.locals.formatDate = formatDate;
  res.locals.formatTime = formatTime;
  next();
});

// ------------------------------
// Routes (Phase 3)
// ------------------------------
app.get('/', require('./controllers/hospitalController').showHome);

app.use('/', require('./routes/authRoutes'));
app.use('/patient', require('./routes/patientRoutes'));
app.use('/doctors', require('./routes/doctorRoutes'));
app.use('/appointments', require('./routes/appointmentRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/cart', require('./routes/cartRoutes'));
app.use('/', require('./routes/orderRoutes'));
app.use('/hospital', require('./routes/hospitalRoutes'));
app.use('/ai', require('./routes/aiRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// ------------------------------
// 404 handler
// ------------------------------
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' }); // views/404.ejs — added in Phase 4
});

// ------------------------------
// Global error handler
// ------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', { // views/error.ejs — added in Phase 4
    title: 'Something Went Wrong',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message
  });
});

// ------------------------------
// Start server
// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MediCare+ server running on http://localhost:${PORT}`);
});

module.exports = app;
