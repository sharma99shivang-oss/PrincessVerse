# PrincessVerse

PrincessVerse is a production-oriented MERN starter for a private relationship dashboard: memories, foods, movies, music, letters, gifts, a shared timeline, moods, a bucket list, notifications, profile/settings, and an admin surface.

## Stack

- **Frontend:** React 19, Vite, React Router, Axios, Lucide React, responsive custom glassmorphism CSS.
- **Backend:** Node.js, Express, Mongoose, MVC controllers/routes, JWT access + refresh tokens, bcrypt, role middleware.
- **Data:** MongoDB. Seed data is included for a demo princess account and a companion/admin account.

## Quick start

```bash
npm install
npm run install:all
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
npm run seed
npm run dev
```

Frontend: `http://localhost:5173`  
API: `http://localhost:5000`

Demo credentials after seeding:

- Princess: `princess@princessverse.app` / `Princess123!`
- Admin: `admin@princessverse.app` / `Admin123!`

For production, provide a real `MONGODB_URI`, a long random `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`, set `CLIENT_URL`, run the frontend build, and serve `frontend/dist` through a CDN or reverse proxy.

## Useful commands

```bash
npm run build
npm run seed
npm run dev
```

The backend deliberately starts without connecting until `MONGODB_URI` is configured. API errors are returned as JSON and refresh tokens are stored in an HTTP-only cookie.
