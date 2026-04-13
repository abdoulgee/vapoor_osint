# 🛰️ VAPOR SCAN — OSINT Intelligence Platform

A production-ready OSINT intelligence dashboard for managing investigations, geospatial intelligence, evidence, FOI requests, and generating professional reports.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, SQLAlchemy, Alembic |
| Frontend | React (Vite), Tailwind CSS, Zustand, Leaflet.js |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (access + refresh tokens), bcrypt |

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Seed sample data
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vaporscan.io | admin123 |
| Manager | manager@vaporscan.io | manager123 |
| Analyst | analyst1@vaporscan.io | analyst123 |

## Features

- **Case Management** — Create, assign, and track investigations
- **Geospatial Intelligence** — Leaflet map with risk-level markers
- **Evidence Vault** — Upload images/PDFs linked to markers
- **FOI Tracker** — Track Freedom of Information requests
- **PDF Reports** — Generate per-case intelligence reports
- **RBAC** — Admin, Manager, Analyst roles
- **Audit Logs** — Full action trail (admin-only)
- **Notifications** — In-app alerts for assignments and uploads
- **Analytics Dashboard** — Stats, risk breakdown, activity feed

## Project Structure

```
vapor_osint/
├── backend/
│   ├── app/
│   │   ├── core/       # Config, database, security
│   │   ├── models/     # SQLAlchemy models
│   │   ├── schemas/    # Pydantic schemas
│   │   ├── routers/    # API endpoints
│   │   ├── services/   # Business logic
│   │   └── utils/      # Auth dependencies
│   ├── alembic/        # Database migrations
│   └── seed.py         # Sample data
├── frontend/
│   └── src/
│       ├── api/        # Axios client
│       ├── stores/     # Zustand state
│       ├── components/ # Reusable UI
│       └── pages/      # Route pages
└── README.md
```
