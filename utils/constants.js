// utils/constants.js
// Shared constant values, kept in sync with the ENUM columns defined
// in database/schema.sql. Import these instead of retyping string
// literals so a typo can't silently create an invalid status.

const USER_ROLES = {
  PATIENT: 'patient',
  ADMIN: 'admin'
};

const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

const PAYMENT_METHOD = {
  COD: 'Cash on Delivery',
  DEMO_ONLINE: 'Demo Online Payment'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed'
};

const ORDER_STATUS = {
  PLACED: 'placed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
};

// Flat delivery charge used at checkout for the student project
// (no real shipping calculation is required).
const DELIVERY_CHARGE = 49.0;
const FREE_DELIVERY_THRESHOLD = 999.0;

module.exports = {
  USER_ROLES,
  APPOINTMENT_STATUS,
  PRODUCT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  ORDER_STATUS,
  GENDER,
  DELIVERY_CHARGE,
  FREE_DELIVERY_THRESHOLD
};
