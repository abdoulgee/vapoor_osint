"""
Seed script — Populates the database with realistic sample data.
Run from the backend directory: python seed.py
"""

import os
import sys

# Ensure the backend module is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.case import Case, CaseAssignment, CaseStatus
from app.models.marker import Marker, RiskLevel
from app.models.evidence import Evidence, EvidenceStatus
from app.models.foi import FOIRequest
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.models.timeline import InvestigationEvent, ActionType
from datetime import datetime, timezone, timedelta


def seed():
    """Seed the database with sample data."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("[+] Tables created")

    db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 0:
        print("[!] Database already seeded. Delete vapor_scan.db to re-seed.")
        db.close()
        return

    now = datetime.now(timezone.utc)

    # ── Users ──────────────────────────────────────────
    print("[+] Creating users...")
    admin = User(
        email="admin@vaporscan.io", full_name="Director Sarah Mitchell",
        hashed_password=hash_password("admin123"), role=UserRole.ADMIN
    )
    manager = User(
        email="manager@vaporscan.io", full_name="Agent Marcus Cole",
        hashed_password=hash_password("manager123"), role=UserRole.MANAGER
    )
    analyst1 = User(
        email="analyst1@vaporscan.io", full_name="Analyst Elena Vasquez",
        hashed_password=hash_password("analyst123"), role=UserRole.ANALYST
    )
    analyst2 = User(
        email="analyst2@vaporscan.io", full_name="Analyst James Park",
        hashed_password=hash_password("analyst123"), role=UserRole.ANALYST
    )
    db.add_all([admin, manager, analyst1, analyst2])
    db.commit()
    print(f"  → Created {db.query(User).count()} users")

    # ── Cases ──────────────────────────────────────────
    print("[+] Creating cases...")
    case1 = Case(
        title="Operation Nightfall", description="Investigation into suspicious financial transactions tied to offshore shell companies in the Caribbean region.",
        status=CaseStatus.INVESTIGATING, created_by=manager.id, created_at=now - timedelta(days=14)
    )
    case2 = Case(
        title="Project Watchtower", description="Monitoring unauthorized telecommunications infrastructure deployments in restricted zones.",
        status=CaseStatus.OPEN, created_by=admin.id, created_at=now - timedelta(days=7)
    )
    case3 = Case(
        title="Silverlake Inquiry", description="Environmental contamination investigation near Silverlake industrial complex.",
        status=CaseStatus.CLOSED, created_by=manager.id, created_at=now - timedelta(days=30)
    )
    db.add_all([case1, case2, case3])
    db.commit()

    # ── Case Assignments ───────────────────────────────
    assignments = [
        CaseAssignment(case_id=case1.id, user_id=analyst1.id),
        CaseAssignment(case_id=case1.id, user_id=analyst2.id),
        CaseAssignment(case_id=case2.id, user_id=analyst1.id),
        CaseAssignment(case_id=case2.id, user_id=manager.id),
        CaseAssignment(case_id=case3.id, user_id=analyst2.id),
    ]
    db.add_all(assignments)
    db.commit()
    print(f"  → Created {len(assignments)} case assignments")

    # ── Markers ────────────────────────────────────────
    print("[+] Creating markers...")
    markers_data = [
        # Case 1 markers
        Marker(case_id=case1.id, title="Offshore Registry Office", description="Shell company registration address. Multiple entities share this location.",
               latitude=18.4861, longitude=-69.9312, category="Commercial", risk_level=RiskLevel.HIGH, created_by=analyst1.id),
        Marker(case_id=case1.id, title="Port Facility Alpha", description="Suspected goods transfer point with unusual nighttime activity.",
               latitude=18.4685, longitude=-69.9090, category="Transportation", risk_level=RiskLevel.CRITICAL, created_by=analyst1.id),
        Marker(case_id=case1.id, title="Financial District Hub", description="Banking cluster with 3 identified shell company accounts.",
               latitude=18.4734, longitude=-69.9257, category="Commercial", risk_level=RiskLevel.MEDIUM, created_by=analyst2.id),
        # Case 2 markers
        Marker(case_id=case2.id, title="Unauthorized Tower Site", description="Undocumented cellular tower detected via RF scanning.",
               latitude=40.7589, longitude=-73.9851, category="Telecommunications", risk_level=RiskLevel.HIGH, created_by=analyst1.id),
        Marker(case_id=case2.id, title="Signal Relay Point", description="Suspected signal relay co-located with legitimate ISP infrastructure.",
               latitude=40.7484, longitude=-73.9857, category="Telecommunications", risk_level=RiskLevel.MEDIUM, created_by=analyst1.id),
        # Case 3 markers
        Marker(case_id=case3.id, title="Industrial Outfall Pipe", description="Discharge point for processed wastewater. Samples show elevated heavy metals.",
               latitude=34.0522, longitude=-118.2437, category="Environmental", risk_level=RiskLevel.CRITICAL, created_by=analyst2.id),
        Marker(case_id=case3.id, title="Monitoring Well #7", description="Groundwater monitoring station showing contamination plume migration.",
               latitude=34.0548, longitude=-118.2401, category="Environmental", risk_level=RiskLevel.HIGH, created_by=analyst2.id),
    ]
    db.add_all(markers_data)
    db.commit()
    print(f"  → Created {len(markers_data)} markers")

    # ── FOI Requests ───────────────────────────────────
    print("[+] Creating FOI requests...")
    foi_data = [
        FOIRequest(case_id=case1.id, agency_name="Financial Crimes Unit", request_date="2025-11-15",
                   response_status="in_progress", notes="Requested transaction records for entities Alpha-7 through Alpha-12.", created_by=manager.id),
        FOIRequest(case_id=case2.id, agency_name="Federal Communications Commission", request_date="2025-12-01",
                   response_status="pending", notes="RF spectrum allocation records for target coordinates.", created_by=admin.id),
        FOIRequest(case_id=case3.id, agency_name="Environmental Protection Agency", request_date="2025-10-01",
                   response_status="completed", notes="Water quality analysis results received. Elevated lead levels confirmed.", created_by=manager.id),
    ]
    db.add_all(foi_data)
    db.commit()
    print(f"  → Created {len(foi_data)} FOI requests")

    # ── Timeline Events ────────────────────────────────
    print("[+] Creating timeline events...")
    timeline_data = [
        InvestigationEvent(case_id=case1.id, user_id=manager.id, action_type=ActionType.CASE_CREATED,
                          description='Case "Operation Nightfall" created', created_at=now - timedelta(days=14)),
        InvestigationEvent(case_id=case1.id, user_id=manager.id, action_type=ActionType.USER_ASSIGNED,
                          description='2 analysts assigned to case', created_at=now - timedelta(days=14)),
        InvestigationEvent(case_id=case1.id, user_id=analyst1.id, action_type=ActionType.MARKER_ADDED,
                          description='Marker "Offshore Registry Office" added (high risk)', created_at=now - timedelta(days=12)),
        InvestigationEvent(case_id=case1.id, user_id=analyst1.id, action_type=ActionType.MARKER_ADDED,
                          description='Marker "Port Facility Alpha" added (critical risk)', created_at=now - timedelta(days=11)),
        InvestigationEvent(case_id=case1.id, user_id=analyst2.id, action_type=ActionType.EVIDENCE_UPLOADED,
                          description='Evidence "port_surveillance_jan.pdf" uploaded', created_at=now - timedelta(days=10)),
        InvestigationEvent(case_id=case1.id, user_id=manager.id, action_type=ActionType.EVIDENCE_APPROVED,
                          description='Evidence "port_surveillance_jan.pdf" approved', created_at=now - timedelta(days=9)),
        InvestigationEvent(case_id=case1.id, user_id=manager.id, action_type=ActionType.STATUS_CHANGED,
                          description='Case status changed from "open" to "investigating"', created_at=now - timedelta(days=8)),
    ]
    db.add_all(timeline_data)
    db.commit()
    print(f"  → Created {len(timeline_data)} timeline events")

    # ── Audit Logs ─────────────────────────────────────
    print("[+] Creating audit logs...")
    audits = [
        AuditLog(user_id=admin.id, action="login", entity_type="user", created_at=now - timedelta(days=14)),
        AuditLog(user_id=manager.id, action="created", entity_type="case", entity_id=case1.id, created_at=now - timedelta(days=14)),
        AuditLog(user_id=analyst1.id, action="created", entity_type="marker", entity_id=1, created_at=now - timedelta(days=12)),
        AuditLog(user_id=manager.id, action="approved", entity_type="evidence", entity_id=1, created_at=now - timedelta(days=9)),
    ]
    db.add_all(audits)
    db.commit()
    print(f"  → Created {len(audits)} audit logs")

    db.close()

    print("\n" + "=" * 50)
    print("✓ DATABASE SEEDED SUCCESSFULLY")
    print("=" * 50)
    print("\nTest Credentials:")
    print("  Admin:   admin@vaporscan.io    / admin123")
    print("  Manager: manager@vaporscan.io  / manager123")
    print("  Analyst: analyst1@vaporscan.io / analyst123")
    print("  Analyst: analyst2@vaporscan.io / analyst123")


if __name__ == "__main__":
    seed()
