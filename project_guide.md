You are a senior full-stack software engineer and system architect.

Your task is to design and build a **production-ready OSINT intelligence platform** called:

# 🛰️ VAPOR SCAN

This system must be built as a scalable, secure, and modular SaaS-style application — NOT a simple demo.

---

# 🎯 CORE OBJECTIVE

Build a web-based intelligence dashboard that allows organizations to:

* Manage investigation cases
* Map geospatial intelligence (POIs)
* Upload and manage evidence
* Track FOI requests
* Generate professional reports
* Enforce role-based access control

---

# 🧱 TECH STACK (STRICT)

## Backend:

* Python (FastAPI)
* PostgreSQL (use SQLite for dev fallback)
* SQLAlchemy ORM
* Alembic (migrations)
* JWT Authentication (access + refresh tokens)

## Frontend:

* React (Vite)
* Tailwind CSS (dark mode default)
* Zustand or Redux (state management)
* Leaflet.js (map engine)

## Storage:

* Local file storage (/uploads)
* Structure folders by case_id

---

# 🧠 SYSTEM ARCHITECTURE

Use clean architecture:

* routers/
* services/
* models/
* schemas/
* core/
* utils/

Follow separation of concerns strictly.

---

# 👥 ROLE-BASED ACCESS CONTROL

## Roles:

1. Admin
2. Manager
3. Analyst

## Permissions Matrix:

### Admin:

* Full access
* Manage users
* Assign roles
* View/edit/delete all cases
* System configuration
* View audit logs

### Manager:

* Create/manage cases
* Assign analysts
* Approve evidence
* Generate reports
* View team activity

### Analyst:

* View assigned cases only
* Add markers
* Upload evidence
* Add notes

---

# 📁 CORE FEATURES

## 1. AUTH SYSTEM

* Register / Login
* JWT (access + refresh)
* Password hashing (bcrypt)
* Middleware for role enforcement

---

## 2. CASE MANAGEMENT

Fields:

* id
* title
* description
* status (open, investigating, closed)
* created_by
* assigned_users
* created_at

---

## 3. MAP & MARKERS (GEOSPATIAL INTELLIGENCE)

* Leaflet map
* Add marker via click or coordinates

Marker fields:

* id
* case_id
* title
* description
* latitude
* longitude
* category
* risk_level
* created_by
* created_at

---

## 4. EVIDENCE VAULT

* Upload images and PDFs
* Linked to markers

Fields:

* id
* marker_id
* file_path
* file_type
* uploaded_by
* timestamp

---

## 5. FOI TRACKING MODULE

Fields:

* id
* case_id
* agency_name
* request_date
* response_status
* documents

---

## 6. REPORT GENERATOR

* Generate PDF per case

Include:

* Case details
* Marker list
* Map snapshot (use static map API or server-side rendering)
* Evidence list
* Notes

---

## 7. SEARCH & FILTER

* By category
* Risk level
* Case
* Date range

---

## 8. AUDIT LOG SYSTEM

Track:

* user_id
* action
* entity_type
* entity_id
* timestamp

---

## 9. NOTIFICATIONS SYSTEM (BASIC)

* In-app notifications
* Trigger:

  * case assigned
  * evidence uploaded

---

## 10. ANALYTICS DASHBOARD

* Total cases
* Active investigations
* High-risk markers
* Recent activity

---

# 🧑‍💻 FRONTEND UI REQUIREMENTS

## Layout:

* Sidebar:

  * Cases
  * Dashboard
  * FOI
* Topbar:

  * User info
  * Notifications
* Main:

  * Map view
  * Case panel
  * Marker details panel

## Features:

* Dark theme
* Responsive
* Clean modern UI
* Modal forms for:

  * Creating cases
  * Adding markers
  * Uploading evidence

---

# 📂 DATABASE DESIGN

Provide full schema with relationships:

* Users
* Roles
* Cases
* Markers
* Evidence
* FOI Requests
* Audit Logs

---

# 🔐 SECURITY REQUIREMENTS

* Validate all inputs
* Secure file uploads
* Prevent unauthorized access
* Role-based middleware
* Sanitize user data

---

# 📦 DELIVERABLES (MANDATORY)

You must output:

## 1. FULL BACKEND CODE

* FastAPI app
* Models
* Routes
* Services
* Auth system

## 2. FULL FRONTEND CODE

* React app
* Pages
* Components
* API integration

## 3. DATABASE SETUP

* Models + migrations

## 4. PROJECT STRUCTURE

## 5. RUN INSTRUCTIONS

* Backend setup
* Frontend setup
* Database setup

## 6. SAMPLE DATA

---

# 🚀 EXTRA ENGINEERING REQUIREMENTS

* Use reusable components
* Add meaningful comments
* Follow best practices
* Modular and scalable design
* Avoid hardcoding values

---

# ⚠️ IMPORTANT

* Do NOT skip any feature
* Do NOT simplify architecture
* Do NOT return partial implementation

Build a complete working MVP that can be extended into a production SaaS platform.

Output everything in structured sections.
