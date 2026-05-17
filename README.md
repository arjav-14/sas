# NoteFlow — AI Collaborative Notes Workspace

Full-stack notes app built with **Next.js (App Router)**, **JavaScript**, **Tailwind CSS**, **MongoDB + Mongoose**, **JWT auth**, and **Google Gemini AI**.

This project is a submission for the **Peblo Full Stack Developer Challenge**. All required features have been implemented according to the challenge specifications.

## Challenge Requirements - Implementation Status

### ✅ 1. Authentication
**Requirement**: User signup and login, Protected routes and pages, Persistent authentication sessions, Secure password handling

**Implementation**:
- **User Signup**: `POST /api/auth/signup` - Creates user with bcrypt password hashing
- **User Login**: `POST /api/auth/login` - Validates credentials and issues JWT token
- **Protected Routes**: `middleware.js` protects `/dashboard` and all sub-routes
- **Persistent Sessions**: JWT stored in httpOnly cookies with 7-day expiration
- **Secure Password Handling**: bcryptjs with salt factor 12 for password hashing
- **Session Management**: `lib/auth.js` handles token verification and user session retrieval

**Files**: `app/api/auth/signup/route.js`, `app/api/auth/login/route.js`, `middleware.js`, `lib/auth.js`, `lib/jwt.js`

---

### ✅ 2. Notes Management
**Requirement**: Create and manage notes, Organise notes using tags or categories

**Implementation**:
- **Create Notes**: `POST /api/notes` - Creates new note with title, content, tags, category
- **Read Notes**: `GET /api/notes` - Fetches user's notes with search/filter support
- **Update Notes**: `PATCH /api/notes/[id]` - Updates note fields (title, content, tags, category, archived, isPublic)
- **Delete Notes**: `DELETE /api/notes/[id]` - Permanently deletes note
- **Auto-save**: Client-side debounced auto-save (1200ms) in `NoteEditor.js`
- **Tags**: Array of string tags, searchable and filterable
- **Categories**: Single category field per note
- **Archive**: Boolean flag to archive/unarchive notes
- **Sorting**: Notes sorted by `updatedAt` in descending order (most recent first)

**Data Model**:
```javascript
{
  userId: ObjectId,
  title: String,
  content: String,
  tags: [String],
  category: String,
  archived: Boolean,
  isPublic: Boolean,
  shareId: String,
  aiSummary: String,
  aiActionItems: [String],
  aiSuggestedTitle: String
}
```

**Files**: `app/api/notes/route.js`, `app/api/notes/[id]/route.js`, `models/Note.js`, `components/NoteEditor.js`

---

### ✅ 3. AI Summaries
**Requirement**: Generate AI summaries from note content

**Implementation**:
- **AI Analysis**: `POST /api/notes/[id]/ai` - Triggers Gemini AI analysis
- **Summary Generation**: AI generates 2-3 sentence summary of note content
- **Action Items Extraction**: AI extracts actionable items from note
- **Title Suggestions**: AI suggests improved title based on content
- **Response Format**:
```javascript
{
  "summary": "2-3 sentence summary",
  "action_items": ["item 1", "item 2"],
  "suggested_title": "short descriptive title"
}
```
- **Usage Tracking**: Increments `aiUsageCount` on user model per analysis
- **Model Fallback**: Supports multiple Gemini models with automatic fallback (gemini-2.5-flash, gemini-2.0-flash-lite, gemini-1.5-flash)
- **Error Handling**: Graceful handling of quota errors and model unavailability

**Files**: `app/api/notes/[id]/ai/route.js`, `lib/gemini.js`

---

### ✅ 4. Search and Filtering
**Requirement**: Supports note search and filtering

**Implementation**:
- **Keyword Search**: Regex-based search across title, content, tags, and category fields
- **Tag Filtering**: Filter notes by specific tag
- **Archive View**: Toggle to show/hide archived notes
- **Real-time Search**: Debounced search (300ms) for responsive UI
- **Combined Filters**: Search and tag filters can be used together
- **API Parameters**: `?search=keyword&tag=tagname&archived=true&sort=updated`

**Files**: `app/api/notes/route.js`, `components/SearchFilter.js`, `components/DashboardClient.js`

---

### ✅ 5. Public Sharing
**Requirement**: Enables public sharing of notes

**Implementation**:
- **Share Link Generation**: `PATCH /api/notes/[id]/share` - Generates unique UUID share link
- **Public/Private Toggle**: Users can toggle note visibility (isPublic flag)
- **Public Access**: `GET /api/shared/[shareId]` - Access shared notes without authentication
- **Share URL Format**: `/shared/[shareId]` - Clean, user-friendly URLs
- **Share Link Regeneration**: Option to regenerate share link for security
- **Author Attribution**: Public pages display author name (not email)
- **AI Data Included**: Shared notes include AI summary and action items

