import { sql, ensureSchema } from "../_lib/db.js";
import { hashPassword, signJwt } from "../_lib/auth.js";
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

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing?.rows?.length) {
      res.statusCode = 409;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Email already registered" }));
      return;
    }

    const password_hash = await hashPassword(password);
    const insert = await sql`
      INSERT INTO users (email, password_hash) VALUES (${email}, ${password_hash}) RETURNING id, email
    `;

    const user = insert.rows[0];
    const token = signJwt({ sub: user.id, email: user.email });

    setAuthCookie(res, token);

    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ id: user.id, email: user.email }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};