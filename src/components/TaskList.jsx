import { useEffect, useState } from "react";

export default function TaskList({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "pending", "completed"

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
    try {
      setError(""); // Clear any previous errors
      
      // First update the UI optimistically
      setTasks((list) =>
        list.map((t) =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        )
      );

      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed: !task.completed }),
      });
      
      // Read the response text first
      const text = await res.text();
      
      // Try to parse as JSON
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Invalid JSON response:', text);
        throw new Error("Server returned invalid JSON response");
      }
      
      if (!res.ok) {
        // Revert the optimistic update
        setTasks((list) =>
          list.map((t) =>
            t.id === task.id ? task : t
          )
        );
        throw new Error(data.error || "Failed to update task");
      }
      
      // Update with the server response data
      setTasks((list) => list.map((t) => (t.id === task.id ? data : t)));
    } catch (err) {
      console.error("Error toggling task:", err);
      setError(err.message || "Failed to update task status");
    }
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
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setTasks((list) => list.filter((t) => t.id !== task.id));
    } catch (err) {
      setError(err.message);
    }
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

      <div className="filter-controls" style={{ marginBottom: 12, display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          className={`neon-btn ${filter === 'all' ? '' : 'ghost'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`neon-btn ${filter === 'pending' ? '' : 'ghost'}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`neon-btn ${filter === 'completed' ? '' : 'ghost'}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      <ul className="tasks-list">
        {tasks
          .filter(t => {
            if (filter === 'pending') return !t.completed;
            if (filter === 'completed') return t.completed;
            return true;
          })
          .map((t) => (
          <li key={t.id} className="task-row">
            <input 
              className="neon-checkbox" 
              type="checkbox" 
              checked={t.completed} 
              onChange={() => toggle(t)} 
              aria-label={t.completed ? "Mark as incomplete" : "Mark as complete"}
            />
            <input
              className={`neon-input task-title ${t.completed ? 'completed' : ''}`}
              value={t.title}
              onChange={(e) => updateTitle(t, e.target.value)}
              style={t.completed ? { textDecoration: 'line-through', opacity: 0.7 } : {}}
            />
            <div className="task-actions">
              <button 
                className={`neon-btn ${t.completed ? 'warning' : 'success'} ghost`} 
                onClick={() => toggle(t)}
              >
                {t.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
              <button className="neon-btn ghost danger" onClick={() => remove(t)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}