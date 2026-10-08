from pydantic import BaseModel, ConfigDict


class TranscriptSegmentResponse(BaseModel):
    id: int
    meeting_id: int
    speaker_name: str
    text: str
    start_time: float
    end_time: float
    sequence_number: int

    model_config = ConfigDict(from_attributes=True)