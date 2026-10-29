// controllers/doctorController.js
// Doctor listing (with search/specialization/department filters) and
// individual doctor profile pages.

const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const { catchAsync } = require('../middleware/errorMiddleware');

exports.listDoctors = catchAsync(async (req, res) => {
  const { search, department } = req.query;

  let doctors;
  if (search) {
    // Doctor.search() matches against both name and specialization,
    // which covers "search by doctor name" and "search by specialization".
    doctors = await Doctor.search(search);
  } else if (department) {
    doctors = await Doctor.findByDepartment(department);
  } else {
    doctors = await Doctor.findAll();
  }

  const departments = await Department.findAll();

  res.render('doctors/doctors', {
    title: 'Our Doctors',
    doctors,
    departments,
    filters: { search: search || '', department: department || '' }
  });
});

exports.showDoctor = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    req.flash('error', 'Doctor not found.');
    return res.redirect('/doctors');
  }

  res.render('doctors/doctor-profile', { title: doctor.name, doctor });
});
