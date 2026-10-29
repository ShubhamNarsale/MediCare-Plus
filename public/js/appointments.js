// public/js/appointments.js
// Populates the time-slot <select> on the appointment booking page by
// calling GET /appointments/slots?doctor_id=&date= (see
// controllers/appointmentController.js -> getAvailableSlots).

document.addEventListener('DOMContentLoaded', function () {
  var dateInput = document.getElementById('appointment_date');
  var timeSelect = document.getElementById('appointment_time');
  var slotsHelp = document.getElementById('slotsHelp');
  var doctorId = window.MEDICARE_DOCTOR_ID;

  if (!dateInput || !timeSelect || !doctorId) return;

  function formatSlotLabel(time) {
    var parts = time.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parts[1];
    var suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return hours + ':' + minutes + ' ' + suffix;
  }

  dateInput.addEventListener('change', function () {
    var date = dateInput.value;
    timeSelect.innerHTML = '<option value="">Loading slots...</option>';
    slotsHelp.textContent = '';

    if (!date) {
      timeSelect.innerHTML = '<option value="">Select a date first</option>';
      return;
    }

    fetch('/appointments/slots?doctor_id=' + encodeURIComponent(doctorId) + '&date=' + encodeURIComponent(date))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.success) {
          timeSelect.innerHTML = '<option value="">Unable to load slots</option>';
          slotsHelp.textContent = data.message || '';
          return;
        }

        if (!data.slots.length) {
          timeSelect.innerHTML = '<option value="">No slots available</option>';
          slotsHelp.textContent = 'The doctor is not available on this date, or all slots are booked.';
          return;
        }

        timeSelect.innerHTML = '<option value="">Choose a time</option>' +
          data.slots.map(function (slot) {
            return '<option value="' + slot + '">' + formatSlotLabel(slot) + '</option>';
          }).join('');
        slotsHelp.textContent = data.slots.length + ' slot(s) available.';
      })
      .catch(function () {
        timeSelect.innerHTML = '<option value="">Error loading slots</option>';
        slotsHelp.textContent = 'Something went wrong. Please try a different date.';
      });
  });
});
