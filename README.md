# Task Manager

A Vite + React app with a Vercel serverless backend using Vercel Postgres, JWT auth with HTTP-only cookies.

## Local Development

1. Install deps
```bash
npm install
```

2. Create `.env.local` at project root with:
```
JWT_SECRET=your-strong-secret
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:5173
# Vercel Postgres env vars, if using local/remote DB
POSTGRES_URL=...
```

3. Run frontend
```bash
npm run dev
```

4. Run API locally (Vercel CLI)
```bash
npx vercel dev
```
This exposes http://localhost:3000 for `/api/*` which is proxied from Vite.

## Deploy to Vercel

1. Push repo and import to Vercel or run:
```bash
npx vercel
```
2. Set environment variables in Vercel project settings:
- `POSTGRES_URL` (and related) from Vercel Postgres
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (optional)
- `FRONTEND_ORIGIN` (your deployed frontend URL)

3. Redeploy. Backend routes:
- POST `/api/auth/signup`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/tasks`
- POST `/api/tasks`
- PUT `/api/tasks/:id`
- DELETE `/api/tasks/:id`

## Notes
- Cookies are `HttpOnly` and `Secure` in production. For localhost, `Secure` is omitted automatically.
- Tables are created automatically on demand.
