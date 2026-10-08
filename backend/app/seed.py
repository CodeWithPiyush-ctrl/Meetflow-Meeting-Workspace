from datetime import datetime

from app.database import SessionLocal
from app.models import (
    ActionItem,
    Meeting,
    Participant,
    Summary,
    Topic,
    TranscriptSegment,
)


def create_meeting(
    db,
    title,
    meeting_date,
    duration_seconds,
    participants,
    transcript,
    summary,
    topics,
    action_items,
):
    meeting = Meeting(
        title=title,
        meeting_date=meeting_date,
        duration_seconds=duration_seconds,
    )

    db.add(meeting)
    db.flush()

    for participant in participants:
        db.add(
            Participant(
                meeting_id=meeting.id,
                name=participant["name"],
                email=participant.get("email"),
            )
        )

    for index, segment in enumerate(transcript):
        db.add(
            TranscriptSegment(
                meeting_id=meeting.id,
                speaker_name=segment["speaker"],
                text=segment["text"],
                start_time=segment["start"],
                end_time=segment["end"],
                sequence_number=index + 1,
            )
        )

    db.add(
        Summary(
            meeting_id=meeting.id,
            overview=summary,
        )
    )

    for topic in topics:
        db.add(
            Topic(
                meeting_id=meeting.id,
                title=topic["title"],
                start_time=topic["start"],
            )
        )

    for item in action_items:
        db.add(
            ActionItem(
                meeting_id=meeting.id,
                title=item["title"],
                description=item.get("description"),
                assignee=item.get("assignee"),
                due_date=item.get("due_date"),
                completed=item.get("completed", False),
            )
        )

    return meeting


