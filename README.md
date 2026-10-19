# Task Manager — Full Stack (Practicals 5 and 6)

[![CI Pipeline](https://github.com/DhrutiM39/momentum-task-manager/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/DhrutiM39/momentum-task-manager/actions/workflows/ci.yml)

A React task board connected to an Express, Mongoose, and MongoDB CRUD API.

```
task-manager-app/
├── backend/                 Node.js + Express REST API
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── models/
│   │   ├── Task.js               User-owned task schema
│   │   └── User.js               Email and bcrypt password hash
│   ├── middleware/
│   │   ├── logger.js              logs METHOD URL - timestamp
│   │   ├── validateContentType.js rejects POST/PUT w/o application/json
│   │   ├── validateTaskId.js      validates MongoDB ObjectIds
│   │   ├── authenticateToken.js   verifies JWT Bearer tokens
│   │   └── validateTaskInput.js   validates task request bodies
│   │   └── errorHandler.js        global error handler (last middleware)
│   ├── routes/
│   │   └── taskRoutes.js
│   ├── server.js            App entry point
│   └── package.json
│
└── frontend/                 React app (Vite)
    ├── src/
    │   ├── api/taskApi.js         Axios calls to the backend
    │   ├── components/            Header, ActivityLog, Board, Column, TaskCard, NewTaskForm
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Architecture

```
Browser (React, http://localhost:5173)
        │  Axios (fetch/create/update/delete)
        ▼
Express API (http://localhost:5000)
        │
[CORS] → [JSON body parser] → [Logging] → [Content-Type Validator]
        │
Router  /api/auth
        ├── POST   /register          → validateAuthInput → hash password → save user
        ├── POST   /login             → validateAuthInput → verify hash → sign JWT (1h)
        └── GET    /me                → authenticateToken → current user
Router  /api/tasks
        └── authenticateToken → validate request → user-scoped task controller
        │
[404 Handler] → [Global Error Handler]
```

## Prerequisites

- Node.js v18+ and npm (check with `node -v` and `npm -v`)
- VS Code (or any editor)

## Setup & Run

Open **two terminals** in VS Code (`` Ctrl+` `` then split, or `Terminal → New Terminal`).

### Terminal 1 — Backend (API on port 5000)

```bash
cd backend
npm install
npm run dev        # uses nodemon, auto-restarts on changes
# or: npm start     # plain node
```

Create `backend/.env` from `backend/.env.example`, set `MONGO_URI`, and replace
`JWT_SECRET` with a long random secret before starting the API. The `.env` file
is ignored by Git. The API will not start without `JWT_SECRET`.

You should see:

```
Server running on http://localhost:5000
```

Test it directly by registering and logging in with the requests below. Tasks
are private to the logged-in user and persist in MongoDB.

### Terminal 2 — Frontend (React on port 3000)

```bash
cd frontend
npm install
npm run dev
```

Vite will open `http://localhost:5173` automatically. The React app talks to
the API at `http://localhost:5000/api/tasks` (see `src/api/taskApi.js` if you
ever change the backend port).

> Both servers must be running at the same time for the app to work — the
> backend serves data, the frontend serves the UI.

## Run with Docker Compose

Install and start Docker Desktop (or Docker Engine with the Compose plugin),
then run this single command from the project root:

```bash
docker compose up --build
```

Open `http://localhost:5173`. The frontend is served by Nginx, the API is
available at `http://localhost:5000`, and MongoDB is available on port `27017`.
Compose starts all three services on the `app-network`; the backend connects to
MongoDB using `mongodb://mongodb:27017/taskmanager`. MongoDB data persists in
the named `mongodb-data` volume across container restarts.

Stop the stack with `Ctrl+C`. To remove the containers and network while
preserving the database volume, run `docker compose down`. To also delete the
persisted database, run `docker compose down --volumes`.

The Compose file uses a development-only default JWT secret so the stack starts
without additional setup. Set `JWT_SECRET` in the environment before running
Compose to use a different value; do not use the default in a deployed
environment. Docker build contexts exclude `node_modules`, `.env`, and generated
frontend build files.

## Practical 12: GitHub Actions CI

The `.github/workflows/ci.yml` workflow runs on pushes to `main` and pull
requests targeting `main`. It installs backend and frontend dependencies,
runs backend API smoke tests, and builds the frontend. GitHub reports the job
as passed or failed in the Actions tab and on the badge above.

The backend tests exercise the API health endpoint and verify that unauthenticated
access to the current-user endpoint is rejected. They run without MongoDB because
the Express app is exported independently from the database-connected server.

To demonstrate a failed run, temporarily change the expected health response
message in `backend/__tests__/app.test.js`, commit and push the change to `main`,
then open the failed run in **Actions** and inspect the test output. Restore the
correct expected message in a follow-up commit and push again to observe a
passing run. Do not leave the intentionally broken assertion in the final code.
Capture screenshots of both actual Actions runs for the lab journal.

## What the frontend does

- Fetches all tasks on load and shows them in three columns: **Pending**, **In
  Progress**, **Done**.
- Add a task from the terminal-style input bar at the top.
- Move a task between columns with the ← / → buttons on each card.
- Delete a task with the **×** button.
- A live **activity log** panel echoes every API call the UI makes (method,
  URL, time) — the frontend's mirror of the backend's request-logging
  middleware.
- A status pill in the header turns red if the API can't be reached (e.g. you
  forgot to start the backend).
- Create, status update, and delete operations show loading and toast feedback.
- Deletes require confirmation and failed writes restore the previous UI state.

## Practical 8: Lazy Loading and Performance

The authenticated workspace has two client-side routes: `/` for the task board
and `/activity` for the request activity log. Both route components are loaded
with `React.lazy()` and rendered under a route-level `Suspense` fallback. The
shared shell and sign-in screen remain in the initial bundle; route-specific
components are downloaded when their route is first visited. Vite may also
extract shared dependencies into a common chunk.

### Build comparison

Baseline values were recorded with `npm run build` in `frontend/` before
optimization. Post-change values are from the same command after adding the
lazy routes. Vite reports uncompressed and gzip sizes; the main JavaScript
asset is the initial application bundle and route assets are deferred chunks.

| Build | Initial JavaScript | Deferred JavaScript chunks |
| --- | ---: | --- |
| Before | 205.29 kB (68.63 kB gzip) | None; one JS file |
| After | 201.66 kB (67.89 kB gzip) | TaskBoardPage: 4.02 kB (1.47 kB gzip); Board: 1.84 kB (0.71 kB gzip); ActivityPage: 1.35 kB (0.47 kB gzip) |

Post-change Vite output:

```text
dist/assets/index-B4aO15vA.js          201.66 kB │ gzip: 67.89 kB
dist/assets/TaskBoardPage-D7I_MjmA.js    4.02 kB │ gzip:  1.47 kB
dist/assets/Board-Dmswz87V.js            1.84 kB │ gzip:  0.71 kB
dist/assets/ActivityPage-DCnWvV72.js     1.35 kB │ gzip:  0.47 kB
```

The initial entry asset is 3.63 kB smaller (0.74 kB gzip) than the baseline.
All emitted JavaScript totals 208.87 kB (70.54 kB gzip), about 3.58 kB larger
than the original single bundle; code splitting adds some overhead. The task
board and its board component are requested when `/` is visited, while the
activity chunk waits until `/activity` is visited. These figures are Vite build
sizes, not measured browser transfer timings.

For a browser comparison, run `npm run dev` from `frontend/`, sign in, open
DevTools Network, enable **Disable cache**, and reload `/`. Record initial JS
transferred size and load time, then navigate to `/activity` and confirm its
chunk appears only on first visit. Repeat with Slow 3G enabled to observe the
fallback. Record the actual browser/version and measurements here; network
timings vary by machine and connection.

| Network observation | Before | After |
| --- | --- | --- |
| Initial JavaScript transferred | 68.63 kB gzip (build output) | 67.89 kB gzip for the entry asset; route chunks load separately |
| Initial JavaScript load time | Not captured before the change | Capture in DevTools; depends on browser and network |
| Activity-route chunk | Included in initial file | Requested on first `/activity` visit |

### Analysis

- The initial bundle is downloaded during the first page load. A lazy route
        chunk is requested only when the user visits that route for the first time.
- Lazy loading can improve perceived startup speed by reducing the JavaScript
        the browser must download, parse, and execute before the first useful view;
        visiting every route later can bring total downloaded code close to the same
        amount as the unsplit build.
- It may not be worthwhile for a very small app: extra chunks and loading states
        add complexity, while the initial bundle reduction may be too small to matter.

The fallback is intentionally scoped to the route outlet and exposes a status
message and spinner. Test it with Slow 3G because local chunks can load too
quickly for the pending state to be visible.

## Practical 9: In-Memory Caching and Query Optimization

The backend uses `node-cache` with a 60-second TTL. `GET /api/tasks` caches the
response by authenticated owner, and `GET /api/tasks/:id` uses a separate
owner-and-task key. Database reads use Mongoose `.lean()` so cached values are
plain objects. Successful POST requests invalidate the owner's list; PUT and
DELETE invalidate that list and the affected detail entry. Failed writes do
not evict valid entries.

`GET /api/debug/cache` returns the process-wide hit/miss/key counters and TTL;
it requires a valid Bearer token. Counters are per Node process and reset when
the server restarts. The cache itself is also process-local, so multiple server
instances can disagree and serve stale data. A shared cache such as Redis with
cross-instance invalidation is needed for multi-instance deployments.

### Response-time comparison

Three uncached samples were recorded before the cache change. For the cached
set, one request warmed the cache before timing three subsequent requests.
Both sets used the same authenticated `GET /api/tasks` endpoint, one owner with
one task, local Node `fetch`, and the same machine/API process.

| Sample | Uncached | Cached |
| --- | ---: | ---: |
| 1 | 71.43 ms | 9.53 ms |
| 2 | 10.78 ms | 15.65 ms |
| 3 | 12.88 ms | 5.53 ms |
| **Mean** | **31.70 ms** | **10.24 ms** |

In this small local run, cached mean response time was about 67.7% lower. The
first uncached request was notably slower than the other two, and these results
are not a production benchmark: the dataset is tiny and local timings vary.
For a lab submission, repeat the readings in Postman or Thunder Client with a
larger dataset and record the environment and cache-warm procedure.

### Analysis

- Every successful write must invalidate affected entries; otherwise later
        reads can return stale task data until the entry expires.
- A 60-second TTL is a reasonable short-lived cache for a personal task board:
        longer TTLs can improve hit rate but increase the stale-data window if an
        invalidation path is missed.
- `node-cache` is process-local memory. Other server instances neither see its
        entries nor its invalidations, and a restart clears it; use a shared cache
        for horizontally scaled deployments.

## Testing the API directly

With the backend running, use Postman or these PowerShell-friendly `curl.exe`
requests. Copy `token` from the login response and use it for task requests:

```bash
curl.exe -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"email":"student@example.com","password":"practice123"}'
curl.exe -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"student@example.com","password":"practice123"}'
curl.exe http://localhost:5000/api/auth/me -H "Authorization: Bearer <token>"
curl.exe http://localhost:5000/api/tasks -H "Authorization: Bearer <token>"
curl.exe -X POST http://localhost:5000/api/tasks -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"title":"New task"}'
```

Task routes return `401` when the Bearer token is missing, invalid, or expired.
The frontend stores the token for the session, signs out by clearing it, and
returns to sign-in when a protected request returns `401`.

## Notes

- User passwords are bcrypt hashes; task documents include an owner and all
        task reads and writes are constrained to that authenticated owner.
- CORS is enabled on the backend so the React dev server (port 5173) can call
  the API (port 5000) without errors.
