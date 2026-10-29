-- ============================================================
-- MediCare+ Seed Data
-- Run this AFTER schema.sql has created the tables.
-- Note: the default admin account is created separately by
-- running `node database/seedAdmin.js` (see README) so that its
-- password is properly hashed with bcrypt rather than stored as
-- plain text in this file.
-- ============================================================

USE medicare_plus;

-- ------------------------------------------------------------
-- Departments (10)
-- ------------------------------------------------------------
INSERT INTO departments (name, description, image) VALUES
('Cardiology', 'Diagnosis and treatment of heart and blood vessel conditions.', 'departments/cardiology.jpg'),
('Dermatology', 'Care for skin, hair, and nail conditions.', 'departments/dermatology.jpg'),
('Neurology', 'Diagnosis and treatment of disorders of the brain and nervous system.', 'departments/neurology.jpg'),
('Orthopedics', 'Treatment of bones, joints, ligaments, and muscles.', 'departments/orthopedics.jpg'),
('Pediatrics', 'Medical care for infants, children, and adolescents.', 'departments/pediatrics.jpg'),
('ENT', 'Care for ear, nose, and throat conditions.', 'departments/ent.jpg'),
('General Medicine', 'General diagnosis and treatment of common illnesses.', 'departments/general-medicine.jpg'),
('Gynecology', 'Women\'s reproductive health care.', 'departments/gynecology.jpg'),
('Dentistry', 'Oral health, teeth, and gum care.', 'departments/dentistry.jpg'),
('Ophthalmology', 'Diagnosis and treatment of eye conditions.', 'departments/ophthalmology.jpg');

