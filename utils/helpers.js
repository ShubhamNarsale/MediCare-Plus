// utils/helpers.js
// Small, generic helper functions used across controllers/services.

const { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } = require('./constants');

/**
 * Format a number as a currency string for display, e.g. 1234.5 -> "₹1,234.50"
 */
function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a JS Date or 'YYYY-MM-DD' string into a friendly display
 * format, e.g. "14 Aug 2026".
 */
function formatDate(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Format a 'HH:MM:SS' time string into 12-hour display format, e.g. "09:30 AM".
 */
function formatTime(timeValue) {
  if (!timeValue) return '';
  const [hoursStr, minutes] = String(timeValue).split(':');
  let hours = parseInt(hoursStr, 10);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${suffix}`;
}

/**
 * Build the list of 30-minute appointment slots between a doctor's
 * start_time and end_time, excluding any already-booked times.
 * doctorStartTime / doctorEndTime: 'HH:MM:SS' strings from the doctors table.
 * bookedTimes: array of 'HH:MM:SS' strings (see Appointment.getBookedSlots).
 */
function generateAvailableSlots(doctorStartTime, doctorEndTime, bookedTimes = [], intervalMinutes = 30) {
  if (!doctorStartTime || !doctorEndTime) return [];

  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toTimeString = (mins) => {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}:${m}:00`;
  };

  const bookedSet = new Set(bookedTimes.map((t) => String(t)));
  const slots = [];

  let current = toMinutes(doctorStartTime);
  const end = toMinutes(doctorEndTime);

  while (current + intervalMinutes <= end) {
    const slot = toTimeString(current);
    if (!bookedSet.has(slot)) {
      slots.push(slot);
    }
    current += intervalMinutes;
  }

  return slots;
}

/**
 * Calculate cart totals (subtotal, delivery, total) from a list of
 * cart items that each have a `subtotal` field (see CartItem.findByCart).
 */
function calculateCartTotals(cartItems) {
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_CHARGE;
  const total = subtotal + delivery;
  return { subtotal, delivery, total };
}

/**
 * Convert available_days string like "Mon,Wed,Fri" into an array.
 */
function parseAvailableDays(availableDaysString) {
  if (!availableDaysString) return [];
  return availableDaysString.split(',').map((d) => d.trim()).filter(Boolean);
}

module.exports = {
  formatCurrency,
  formatDate,
  formatTime,
  generateAvailableSlots,
  calculateCartTotals,
  parseAvailableDays
};
