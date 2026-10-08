from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meeting import ActionItem, Meeting
from app.schemas.action_item import (
    ActionItemCreate,
    ActionItemResponse,
    ActionItemUpdate,
)


router = APIRouter(
    tags=["Action Items"],
)


# ============================================================
# GET ACTION ITEMS FOR A MEETING
# ============================================================

@router.get(
    "/api/meetings/{meeting_id}/action-items",
    response_model=List[ActionItemResponse],
)
def get_action_items(
    meeting_id: int,
    db: Session = Depends(get_db),
):
    # First check that the meeting exists.
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

    action_items = (
        db.query(ActionItem)
        .filter(ActionItem.meeting_id == meeting_id)
        .order_by(ActionItem.id.asc())
        .all()
    )

    return action_items


# ============================================================
# CREATE ACTION ITEM
# ============================================================

@router.post(
    "/api/meetings/{meeting_id}/action-items",
    response_model=ActionItemResponse,
    status_code=201,
)
def create_action_item(
    meeting_id: int,
    action_item_data: ActionItemCreate,
    db: Session = Depends(get_db),
):
    # Check that the meeting exists.
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

    action_item = ActionItem(
        meeting_id=meeting_id,
        title=action_item_data.title,
        description=action_item_data.description,
        assignee=action_item_data.assignee,
        due_date=action_item_data.due_date,
        completed=False,
    )

    db.add(action_item)
    db.commit()
    db.refresh(action_item)

    return action_item


# ============================================================
# UPDATE ACTION ITEM
# ============================================================

@router.put(
    "/api/action-items/{action_item_id}",
    response_model=ActionItemResponse,
)
def update_action_item(
    action_item_id: int,
    action_item_data: ActionItemUpdate,
    db: Session = Depends(get_db),
):
    action_item = (
        db.query(ActionItem)
        .filter(ActionItem.id == action_item_id)
        .first()
    )

    if not action_item:
        raise HTTPException(
            status_code=404,
            detail="Action item not found",
        )

    update_data = action_item_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(action_item, field, value)

    db.commit()
    db.refresh(action_item)

    return action_item


# ============================================================
# DELETE ACTION ITEM
# ============================================================

@router.delete(
    "/api/action-items/{action_item_id}",
)
def delete_action_item(
    action_item_id: int,
    db: Session = Depends(get_db),
):
    action_item = (
        db.query(ActionItem)
        .filter(ActionItem.id == action_item_id)
        .first()
    )

    if not action_item:
        raise HTTPException(
            status_code=404,
            detail="Action item not found",
        )

    db.delete(action_item)
    db.commit()

    return {
        "message": "Action item deleted successfully",
        "action_item_id": action_item_id,
    }