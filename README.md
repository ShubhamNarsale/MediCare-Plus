# MediCare+ — Hospital & Healthcare Management System

MediCare+ is a full-stack web application for a fictional hospital,
built as a college project. It lets patients register, browse
doctors, book appointments, shop for non-prescription healthcare
products, and chat with a simple rule-based AI assistant. Admins get
a dashboard to manage doctors, patients, appointments, products, and
orders.

> **This is a demo project.** All hospital, doctor, and product data
> is dummy data. No real medical records are stored, and no real
> payments are processed.

---

## 1. Project Overview

- **Type:** College/academic full-stack web project
- **Domain:** Hospital & healthcare management (patient portal +
  e-commerce + admin dashboard)
- **Status:** Built in phases — see [Build Phases](#build-phases) below.

## 2. Features

- Patient registration, login, and profile management
- Browse and search doctors by name / specialization / department
- View doctor profiles and available slots
- Book, cancel, and view appointment history
- Prevents double-booking the same doctor/date/time — and automatically
  frees the slot again if that appointment is cancelled
- Browse, search, and filter healthcare products
- Shopping cart with quantity updates and stock validation
- Checkout with simulated payment (Cash on Delivery / Demo Online
  Payment)
- Order history
- Hospital info pages: About, Departments, Facilities, Contact,
  Emergency
- Rule-based AI assistant for site navigation and general health
  information (with a clear "not a medical professional" disclaimer)
- Admin dashboard: manage doctors, products, appointments, and orders

## 3. Technology Stack

| Layer          | Technology                                   |
|----------------|-----------------------------------------------|
| Frontend       | HTML5, CSS3, EJS templates, vanilla JS, Bootstrap 5 |
| Backend        | Node.js, Express.js                           |
| Database       | MySQL                                          |
| DB Driver      | mysql2 (connection pooling)                   |
| Auth           | express-session, bcryptjs                     |
| Config         | dotenv                                         |
| Other          | express-validator, multer, helmet, morgan, connect-flash |

## 4. Folder Structure

```
MediCare+/
├── app.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── config/
│   └── db.js
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── seedAdmin.js
├── models/          (Phase 2)
├── middleware/       (Phase 2)
├── utils/            (Phase 2)
├── controllers/       (Phase 3)
├── routes/            (Phase 3)
├── services/          (Phase 3)
├── views/             (Phase 4)
├── public/            (Phase 5)
└── tests/             (Phase 6)
```

## 5. MySQL Installation

Install MySQL Server (8.0+ recommended) for your OS:

- **Windows/macOS:** https://dev.mysql.com/downloads/installer/
- **Linux (Debian/Ubuntu):** `sudo apt install mysql-server`

Start the MySQL service and make sure you can log in:

```bash
mysql -u root -p
```

## 6. Database Creation

`schema.sql` creates the `medicare_plus` database for you, so you
don't need to create it manually. Just run the import command below.

## 7. Importing schema.sql

```bash
mysql -u root -p < database/schema.sql
```

This creates the `medicare_plus` database and all tables
(`users`, `departments`, `doctors`, `appointments`, `products`,
`cart`, `cart_items`, `orders`, `order_items`, `hospital`) with
proper primary keys, foreign keys, and indexes.

## 8. Importing seed.sql

```bash
mysql -u root -p medicare_plus < database/seed.sql
```

This adds:
- 10 departments
- 15 doctors
- 20 dummy healthcare products
- 1 hospital info record

## 9. Configuring .env

Copy the example file and fill in your local MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=medicare_plus
SESSION_SECRET=change_this_secret
AI_API_KEY=
NODE_ENV=development
```

`AI_API_KEY` can be left empty — the AI assistant falls back to a
built-in rule-based mode when no key is configured.

## 10. Installing npm Packages

```bash
npm install
```

## 11. Creating the Demo Admin Account

Because passwords must never be stored as plain text, the default
admin account is created by a small script (not by `seed.sql`) so its
password is properly hashed with bcrypt:

```bash
node database/seedAdmin.js
```

## 12. Running the Project

```bash
npm start
```

or, with auto-restart during development:

```bash
npm run dev
```

The app will be available at: `http://localhost:3000`

## 13. Demo Login Credentials

**Admin**
- Email: `admin@medicareplus.test`
- Password: `Admin@123`

**Patient**
- Register a new patient account from the `/register` page, or create
  one directly via the sign-up form once the auth module (Phase 3) is
  built.

> These are demo credentials for local evaluation only. Change them
> before deploying anywhere public.

## 14. AI Assistant Explanation

The AI assistant (`services/aiService.js`, added in Phase 3) helps
with:
- **Website navigation** — e.g. "Where can I book an appointment?"
- **General health information** — basic educational answers only

It always discloses:

> "MediCare+ AI Assistant provides general health information and
> website assistance. It does not diagnose diseases, prescribe
> medicines, or replace a qualified healthcare professional."

If no `AI_API_KEY` is set, it runs in a simple rule-based fallback
mode with predefined responses — no external API required. The
service is structured so a real AI API can be plugged in later
without changing the rest of the app.

## 15. Security Considerations

- Passwords are hashed with bcrypt — never stored or logged in plain
  text.
- All SQL queries use parameterized statements (via `mysql2`) — no
  string concatenation of user input.
- Sessions are used for authentication; protected routes check
  session state, and admin routes additionally check role.
- Secrets (DB credentials, session secret) are loaded from `.env`,
  which is excluded from version control via `.gitignore`.
- Stack traces are hidden from users in production mode; only a
  generic error message is shown.
- No real medical records, prescriptions, or payment card data are
  collected or stored anywhere in this project.
- The double-booking check is enforced at the database level via a
  generated `booking_slot` column and unique index on `appointments`,
  not just in application code — cancelling an appointment sets that
  column back to `NULL`, which frees the slot for rebooking.

## 16. Future Improvements

- Real payment gateway integration (optional, out of scope for the
  academic version)
- Email notifications for appointment confirmations
- Doctor-side login and dashboard
- File upload for profile/doctor images with image optimization
- Pagination for large product/doctor lists
- Automated test coverage expansion

---

## Build Phases

This project was generated in phases to keep each part consistent:

1. **Phase 1** — Project scaffolding: `package.json`, `app.js`,
   `.env.example`, `.gitignore`, `config/db.js`, `database/schema.sql`,
   `database/seed.sql`, `README.md` ✅
2. **Phase 2** — `models/`, `middleware/`, `utils/` ✅
3. **Phase 3** — `controllers/`, `routes/`, `services/` ✅ *(current)*
4. **Phase 4** — `views/` (EJS templates)
5. **Phase 5** — `public/css/`, `public/js/`
6. **Phase 6** — `tests/`

As of Phase 3, every route from the master prompt's route list is wired
up in `app.js` through real controllers, calling the Phase 2 models.
**Views don't exist yet (Phase 4)** — any route that calls `res.render(...)`
(most `GET` page routes) will currently respond with a 500 "Failed to
lookup view" error. That's expected at this stage. Routes that
`res.redirect(...)` after a database write (register, login, add to
cart, book an appointment, checkout, admin actions, etc.) work
end-to-end right now, since they never try to render a template.
