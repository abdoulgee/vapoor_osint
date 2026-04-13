"""
VAPOR SCAN — Main FastAPI Application

An OSINT intelligence platform for managing investigations, geospatial markers,
evidence with approval pipeline, investigation timeline, and professional reports.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base

# Import all models so they're registered with SQLAlchemy
from app.models.user import User
from app.models.case import Case, CaseAssignment
from app.models.marker import Marker
from app.models.evidence import Evidence
from app.models.foi import FOIRequest
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.models.timeline import InvestigationEvent

# Import routers
from app.routers import auth, users, cases, markers, evidence, foi, audit_logs, notifications, analytics, reports, timeline


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables on startup."""
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="OSINT Intelligence Platform — Manage investigations, map geospatial intelligence, track evidence and FOI requests.",
    lifespan=lifespan,
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file serving for uploads
upload_dir = settings.UPLOAD_DIR
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Register all routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cases.router)
app.include_router(markers.router)
app.include_router(evidence.router)
app.include_router(foi.router)
app.include_router(audit_logs.router)
app.include_router(notifications.router)
app.include_router(analytics.router)
app.include_router(reports.router)
app.include_router(timeline.router)


@app.get("/", tags=["Health"])
def health_check():
    """Application health check endpoint."""
    return {
        "status": "operational",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
