// middleware/roleMiddleware.js
// Restricts routes based on the logged-in user's role.
// Roles match the `users.role` ENUM('patient', 'admin') in database/schema.sql.
//
// Always use requireAuth (authMiddleware.js) BEFORE these, so
// req.session.user is guaranteed to exist.

/**
 * Generic role check. Usage: requireRole('admin')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const user = req.session && req.session.user;

    if (!user) {
      req.flash('error', 'Please log in to continue.');
      return res.redirect('/login');
    }

    if (!allowedRoles.includes(user.role)) {
      req.flash('error', "You don't have permission to access that page.");
      const destination = user.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard';
      return res.redirect(destination);
    }

    return next();
  };
}

// Convenience shortcuts for the two roles used in this project.
const requireAdmin = requireRole('admin');
const requirePatient = requireRole('patient');

module.exports = { requireRole, requireAdmin, requirePatient };
