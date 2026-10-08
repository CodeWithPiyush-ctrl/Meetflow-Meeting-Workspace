from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# -----------------------------
# Participant schemas
# -----------------------------

class ParticipantBase(BaseModel):
    name: str
    email: Optional[str] = None


class ParticipantResponse(ParticipantBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )


# -----------------------------
# Transcript schemas
# -----------------------------

class TranscriptSegmentResponse(BaseModel):
    id: int
    speaker_name: str
    text: str
    start_time: float
    end_time: float
    sequence_number: int

    model_config = ConfigDict(
        from_attributes=True
    )


# -----------------------------
# Summary schemas
# -----------------------------

class SummaryResponse(BaseModel):
    id: int
    overview: str

    model_config = ConfigDict(
        from_attributes=True
    )


# -----------------------------
# Topic schemas
# -----------------------------

class TopicResponse(BaseModel):
    id: int
    title: str
    start_time: float

    model_config = ConfigDict(
        from_attributes=True
    )


# -----------------------------
# Action item schemas
# -----------------------------

class ActionItemResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: bool

    model_config = ConfigDict(
        from_attributes=True
    )


# -----------------------------
# Meeting schemas
# -----------------------------

class MeetingBase(BaseModel):
    title: str
    meeting_date: datetime
    duration_seconds: int = 0


# -----------------------------
# Create meeting
# -----------------------------

class MeetingCreate(MeetingBase):
    participants: List[ParticipantBase] = Field(
        default_factory=list
    )

    # Raw transcript text supplied when creating a meeting.
    # The backend converts this into transcript segments.
    transcript: Optional[str] = None


# -----------------------------
# Update meeting
# -----------------------------

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    meeting_date: Optional[datetime] = None
    duration_seconds: Optional[int] = None

    # Optional participant update.
    # When provided, the backend will replace
    # the meeting's existing participants.
    participants: Optional[List[ParticipantBase]] = None


# -----------------------------
# Meeting list response
# -----------------------------

class MeetingListResponse(MeetingBase):
    id: int

    participants: List[ParticipantResponse] = Field(
        default_factory=list
    )

    model_config = ConfigDict(
        from_attributes=True
    )


# -----------------------------
# Meeting detail response
# -----------------------------

class MeetingDetailResponse(MeetingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    participants: List[ParticipantResponse] = Field(
        default_factory=list
    )

    transcript_segments: List[TranscriptSegmentResponse] = Field(
        default_factory=list
    )

    summary: Optional[SummaryResponse] = None

    action_items: List[ActionItemResponse] = Field(
        default_factory=list
    )

    topics: List[TopicResponse] = Field(
        default_factory=list
    )

    model_config = ConfigDict(
        from_attributes=True
    )