import { useEffect, useState } from "react";

export default function TaskList({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/tasks`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(`/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      setTasks((t) => [data, ...t]);
      setNewTitle("");
    } catch (err) {
      setError(err.message);
    }
  };

  const toggle = async (task) => {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ completed: !task.completed }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Failed to update");
    setTasks((list) => list.map((t) => (t.id === task.id ? data : t)));
  };

  const updateTitle = async (task, title) => {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Failed to update");
    setTasks((list) => list.map((t) => (t.id === task.id ? data : t)));
  };

  const remove = async (task) => {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) return setError("Failed to delete");
    setTasks((list) => list.filter((t) => t.id !== task.id));
  };

  const logout = async () => {
    await fetch(`/api/auth/logout`, { method: "POST", credentials: "include" });
    onLogout();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Tasks</h2>
        <div>
          <span>{user.email}</span>
          <button onClick={logout} style={{ marginLeft: 8 }}>Logout</button>
        </div>
      </div>

      <form onSubmit={addTask} style={{ marginBottom: 16 }}>
        <input
          placeholder="New task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((t) => (
          <li key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <input type="checkbox" checked={t.completed} onChange={() => toggle(t)} />
            <input
              value={t.title}
              onChange={(e) => updateTitle(t, e.target.value)}
              style={{ flex: 1 }}
            />
            <button onClick={() => remove(t)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}