-- ------------------------------------------------------------
-- Doctors (15)
-- ------------------------------------------------------------
INSERT INTO doctors (name, email, phone, qualification, specialization, experience, consultation_fee, bio, image, department_id, available_days, start_time, end_time) VALUES
('Dr. Ananya Sharma', 'ananya.sharma@medicareplus.test', '9876500001', 'MD, DM Cardiology', 'Cardiologist', 12, 800.00, 'Specialist in interventional cardiology with over a decade of clinical experience.', 'doctors/doctor1.jpg', 1, 'Mon,Wed,Fri', '09:00:00', '14:00:00'),
('Dr. Rohan Mehta', 'rohan.mehta@medicareplus.test', '9876500002', 'MD Cardiology', 'Cardiologist', 8, 700.00, 'Focuses on preventive cardiology and heart failure management.', 'doctors/doctor2.jpg', 1, 'Tue,Thu,Sat', '10:00:00', '16:00:00'),
('Dr. Priya Nair', 'priya.nair@medicareplus.test', '9876500003', 'MD Dermatology', 'Dermatologist', 9, 600.00, 'Experienced in treating acne, eczema, and skin allergies.', 'doctors/doctor3.jpg', 2, 'Mon,Tue,Thu', '09:00:00', '13:00:00'),
('Dr. Karan Verma', 'karan.verma@medicareplus.test', '9876500004', 'MBBS, MD Dermatology', 'Cosmetic Dermatologist', 6, 650.00, 'Specializes in cosmetic dermatology and skin rejuvenation.', 'doctors/doctor4.jpg', 2, 'Wed,Fri,Sat', '11:00:00', '17:00:00'),
('Dr. Sanjay Iyer', 'sanjay.iyer@medicareplus.test', '9876500005', 'DM Neurology', 'Neurologist', 15, 900.00, 'Expert in stroke management and epilepsy treatment.', 'doctors/doctor5.jpg', 3, 'Mon,Wed,Fri', '10:00:00', '15:00:00'),
('Dr. Meera Pillai', 'meera.pillai@medicareplus.test', '9876500006', 'MD Neurology', 'Neurologist', 7, 750.00, 'Focuses on headache disorders and movement disorders.', 'doctors/doctor6.jpg', 3, 'Tue,Thu', '09:00:00', '13:00:00'),
('Dr. Arjun Rao', 'arjun.rao@medicareplus.test', '9876500007', 'MS Orthopedics', 'Orthopedic Surgeon', 11, 850.00, 'Specialist in joint replacement and sports injuries.', 'doctors/doctor7.jpg', 4, 'Mon,Tue,Thu,Sat', '09:00:00', '14:00:00'),
('Dr. Neha Kapoor', 'neha.kapoor@medicareplus.test', '9876500008', 'MS Orthopedics', 'Orthopedic Surgeon', 5, 600.00, 'Focus on spine care and fracture management.', 'doctors/doctor8.jpg', 4, 'Wed,Fri', '10:00:00', '16:00:00'),
('Dr. Aditi Joshi', 'aditi.joshi@medicareplus.test', '9876500009', 'MD Pediatrics', 'Pediatrician', 10, 500.00, 'Caring for newborns, children, and adolescent health.', 'doctors/doctor9.jpg', 5, 'Mon,Wed,Fri,Sat', '09:00:00', '13:00:00'),
('Dr. Vikram Singh', 'vikram.singh@medicareplus.test', '9876500010', 'MBBS, MD Pediatrics', 'Pediatrician', 4, 450.00, 'Special interest in childhood nutrition and vaccination.', 'doctors/doctor10.jpg', 5, 'Tue,Thu,Sat', '10:00:00', '15:00:00'),
('Dr. Ritu Malhotra', 'ritu.malhotra@medicareplus.test', '9876500011', 'MS ENT', 'ENT Specialist', 9, 550.00, 'Handles sinus, hearing, and throat disorders.', 'doctors/doctor11.jpg', 6, 'Mon,Tue,Wed', '09:00:00', '14:00:00'),
('Dr. Suresh Pillai', 'suresh.pillai@medicareplus.test', '9876500012', 'MBBS, MD General Medicine', 'General Physician', 14, 400.00, 'General health checkups and chronic disease management.', 'doctors/doctor12.jpg', 7, 'Mon,Tue,Wed,Thu,Fri', '08:00:00', '12:00:00'),
('Dr. Kavya Reddy', 'kavya.reddy@medicareplus.test', '9876500013', 'MD Gynecology', 'Gynecologist', 10, 700.00, 'Women\'s health, prenatal care, and family planning.', 'doctors/doctor13.jpg', 8, 'Mon,Wed,Fri', '10:00:00', '15:00:00'),
('Dr. Manish Gupta', 'manish.gupta@medicareplus.test', '9876500014', 'BDS, MDS', 'Dentist', 8, 500.00, 'General and cosmetic dentistry, root canal specialist.', 'doctors/doctor14.jpg', 9, 'Tue,Thu,Sat', '09:00:00', '17:00:00'),
('Dr. Divya Menon', 'divya.menon@medicareplus.test', '9876500015', 'MS Ophthalmology', 'Ophthalmologist', 6, 550.00, 'Cataract surgery and general eye care specialist.', 'doctors/doctor15.jpg', 10, 'Mon,Wed,Fri', '09:00:00', '13:00:00');

