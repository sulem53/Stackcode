# CareerPilot — AI Career Search & Application Agent

Built for HackTheStack August 2026 by StackCode Training Institute.

## What it does
CareerPilot helps job seekers understand how well their resume fits available roles. Upload a resume, get an AI-extracted structured profile, see it matched and scored against a job dataset with explainable reasoning, track applications through a hiring pipeline, and generate a tailored cover letter for any job.

## Team
- Sulem — Backend & AI (Node/Express, Groq integration, prompt engineering)
- Aneeq — Frontend (React, UI/UX, state management)

## Tech Stack
**Frontend:** React + Vite, Tailwind CSS, Zustand
**Backend:** Node.js + Express
**AI:** Groq API — model: `llama-3.3-70b-versatile`
**Resume parsing:** pdf-parse (PDF), mammoth (DOCX)
**Data storage:** In-memory (no database) — sufficient for hackathon demo scope

## AI Services Disclosed
This project uses the **Groq API** (llama-3.3-70b-versatile) for three core AI functions:
1. Resume text → structured profile extraction (name, skills, experience, education)
2. Semantic job matching with explainable scoring (0-100, matching skills, missing skills, rationale)
3. Tailored cover letter generation per job

No other third-party AI models or services are used. Team members are responsible for the accuracy and appropriateness of all AI-generated output, per event rules.

## Setup

### Backend
```bash
cd careerpilot-backend
npm install
```

Run:
```bash
npm run dev
```

Server runs on `http://localhost:3001`

### Frontend
```bash
cd careerpilot-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (Vite default)

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/jobs` | Returns full job dataset (15 sample postings) |
| POST | `/upload-resume` | Accepts PDF/DOCX, returns structured profile |
| POST | `/match-jobs` | Accepts profile, returns all jobs ranked with scores |
| POST | `/generate-cover-letter` | Accepts profile + jobId, returns cover letter text |
| POST | `/applications` | Creates a tracked application |
| GET | `/applications` | Lists all tracked applications |
| PATCH | `/applications/:id` | Updates application stage (accepts jobId or UUID) |
| DELETE | `/applications/:id` | Removes an application |

## Known Limitations
- Data storage is in-memory only — restarting the server clears all applications and any uploaded profile data. Job dataset persists (loaded from a static JSON file).
- Job dataset is a curated sample of 15 postings across Frontend, Backend, Data Analytics, and Marketing domains — not a live job board integration (per event guardrails, live LinkedIn/Indeed integration was intentionally out of scope).
- Resume parsing works reliably on standard text-based PDF/DOCX resumes; heavily formatted or scanned/image-based resumes may extract imperfectly.
- No authentication or multi-user support — built as a single-session demo application.

## Team Contributions
- **Sulem:** Backend architecture, all Groq prompt design and integration, resume parsing pipeline, job matching logic, cover letter generation, applications API
- **Aneeq:** Frontend architecture, UI/UX design, state management, all user-facing components and demo flow

## Demo Flow
1. Upload a resume → view AI-extracted structured profile
2. View ranked job matches with explainable scores (matching skills + gaps)
3. Move an application through tracker stages (Interested → Applied → Interview → Selected/Rejected)
4. Generate a tailored cover letter for a selected job

Create a `.env` file in `careerpilot-backend/`:
