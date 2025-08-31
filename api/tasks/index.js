import { sql, ensureSchema } from "../_lib/db.js";
import { getAuthUser, parseJsonBody, withCors } from "../_lib/http.js";

export default async function handler(req, res) {
  if (withCors(req, res)) return; // Handle preflight
  try {
    await ensureSchema();
    const user = getAuthUser(req);
    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    if (req.method === "GET") {
      const result = await sql`SELECT id, title, completed, created_at, updated_at FROM tasks WHERE user_id = ${user.id} ORDER BY created_at DESC`;
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result.rows));
      return;
    }

    if (req.method === "POST") {
      const body = await parseJsonBody(req);
      const { title } = body || {};
      if (!title) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Title is required" }));
        return;
      }
      const insert = await sql`
        INSERT INTO tasks (user_id, title) VALUES (${user.id}, ${title}) RETURNING id, title, completed, created_at, updated_at
      `;
      res.statusCode = 201;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(insert.rows[0]));
      return;
    }

    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}