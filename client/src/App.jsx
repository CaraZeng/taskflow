import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import ThemeToggle from "./components/ThemeToggle";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TasksList from "./pages/TasksList";
import NewTask from "./pages/NewTask";
import NewProject from "./pages/NewProject";

// ── Auth context ──────────────────────────────────────────────────────────
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

// ── Navbar ────────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">✅ TaskFlow</Link>
        <div className="navbar-links">
          <Link to="/tasks">Tasks</Link>
          {user ? (
            <>
              <Link to="/tasks/new">+ New Task</Link>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                {user.name}
              </span>
              <button className="btn btn-secondary" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign up</Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch("http://localhost:3000/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      <BrowserRouter>
        <Navbar />
        <main className="container" style={{ padding: "2rem 1.25rem" }}>
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/tasks"      element={<TasksList />} />
            <Route path="/tasks/new"  element={<PrivateRoute><NewTask /></PrivateRoute>} />
            <Route path="/projects/new" element={<PrivateRoute><NewProject /></PrivateRoute>} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}