# 🎯 GoodScore — MERN edition

A golf performance + charity draw platform, built against **Digital Heroes
PRD (Level 1)

goodscore-mern/
├── backend/     Express + Node + MongoDB (Mongoose) REST API
└── frontend/    React (Vite) single-page app


The two run as independent services that talk over HTTP — deploy them
separately (e.g. backend on Render/Railway, frontend on Vercel), or run both
locally with two terminals.

## 1 · Backend setup

```bash
cd backend
npm install
npm run seed               # populates demo charities, users, and one draw
npm run dev                 # http://localhost:5000
```

### Demo credentials (created by `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@goodscore.app` | `admin123` |
| Subscriber (active, monthly) | `ps@example.com` | `player123` |
| Subscriber (active, yearly) | `rj@example.com` | `player123` |
| Subscriber (lapsed) | `rs@example.com` | `player123` |


## 2 · Frontend setup

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```


## API overview

| Resource | Routes |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Subscriptions | `POST /api/subscriptions` (signup+subscribe, or change plan if logged in), `PUT /api/subscriptions/me/charity`, `DELETE /api/subscriptions/me` |
| User | `PUT /api/users/me`, `POST /api/users/me/scores`, `DELETE /api/users/me/scores/:date` |
| Charities | `GET /api/charities`, `GET /api/charities/:id`, admin: `POST` / `PUT /:id` / `DELETE /:id` |
| Draws | `GET /api/draws` (published, public), `GET /api/draws/mine`, admin: `GET /all`, `POST /`, `PUT /:id/type`, `POST /:id/simulate`, `POST /:id/publish`, `DELETE /:id`; `POST /:id/proof` (winner proof upload); admin: `PUT /:id/winners/:winnerId` |
| Admin | `GET /api/admin/users`, `PUT /api/admin/users/:id/status`, `PUT /api/admin/users/:id/scores`, `DELETE /api/admin/users/:id/scores/:date`, `GET /api/admin/reports` |
All routes except `GET /api/charities*`, `GET /api/draws`, `POST/api/auth/*`, and `POST /api/subscriptions` require a `Bearer <JWT>` header, issued by login/register/subscribe and stored client-side in `localStorage`.


## Deployment sketch

1. **MongoDB Atlas** — new free cluster → copy connection string.
2. **Backend** → Render/Railway/Fly.io: set `MONGO_URI`, `JWT_SECRET`,
   `CLIENT_ORIGIN` (your frontend URL) as env vars, deploy `backend/`, then
   run `npm run seed` once (e.g. via a one-off shell/job) for demo data.
3. **Frontend** → Vercel/Netlify: set `VITE_API_URL` to your deployed
   backend's `/api` URL, deploy `frontend/`.
