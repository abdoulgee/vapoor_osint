"""
Report generation router: PDF report per case.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.services.report_service import generate_case_report
from app.utils.dependencies import get_current_user, require_manager_or_admin
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/case/{case_id}")
def download_case_report(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Generate and download a PDF report for a case (Manager/Admin only)."""
    try:
        pdf_buffer = generate_case_report(db, case_id)
        log_action(db, current_user.id, "generated_report", "case", case_id)

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="vapor_scan_case_{case_id}_report.pdf"'
            },
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
