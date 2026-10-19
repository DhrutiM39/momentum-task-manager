
# Momentum — Task Manager

Momentum is a full-stack task management application that helps users organize, manage, and track their tasks through a simple and user-friendly interface.

The application uses React for the frontend, Node.js and Express.js for the backend REST API, and MongoDB for data storage. It also includes authentication, task management, caching, request logging, Docker support, automated testing, and GitHub Actions CI.

## Features

- User registration and login with JWT authentication.
- Secure password hashing using bcrypt.
- Create, view, update, and delete tasks.
- Organize tasks by status: Pending, In Progress, and Done.
- Task ownership so users can access their own tasks.
- Request logging with HTTP methods, URLs, and timestamps.
- Input validation and centralized error handling.
- In-memory caching for task API responses.
- Activity log and responsive task board interface.
- Lazy loading for selected frontend routes.
- Docker Compose support for running the application and MongoDB.
- Automated backend tests using Jest and Supertest.
- Continuous Integration using GitHub Actions.

## Technologies Used

**Frontend**
- React
- Vite
- JavaScript
- Axios
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- node-cache

**Testing and DevOps**
- Jest
- Supertest
- Docker
- Docker Compose
- Git
- GitHub Actions

## Project Structure

```text
momentum-task-manager/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── cache/
│   ├── controllers/
│   ├── events/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── server.test.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── index.html
│   └── package.json
├── ss/
├── docker-compose.yml
└── README.md
```

## Prerequisites

Install the following tools before running the application:

- Node.js and npm
- MongoDB, or Docker Desktop with Docker Compose
- Git
- A modern web browser

## Setup and Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/DhrutiM39/momentum-task-manager.git
cd momentum-task-manager
```

### 2. Configure the Backend

Open a terminal and run:

```bash
cd backend
npm install
```

Create a `backend/.env` file and configure your environment variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=replace_with_a_long_random_secret
```

Use a secure, private JWT secret. Never commit your `.env` file or credentials to GitHub.

Start the backend:

```bash
npm start
```

The API runs at `http://localhost:5000` when the database is available.

### 3. Run the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## Run with Docker Compose

Ensure Docker Desktop is running, then execute the following command from the project root:

```bash
docker compose up --build -d
```

Check running containers:

```bash
docker compose ps
```

Open the frontend at `http://localhost:5173` if that port is configured by the Compose setup.

To stop the containers:

```bash
docker compose down
```

## Automated Testing

The backend uses Jest and Supertest to test API behavior.

Run the tests from the backend directory:

```bash
cd backend
npm test
```

The test suite includes checks for the API root endpoint and unknown routes.

## Continuous Integration

GitHub Actions runs the backend test suite automatically when changes are pushed to, or a pull request targets, the `main` branch.

The workflow is defined in:

```text
.github/workflows/ci.yml
```

To review the workflow results, open the repository on GitHub and select the **Actions** tab.

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Check API status |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the authenticated user |
| `/api/tasks` | Task routes | Manage authenticated users' tasks |
| GET | `/api/debug/cache` | View cache statistics (authentication required) |

Task routes support the operations configured by the backend router. Protected endpoints require a valid JWT Bearer token.

## Security Notes

- Passwords are hashed before storage.
- Protected routes use JWT authentication.
- Task access is restricted to the authenticated owner.
- Keep environment variables and credentials private.
- Use secure secrets and production-appropriate configuration when deploying.

## Future Improvements

- Add more automated unit and integration tests.
- Add frontend testing and code linting.
- Improve deployment automation.
- Introduce a shared cache for multi-instance deployments.
- Add monitoring and production error reporting.

## Author

**DhrutiM39**

GitHub: [https://github.com/DhrutiM39](https://github.com/DhrutiM39)
