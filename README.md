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
