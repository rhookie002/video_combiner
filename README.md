
# Video Combination Generator - Node.js (Frontend + Backend)

This project converts the provided single-file HTML app into a Node.js application with separated frontend and backend,
environment variables, and ready-to-deploy structure for Railway.

## Structure
- `frontend/` - static frontend files (index.html, assets)
- `backend/` - Express.js backend (serves frontend, provides /config and proxy endpoints)
- `.env.example` - example environment variables
- `package.json` - root package to start the backend server (for Railway)

## Quick start (local)
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` and use the app.

## Railway deployment notes
- Set environment variables in Railway to match `.env` (SUPABASE_URL, SUPABASE_KEY, N8N_WEBHOOK_URL, N8N_LAMBDA_URL)
- Deploy the `backend` folder (this repo) — it serves the frontend static files and acts as the API.

## What I changed
- Separated frontend and backend
- The frontend fetches `/config` from backend to get Supabase keys (you can change this pattern; for security consider using signed uploads)
- Backend proxies two endpoints:
  - `/api/create-folder` -> forwards to N8N webhook create-folder URL
  - `/api/send-n8n` -> forwards payload to your lambda/n8n webhook for combination processing
  - `/api/retry-google-drive` -> forwards retry payload to retry endpoint you configure
