# Deploying Task Manager to Vercel

Follow these steps to run locally and deploy the backend (serverless functions) and frontend to Vercel using Vercel Postgres.

## Prerequisites
- Node.js 18+
- A Vercel account
- Vercel CLI installed
```bash
npm i -g vercel
```

## 1) Link or create the Vercel project
1. From the repo root, run:
```bash
vercel
```
2. Choose:
   - **Link to existing project** or **Create a new project**
   - Framework preset: "Other" (vercel.json is already provided)
3. Confirm settings and complete linking.

## 2) Provision Vercel Postgres
1. In the Vercel dashboard, open your project.
2. Go to the **Storage** tab → **Add** → **Postgres**.
3. Create the database and link it to this project (Production and Preview).
4. Vercel will inject these env vars (names may vary):
   - **POSTGRES_URL**
   - POSTGRES_PRISMA_URL
   - POSTGRES_URL_NO_SSL
   - POSTGRES_URL_NON_POOLING
   - POSTGRES_USER, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_DATABASE

## 3) Set required Environment Variables
Go to Project → Settings → Environment Variables and add:
- **JWT_SECRET**: a strong random string
- **JWT_EXPIRES_IN**: 7d
- **FRONTEND_ORIGIN**: your frontend URL(s), comma-separated. Example:
  - For production only:
    - https://your-app.vercel.app
  - For prod + local dev:
    - https://your-app.vercel.app, http://localhost:5173

Notes:
- The server sets HttpOnly cookies. `Secure` is used automatically in production only.
- CORS allows credentials and restricts origin to FRONTEND_ORIGIN values.

## 4) Local development
You’ll run the serverless API and the Vite app in parallel.

1. Create a local env file (optional, only if not relying on Vercel dev env sync):
```bash
# .env.local
JWT_SECRET=dev-secret
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:5173
# If you want to use your remote DB in dev, add:
# POSTGRES_URL=...
```

2. Start the Vercel dev server (serves /api on http://localhost:3000):
```bash
vercel dev
```

3. In another terminal, start Vite (frontend on http://localhost:5173):
```bash
npm run dev
```

4. Open http://localhost:5173 and use the UI to sign up, login, and manage tasks.

## 5) Deploy
1. Deploy a preview:
```bash
vercel
```
2. Promote to production:
```bash
vercel --prod
```
3. After deployment, ensure your production **FRONTEND_ORIGIN** includes your final URL (for cookies and CORS). Example:
- https://your-app.vercel.app

## 6) API routes (for reference)
- **POST** `/api/auth/signup` → { email, password }
- **POST** `/api/auth/login` → { email, password }
- **POST** `/api/auth/logout`
- **GET** `/api/tasks`
- **POST** `/api/tasks` → { title }
- **PUT** `/api/tasks/:id` → { title?, completed? }
- **DELETE** `/api/tasks/:id`

## 7) Common issues
- **401 Unauthorized**: Ensure you are logged in and cookies are allowed. Check that FRONTEND_ORIGIN matches the site you’re calling from.
- **500 Internal Server Error / DB errors**: Verify POSTGRES_URL (and related) exist in Vercel and are assigned to the correct environments (Production/Preview).
- **Cookies not set**: In production, cookies require HTTPS. Locally, `Secure` is disabled automatically; ensure requests include `credentials: 'include'` on the frontend.

## 8) Useful commands
- **Run local API**: `vercel dev`
- **Run local frontend**: `npm run dev`
- **Deploy preview**: `vercel`
- **Deploy production**: `vercel --prod`

You’re ready to deploy. After the first production deployment, test signup/login on your production URL to confirm cookies and CORS are working end-to-end.