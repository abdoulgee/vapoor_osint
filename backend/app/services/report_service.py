"""
Report generation service: creates PDF reports per case.
Uses ReportLab for PDF generation.
"""

import io
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

from app.models.case import Case
from app.models.marker import Marker
from app.models.evidence import Evidence
from app.models.foi import FOIRequest


def generate_case_report(db: Session, case_id: int) -> io.BytesIO:
    """Generate a comprehensive PDF report for a case."""
    case = db.query(Case).options(
        joinedload(Case.creator),
        joinedload(Case.markers).joinedload(Marker.evidence),
        joinedload(Case.foi_requests),
    ).filter(Case.id == case_id).first()

    if not case:
        raise ValueError("Case not found")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CustomTitle", parent=styles["Title"],
        fontSize=24, textColor=colors.HexColor("#1a1a2e"),
        spaceAfter=20,
    )
    heading_style = ParagraphStyle(
        "CustomHeading", parent=styles["Heading2"],
        fontSize=16, textColor=colors.HexColor("#16213e"),
        spaceBefore=15, spaceAfter=10,
    )
    body_style = styles["BodyText"]

    elements = []

    # Title
    elements.append(Paragraph("VAPOR SCAN — Intelligence Report", title_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0f3460")))
    elements.append(Spacer(1, 12))

    # Case Details
    elements.append(Paragraph("Case Details", heading_style))
    case_data = [
        ["Field", "Value"],
        ["Case ID", str(case.id)],
        ["Title", case.title],
        ["Status", case.status.value.upper()],
        ["Created By", case.creator.full_name if case.creator else "N/A"],
        ["Created At", case.created_at.strftime("%Y-%m-%d %H:%M UTC")],
        ["Description", case.description or "No description"],
    ]
    case_table = Table(case_data, colWidths=[1.5 * inch, 4.5 * inch])
    case_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f5f5f5")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f5f5f5"), colors.white]),
    ]))
    elements.append(case_table)
    elements.append(Spacer(1, 20))

    # Markers
    markers = case.markers
    elements.append(Paragraph(f"Markers ({len(markers)})", heading_style))
    if markers:
        marker_data = [["#", "Title", "Category", "Risk", "Coordinates"]]
        for i, m in enumerate(markers, 1):
            marker_data.append([
                str(i),
                m.title,
                m.category or "—",
                m.risk_level.value.upper(),
                f"{m.latitude:.4f}, {m.longitude:.4f}",
            ])
        marker_table = Table(marker_data, colWidths=[0.4 * inch, 2 * inch, 1.2 * inch, 1 * inch, 1.8 * inch])
        marker_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16213e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f5f5f5"), colors.white]),
        ]))
        elements.append(marker_table)
    else:
        elements.append(Paragraph("No markers recorded.", body_style))
    elements.append(Spacer(1, 20))

    # Evidence
    all_evidence = []
    for m in markers:
        for e in m.evidence:
            all_evidence.append((m.title, e))

    elements.append(Paragraph(f"Evidence ({len(all_evidence)})", heading_style))
    if all_evidence:
        ev_data = [["#", "Marker", "Filename", "Type", "Uploaded"]]
        for i, (marker_title, e) in enumerate(all_evidence, 1):
            ev_data.append([
                str(i),
                marker_title,
                e.original_filename,
                e.file_type,
                e.created_at.strftime("%Y-%m-%d"),
            ])
        ev_table = Table(ev_data, colWidths=[0.4 * inch, 1.5 * inch, 2 * inch, 1.2 * inch, 1.2 * inch])
        ev_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3460")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f5f5f5"), colors.white]),
        ]))
        elements.append(ev_table)
    else:
        elements.append(Paragraph("No evidence files attached.", body_style))
    elements.append(Spacer(1, 20))

    # FOI Requests
    foi_list = case.foi_requests
    elements.append(Paragraph(f"FOI Requests ({len(foi_list)})", heading_style))
    if foi_list:
        foi_data = [["#", "Agency", "Request Date", "Status"]]
        for i, f in enumerate(foi_list, 1):
            foi_data.append([
                str(i),
                f.agency_name,
                f.request_date.strftime("%Y-%m-%d") if f.request_date else "—",
                f.response_status.value.upper(),
            ])
        foi_table = Table(foi_data, colWidths=[0.4 * inch, 2.5 * inch, 1.5 * inch, 1.5 * inch])
        foi_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#533483")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f5f5f5"), colors.white]),
        ]))
        elements.append(foi_table)
    else:
        elements.append(Paragraph("No FOI requests filed.", body_style))

    # Footer
    elements.append(Spacer(1, 30))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
    elements.append(Spacer(1, 6))
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    elements.append(Paragraph(
        f"Generated by VAPOR SCAN on {generated_at}",
        ParagraphStyle("Footer", parent=body_style, fontSize=8, textColor=colors.grey),
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer
