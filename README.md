#FireFive — PantherNest 🐾

An affordable housing finder application tailored for Georgia State University (GSU) students to search, browse, and match housing options based on their budget and needs.

## Run locally

Start the Flask API:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

In another terminal, start the React app:

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` requests to Flask at `http://localhost:5001`. For a separately
hosted API, set `VITE_API_BASE_URL` to the backend origin before building the frontend.

## Account and admin configuration

Student registration accepts university `.edu` addresses. Email verification and
password-reset links are sent through SMTP when the variables below are configured.
In local development, the UI receives a one-time link directly so these flows remain
testable without an email provider.

```bash
ADMIN_EMAIL=admin@gsu.edu
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
SMTP_FROM="PantherDen <no-reply@example.com>"
SECRET_KEY=replace-with-a-long-random-production-secret
```

The account matching `ADMIN_EMAIL` receives access to the moderation dashboard after
signing up. Reviews remain pending until an administrator approves them.
