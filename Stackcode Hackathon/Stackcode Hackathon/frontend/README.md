# AI Resume-to-Job Matcher — Frontend

A hackathon-ready React + Vite frontend that lets users upload their resume, review AI-ranked job matches, track applications, and generate cover letters. All AI calls are currently mocked in `src/api/` and can be swapped for real backend calls by editing a single file.

---

## Getting Started

```bash
npm install
npm run dev
```

Opens at **http://localhost:5173** (or 5174 if 5173 is busy).

---

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Upload | Drag-and-drop resume upload → simulated parse → editable profile form |
| `/results` | Job Results | AI-ranked job cards with match score, skill tags, Apply & Cover Letter actions |
| `/tracker` | Application Tracker | List of applied jobs with stage dropdown (Interested → Rejected) |

---

## Zustand Store (`src/store/useAppStore.js`)

```js
{
  profile: null,          // Parsed resume profile (set after upload)
  jobMatches: [],         // Array of JobMatch objects, sorted by score desc
  applications: [],       // Tracker items { jobId, title, company, stage }
  coverLetters: {}        // Map of jobId → generated cover letter string
}
```

### Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `setProfile` | `(profile) => void` | Save parsed resume profile |
| `setJobMatches` | `(matches[]) => void` | Save ranked job match array |
| `applyToJob` | `(job) => void` | Add job to tracker with stage "Applied" (idempotent) |
| `updateApplicationStage` | `(jobId, stage) => void` | Update stage for an existing application |
| `setCoverLetter` | `(jobId, text) => void` | Cache a generated cover letter |

---

## API Layer (`src/api/resumeApi.js`)

All three functions return `Promise`s. Currently they resolve with mock data after a short delay, simulating network latency. **To connect to Dev A's Node/Express + Groq backend, replace the body of each function** with the corresponding `fetch()` call — the function signatures stay identical.

### `uploadResume(file: File): Promise<Profile>`

```js
// REAL BACKEND:
const formData = new FormData();
formData.append('resume', file);
const res = await fetch('/api/upload', { method: 'POST', body: formData });
return res.json();
```

**Dev A endpoint:** `POST /api/upload`  
**Returns:** Profile JSON

---

### `fetchJobMatches(profile: Profile): Promise<JobMatch[]>`

```js
// REAL BACKEND:
const res = await fetch('/api/job-matches', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ profile }),
});
const data = await res.json();
return data.jobMatches;
```

**Dev A endpoint:** `POST /api/job-matches`  
**Returns:** `{ jobMatches: JobMatch[] }` — array sorted by score descending

---

### `generateCoverLetter(jobId: string, profile: Profile): Promise<string>`

```js
// REAL BACKEND:
const res = await fetch('/api/cover-letter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jobId, profile }),
});
const data = await res.json();
return data.letter;
```

**Dev A endpoint:** `POST /api/cover-letter`  
**Returns:** `{ letter: string }` — the generated cover letter text

---

## JSON Schemas

### Profile
```json
{
  "name": "string",
  "email": "string",
  "skills": ["React", "Node.js"],
  "experience": [{ "role": "string", "company": "string", "years": 2 }],
  "education": [{ "degree": "string", "institution": "string", "year": "2023" }],
  "totalYearsExperience": 2
}
```

### Job Match
```json
{
  "jobId": "string",
  "title": "string",
  "company": "string",
  "score": 85,
  "rationale": "string",
  "matchingSkills": ["React"],
  "missingSkills": ["AWS"]
}
```

### Application (Tracker item)
```json
{
  "jobId": "string",
  "title": "string",
  "company": "string",
  "stage": "Applied"
}
```

**Valid stages:** `Interested` | `Applied` | `Interview` | `Selected` | `Rejected`

---

## File Structure

```
src/
├── api/
│   └── resumeApi.js          ← All API calls (mock now, swap for real later)
├── components/
│   ├── CoverLetterModal.jsx  ← Cover letter generation modal
│   ├── JobCard.jsx           ← Job match card with Apply + Cover Letter
│   ├── LoadingSpinner.jsx    ← Reusable spinner
│   ├── Navbar.jsx            ← Top navigation with active states
│   ├── ScoreBadge.jsx        ← Colored ring score badge
│   └── SkillTag.jsx          ← Matching/missing skill pill tags
├── pages/
│   ├── UploadPage.jsx        ← Route: /
│   ├── ResultsPage.jsx       ← Route: /results
│   └── TrackerPage.jsx       ← Route: /tracker
├── store/
│   └── useAppStore.js        ← Zustand store
├── App.jsx                   ← Router setup
├── index.css                 ← Tailwind v4 + global styles
└── main.jsx                  ← Entry point with BrowserRouter
```

---

## Tech Stack

- **React 19** + **Vite 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **Zustand** for state management
- **React Router v6** for client-side routing
- **Inter** font (Google Fonts)

---

## Handoff Notes for Dev A

1. Set up a proxy in `vite.config.js` for `/api` → `http://localhost:3000` (or wherever Express runs)
2. Replace mock function bodies in `src/api/resumeApi.js` — signatures don't change
3. The frontend expects CORS headers on the backend during dev
4. Cover letter text comes back as a plain string in `data.letter`, not an object
