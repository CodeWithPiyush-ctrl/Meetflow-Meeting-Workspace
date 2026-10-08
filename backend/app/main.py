from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# Import all database models so SQLAlchemy knows about the tables.
from app.models import (
    ActionItem,
    Meeting,
    Participant,
    Summary,
    Topic,
    TranscriptSegment,
)

# Import API routers.
from app.routers.meetings import router as meetings_router
from app.routers.action_items import router as action_items_router
from app.routers.transcript import router as transcript_router


# ============================================================
# DATABASE
# ============================================================

# Create database tables if they do not already exist.
Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="MeetFlow API",
    description="Backend API for the MeetFlow meeting workspace",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://meetflow-meeting-workspace.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(meetings_router)
app.include_router(action_items_router)
app.include_router(transcript_router)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "MeetFlow API",
    }