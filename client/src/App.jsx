import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import ThemeToggle from "./components/ThemeToggle";
import { apiFetch, setToken, getToken } from "./api";
import Home         from "./pages/Home";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import TasksList    from "./pages/TasksList";
import NewTask      from "./pages/NewTask";
import EditTask     from "./pages/EditTask";
import NewProject   from "./pages/NewProject";
import ProjectsList from "./pages/ProjectsList";
import AdminPanel   from "./pages/AdminPanel";
import Weather      from "./pages/Weather";
import Dashboard    from "./pages/Dashboard";
import CalendarView from "./pages/CalendarView";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span style={{
            background: "var(--accent)", color: "#fff",
            borderRadius: "6px", padding: "0.15rem 0.4rem",
            fontWeight: 800, fontSize: "13px", marginRight: "0.1rem",
          }}>T</span>
          TaskFlow
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/tasks">Tasks</Link>
              <Link to="/calendar">Calendar</Link>
              <Link to="/projects">Projects</Link>
              <Link to="/weather">🌤 Weather</Link>
              {user.role === "admin" && (
                <Link to="/admin" className="btn btn-secondary btn-sm">Admin</Link>
              )}
              <span style={{ color: "var(--text-muted)", fontSize: "12.5px" }}>{user.name}</span>
              <button className="btn btn-secondary btn-sm" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/tasks">Tasks</Link>
              <Link to="/weather">🌤 Weather</Link>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ color: "#fff" }}>Sign up</Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    apiFetch("/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      <BrowserRouter>
        <Navbar />
        <main className="container" style={{ padding: "2rem 1.25rem" }}>
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/register"       element={<Register />} />
            <Route path="/tasks"          element={<TasksList />} />
            <Route path="/weather"        element={<Weather />} />
            <Route path="/calendar"       element={<CalendarView />} />
            <Route path="/tasks/new"      element={<PrivateRoute><NewTask /></PrivateRoute>} />
            <Route path="/tasks/:id/edit" element={<PrivateRoute><EditTask /></PrivateRoute>} />
            <Route path="/projects"       element={<PrivateRoute><ProjectsList /></PrivateRoute>} />
            <Route path="/projects/new"   element={<PrivateRoute><NewProject /></PrivateRoute>} />
            <Route path="/admin"          element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}