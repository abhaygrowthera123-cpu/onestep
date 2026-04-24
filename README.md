# OneStep Hub — Project Documentation

OneStep Hub is a full-stack e-commerce application: a React (Vite) storefront with an Express API, Sequelize database (SQLite or MySQL), and Firebase Authentication. It includes customer shopping, seller tools, and an admin area.

---

## Table of contents

1. [Architecture](#architecture)
2. [Repository layout](#repository-layout)
3. [Prerequisites](#prerequisites)
4. [Environment configuration](#environment-configuration)
5. [How to run locally (working order)](#how-to-run-locally-working-order)
6. [Authentication](#authentication)
7. [API overview](#api-overview)
8. [Database](#database)
9. [Frontend notes](#frontend-notes)
10. [Production build](#production-build)
11. [Troubleshooting](#troubleshooting)

---

## Architecture

| Layer | Technology |
|--------|------------|
| **Frontend** | React 19, Vite 6, Tailwind CSS 4, React Router 7, Axios |
| **Backend** | Express 4, Sequelize 6, Firebase Admin (token verification) |
| **Auth (users)** | Firebase Auth (Google, email/password, phone OTP on login page) |
| **Auth (admin)** | Email/password checked against env; session token stored in memory on server |
| **Data** | SQLite (default) or MySQL |

The browser never talks to the database directly. The SPA calls `/api/*` on the Vite dev server; Vite **proxies** those requests to the backend (see `frontend/vite.config.js`).

---

## Repository layout

```
onestep-hub/
├── .env                    # Root env (backend loads this — keep secret)
├── .env.example            # Template — copy to .env and fill in
├── backend/
│   ├── src/
│   │   ├── index.js        # Express app, routes, DB sync, server start
│   │   ├── models/         # Sequelize models (single index.js)
│   │   ├── routes/         # products, orders, auth, users, …
│   │   ├── middleware/     # auth, validation, rate limits, errors
│   │   ├── validators/     # Joi schemas
│   │   ├── services/       # e.g. stock
│   │   └── utils/          # logger, pagination
│   ├── data/               # SQLite file (when DB_DIALECT=sqlite)
│   ├── uploads/            # User-uploaded images (served at /uploads)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Routes, providers, splash
│   │   ├── main.jsx
│   │   ├── firebase.js     # Firebase client init
│   │   ├── context/        # Auth, Cart, Wishlist
│   │   ├── services/api.js # Axios client + Bearer tokens
│   │   ├── pages/          # Shop, admin/, seller/
│   │   └── components/
│   ├── firebase-applet-config.json  # Firebase web app config (required)
│   ├── .env                # Optional: VITE_API_URL, VITE_GOOGLE_MAPS_KEY
│   └── package.json
└── README.md               # This file
```

---

## Prerequisites

- **Node.js** (LTS recommended, e.g. 20.x)
- **npm** (comes with Node)
- **MySQL** (only if you set `DB_DIALECT=mysql` in `.env`)
- A **Firebase project** with Authentication enabled and the web app config in `frontend/firebase-applet-config.json`

---

## Environment configuration

### Root `.env` (backend)

The backend resolves `.env` from the **repository root** (not inside `backend/`). Copy `.env.example` to `.env` and adjust.

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `development` or `production` |
| `BACKEND_PORT` | API port (default **3001**) |
| `FRONTEND_URL` | Used for CORS if `ALLOWED_ORIGINS` is unset (default `http://localhost:5173`) |
| `ALLOWED_ORIGINS` | Comma-separated origins for CORS (optional) |
| `DB_DIALECT` | `sqlite` (default) or `mysql` |
| **SQLite** | File at `backend/data/onestep.sqlite` (created automatically) |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` | MySQL connection |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin login on `/api/auth/admin-login` (defaults exist in code — change in production) |
| `FIREBASE_PROJECT_ID` | Firebase Admin project ID |
| `ADMIN_JWT_SECRET` | Secret for signing admin session JWTs (recommended for production) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | [Razorpay](https://razorpay.com/) API keys for online payments (India) |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signing secret (optional; for `payment.captured` events) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional transactional email (order confirmations) |
| `STORE_DISPLAY_NAME` | Shown in Razorpay checkout |
| `GST_DISPLAY_TEXT` | Default GST/pricing footnote on orders |
| `SYNC_ALTER` | Set `true` once to add new DB columns after upgrades (use carefully) |

Firebase Admin uses Application Default Credentials when available; otherwise initialization may fall back to project ID only (see `backend/src/middleware/auth.js`).

### `frontend/.env` (optional)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend base URL for dev proxy target (default `http://localhost:3001`). Must match `BACKEND_PORT`. |
| `VITE_GOOGLE_MAPS_KEY` | Google Maps JavaScript API key (addresses / maps) |

---

## How to run locally (working order)

**Order matters:** the API must be listening before the browser loads pages that fetch products, or you will see **Vite proxy errors (`ECONNREFUSED`)**.

1. **Install dependencies**

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure env**

   - Copy `.env.example` to `.env` at repo root and set database and admin settings.
   - Ensure `frontend/firebase-applet-config.json` exists with your Firebase web config.

3. **Start the backend first**

   ```bash
   cd backend
   npm run dev
   ```

   Wait until logs show the server is running, e.g. `Backend running on http://localhost:3001`.

4. **Start the frontend**

   ```bash
   cd frontend
   npm run dev
   ```

5. **Open** `http://localhost:5173` in the browser.

If you started the UI before the API, **refresh the page** after the backend is up.

---

## Authentication

### Customers (Firebase)

- Sign-in uses **Firebase Auth** (`frontend/src/firebase.js`).
- After login, the app calls **`POST /api/users`** (via `api.syncUser`) to upsert the user row in the database.
- API requests send **`Authorization: Bearer <Firebase ID token>`** (`frontend/src/services/api.js`).

### Admin (email + password)

- Login form can call **`POST /api/auth/admin-login`** with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.
- The server returns a **session token** stored in `localStorage` as `adminToken` and a JSON session as `adminSession`.
- **Important:** Admin tokens live in an **in-memory `Map`** on the server. If you restart the backend, you must **log in again** (stale tokens are cleared on 401 in `api.js`).

### Development helpers

- Non-production: a **debug Bearer token** may be accepted for local testing (see `backend/src/middleware/auth.js`).
- The login page may expose **dev login** paths for testing without Firebase (implementation in `AuthContext` / `Login`).

---

## API overview

- **Versioned base:** `/api/v1/...`
- **Legacy alias:** `/api/...` (same handlers)

Main groups:

| Prefix | Purpose |
|--------|---------|
| `/api/v1/products` | Products, search, filters |
| `/api/v1/categories` | Categories |
| `/api/v1/orders` | Orders |
| `/api/v1/users` | User sync and admin user management |
| `/api/v1/auth` | Admin login, verify |
| `/api/v1/upload` | Image uploads |
| `/api/v1/addresses` | Saved addresses |
| `/api/v1/contact` | Contact form / newsletter |
| `/api/v1/reviews` | Product reviews |

Health checks: `GET /api/health` and `GET /api/v1/health`.

Static uploads: `GET /uploads/...` on the backend origin (proxied as `/uploads` in dev).

---

## Database

- **Default:** SQLite file under `backend/data/` — no MySQL install required.
- **MySQL:** Set `DB_DIALECT=mysql` and provide host, user, password, database name.

On startup, Sequelize **syncs** models; optional seed runs if tables are empty (`backend/src/seed.js`). An **admin** Firebase user + DB row may be auto-created if no admin exists (see `backend/src/index.js`).

---

## Frontend notes

- **Routing:** Public shop routes under `/`; **seller** under `/seller/*`; **admin** under `/admin/*` (role checks in `App.jsx`).
- **State:** Cart and wishlist use React context; persist as implemented in those files.
- **Images:** `frontend/src/lib/imageUrl.js` may prepend `VITE_API_URL` for absolute asset URLs when needed.

---

## Production build

**Frontend**

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`. Serve `dist/` behind any static host or reverse proxy. Configure the same origin or set CORS/`ALLOWED_ORIGINS` and point API calls to your real API URL (you may need a production `VITE_*` strategy or server-side proxy).

**Backend**

```bash
cd backend
npm start
```

Use `NODE_ENV=production`, secure `.env`, and a process manager (systemd, PM2, Docker, etc.). Prefer **MySQL** (or another managed DB) over SQLite for production concurrency.

---

## Troubleshooting

| Symptom | Likely cause | What to do |
|---------|----------------|------------|
| Vite `http proxy error` / `ECONNREFUSED` for `/api/...` | Backend not running or wrong port | Start backend first; ensure `BACKEND_PORT` and `VITE_API_URL` match; refresh browser |
| `401` after backend restart (admin) | In-memory admin tokens cleared | Log in again as admin |
| CORS errors | Origin not allowed | Set `ALLOWED_ORIGINS` or `FRONTEND_URL` in root `.env` |
| Firebase sign-in failures | Wrong domain / config | Check Firebase console authorized domains and `firebase-applet-config.json` |
| “Email/password is not enabled” / `auth/operation-not-allowed` | Email/Password provider off in Firebase | [Firebase Console](https://console.firebase.google.com/) → your project → **Authentication** → **Sign-in method** → **Email/Password** → **Enable** → Save. Enable **Google** too if you use “Continue with Google”. |
| Database errors | MySQL not running or wrong credentials | Fix `.env` or switch to `DB_DIALECT=sqlite` for local dev |

---

## Scripts reference

| Location | Command | Description |
|----------|---------|-------------|
| `backend/` | `npm run dev` | `node --watch src/index.js` |
| `backend/` | `npm start` | Run without watch |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | Production build |
| `frontend/` | `npm run preview` | Preview production build |

---

This document describes the project as implemented in this repository. For behavior of individual endpoints, inspect the files under `backend/src/routes/` and the corresponding validators.

---

## Production deployment (Frontend + Backend + MySQL)

This repository is now set up to deploy as:
- one app container (serves React build + API)
- one MySQL container (persistent volume)

### 1) Prepare production env

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with real secrets and your domain.

### 2) Build and run

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

### 3) Verify

- App: `http://YOUR_SERVER_IP:3001`
- Health: `http://YOUR_SERVER_IP:3001/api/health`

### 4) Put behind domain + HTTPS (recommended)

Use any reverse proxy (Nginx, Caddy, Traefik, Cloudflare Tunnel) and point your domain to port `3001`.

### 5) Share link

After DNS + HTTPS, users can open:
- `https://your-domain.com`

This is a full-stack deploy (frontend, backend, and DB) in one setup.

---

## Deploy on Render

This repo includes `render.yaml` so you can deploy with Render Blueprint.

### 1) Push code to GitHub

Render deploys from your GitHub repository, so push this project first.

### 2) Create Blueprint service

In Render:
- New + -> Blueprint
- Select your repository
- Render reads `render.yaml` and creates the web service

### 3) Set required env vars in Render

Open the created service and set:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `FIREBASE_PROJECT_ID`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

`ADMIN_JWT_SECRET` is auto-generated by Render from `render.yaml`.

### 4) Deploy and share link

After deploy succeeds, Render gives a public URL:
- `https://<your-service>.onrender.com`

That single link serves frontend + backend APIs, and SQLite is persisted on the attached Render disk (`backend/data`).
