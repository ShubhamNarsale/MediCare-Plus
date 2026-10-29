// middleware/authMiddleware.js
// Protects routes that require the user to be logged in.
// Relies on `req.session.user` — the same session structure already
// set up in app.js (see res.locals.currentUser = req.session.user).

/**
 * Blocks access unless a user is logged in.
 * On failure: redirects to /login with a flash message (for normal
 * page requests) or returns 401 JSON (for AJAX/API-style requests).
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  if (req.xhr || req.headers.accept === 'application/json') {
    return res.status(401).json({ success: false, message: 'Please log in to continue.' });
  }

  req.flash('error', 'Please log in to continue.');
  return res.redirect('/login');
}

/**
 * Opposite of requireAuth — used on login/register pages so an
 * already-logged-in user is redirected to their dashboard instead.
 */
function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    const destination = req.session.user.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard';
    return res.redirect(destination);
  }
  return next();
}

module.exports = { requireAuth, redirectIfAuthenticated };
