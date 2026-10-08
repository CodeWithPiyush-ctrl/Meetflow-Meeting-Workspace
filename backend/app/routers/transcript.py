from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meeting import Meeting, TranscriptSegment
from app.schemas.transcript import TranscriptSegmentResponse


router = APIRouter(
    tags=["Transcript"],
)


# ============================================================
# GET TRANSCRIPT
# ============================================================

@router.get(
    "/api/meetings/{meeting_id}/transcript",
    response_model=List[TranscriptSegmentResponse],
)
def get_transcript(
    meeting_id: int,
    search: Optional[str] = Query(
        default=None,
        description="Search text inside the transcript",
    ),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check that the meeting exists
    # --------------------------------------------------------

    meeting = (
        db.query(Meeting)
        .filter(Meeting.id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    # --------------------------------------------------------
    # Get transcript segments
    # --------------------------------------------------------

    query = (
        db.query(TranscriptSegment)
        .filter(
            TranscriptSegment.meeting_id == meeting_id
        )
    )

    # --------------------------------------------------------
    # Search transcript text
    # --------------------------------------------------------

    if search:
        search_value = f"%{search}%"

        query = query.filter(
            TranscriptSegment.text.ilike(search_value)
        )

    # --------------------------------------------------------
    # Keep transcript in original order
    # --------------------------------------------------------

    query = query.order_by(
        TranscriptSegment.sequence_number.asc()
    )

    return query.all()