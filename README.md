# MeetFlow — Meeting Intelligence Workspace

MeetFlow is a full-stack meeting workspace inspired by modern meeting intelligence platforms such as Fireflies.ai.

The application allows users to browse meetings, view transcripts, search transcripts, review summaries and action items, create new meetings, edit meeting information, and delete meetings.

The application uses a Next.js frontend, FastAPI backend, and SQLite database.

---

## Features

### Meeting Library

- View all meetings
- Search meetings by title
- Filter meetings by participant
- Filter meetings by date
- Sort meetings by newest or oldest
- View meeting duration
- View meeting participants
- Responsive meeting cards

### Meeting Details

- Meeting title and metadata
- Participant information
- Interactive transcript
- Speaker names
- Transcript timestamps
- Transcript search
- Highlighted transcript matches
- Media-player placeholder
- Transcript-to-player interaction
- Player-to-transcript interaction
- Meeting summary
- Key topics
- Meeting outline
- Action items

### Meeting CRUD

Users can:

- Create meetings
- Add participants
- Add/paste transcripts
- Edit meeting title
- Edit meeting date
- Edit meeting duration
- Edit participants
- Delete meetings

All core meeting data is persisted in SQLite.

### Action Items

Users can:

- Create action items
- Assign action items
- Mark action items as completed
- Update action items
- Delete action items

---

## Technology Stack

### Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- SWR
- Lucide React
- Sonner

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

### Database

- SQLite

### Development Tools

- Cursor
- Git
- GitHub

---

## Project Structure

```text
meet-flow-application-development/
│
├── app/
│   └── (app)/
│       ├── page.tsx
│       └── meetings/
│
├── components/
│   ├── meetings/
│   │   ├── meeting-card.tsx
│   │   ├── meeting-form-dialog.tsx
│   │   ├── meeting-library.tsx
│   │   ├── participants-input.tsx
│   │   ├── participant-avatars.tsx
│   │   └── delete-meeting-dialog.tsx
│   │
│   ├── layout/
│   └── ui/
│
├── lib/
│   ├── api.ts
│   ├── format.ts
│   ├── transcript.ts
│   └── hooks/
│       ├── use-meetings.ts
│       └── use-action-items.ts
│
├── types/
│   └── meeting.ts
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── meeting.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── meeting.py
│   │   │   ├── action_item.py
│   │   │   └── transcript.py
│   │   │
│   │   ├── routers/
│   │   │   ├── meetings.py
│   │   │   ├── action_items.py
│   │   │   └── transcript.py
│   │   │
│   │   ├── services/
│   │   ├── database.py
│   │   ├── main.py
│   │   └── seed.py
│   │
│   ├── requirements.txt
│   └── meetflow.db
│
├── package.json
├── pnpm-lock.yaml
└── README.md
