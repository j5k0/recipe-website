# Recipe Website (Komanda26)

## What the project does
This project is a recipe-sharing website where users can browse recipes, view recipe details (including ingredients), and submit their own recipes.

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- API base path: `/api/...`

## Why the project is useful
- Provides a simple platform to discover and share recipes.
- Supports tags and recipe details (including ingredients).
- Serves as a team full-stack project to practice real workflows (branches, PRs, CI/deploy checks, API integration).

## How users can get started with the project

### Requirements
- Node.js + npm
- Git

### Clone the repository
```bash
git clone <REPO_URL>
cd recipe-website
```

### Install dependencies
```bash
npm install
```

### Run the backend
```bash
cd packages/backend
npm run dev
```

Health check (adjust port if needed):
```bash
curl.exe http://localhost:3001/api/health
```

### Run the frontend
Open a new terminal:
```bash
cd packages/frontend
npm run dev
```

Frontend runs on:
- http://localhost:5173

### Environment variables
Frontend supports:
- `VITE_BACKEND_URL` (example: `http://localhost:3001`)

If not set, the frontend defaults to `http://localhost:3001`.

## Where users can get help with your project
- Check GitHub Issues / Pull Requests in this repository.
- For local problems: check terminal logs (frontend/backend) and browser console (F12).
- Team members can contact maintainers below.

## Who maintains and contributes to the project
Maintained by **Komanda26**.

Contributions are made via feature branches and pull requests.
