// controllers/authController.js
// Handles registration, login, and logout.
// Session shape after login: req.session.user = { id, name, email, role }
// — this exact shape is what middleware/authMiddleware.js and
// app.js's res.locals.currentUser already expect.

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { catchAsync } = require('../middleware/errorMiddleware');

const SALT_ROUNDS = 10;

function toSessionUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

exports.showRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

exports.register = catchAsync(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const alreadyExists = await User.emailExists(email);
  if (alreadyExists) {
    req.flash('error', 'An account with that email already exists. Please log in instead.');
    return res.redirect('/register');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  let userId;
  try {
    userId = await User.create({ name, email, password: hashedPassword, phone, role: 'patient' });
  } catch (err) {
    // Safety net for the rare race condition where two requests register
    // the same email at once (uq_users_email in database/schema.sql).
    if (err.code === 'ER_DUP_ENTRY') {
      req.flash('error', 'An account with that email already exists. Please log in instead.');
      return res.redirect('/register');
    }
    throw err;
  }

  const user = await User.findById(userId);
  req.session.user = toSessionUser(user);
  req.flash('success', `Welcome to MediCare+, ${user.name}!`);
  return res.redirect('/patient/dashboard');
});

exports.showLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    req.flash('error', 'Invalid email or password.');
    return res.redirect('/login');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    req.flash('error', 'Invalid email or password.');
    return res.redirect('/login');
  }

  req.session.user = toSessionUser(user);

  const returnTo = req.session.returnTo;
  delete req.session.returnTo;

  req.flash('success', `Welcome back, ${user.name}!`);

  if (returnTo) return res.redirect(returnTo);
  return res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard');
});

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};
