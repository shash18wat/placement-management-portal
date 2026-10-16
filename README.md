# Placement Management Portal

A local portfolio MVP for placement preparation and recruitment coordination. The React interface connects to a FastAPI REST service with SQLite persistence. Students can review opportunity requirements, check eligibility, submit a resume to the local demo, and request focused feedback on a resume summary.

## Features

- **Student profile:** Stores the profile in this browser. GPA and active backlog values can be used for opportunity eligibility checks.
- **Company management:** Create and remove company records through REST endpoints.
- **Opportunity management:** Create roles with location, employment type, skills, description, and optional GPA or active backlog requirements.
- **Eligibility verification:** Compares the values a student provides against a listing's configured criteria and explains missing or unmet requirements.
- **Resume submission:** Accepts PDF and DOCX files up to 5 MB, performs basic file-type checks, and stores the submission metadata in SQLite and the resume under the local `data/resumes` folder. The demo never contacts an employer.
- **Application dashboard:** Shows submitted resume records, allows coordinator status updates (received, under review, interview, offer, or not selected), and deletes a local submission and its file when requested. Status updates do not notify candidates.
- **AI resume feedback:** Uses Gemini only when a server-side `GEMINI_API_KEY` is configured and the user agrees to send the role, skills, and summary. Otherwise, built-in checks give basic feedback without calling an AI provider.
- **Privacy and terms pages:** Explain the local demo's current storage behavior and public-launch limits.

Three clearly labeled illustrative listings are inserted into a new local database. They are examples only and are not real vacancies.

## Important demo security limit

This is a **local demonstration only**. The coordinator endpoints do not require authentication. A person who can reach the API can create or view company, opportunity, and application records. The API is configured for local use and must not be exposed to the public internet. Use fictional data only. Do not submit real student details or resumes.

Before any public or institutional deployment, add authentication, role-based access, production-grade file handling, protected storage, retention and deletion operations, persistent rate limiting, monitoring, backups, and a security review. Review and finalize the privacy and terms pages with the real operator and contact information.

## Run locally on Windows

1. Open PowerShell in this project folder.
2. Create a Python environment and install the API requirements:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. Install the frontend dependencies:

   ```powershell
   cd frontend
   npm install
   ```

4. Start the React development server in that terminal:

   ```powershell
   npm run dev
   ```

5. Open a second PowerShell window in the project folder, activate `.venv`, and run the API:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
   ```

6. Open the local address printed by Vite, normally `http://127.0.0.1:5173`.

The Vite development server forwards `/api` requests to FastAPI on port 8000. SQLite and uploaded resume files are created in `data/` after the first API request. That folder is excluded from Git.

## Public portfolio demo

The public build is a read-only portfolio demonstration. It lists illustrative roles, supports eligibility practice, and provides resume feedback. It does not accept resume uploads or expose coordinator records. Student profile details stay in each visitor's browser. Keep `PUBLIC_DEMO=true` on the public service; the included Docker image defaults to this setting.

This project includes a Dockerfile and Render Blueprint for a single-service deployment. To create a live `onrender.com` link:

1. Push this project to a GitHub repository you control. Do not commit `.env` or any API key.
2. In Render, create a new Blueprint and select that repository. Render reads `render.yaml`, builds the React app and FastAPI service together, and checks `/api/health` before routing traffic.
3. Wait for the first deploy to finish, then open the service's `onrender.com` address. Render assigns this address automatically.
4. Leave `GEMINI_API_KEY` unset for built-in feedback. If you choose to enable Gemini, add the key in Render's secret environment settings; never put it in the frontend or repository.

The public service remains a portfolio demo: its sample listings are not current vacancies, resume submissions are disabled, and no applications are sent to employers. Review the privacy and terms drafts and replace the sample listings before presenting the site as an institutional placement service. A custom domain also requires ownership of a domain and DNS configuration. See [Render's Blueprint reference](https://render.com/docs/blueprint-spec) for deployment settings.

## Optional Gemini setup

1. Copy `.env.example` to `.env` in this project folder.
2. Add your Gemini API key to `.env` as `GEMINI_API_KEY=your_key`.
3. Restart FastAPI. Keep the key out of Git, screenshots, browser code, and frontend environment variables.

When Gemini is configured, the review page asks for explicit consent before sending the target role, skills, and summary to Google Gemini. The API does not persist review text. Without a key, built-in checks run without contacting an AI provider. Gemini use may be subject to Google's current quotas and billing rules.

## API overview

- `GET /api/health` and `GET /api/status`
- `GET` and `POST /api/companies`, plus `DELETE /api/companies/{company_id}`
- `GET` and `POST /api/opportunities`, plus `DELETE /api/opportunities/{opportunity_id}`
- `POST /api/eligibility/check`
- `GET /api/applications`
- `PATCH /api/applications/{application_id}/status`
- `POST /api/resume-submissions`
- `DELETE /api/applications/{application_id}`
- `POST /api/feedback`

FastAPI's interactive API documentation is available at `http://127.0.0.1:8000/docs` while the local service is running.

## Build and verify

Build the frontend:

```powershell
cd frontend
npm run build
```

Run backend checks from the project folder:

```powershell
py -m pytest
```

The FastAPI app serves `frontend/dist` when that build exists. For development, run Vite and FastAPI separately.

## Public launch checklist

The app has **not** been deployed. Do not launch it publicly until all of the following are complete:

- Add authentication and separate student and coordinator permissions.
- Replace SQLite and local file storage with protected production storage and backups.
- Add persistent abuse controls, monitoring, retention and deletion processes.
- Review the resume file pipeline, API security, accessibility, and operational recovery.
- Replace example listings with verified, current opportunities.
- Finalize the privacy and terms pages with the operator's identity, contact information, and jurisdiction-specific review.
- Connect and verify a custom domain, enable HTTPS, and verify the favicon on that domain.
- Keep all credentials in the hosting provider's secret manager.
