# MediMate – Doctor Appointment Booking System

A full-stack healthcare platform with **3 separate applications**:

```
medimate/
├── frontend/   — Patient-facing React app        (port 5173)
├── admin/      — Admin & Doctor panel React app  (port 5174)
└── backend/    — Node.js + Express REST API      (port 4000)
```

---

## 🚀 Quick Start

### 1. Backend
```bash
cd backend
npm install
# Edit .env with your MongoDB URI, JWT secret, Cloudinary keys
npm run dev
```

### 2. Frontend (Patient App)
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 3. Admin Panel
```bash
cd admin
npm install
npm run dev
# Opens at http://localhost:5174
```

---

## 🔐 Admin Panel Login

Click **"Admin Panel"** in the frontend Navbar → opens `http://localhost:5174` in a new tab.

| Role    | Credentials                          |
|---------|--------------------------------------|
| Admin   | `admin@medimate.com` / `admin123`    |
| Doctor  | Email + password set when doctor was added |

- Admin login → full dashboard (manage doctors, appointments, stats)
- Doctor login → restricted view (own appointments only)
- Toggle between modes with **"Login as a Doctor"** button at the bottom of the admin login form

---

## 📁 Project Structure

### Frontend (`/frontend/src/`)
```
components/
  Navbar.jsx          — Top navigation with Admin Panel button
  Footer.jsx          — Site footer
  Header.jsx          — Hero banner on Home page
  SpecialityMenu.jsx  — Speciality icons grid
  TopDoctors.jsx      — Featured doctor cards
  Banner.jsx          — CTA section
  DoctorCard.jsx      — Reusable doctor card
  RelatedDoctors.jsx  — Related doctors section
pages/
  Home.jsx            — Landing page
  Doctors.jsx         — Doctor listing with sidebar filter
  Appointment.jsx     — Booking page with time slots
  MyAppointments.jsx  — User's booked appointments
  MyProfile.jsx       — Edit user profile
  Login.jsx           — Login / Sign up
  About.jsx           — About us page
  Contact.jsx         — Contact page
context/
  AppContext.jsx      — Global state (doctors, token, userData)
assets/
  assets.js           — Mock data, helpers (getInitials, getDoctorColor, formatSlotDate)
```

### Admin (`/admin/src/`)
```
components/
  Sidebar.jsx         — Navigation sidebar (Admin vs Doctor views)
  Topbar.jsx          — Header with role badge and logout
pages/
  AdminLogin.jsx      — Admin + Doctor login form (single page, toggle at bottom)
  Dashboard.jsx       — Stats overview + recent appointments
  DoctorsList.jsx     — All doctors with availability toggle
  AddDoctor.jsx       — Add new doctor form
  Appointments.jsx    — All appointments with status filter
context/
  AdminContext.jsx    — Admin/doctor tokens, role, login/logout
```

### Backend (`/backend/`)
```
server.js             — Express app entry point
config/
  mongodb.js          — Mongoose connection
  cloudinary.js       — Cloudinary image upload config
models/
  userModel.js        — Patient schema
  doctorModel.js      — Doctor schema
  appointmentModel.js — Appointment schema
middleware/
  authMiddleware.js   — authUser / authAdmin / authDoctor JWT guards
  multer.js           — File upload handling
controllers/
  adminController.js  — Admin login, add doctor, dashboard stats
  doctorController.js — Doctor login, list, profile, appointments
  userController.js   — Register, login, profile, book/cancel appointments
routes/
  adminRoute.js       — /api/admin/*
  doctorRoute.js      — /api/doctor/*
  userRoute.js        — /api/user/*
```

---

## 🛠 Tech Stack
- **Frontend / Admin**: React 18, React Router v6, Tailwind CSS, Axios, React Toastify
- **Backend**: Node.js, Express.js, MongoDB + Mongoose, JWT, Bcrypt, Multer, Cloudinary
- **Build tool**: Vite

---

## ⚙️ Environment Variables

### Backend `.env`
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/medimate
JWT_SECRET=your_secret_key
ADMIN_EMAIL=admin@medimate.com
ADMIN_PASSWORD=admin123
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend `.env`
```
VITE_BACKEND_URL=http://localhost:4000
VITE_ADMIN_URL=http://localhost:5174
```

### Admin `.env`
```
VITE_BACKEND_URL=http://localhost:4000
```