def seed_database():
    db = SessionLocal()

    try:
        # Remove existing demo data so the seed can be safely re-run.
        existing_meetings = db.query(Meeting).all()

        for meeting in existing_meetings:
            db.delete(meeting)

        db.commit()

        meetings = [
            {
                "title": "Product Strategy & Q4 Planning",
                "meeting_date": datetime(2026, 10, 7, 10, 0),
                "duration_seconds": 1920,
                "participants": [
                    {
                        "name": "Sarah Chen",
                        "email": "sarah@meetflow.com",
                    },
                    {
                        "name": "Alex Morgan",
                        "email": "alex@meetflow.com",
                    },
                    {
                        "name": "Maya Patel",
                        "email": "maya@meetflow.com",
                    },
                    {
                        "name": "Daniel Kim",
                        "email": "daniel@meetflow.com",
                    },
                ],
                "transcript": [
                    {
                        "speaker": "Sarah Chen",
                        "text": "Thanks everyone for joining. Today we need to finalize our Q4 product strategy.",
                        "start": 0,
                        "end": 30,
                    },
                    {
                        "speaker": "Alex Morgan",
                        "text": "The biggest priority should be improving onboarding because our activation rate has dropped over the last quarter.",
                        "start": 30,
                        "end": 65,
                    },
                    {
                        "speaker": "Maya Patel",
                        "text": "I agree. The analytics show that users are getting stuck during workspace configuration.",
                        "start": 65,
                        "end": 95,
                    },
                    {
                        "speaker": "Daniel Kim",
                        "text": "We can simplify that flow and reduce the number of required fields.",
                        "start": 95,
                        "end": 125,
                    },
                    {
                        "speaker": "Sarah Chen",
                        "text": "Let's make onboarding improvement our first Q4 initiative.",
                        "start": 125,
                        "end": 155,
                    },
                    {
                        "speaker": "Alex Morgan",
                        "text": "The second area is the meeting intelligence dashboard.",
                        "start": 155,
                        "end": 180,
                    },
                    {
                        "speaker": "Maya Patel",
                        "text": "Users want better summaries and more useful action items after meetings.",
                        "start": 180,
                        "end": 215,
                    },
                    {
                        "speaker": "Daniel Kim",
                        "text": "We could improve the action item extraction and add confidence indicators.",
                        "start": 215,
                        "end": 250,
                    },
                    {
                        "speaker": "Sarah Chen",
                        "text": "That sounds good. We should also make the transcript easier to navigate.",
                        "start": 250,
                        "end": 280,
                    },
                    {
                        "speaker": "Alex Morgan",
                        "text": "I'll prepare a proposal for the onboarding redesign.",
                        "start": 280,
                        "end": 310,
                    },
                    {
                        "speaker": "Maya Patel",
                        "text": "I'll analyze the latest onboarding funnel data and identify the largest drop-off points.",
                        "start": 310,
                        "end": 345,
                    },
                    {
                        "speaker": "Daniel Kim",
                        "text": "I'll investigate the technical effort for the transcript improvements.",
                        "start": 345,
                        "end": 380,
                    },
                    {
                        "speaker": "Sarah Chen",
                        "text": "Let's review all three proposals in next week's planning meeting.",
                        "start": 380,
                        "end": 415,
                    },
                    {
                        "speaker": "Alex Morgan",
                        "text": "I'll have the design proposal ready by Friday.",
                        "start": 415,
                        "end": 440,
                    },
                    {
                        "speaker": "Sarah Chen",
                        "text": "Great. Thanks everyone. Let's move forward with those priorities.",
                        "start": 440,
                        "end": 465,
                    },
                ],
                "summary": (
                    "The team agreed to prioritize onboarding improvements during Q4. "
                    "The group identified workspace configuration as a major activation "
                    "drop-off point. They also discussed improving meeting summaries, "
                    "action-item extraction, and transcript navigation."
                ),
                "topics": [
                    {"title": "Q4 priorities", "start": 0},
                    {"title": "Onboarding improvements", "start": 30},
                    {"title": "Meeting intelligence", "start": 155},
                    {"title": "Transcript improvements", "start": 250},
                ],
                "action_items": [
                    {
                        "title": "Prepare onboarding redesign proposal",
                        "description": "Create a proposal for simplifying the workspace onboarding flow.",
                        "assignee": "Alex Morgan",
                        "due_date": datetime(2026, 10, 9),
                    },
                    {
                        "title": "Analyze onboarding funnel",
                        "description": "Identify the largest activation drop-off points.",
                        "assignee": "Maya Patel",
                        "due_date": datetime(2026, 10, 10),
                    },
                    {
                        "title": "Investigate transcript improvements",
                        "description": "Estimate the technical effort required for transcript navigation improvements.",
                        "assignee": "Daniel Kim",
                        "due_date": datetime(2026, 10, 12),
                    },
                    {
                        "title": "Review proposals",
                        "description": "Review all proposals during the next planning meeting.",
                        "assignee": "Sarah Chen",
                        "due_date": datetime(2026, 10, 14),
                    },
                ],
            },
            {
                "title": "Engineering Weekly Sync",
                "meeting_date": datetime(2026, 10, 6, 14, 0),
                "duration_seconds": 1440,
                "participants": [
                    {
                        "name": "James Wilson",
                        "email": "james@meetflow.com",
                    },
                    {
                        "name": "Priya Sharma",
                        "email": "priya@meetflow.com",
                    },
                    {
                        "name": "Robert Lee",
                        "email": "robert@meetflow.com",
                    },
                ],
                "transcript": [
                    {
                        "speaker": "James Wilson",
                        "text": "Let's start with the engineering updates from this week.",
                        "start": 0,
                        "end": 25,
                    },
                    {
                        "speaker": "Priya Sharma",
                        "text": "The authentication migration is almost complete.",
                        "start": 25,
                        "end": 50,
                    },
                    {
                        "speaker": "Robert Lee",
                        "text": "The new API endpoints have passed the integration tests.",
                        "start": 50,
                        "end": 80,
                    },
                    {
                        "speaker": "James Wilson",
                        "text": "Are there any blockers for the release?",
                        "start": 80,
                        "end": 100,
                    },
                    {
                        "speaker": "Priya Sharma",
                        "text": "We still have two edge cases around expired sessions.",
                        "start": 100,
                        "end": 130,
                    },
                    {
                        "speaker": "Robert Lee",
                        "text": "I can add automated tests for those cases.",
                        "start": 130,
                        "end": 160,
                    },
                    {
                        "speaker": "James Wilson",
                        "text": "Good. We should also monitor API latency after deployment.",
                        "start": 160,
                        "end": 195,
                    },
                    {
                        "speaker": "Priya Sharma",
                        "text": "I'll prepare the monitoring dashboard before release.",
                        "start": 195,
                        "end": 225,
                    },
                    {
                        "speaker": "Robert Lee",
                        "text": "The database migration is ready for staging.",
                        "start": 225,
                        "end": 255,
                    },
                    {
                        "speaker": "James Wilson",
                        "text": "Let's deploy to staging tomorrow morning.",
                        "start": 255,
                        "end": 285,
                    },
                    {
                        "speaker": "Priya Sharma",
                        "text": "I'll coordinate the deployment checklist.",
                        "start": 285,
                        "end": 315,
                    },
                    {
                        "speaker": "Robert Lee",
                        "text": "I'll verify the migration scripts on staging.",
                        "start": 315,
                        "end": 345,
                    },
                    {
                        "speaker": "James Wilson",
                        "text": "We'll review the results in Friday's sync.",
                        "start": 345,
                        "end": 375,
                    },
                ],
                "summary": (
                    "Engineering reviewed the authentication migration, API testing, "
                    "database migration, monitoring, and staging deployment plan. "
                    "Two expired-session edge cases remain before release."
                ),
                "topics": [
                    {"title": "Authentication migration", "start": 0},
                    {"title": "API testing", "start": 50},
                    {"title": "Monitoring", "start": 160},
                    {"title": "Staging deployment", "start": 255},
                ],
                "action_items": [
                    {
                        "title": "Add expired-session tests",
                        "description": "Create automated tests for expired authentication sessions.",
                        "assignee": "Robert Lee",
                        "due_date": datetime(2026, 10, 8),
                    },
                    {
                        "title": "Prepare monitoring dashboard",
                        "description": "Set up API latency monitoring before release.",
                        "assignee": "Priya Sharma",
                        "due_date": datetime(2026, 10, 9),
                    },
                    {
                        "title": "Verify migration scripts",
                        "description": "Run and verify database migration scripts on staging.",
                        "assignee": "Robert Lee",
                        "due_date": datetime(2026, 10, 8),
                    },
                ],
            },
            {
                "title": "Customer Feedback Review",
                "meeting_date": datetime(2026, 10, 3, 11, 30),
                "duration_seconds": 1620,
                "participants": [
                    {
                        "name": "Emily Davis",
                        "email": "emily@meetflow.com",
                    },
                    {
                        "name": "Michael Brown",
                        "email": "michael@meetflow.com",
                    },
                    {
                        "name": "Ananya Gupta",
                        "email": "ananya@meetflow.com",
                    },
                ],
                "transcript": [
                    {
                        "speaker": "Emily Davis",
                        "text": "Today we'll review the latest customer feedback.",
                        "start": 0,
                        "end": 25,
                    },
                    {
                        "speaker": "Michael Brown",
                        "text": "The strongest request is better search across meeting transcripts.",
                        "start": 25,
                        "end": 60,
                    },
                    {
                        "speaker": "Ananya Gupta",
                        "text": "Customers also want to filter meetings by participant and date.",
                        "start": 60,
                        "end": 90,
                    },
                    {
                        "speaker": "Emily Davis",
                        "text": "Those filters are already planned for the next release.",
                        "start": 90,
                        "end": 120,
                    },
                    {
                        "speaker": "Michael Brown",
                        "text": "Several customers mentioned that summaries are too generic.",
                        "start": 120,
                        "end": 155,
                    },
                    {
                        "speaker": "Ananya Gupta",
                        "text": "We should include more specific decisions and action items.",
                        "start": 155,
                        "end": 190,
                    },
                    {
                        "speaker": "Emily Davis",
                        "text": "Another request is exporting meeting notes.",
                        "start": 190,
                        "end": 220,
                    },
                    {
                        "speaker": "Michael Brown",
                        "text": "PDF and Markdown exports would cover most use cases.",
                        "start": 220,
                        "end": 250,
                    },
                    {
                        "speaker": "Ananya Gupta",
                        "text": "I'll collect examples of customer workflows for the export feature.",
                        "start": 250,
                        "end": 285,
                    },
                    {
                        "speaker": "Emily Davis",
                        "text": "Let's prioritize transcript search and better summaries first.",
                        "start": 285,
                        "end": 320,
                    },
                    {
                        "speaker": "Michael Brown",
                        "text": "I'll prepare requirements for the search experience.",
                        "start": 320,
                        "end": 350,
                    },
                    {
                        "speaker": "Ananya Gupta",
                        "text": "I'll draft improvements to the summary format.",
                        "start": 350,
                        "end": 380,
                    },
                ],
                "summary": (
                    "Customers requested stronger transcript search, participant and "
                    "date filters, more specific summaries, and meeting-note exports. "
                    "The team decided to prioritize search and summary improvements."
                ),
                "topics": [
                    {"title": "Customer feedback", "start": 0},
                    {"title": "Transcript search", "start": 25},
                    {"title": "Summary quality", "start": 120},
                    {"title": "Export functionality", "start": 190},
                ],
                "action_items": [
                    {
                        "title": "Document search requirements",
                        "description": "Prepare requirements for the transcript search experience.",
                        "assignee": "Michael Brown",
                        "due_date": datetime(2026, 10, 9),
                    },
                    {
                        "title": "Draft improved summary format",
                        "description": "Create a more detailed meeting summary structure.",
                        "assignee": "Ananya Gupta",
                        "due_date": datetime(2026, 10, 10),
                    },
                    {
                        "title": "Collect export workflows",
                        "description": "Gather examples of how customers use meeting exports.",
                        "assignee": "Ananya Gupta",
                        "due_date": datetime(2026, 10, 11),
                    },
                ],
            },
            {
                "title": "Design Review — Meeting Details",
                "meeting_date": datetime(2026, 9, 30, 15, 0),
                "duration_seconds": 1260,
                "participants": [
                    {
                        "name": "Olivia Martin",
                        "email": "olivia@meetflow.com",
                    },
                    {
                        "name": "Ethan Clark",
                        "email": "ethan@meetflow.com",
                    },
                    {
                        "name": "Sophia Taylor",
                        "email": "sophia@meetflow.com",
                    },
                    {
                        "name": "Noah Walker",
                        "email": "noah@meetflow.com",
                    },
                ],
                "transcript": [
                    {
                        "speaker": "Olivia Martin",
                        "text": "Let's review the latest meeting detail design.",
                        "start": 0,
                        "end": 25,
                    },
                    {
                        "speaker": "Ethan Clark",
                        "text": "The transcript panel feels much easier to scan now.",
                        "start": 25,
                        "end": 55,
                    },
                    {
                        "speaker": "Sophia Taylor",
                        "text": "I would increase the visual distinction between speakers.",
                        "start": 55,
                        "end": 85,
                    },
                    {
                        "speaker": "Noah Walker",
                        "text": "We should keep timestamps aligned with each transcript segment.",
                        "start": 85,
                        "end": 115,
                    },
                    {
                        "speaker": "Olivia Martin",
                        "text": "The summary panel should remain visible while scrolling.",
                        "start": 115,
                        "end": 145,
                    },
                    {
                        "speaker": "Ethan Clark",
                        "text": "I also recommend keeping action items close to the summary.",
                        "start": 145,
                        "end": 175,
                    },
                    {
                        "speaker": "Sophia Taylor",
                        "text": "Search results should highlight matching transcript text.",
                        "start": 175,
                        "end": 205,
                    },
                    {
                        "speaker": "Noah Walker",
                        "text": "Clicking a transcript segment should also update the media position.",
                        "start": 205,
                        "end": 240,
                    },
                    {
                        "speaker": "Olivia Martin",
                        "text": "That interaction will make long meetings much easier to navigate.",
                        "start": 240,
                        "end": 270,
                    },
                    {
                        "speaker": "Ethan Clark",
                        "text": "I'll update the interaction specification.",
                        "start": 270,
                        "end": 300,
                    },
                    {
                        "speaker": "Sophia Taylor",
                        "text": "I'll prepare the final visual adjustments.",
                        "start": 300,
                        "end": 330,
                    },
                    {
                        "speaker": "Noah Walker",
                        "text": "I'll review the responsive layout on smaller screens.",
                        "start": 330,
                        "end": 360,
                    },
                ],
                "summary": (
                    "The design review focused on transcript readability, speaker "
                    "distinction, timestamps, persistent summaries, action items, "
                    "search highlighting, and transcript-to-media interaction."
                ),
                "topics": [
                    {"title": "Transcript design", "start": 0},
                    {"title": "Summary panel", "start": 115},
                    {"title": "Search highlighting", "start": 175},
                    {"title": "Media interaction", "start": 205},
                ],
                "action_items": [
                    {
                        "title": "Update interaction specification",
                        "description": "Document transcript and media synchronization behavior.",
                        "assignee": "Ethan Clark",
                        "due_date": datetime(2026, 10, 3),
                    },
                    {
                        "title": "Prepare visual adjustments",
                        "description": "Apply the final visual improvements to the meeting detail screen.",
                        "assignee": "Sophia Taylor",
                        "due_date": datetime(2026, 10, 4),
                    },
                    {
                        "title": "Review responsive layout",
                        "description": "Test the meeting detail page on smaller screens.",
                        "assignee": "Noah Walker",
                        "due_date": datetime(2026, 10, 4),
                    },
                ],
            },
            {
                "title": "Sprint Retrospective",
                "meeting_date": datetime(2026, 9, 27, 16, 0),
                "duration_seconds": 1380,
                "participants": [
                    {
                        "name": "Lucas Anderson",
                        "email": "lucas@meetflow.com",
                    },
                    {
                        "name": "Grace Thomas",
                        "email": "grace@meetflow.com",
                    },
                    {
                        "name": "Henry White",
                        "email": "henry@meetflow.com",
                    },
                ],
                "transcript": [
                    {
                        "speaker": "Lucas Anderson",
                        "text": "Let's review what went well during this sprint.",
                        "start": 0,
                        "end": 25,
                    },
                    {
                        "speaker": "Grace Thomas",
                        "text": "The new API testing process reduced regressions significantly.",
                        "start": 25,
                        "end": 55,
                    },
                    {
                        "speaker": "Henry White",
                        "text": "The design handoff process also became much clearer.",
                        "start": 55,
                        "end": 85,
                    },
                    {
                        "speaker": "Lucas Anderson",
                        "text": "What should we improve for the next sprint?",
                        "start": 85,
                        "end": 105,
                    },
                    {
                        "speaker": "Grace Thomas",
                        "text": "We should estimate frontend tasks more carefully.",
                        "start": 105,
                        "end": 135,
                    },
                    {
                        "speaker": "Henry White",
                        "text": "Some dependencies were identified too late in the sprint.",
                        "start": 135,
                        "end": 165,
                    },
                    {
                        "speaker": "Lucas Anderson",
                        "text": "Let's add dependency review to sprint planning.",
                        "start": 165,
                        "end": 195,
                    },
                    {
                        "speaker": "Grace Thomas",
                        "text": "I'd also like a shorter daily status meeting.",
                        "start": 195,
                        "end": 225,
                    },
                    {
                        "speaker": "Henry White",
                        "text": "We can experiment with a fifteen-minute limit.",
                        "start": 225,
                        "end": 250,
                    },
                    {
                        "speaker": "Lucas Anderson",
                        "text": "That sounds reasonable for the next sprint.",
                        "start": 250,
                        "end": 275,
                    },
                    {
                        "speaker": "Grace Thomas",
                        "text": "I'll update the sprint planning checklist.",
                        "start": 275,
                        "end": 305,
                    },
                    {
                        "speaker": "Henry White",
                        "text": "I'll document the dependency review process.",
                        "start": 305,
                        "end": 335,
                    },
                    {
                        "speaker": "Lucas Anderson",
                        "text": "Great. We'll review these changes at the next retrospective.",
                        "start": 335,
                        "end": 365,
                    },
                ],
                "summary": (
                    "The team reviewed the previous sprint and agreed that API testing "
                    "and design handoffs improved. Improvements were identified around "
                    "frontend estimation, dependency tracking, and meeting duration."
                ),
                "topics": [
                    {"title": "Sprint wins", "start": 0},
                    {"title": "Estimation", "start": 105},
                    {"title": "Dependencies", "start": 135},
                    {"title": "Meeting efficiency", "start": 195},
                ],
                "action_items": [
                    {
                        "title": "Update sprint planning checklist",
                        "description": "Add dependency review and improved estimation steps.",
                        "assignee": "Grace Thomas",
                        "due_date": datetime(2026, 10, 1),
                    },
                    {
                        "title": "Document dependency review",
                        "description": "Document the dependency review process for future sprints.",
                        "assignee": "Henry White",
                        "due_date": datetime(2026, 10, 2),
                    },
                    {
                        "title": "Test shorter daily meetings",
                        "description": "Experiment with a fifteen-minute daily status meeting.",
                        "assignee": "Lucas Anderson",
                        "due_date": datetime(2026, 10, 5),
                    },
                ],
            },
        ]

        for meeting_data in meetings:
            create_meeting(
                db=db,
                title=meeting_data["title"],
                meeting_date=meeting_data["meeting_date"],
                duration_seconds=meeting_data["duration_seconds"],
                participants=meeting_data["participants"],
                transcript=meeting_data["transcript"],
                summary=meeting_data["summary"],
                topics=meeting_data["topics"],
                action_items=meeting_data["action_items"],
            )

        db.commit()

        print("Database seeded successfully.")
        print(f"Created {len(meetings)} meetings.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()