import { useState } from "react";

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send/receive HTTP-only cookie
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      onAuthed({ id: data.id, email: data.email });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <h2 className="subtle-text" style={{ marginTop: 0 }}>{mode === "login" ? "Login" : "Sign Up"}</h2>
      <form onSubmit={submit}>
        <div className="form-row">
          <label className="label">Email</label>
          <input className="neon-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div className="form-row">
          <label className="label">Password</label>
          <input className="neon-input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        {error && <p className="error-text">{error}</p>}
        <div className="row" style={{ marginTop: 10 }}>
          <button className="neon-btn pink" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
          <button className="neon-btn ghost" type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}> 
            {mode === "login" ? "Need an account?" : "Have an account?"}
          </button>
        </div>
      </form>
    </div>
  );
}