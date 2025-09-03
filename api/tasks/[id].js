import { sql, ensureSchema } from "../_lib/db.js";
import { getAuthUser, parseJsonBody, withCors } from "../_lib/http.js";

export default async function handler(req, res) {
  if (withCors(req, res)) return;

  try {
    await ensureSchema();
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.query;  // ✅ simpler and reliable
    const taskId = parseInt(id, 10);
    if (!Number.isFinite(taskId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    if (req.method === "PUT") {
      const body = await parseJsonBody(req);
      const { title, completed } = body || {};

      const update = await sql`
        UPDATE tasks
        SET 
          title = COALESCE(${title}, title),
          completed = COALESCE(${completed}, completed),
          updated_at = now()
        WHERE id = ${taskId} AND user_id = ${user.id}
        RETURNING id, title, completed, created_at, updated_at
      `;

      if (!update.rows.length) return res.status(404).json({ error: "Task not found" });
      return res.status(200).json(update.rows[0]);
    }

    if (req.method === "DELETE") {
      const del = await sql`
        DELETE FROM tasks
        WHERE id = ${taskId} AND user_id = ${user.id}
        RETURNING id, title
      `;
      if (!del.rows.length) return res.status(404).json({ error: "Task not found" });
      return res.status(200).json({ success: true, task: del.rows[0] });
    }

    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("Task API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
