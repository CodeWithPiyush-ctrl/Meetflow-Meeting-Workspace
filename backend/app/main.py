from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, SessionLocal

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

# Import the existing seed function.
from app.seed import seed_database


# ============================================================
# DATABASE
# ============================================================

# Create all database tables before doing anything with the data.
Base.metadata.create_all(bind=engine)


def seed_database_if_empty():
    """
    Seed the database only when there are no meetings.

    This prevents the demo seed from deleting user-created
    meetings whenever the Render service restarts.
    """
    db = SessionLocal()

    try:
        meeting_count = db.query(Meeting).count()

        if meeting_count == 0:
            print("Database is empty. Seeding demo meetings...")
            seed_database()
            print("Demo meetings seeded successfully.")
        else:
            print(
                f"Database already contains {meeting_count} meeting(s). "
                "Skipping seed."
            )

    except Exception as error:
        print(f"Database seeding check failed: {error}")
        raise

    finally:
        db.close()


# Seed only after the tables have been created.
seed_database_if_empty()


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
    allow_origin_regex=r"https://.*\.vercel\.app",
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