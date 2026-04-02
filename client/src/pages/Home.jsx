import { Link } from "react-router-dom";
import { useAuth } from "../App";

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", paddingTop: "3rem" }}>
      <h1 style={{ fontSize: "2.4rem", fontWeight: 800, marginBottom: "1rem" }}>
        Manage your tasks <span style={{ color: "var(--accent)" }}>effortlessly</span>
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "2rem" }}>
        TaskFlow helps you organize projects and tasks, track progress, and get things done.
      </p>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        {user ? (
          <Link to="/tasks/new" className="btn btn-primary" style={{ fontSize: "1rem" }}>
            + Create a Task
          </Link>
        ) : (
          <>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: "1rem" }}>
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ fontSize: "1rem" }}>
              Log In
            </Link>
          </>
        )}
        <Link to="/tasks" className="btn btn-secondary" style={{ fontSize: "1rem" }}>
          Browse Tasks
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem", marginTop: "3rem" }}>
        {[
          { icon: "📋", title: "Organize Projects", desc: "Group related tasks into projects." },
          { icon: "📅", title: "Track Due Dates", desc: "Never miss a deadline again." },
          { icon: "⚡", title: "Fast & Minimal", desc: "No clutter, just productivity." },
        ].map(f => (
          <div key={f.title} className="card" style={{ textAlign: "left" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>{f.icon}</div>
            <strong>{f.title}</strong>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}