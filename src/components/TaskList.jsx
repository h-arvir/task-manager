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

  useEffect(() => { load(); }, []);

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
    <div className="neon-card card-pad">
      <div className="toolbar center">
        <h2 style={{ margin: 0, textAlign: "center" }}>Tasks</h2>
        <div className="user-pill" style={{ justifyContent: "center" }}>
          <span className="subtle-text" style={{ fontSize: 12 }}>Signed in</span>
          <span>{user.email}</span>
          <button className="neon-btn ghost" onClick={logout}>Logout</button>
        </div>
      </div>

      <form onSubmit={addTask} className="row center" style={{ marginBottom: 12 }}>
        <input
          className="neon-input"
          placeholder="New task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button className="neon-btn" type="submit">Add</button>
      </form>

      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      <ul className="tasks-list">
        {tasks.map((t) => (
          <li key={t.id} className="task-row">
            <input className="neon-checkbox" type="checkbox" checked={t.completed} onChange={() => toggle(t)} />
            <input
              className="neon-input task-title"
              value={t.title}
              onChange={(e) => updateTitle(t, e.target.value)}
            />
            <button className="neon-btn ghost" onClick={() => remove(t)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}