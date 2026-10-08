from datetime import date, datetime, time, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meeting import (
    Meeting,
    Participant,
    TranscriptSegment,
)
from app.schemas.meeting import (
    MeetingCreate,
    MeetingDetailResponse,
    MeetingListResponse,
    MeetingUpdate,
)


router = APIRouter(
    prefix="/api/meetings",
    tags=["Meetings"],
)


# ============================================================
# GET ALL MEETINGS
# ============================================================

@router.get(
    "",
    response_model=List[MeetingListResponse],
)
def get_meetings(
    search: Optional[str] = Query(
        default=None,
        description="Search meetings by title",
    ),
    participant: Optional[str] = Query(
        default=None,
        description="Filter meetings by participant name",
    ),
    date_from: Optional[date] = Query(
        default=None,
        description="Show meetings from this date",
    ),
    date_to: Optional[date] = Query(
        default=None,
        description="Show meetings up to this date",
    ),
    sort: str = Query(
        default="recent",
        description="Sort by recent or oldest",
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Meeting)

    # --------------------------------------------------------
    # Search by meeting title
    # --------------------------------------------------------

    if search:
        search_value = f"%{search}%"

        query = query.filter(
            Meeting.title.ilike(search_value)
        )

    # --------------------------------------------------------
    # Filter by participant
    # --------------------------------------------------------

    if participant:
        participant_value = f"%{participant}%"

        query = query.filter(
            Meeting.participants.any(
                Participant.name.ilike(
                    participant_value
                )
            )
        )

    # --------------------------------------------------------
    # Filter by starting date
    # --------------------------------------------------------

    if date_from:
        start_datetime = datetime.combine(
            date_from,
            time.min,
        )

        query = query.filter(
            Meeting.meeting_date >= start_datetime
        )

    # --------------------------------------------------------
    # Filter by ending date
    # --------------------------------------------------------

    if date_to:
        end_datetime = datetime.combine(
            date_to + timedelta(days=1),
            time.min,
        )

        query = query.filter(
            Meeting.meeting_date < end_datetime
        )

    # --------------------------------------------------------
    # Sorting
    # --------------------------------------------------------

    if sort.lower() == "oldest":
        query = query.order_by(
            Meeting.meeting_date.asc()
        )
    else:
        query = query.order_by(
            Meeting.meeting_date.desc()
        )

    return query.all()


# ============================================================
# GET ONE MEETING
# ============================================================

@router.get(
    "/{meeting_id}",
    response_model=MeetingDetailResponse,
)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
):
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

    return meeting


# ============================================================
# CREATE MEETING
# ============================================================

@router.post(
    "",
    response_model=MeetingDetailResponse,
    status_code=201,
)
def create_meeting(
    meeting_data: MeetingCreate,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Create meeting
    # --------------------------------------------------------

    meeting = Meeting(
        title=meeting_data.title,
        meeting_date=meeting_data.meeting_date,
        duration_seconds=meeting_data.duration_seconds,
    )

    db.add(meeting)

    # Flush so meeting.id is available
    db.flush()

    # --------------------------------------------------------
    # Add participants
    # --------------------------------------------------------

    for participant_data in meeting_data.participants:
        participant = Participant(
            meeting_id=meeting.id,
            name=participant_data.name,
            email=participant_data.email,
        )

        db.add(participant)

    # --------------------------------------------------------
    # Add transcript segments
    # --------------------------------------------------------

    if meeting_data.transcript:
        transcript_lines = [
            line.strip()
            for line in meeting_data.transcript.splitlines()
            if line.strip()
        ]

        if transcript_lines:
            segment_duration = (
                meeting_data.duration_seconds
                / len(transcript_lines)
            )

            for index, line in enumerate(
                transcript_lines
            ):

                # Expected format:
                #
                # Speaker Name: Transcript text
                #
                # Example:
                # Piyush: Let's start the meeting.

                if ":" in line:
                    speaker, text = line.split(
                        ":",
                        1,
                    )

                    speaker = speaker.strip()
                    text = text.strip()

                else:
                    speaker = "Speaker"
                    text = line

                start_time = (
                    index * segment_duration
                )

                end_time = (
                    (index + 1)
                    * segment_duration
                )

                transcript_segment = TranscriptSegment(
                    meeting_id=meeting.id,
                    speaker_name=speaker,
                    text=text,
                    start_time=start_time,
                    end_time=end_time,
                    sequence_number=index + 1,
                )

                db.add(transcript_segment)

    # --------------------------------------------------------
    # Save meeting
    # --------------------------------------------------------

    db.commit()
    db.refresh(meeting)

    return meeting


# ============================================================
# UPDATE MEETING
# ============================================================

@router.put(
    "/{meeting_id}",
    response_model=MeetingDetailResponse,
)
def update_meeting(
    meeting_id: int,
    meeting_data: MeetingUpdate,
    db: Session = Depends(get_db),
):
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
    # Update title
    # --------------------------------------------------------

    if meeting_data.title is not None:
        meeting.title = meeting_data.title

    # --------------------------------------------------------
    # Update meeting date
    # --------------------------------------------------------

    if meeting_data.meeting_date is not None:
        meeting.meeting_date = (
            meeting_data.meeting_date
        )

    # --------------------------------------------------------
    # Update duration
    # --------------------------------------------------------

    if meeting_data.duration_seconds is not None:
        meeting.duration_seconds = (
            meeting_data.duration_seconds
        )

    # --------------------------------------------------------
    # Update participants
    # --------------------------------------------------------

    if meeting_data.participants is not None:

        # Remove existing participants
        for participant in list(
            meeting.participants
        ):
            db.delete(participant)

        # Add updated participants
        for participant_data in (
            meeting_data.participants
        ):
            participant = Participant(
                meeting_id=meeting.id,
                name=participant_data.name,
                email=participant_data.email,
            )

            db.add(participant)

    # --------------------------------------------------------
    # Save changes
    # --------------------------------------------------------

    db.commit()
    db.refresh(meeting)

    return meeting


# ============================================================
# DELETE MEETING
# ============================================================

@router.delete(
    "/{meeting_id}",
)
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
):
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

    db.delete(meeting)
    db.commit()

    return {
        "message": "Meeting deleted successfully",
        "meeting_id": meeting_id,
    }