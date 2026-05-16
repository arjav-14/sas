# NoteFlow — AI Collaborative Notes Workspace

Full-stack notes app built with **Next.js (App Router)**, **JavaScript**, **Tailwind CSS**, **MongoDB + Mongoose**, **JWT auth**, and **Google Gemini AI**.

## Features

- **Auth**: Signup/login, bcrypt passwords, JWT in httpOnly cookies, protected `/dashboard` routes
- **Notes**: CRUD, auto-save, tags, categories, archive, sort by recently updated
- **AI (Gemini)**: Summary, action items, suggested title per note
- **Search**: Keyword search, filter by tag, archived view
- **Sharing**: Public share links at `/shared/[shareId]`
- **Dashboard**: Stats cards, top tags, recent notes, weekly activity chart (Recharts)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables and fill in your values in `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `GEMINI_API_KEY` | Google AI Studio / Gemini API key |
| `NEXT_PUBLIC_APP_URL` | App URL for share links (e.g. `http://localhost:3000`) |

3. Run the dev server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project structure

```
app/
  api/          # REST API routes
  dashboard/    # Protected workspace
  login/ signup/
  shared/       # Public share pages
components/
lib/            # mongodb, auth, gemini
models/         # User, Note
middleware.js   # Route protection
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — run production server
