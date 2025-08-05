# CSCC01 Assignment 2 - CI/CD Submission (Team: Microsofties)

This folder contains the Dockerfiles, CI/CD workflows, integration test scripts, and documentation required for Assignment 2.

---

## What This Project Does

This project automates the CI/CD pipeline for a full-stack web application using:

- **GitHub Actions** for continuous integration and deployment
- **Docker & Docker Hub** for containerization and versioning
- **Render** for live deployment of frontend and backend containers

---

## Folder Structure

CICD/

├── backend/

│ └── Dockerfile

├── frontend/

│ └── Dockerfile

├── scripts/

│ └── integration-test.sh

├── workflows/

│ └── ci-cd.yml

├── README.md

└── Report.pdf

---

## CI/CD Workflow

On every push to `main`, GitHub Actions will:

1. Run **unit tests** for both frontend and backend using Jest
2. Build and tag Docker images (`latest` and versioned)
3. Push images to Docker Hub
4. Trigger **Render deploy hooks** for both frontend and backend
5. Wait for services to go live
6. Run **integration tests** by hitting live endpoints via `curl`

---

## Integration Tests

The integration tests (`scripts/integration-test.sh`) validate the deployed containers by:

- Hitting the backend health check at `/api/health`
- Hitting a key backend API route `/api/water-data`
- Checking that the frontend root (`/`) returns a response

---

## Environment Variables (Set in Render)

**Backend:**

- `MONGODB_URI` → MongoDB Atlas connection string
- `JWT_SECRET` → Secret key for token generation

**Frontend:**

- `REACT_APP_API_URL` → URL of deployed backend (e.g., `https://glow-backend-v4-0-0.onrender.com`)

---

## Manual Test Commands (Optional)

From project root:

```bash
# Run backend locally
cd backend
npm install
npm test

# Run frontend locally
cd frontend
npm install
npm test

# Run integration test against deployed services
bash CICD/scripts/integration-test.sh