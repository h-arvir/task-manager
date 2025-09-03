import { useState } from "react";
import "./App.css";
import Auth from "./components/Auth.jsx";
import TaskList from "./components/TaskList.jsx";

function App() {
  const [user, setUser] = useState(null);
  return (
    <div className="app-shell">
      <h1 className="neon-title">NEON TASK MANAGER</h1>
      <div className="neon-divider" />
      <div className="content">
        {user ? (
          <TaskList user={user} onLogout={() => setUser(null)} />
        ) : (
          <div className="neon-card card-pad auth-card">
            <Auth onAuthed={setUser} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
