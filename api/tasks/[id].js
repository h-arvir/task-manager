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

    const id = parseInt(req.query?.id || (req.url?.split("/").pop() ?? ""), 10);
    if (!Number.isFinite(id)) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid id" }));
      return;
    }

    if (req.method === "PUT") {
      const body = await parseJsonBody(req);
      const { title, completed } = body || {};
      const current = await sql`SELECT id FROM tasks WHERE id = ${id} AND user_id = ${user.id}`;
      if (!current.rows.length) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Task not found" }));
        return;
      }

      const update = await sql`
        UPDATE tasks
        SET title = COALESCE(${title}, title),
            completed = COALESCE(${completed}, completed),
            updated_at = now()
        WHERE id = ${id} AND user_id = ${user.id}
        RETURNING id, title, completed, created_at, updated_at
      `;
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(update.rows[0]));
      return;
    }

    if (req.method === "DELETE") {
      await sql`DELETE FROM tasks WHERE id = ${id} AND user_id = ${user.id}`;
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true }));
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