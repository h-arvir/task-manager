import { withCors, clearAuthCookie } from "../_lib/http.js";

export default async function handler(req, res) {
  if (withCors(req, res)) return; // Handle preflight
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }
  clearAuthCookie(res);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true }));
}