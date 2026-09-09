# Weekly Report Generator

Full-stack web application for team members to submit structured weekly reports, for managers to review and approve them, and for admins to manage users and projects.

Built for the Sisenco Digital Full-Stack Developer assessment.

---

## Project Walkthrough & Video Demonstration

Watch the full walkthrough covering system architecture, database design, authentication and RBAC, the report review workflow, and a live demo of the application across Member, Manager, and Admin roles:

[![Watch Project Walkthrough](https://img.youtube.com/vi/-M8UNINu68I/maxresdefault.jpg)](https://youtu.be/-M8UNINu68I)

**Direct Link:** [Watch the Full Project Demonstration on YouTube](https://youtu.be/-M8UNINu68I)

---

## Tech Stack

- **Backend:** NestJS 10, TypeORM, MariaDB, Passport JWT, bcrypt
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, Recharts
- **Testing:** Jest + supertest

## Prerequisites

- Node.js 22+ (LTS)
- npm 10+
- MariaDB / MySQL running locally (default: XAMPP on port 3306)

## 1. Clone the Repository

```bash
git clone https://github.com/DulyaDeCosta/Weekly-Report-Generator.git
cd Weekly-Report-Generator
```

## 2. Setup the Database

Start MariaDB (via XAMPP or your preferred setup) and create a database:

```sql
CREATE DATABASE weekly_report_db;
```

## 3. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=weekly_report_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
PORT=3000
```

Run migrations:

```bash
npm run migration:run
```

Seed the database with users and projects:

```bash
npm run seed:fresh
```

This creates 6 users (1 admin, 2 managers, 3 members) and 5 projects.

Start the backend:

```bash
npm run start:dev
```

Backend runs at `http://localhost:3000` with API prefix `/api`.

## 4. Setup the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## 5. Access the Application

Open `http://localhost:5173` in your browser and log in with any of the seeded credentials above.

## Testing

Run the automated RBAC end-to-end tests:

```bash
cd backend
npm run test:e2e
```

## Project Structure
```text
Weekly-Report-Generator/
├── backend/ # NestJS API
│ ├── src/
│ │ ├── auth/ # Auth module (JWT, guards, decorators)
│ │ ├── users/ # User management
│ │ ├── reports/ # Reports lifecycle + review workflow
│ │ ├── projects/ # Projects CRUD
│ │ ├── dashboard/ # Manager dashboard stats
│ │ ├── entities/ # TypeORM entities
│ │ ├── migrations/ # Database migrations
│ │ └── database/seeds/ # Seed scripts
│ └── test/ # E2E RBAC tests
└── frontend/ # React SPA
├── src/
│ ├── pages/ # Feature-based pages
│ ├── layouts/ # AuthLayout, AppLayout
│ ├── context/ # AuthContext
│ ├── lib/api/ # Axios + typed API clients
│ ├── lib/schemas/ # Zod validation schemas
│ ├── routes/ # ProtectedRoute
│ └── components/ui/ # shadcn components
```

## Key Features

- **Role-based access:** Member, Manager, Admin with layered defense (guards + service-level ownership checks)
- **Report review workflow:** Draft → Submitted → Approved / Needs Correction cycle with comment history
- **Backfill support:** Members can create reports for past weeks (not future)
- **Manager dashboard:** 6 metrics + 3 charts + period/project filters
- **Team member profile:** Managers can drill into any member's report history
- **User self-service:** Every user can edit their name/email and change password

## Design Decisions

See the presentation for detailed rationale on:
- One report per member per week (with wipe-and-replace child arrays)
- Deferred content versioning (used ReviewAction audit trail instead)
- Soft delete for users and projects
- Modal-based CRUD over inline editing
- Manager review page merged with Report Detail

## Future Improvements

- Report content version snapshots (currently only review comment history)
- AI Chat Assistant for team activity Q&A
- Deployment to a public URL
- Password reset flow
- Email notifications for review actions
- Advanced dashboard: task completion trend, activity feed, side-by-side blockers view
- Multi-project weeks (project at task level instead of report level)
