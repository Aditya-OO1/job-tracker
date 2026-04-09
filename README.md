# Launchpad — AI-Powered Job Application Tracker

A full-stack Kanban board for tracking job applications. Paste a job description and AI automatically extracts the company, role, required skills, seniority, and location — then generates tailored resume bullet points for that specific role.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt |
| AI | OpenAI GPT-4o-mini (JSON mode) |
| State | Zustand (auth) + React Query (server state) |
| Drag & Drop | @dnd-kit/core |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI
- An OpenAI API key

---

### 1. Clone & install

```bash
git clone https://github.com/Aditya-OO1/job-tracker.git
cd job-tracker

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

---

### 2. Configure environment variables

**Backend** — copy and fill in:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=a_long_random_string_at_least_32_chars
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...
CLIENT_URL=http://localhost:5173
```

**Frontend** — no changes needed by default (Vite proxies `/api` to the backend).

---

### 3. Run the app

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Express server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for signing JWTs | Yes |
| `JWT_EXPIRES_IN` | JWT token TTL (e.g. `7d`) | No (default: 7d) |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `CLIENT_URL` | Frontend origin for CORS | No (default: localhost:5173) |

---

## Features

### Kanban Board
Five columns: **Applied → Phone Screen → Interview → Offer → Rejected**. Cards are drag-and-drop between columns using `@dnd-kit`. Status updates persist to MongoDB immediately on drop.

### AI Job Description Parser
Paste any job description and click **Parse with AI**. The backend calls OpenAI GPT-4o-mini with `response_format: { type: 'json_object' }` (JSON mode) to extract:
- Company name
- Job title / role
- Required skills
- Nice-to-have skills
- Seniority level
- Location

A second AI call then generates **3–5 resume bullet points** tailored to that specific role and skill set — not generic templates.

### Application Management
Full CRUD: create, view, edit, delete. Fields include company, role, JD link, notes, date applied, status, salary range, skills, and AI-generated bullets. Each suggestion has a one-click copy button.

### Search
Real-time search across company name, role, location, and skills — all client-side, no extra API calls.

### Auth
JWT-based auth with bcrypt password hashing. Token stored in `localStorage` via Zustand `persist` middleware. Protected routes on both frontend and backend. Auto-redirect to `/login` on 401.

---

## Architecture Decisions

**AI in a service layer** — `backend/src/services/aiService.ts` handles all OpenAI calls. Route handlers call the service, never OpenAI directly. This keeps routes thin, makes the AI logic testable, and means swapping models requires changing one file.

**Two AI calls per parse** — One structured extraction call (low temperature, 0.1) for reliable JSON output, and a separate creative call (temperature 0.7) for resume suggestions. Separating them gives better results than cramming both into one prompt.

**JSON mode enforced** — `response_format: { type: 'json_object' }` is set on every OpenAI call. The system prompt instructs the model to return only raw JSON with no markdown fences. This eliminates the need to strip backticks and reduces parse errors.

**@dnd-kit over react-beautiful-dnd** — react-beautiful-dnd is unmaintained and has known issues with React 18 Strict Mode. @dnd-kit is actively maintained, accessible by default, and tree-shakeable.

**Zustand for auth, React Query for server state** — Auth state is UI-global and rarely changes — Zustand with `persist` is ideal. Application data is server state with caching, background refetch, and mutation needs — React Query handles this much better than a hand-rolled store.

**Vite proxy** — The frontend proxies `/api/*` to the backend in development, so no CORS issues locally and the `VITE_API_URL` env var is only needed in production deployments.

---

## Project Structure

```
job-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers (thin)
│   │   ├── middleware/      # JWT auth middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # AI logic (aiService.ts)
│   │   ├── types/           # Shared TypeScript types
│   │   └── index.ts         # Express app + DB connection
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── board/       # KanbanBoard, KanbanColumn, Modals
    │   │   ├── cards/       # ApplicationCard
    │   │   └── ui/          # Navbar, StatusBadge, SkillTag
    │   ├── hooks/           # React Query hooks
    │   ├── pages/           # LoginPage, RegisterPage, BoardPage
    │   ├── services/        # Axios API client
    │   ├── store/           # Zustand auth store
    │   ├── types/           # Shared TypeScript types
    │   └── main.tsx
    ├── .env.example
    └── package.json
```

---

## Deployment (optional)

### Backend (Railway / Render)
Set all env vars from `.env.example` in the platform dashboard. Build command: `npm run build`. Start command: `npm start`.

### Frontend (Vercel / Netlify)
Set `VITE_API_URL` to your deployed backend URL. Build command: `npm run build`. Output directory: `dist`.

Update `backend/.env` `CLIENT_URL` to your deployed frontend URL.

---

## License

MIT
