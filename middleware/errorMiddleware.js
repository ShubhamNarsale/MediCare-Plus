// middleware/errorMiddleware.js
// Centralized error handling for the whole app.
//
// This factors out the 404 / 500 handling that currently lives
// directly inside app.js so it can be reused and kept in one place.
// See the Phase 2 summary for the small change needed in app.js to
// wire these in.

/**
 * Wrap an async route/controller function so any rejected promise
 * (thrown error) is automatically passed to next(err) instead of
 * crashing the process or requiring a try/catch in every controller.
 *
 * Usage in a controller:
 *   exports.showDoctor = catchAsync(async (req, res) => { ... });
 */
function catchAsync(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler — reached when no route matched the request.
 * Renders views/404.ejs (added in Phase 4).
 */
function notFound(req, res) {
  res.status(404).render('404', { title: 'Page Not Found' });
}

/**
 * Final error handler — catches anything passed to next(err)
 * anywhere in the app, including from catchAsync above.
 * Renders views/error.ejs (added in Phase 4).
 *
 * Never leaks a stack trace to the user in production.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred. Please try again later.'
    : err.message;

  res.status(status).render('error', {
    title: 'Something Went Wrong',
    message
  });
}

module.exports = { catchAsync, notFound, errorHandler };
