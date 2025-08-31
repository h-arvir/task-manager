import { sql, ensureSchema } from "../_lib/db.js";
import { comparePassword, signJwt } from "../_lib/auth.js";
import { parseJsonBody, setAuthCookie, withCors } from "../_lib/http.js";

export default async function handler(req, res) {
  if (withCors(req, res)) return; // Handle preflight
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }
  try {
    await ensureSchema();
    const body = await parseJsonBody(req);
    const { email, password } = body || {};
    if (!email || !password) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Email and password required" }));
      return;
    }

    const result = await sql`SELECT id, email, password_hash FROM users WHERE email = ${email}`;
    const user = result.rows[0];
    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid credentials" }));
      return;
    }

    const ok = await comparePassword(password, user.password_hash);
    if (!ok) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid credentials" }));
      return;
    }

    const token = signJwt({ sub: user.id, email: user.email });
    setAuthCookie(res, token);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ id: user.id, email: user.email }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

export const config = { api: { bodyParser: false } };