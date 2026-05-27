# ITO — It Takes One

**ITO** is a speedrun leaderboard for the co-op game *It Takes Two*. The game is intended to be played with two people, however this website lets runners submit solo times for sections of the speedrun.

**Live site:** [ito.itt.run](https://ito.itt.run)

---

## Features

- User account registration and login
- Submit and browse solo speedrun completions
- Persistent leaderboard ranked by completion time
- Token-based authentication for secure API access
- Relational data model tracking users, sessions, and run submissions

---

## Tech Stack

### Backend
- **Python / Flask** — REST API
- **SQLAlchemy** — ORM for relational database access
- **PostgreSQL** — Primary database, stored on an external SSD
- **Gunicorn** — WSGI server
- **Nginx** — Reverse proxy
- **Cloudflare Tunnels** — Secure public internet exposure without port forwarding

### Frontend
- **React** — UI
- **TypeScript / JavaScript**

### Infrastructure
- Self-hosted on a **Raspberry Pi 4** running Linux
- OS on SD card; all application data on external SSD
- Zero cloud dependency — fully managed personal infrastructure

---

## Architecture Overview

```
Browser
   │
   ▼
Cloudflare Tunnel
   │
   ▼
Nginx (reverse proxy)
   │
   ├──▶ React Frontend (static files)
   │
   └──▶ Gunicorn / Flask REST API
              │
              ▼
         PostgreSQL (external SSD)
```

---

## API Overview

The backend exposes a REST API consumed by the React frontend. Key resource areas:

| Resource | Description |
|---|---|
| `/tokens` | Register, login, logout — issues bearer tokens |
| `/profile` | User profile data |
| `/submission` | Create and retrieve speedrun submissions |
| `/leaderboard` | Ranked runs by completion time |

Authentication is handled via **bearer tokens** stored in the `tokens` table and validated on protected routes.

---

## Database Models

| Model | Description |
|---|---|
| `User` | Account credentials and profile info |
| `Token` | Active session tokens linked to users |
| `Submission` | Speedrun entry with time, category, and metadata |

---

## Running Locally

### Prerequisites
- Python 3.10+
- PostgreSQL
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
DB_STRINGL=postgresql://user:password@localhost:5432/ito_database
SECRET_KEY=your-secret-key
```

```bash
flask db upgrade
flask run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

The production instance runs on a Raspberry Pi 4 with the following setup:

- Flask app served via **Gunicorn** bound to a local socket
- **Nginx** proxies requests to Gunicorn (frontend static files served directly)
- **Cloudflare Tunnel** (`cloudflared`) routes public traffic to Nginx with no open inbound ports
- PostgreSQL data persisted on an **external SSD** mounted to the Pi

---
