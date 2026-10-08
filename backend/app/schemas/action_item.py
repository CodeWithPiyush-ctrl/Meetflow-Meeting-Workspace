from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ActionItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None


class ActionItemCreate(ActionItemBase):
    pass


class ActionItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None


class ActionItemResponse(ActionItemBase):
    id: int
    meeting_id: int
    completed: bool

    model_config = ConfigDict(from_attributes=True)