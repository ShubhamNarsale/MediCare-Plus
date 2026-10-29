// controllers/appointmentController.js
// Booking flow, available-slot lookup, history, and cancellation.
// Double-booking is ultimately guaranteed by the unique index on the
// generated `booking_slot` column (database/schema.sql) — the checks
// here exist to give the patient a friendly message *before* that,
// not to replace it.

const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { catchAsync } = require('../middleware/errorMiddleware');
const { generateAvailableSlots, parseAvailableDays } = require('../utils/helpers');

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

exports.showBookForm = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.doctorId);

  if (!doctor) {
    req.flash('error', 'Doctor not found.');
    return res.redirect('/doctors');
  }

  res.render('appointments/book', {
    title: `Book Appointment — ${doctor.name}`,
    doctor,
    availableDays: parseAvailableDays(doctor.available_days)
  });
});

/**
 * GET /appointments/slots?doctor_id=&date=
 * Small JSON endpoint (used by public/js/appointments.js in Phase 5) that
 * returns the open time slots for a doctor on a given date, so the
 * booking page only ever shows slots that are actually available —
 * matching "Show only available slots" in the master prompt.
 */
exports.getAvailableSlots = catchAsync(async (req, res) => {
  const { doctor_id: doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ success: false, message: 'doctor_id and date are required.' });
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found.' });
  }

  const dayName = DAY_NAMES[new Date(date).getUTCDay()];
  const availableDays = parseAvailableDays(doctor.available_days);
  if (availableDays.length && !availableDays.includes(dayName)) {
    return res.json({ success: true, slots: [] });
  }

  const bookedTimes = await Appointment.getBookedSlots(doctorId, date);
  const slots = generateAvailableSlots(doctor.start_time, doctor.end_time, bookedTimes);

  res.json({ success: true, slots });
});

exports.bookAppointment = catchAsync(async (req, res) => {
  const { doctor_id: doctorId, appointment_date: date, appointment_time: time, reason } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    req.flash('error', 'Selected doctor was not found.');
    return res.redirect('/doctors');
  }

  const availableDays = parseAvailableDays(doctor.available_days);
  const dayName = DAY_NAMES[new Date(date).getUTCDay()];
  if (availableDays.length && !availableDays.includes(dayName)) {
    req.flash('error', `Dr. ${doctor.name} is not available on ${dayName}s. Please choose another date.`);
    return res.redirect(`/appointments/book/${doctorId}`);
  }

  // Recompute the doctor's actual generated slots for this date — the same
  // list GET /appointments/slots sends to the booking page — and make sure
  // the submitted time is one of them. This closes the gap where
  // isSlotAvailable() alone would accept any arbitrary, un-booked time
  // (e.g. outside the doctor's working hours or off the 30-minute grid),
  // not just times nobody else has booked yet.
  const bookedTimes = await Appointment.getBookedSlots(doctorId, date);
  const validSlots = generateAvailableSlots(doctor.start_time, doctor.end_time, bookedTimes);
  if (!validSlots.includes(time)) {
    req.flash('error', 'That time slot is not available. Please choose one of the listed available times.');
    return res.redirect(`/appointments/book/${doctorId}`);
  }

  const isAvailable = await Appointment.isSlotAvailable(doctorId, date, time);
  if (!isAvailable) {
    req.flash('error', 'That slot has just been booked by someone else. Please choose another time.');
    return res.redirect(`/appointments/book/${doctorId}`);
  }

  let appointmentId;
  try {
    appointmentId = await Appointment.create({
      patient_id: req.session.user.id,
      doctor_id: doctorId,
      appointment_date: date,
      appointment_time: time,
      reason
    });
  } catch (err) {
    // Appointment.create() throws a friendly Error on a duplicate-key race.
    req.flash('error', err.message);
    return res.redirect(`/appointments/book/${doctorId}`);
  }

  req.flash('success', 'Your appointment has been booked and is pending confirmation.');
  res.redirect(`/appointments/${appointmentId}`);
});

exports.listMyAppointments = catchAsync(async (req, res) => {
  const appointments = await Appointment.findByPatient(req.session.user.id);
  res.render('appointments/history', { title: 'My Appointments', appointments });
});

exports.showAppointment = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment || appointment.patient_id !== req.session.user.id) {
    req.flash('error', 'Appointment not found.');
    return res.redirect('/appointments');
  }

  res.render('appointments/confirmation', { title: 'Appointment Details', appointment });
});

exports.cancelAppointment = catchAsync(async (req, res) => {
  const cancelled = await Appointment.cancel(req.params.id, req.session.user.id);

  if (!cancelled) {
    req.flash('error', 'That appointment could not be cancelled (it may not exist or already be cancelled).');
  } else {
    req.flash('success', 'Your appointment has been cancelled.');
  }

  res.redirect('/appointments');
});