**Files**: `app/api/notes/[id]/share/route.js`, `app/api/shared/[shareId]/route.js`, `app/shared/[shareId]/page.js`

---

### ✅ 6. Productivity Insights
**Requirement**: Displays simple productivity insights

**Implementation**:
- **Total Notes Count**: Shows total active notes
- **AI Usage Count**: Tracks number of AI analyses performed
- **Archived Count**: Shows number of archived notes
- **Top Tags**: Displays most-used tags with usage counts (top 8)
- **Recent Notes**: Shows 5 most recently edited notes
- **Weekly Activity Chart**: Bar chart showing note updates over last 7 days (Recharts)
- **Dashboard Cards**: Clean card-based UI for quick stats overview

**API Response**:
```javascript
{
  totalNotes: Number,
  archivedCount: Number,
  aiUsageCount: Number,
  recentNotes: Array,
  topTags: [{ tag: String, count: Number }],
  weeklyActivity: [{ date: String, label: String, count: Number }]
}
```

**Files**: `app/api/dashboard/stats/route.js`, `components/DashboardStats.js`

---

## Tech Stack

- **Frontend**: Next.js 16.2.6 (App Router), React 19.2.4, Tailwind CSS 4
- **Backend**: Next.js API Routes, Mongoose 9.6.2
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT (jsonwebtoken 9.0.3, jose 6.2.3), bcryptjs 3.0.3
- **AI**: Google Generative AI (@google/generative-ai 0.24.1)
- **Charts**: Recharts 3.8.1
- **Utilities**: UUID (uuid 14.0.0)

**Language**: JavaScript (no TypeScript)

---

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file with the following variables:

```bash
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
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

---

## Project Structure

```
app/
  api/
    auth/
      signup/route.js      # User registration
      login/route.js       # User login
      logout/route.js      # User logout
      me/route.js          # Get current user
    notes/
      route.js             # List/create notes
      [id]/
        route.js           # Get/update/delete note
        ai/route.js        # AI analysis
        share/route.js     # Share link management
    dashboard/
      stats/route.js       # Dashboard statistics
    shared/
      [shareId]/route.js   # Public note access
  dashboard/
    layout.js              # Dashboard layout with sidebar
    page.js                # Dashboard home
    notes/
      [id]/page.js         # Note editor
  login/page.js           # Login page
  signup/page.js          # Signup page
  shared/[shareId]/page.js # Public note view
  page.js                 # Landing page
  layout.js               # Root layout
components/
  AuthForm.js             # Reusable auth form
  DashboardClient.js      # Dashboard client component
  DashboardStats.js       # Stats cards and charts
  NoteCard.js             # Note preview card
  NoteEditor.js           # Note editor with AI
  SearchFilter.js         # Search and filter UI
  Sidebar.js              # Navigation sidebar
  ui/
    Button.js              # Button component
    Input.js               # Input component
lib/
  auth.js                 # Auth utilities
  auth-constants.js       # Auth constants
  gemini.js               # Gemini AI integration
  jwt.js                  # JWT utilities
  mongodb.js              # MongoDB connection
models/
  User.js                 # User model
  Note.js                 # Note model
middleware.js             # Route protection
```

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Notes
- `GET /api/notes` - List notes (supports search, tag, archived filters)
- `POST /api/notes` - Create new note
- `GET /api/notes/[id]` - Get single note
- `PATCH /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note
- `POST /api/notes/[id]/ai` - Generate AI analysis
- `PATCH /api/notes/[id]/share` - Manage share link

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Public Sharing
- `GET /api/shared/[shareId]` - Get public note (no auth required)

---

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — run production server
- `npm run lint` — run ESLint

---

## Security Features

- **Password Hashing**: bcrypt with salt factor 12
- **JWT Authentication**: Secure token-based auth with httpOnly cookies
- **Route Protection**: Middleware protects authenticated routes
- **Input Validation**: Server-side validation on all API endpoints
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Prevention**: React's built-in escaping
- **CSRF Protection**: SameSite cookie policy

---

## Deployment Notes

- Ensure environment variables are set in production
- MongoDB URI should use connection pooling
- JWT_SECRET should be a strong, random string
- GEMINI_API_KEY should be kept secure
- For production, set `NODE_ENV=production` for secure cookies

---



## Demo Video

A demo video showcasing all features can be provided upon request. The video demonstrates:
1. User signup and login flow
2. Creating and editing notes with auto-save
3. AI analysis (summary, action items, title suggestions)
4. Search and filtering functionality
5. Public sharing of notes
6. Dashboard productivity insights
video drive link:
https://drive.google.com/file/d/1R0Lsf5t85oO2SFH7USDo6aFEwwOScLSV/view?usp=sharing



deployed link:
https://sas-pi-ten.vercel.app 

github repository link:
https://github.com/arjav-14/sas