-- ------------------------------------------------------------
-- Products (20) — dummy, non-prescription healthcare products only
-- ------------------------------------------------------------
INSERT INTO products (name, category, description, price, stock, image, status) VALUES
('Digital Thermometer', 'Diagnostic Devices', 'Fast and accurate digital thermometer for home use.', 299.00, 50, 'products/thermometer.jpg', 'active'),
('First Aid Kit (Basic)', 'First Aid', 'Compact first aid kit with essential supplies for home and travel.', 499.00, 40, 'products/first-aid-kit.jpg', 'active'),
('Bandage Pack (Assorted)', 'First Aid', 'Pack of assorted adhesive bandages for minor cuts and wounds.', 99.00, 100, 'products/bandage-pack.jpg', 'active'),
('Hot Water Bag', 'Pain Relief', 'Reusable hot water bag for muscle pain and cramp relief.', 249.00, 60, 'products/hot-water-bag.jpg', 'active'),
('Instant Cold Pack', 'Pain Relief', 'Single-use instant cold pack for swelling and injuries.', 149.00, 70, 'products/cold-pack.jpg', 'active'),
('Hand Sanitizer 500ml', 'Hygiene', 'Alcohol-based hand sanitizer, kills 99.9% of germs.', 179.00, 120, 'products/hand-sanitizer.jpg', 'active'),
('Face Mask (Pack of 50)', 'Hygiene', 'Disposable 3-ply protective face masks.', 349.00, 90, 'products/face-mask.jpg', 'active'),
('Personal Care Kit', 'Personal Care', 'Travel-friendly personal hygiene and care kit.', 599.00, 30, 'products/personal-care-kit.jpg', 'active'),
('Digital Blood Pressure Monitor', 'Diagnostic Devices', 'Automatic upper-arm BP monitor with digital display.', 1899.00, 25, 'products/bp-monitor.jpg', 'active'),
('Pulse Oximeter', 'Diagnostic Devices', 'Fingertip pulse oximeter for measuring SpO2 and pulse rate.', 899.00, 35, 'products/pulse-oximeter.jpg', 'active'),
('Elastic Crepe Bandage', 'First Aid', 'Stretchable crepe bandage for sprains and support.', 129.00, 80, 'products/crepe-bandage.jpg', 'active'),
('Cotton Roll (100g)', 'First Aid', 'Absorbent cotton roll for wound dressing.', 89.00, 100, 'products/cotton-roll.jpg', 'active'),
('Antiseptic Liquid 200ml', 'First Aid', 'Multipurpose antiseptic liquid for cuts and wounds.', 159.00, 75, 'products/antiseptic-liquid.jpg', 'active'),
('Weighing Scale (Digital)', 'Diagnostic Devices', 'Digital bathroom weighing scale with LCD display.', 999.00, 20, 'products/weighing-scale.jpg', 'active'),
('Orthopedic Knee Cap', 'Support & Braces', 'Compression knee cap for joint support during activity.', 399.00, 45, 'products/knee-cap.jpg', 'active'),
('Lumbar Support Belt', 'Support & Braces', 'Adjustable lower back support belt.', 649.00, 30, 'products/lumbar-belt.jpg', 'active'),
('Nebulizer (Compact)', 'Respiratory Care', 'Compact compressor nebulizer for home respiratory care.', 1499.00, 15, 'products/nebulizer.jpg', 'active'),
('Multivitamin Tablets (Non-Rx)', 'Wellness', 'Daily multivitamin supplement, non-prescription.', 349.00, 60, 'products/multivitamin.jpg', 'active'),
('Herbal Immunity Booster Syrup', 'Wellness', 'Ayurvedic immunity booster syrup for daily wellness.', 219.00, 55, 'products/immunity-syrup.jpg', 'active'),
('Wheelchair (Standard, Rental Listing)', 'Mobility Aids', 'Standard foldable wheelchair, ideal for home or hospital use.', 4999.00, 10, 'products/wheelchair.jpg', 'active');

-- ------------------------------------------------------------
-- Hospital information (single row)
-- ------------------------------------------------------------
INSERT INTO hospital (name, description, address, phone, email, emergency_phone, facilities, about) VALUES
(
  'MediCare+ Hospital',
  'A modern, dummy hospital created for academic demonstration purposes.',
  '123 Wellness Avenue, Springfield, Demo State, 000000',
  '+91-11-2345-6789',
  'contact@medicareplus.test',
  '+91-11-9999-0000',
  'Emergency Department,Pharmacy,Diagnostic Laboratory,Ambulance,ICU,Operation Theatre,Waiting Area',
  'MediCare+ Hospital is a fictional healthcare facility used to demonstrate a full-stack hospital management system for a college project. All data on this site is dummy data and does not represent a real hospital, real patients, or real medical records.'
);
