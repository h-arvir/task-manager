import { useState } from "react";
import "./App.css";
import Auth from "./components/Auth.jsx";
import TaskList from "./components/TaskList.jsx";

function App() {
  const [user, setUser] = useState(null);
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 16 }}>
      <h1>Task Manager</h1>
      {user ? (
        <TaskList user={user} onLogout={() => setUser(null)} />
      ) : (
        <Auth onAuthed={setUser} />
      )}
    </div>
  );
}

export default App;
