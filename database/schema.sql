-- ============================================================
-- MediCare+ Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS medicare_plus
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medicare_plus;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(150) NOT NULL,
  password          VARCHAR(255) NOT NULL,
  phone             VARCHAR(20),
  address           VARCHAR(255),
  date_of_birth     DATE,
  gender            ENUM('male', 'female', 'other'),
  role              ENUM('patient', 'admin') NOT NULL DEFAULT 'patient',
  profile_image     VARCHAR(255) DEFAULT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- departments
-- ------------------------------------------------------------
CREATE TABLE departments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  image         VARCHAR(255) DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_departments_name (name)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- doctors
-- ------------------------------------------------------------
CREATE TABLE doctors (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(100) NOT NULL,
  email               VARCHAR(150) NOT NULL,
  phone               VARCHAR(20),
  qualification       VARCHAR(150),
  specialization      VARCHAR(150) NOT NULL,
  experience          INT DEFAULT 0,
  consultation_fee    DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  bio                 TEXT,
  image               VARCHAR(255) DEFAULT NULL,
  department_id       INT NOT NULL,
  available_days      VARCHAR(100),   -- e.g. "Mon,Wed,Fri"
  start_time          TIME,
  end_time            TIME,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_doctors_email (email),
  KEY idx_doctors_specialization (specialization),
  KEY idx_doctors_department (department_id),
  CONSTRAINT fk_doctors_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- appointments
-- ------------------------------------------------------------
CREATE TABLE appointments (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  patient_id          INT NOT NULL,
  doctor_id           INT NOT NULL,
  appointment_date    DATE NOT NULL,
  appointment_time    TIME NOT NULL,
  reason              VARCHAR(255),
  status              ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Generated column: NULL whenever the appointment is cancelled, otherwise
  -- a fingerprint of the booked slot. MySQL unique indexes permit multiple
  -- NULLs, so cancelling an appointment automatically frees the slot again,
  -- while any pending/confirmed/completed appointment still blocks it.
  booking_slot        VARCHAR(60) GENERATED ALWAYS AS (
                         CASE WHEN status = 'cancelled' THEN NULL
                              ELSE CONCAT(doctor_id, '_', appointment_date, '_', appointment_time)
                         END
                       ) STORED,
  KEY idx_appointments_patient (patient_id),
  KEY idx_appointments_doctor (doctor_id),
  KEY idx_appointments_date (appointment_date),
  -- Prevents double-booking the same doctor at the same date & time,
  -- but does not block a slot that was freed by cancellation.
  UNIQUE KEY uq_doctor_date_time (booking_slot),
  CONSTRAINT fk_appointments_patient
    FOREIGN KEY (patient_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_appointments_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
CREATE TABLE products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  category      VARCHAR(100) NOT NULL,
  description   TEXT,
  price         DECIMAL(10, 2) NOT NULL,
  stock         INT NOT NULL DEFAULT 0,
  image         VARCHAR(255) DEFAULT NULL,
  status        ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_products_category (category)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- cart (one active cart per user)
-- ------------------------------------------------------------
CREATE TABLE cart (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_user (user_id),
  CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- cart_items
-- ------------------------------------------------------------
CREATE TABLE cart_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  cart_id       INT NOT NULL,
  product_id    INT NOT NULL,
  quantity      INT NOT NULL DEFAULT 1,
  UNIQUE KEY uq_cart_product (cart_id, product_id),
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES cart(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- orders
-- ------------------------------------------------------------
CREATE TABLE orders (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NOT NULL,
  total_amount        DECIMAL(10, 2) NOT NULL,
  shipping_address    VARCHAR(255) NOT NULL,
  payment_method      ENUM('Cash on Delivery', 'Demo Online Payment') NOT NULL,
  payment_status      ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  order_status        ENUM('placed', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'placed',
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_orders_user (user_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- order_items
-- ------------------------------------------------------------
CREATE TABLE order_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  product_id    INT NOT NULL,
  quantity      INT NOT NULL,
  price         DECIMAL(10, 2) NOT NULL, -- price at time of purchase
  KEY idx_order_items_order (order_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- hospital
-- ------------------------------------------------------------
CREATE TABLE hospital (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(150) NOT NULL,
  description       TEXT,
  address           VARCHAR(255),
  phone             VARCHAR(20),
  email             VARCHAR(150),
  emergency_phone   VARCHAR(20),
  facilities        TEXT,   -- comma-separated or JSON list of facilities
  about             TEXT,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
