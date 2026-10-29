// controllers/hospitalController.js
// Hospital information pages, plus the site home page — the home page
// pulls from several models (hospital, departments, doctors, products)
// so it lives here rather than getting its own single-purpose controller.

const Hospital = require('../models/Hospital');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Product = require('../models/Product');
const { catchAsync } = require('../middleware/errorMiddleware');

const FEATURED_COUNT = 6;

exports.showHome = catchAsync(async (req, res) => {
  const [hospital, departments, doctors, products] = await Promise.all([
    Hospital.getInfo(),
    Department.findAll(),
    Doctor.findAll(),
    Product.findAll()
  ]);

  res.render('home', {
    title: 'MediCare+ — Your Health, Our Priority',
    hospital,
    departments: departments.slice(0, FEATURED_COUNT),
    doctors: doctors.slice(0, FEATURED_COUNT),
    products: products.slice(0, FEATURED_COUNT)
  });
});

exports.showAbout = catchAsync(async (req, res) => {
  const hospital = await Hospital.getInfo();
  res.render('hospital/about', { title: 'About Us', hospital });
});

exports.showDepartments = catchAsync(async (req, res) => {
  const departments = await Department.findAll();
  res.render('hospital/departments', { title: 'Departments', departments });
});

exports.showFacilities = catchAsync(async (req, res) => {
  const [hospital, facilities] = await Promise.all([Hospital.getInfo(), Hospital.getFacilities()]);
  res.render('hospital/facilities', { title: 'Facilities', hospital, facilities });
});

exports.showContact = catchAsync(async (req, res) => {
  const hospital = await Hospital.getInfo();
  res.render('hospital/contact', { title: 'Contact Us', hospital });
});

exports.showEmergency = catchAsync(async (req, res) => {
  const hospital = await Hospital.getInfo();
  res.render('hospital/emergency', { title: 'Emergency', hospital });
});
