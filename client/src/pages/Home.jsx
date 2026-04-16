import { Link } from "react-router-dom";
import { useAuth } from "../App";

const features = [
  { icon: "✦", title: "Organize Projects", desc: "Group related tasks into focused projects and keep everything in one place." },
  { icon: "◷", title: "Track Due Dates",   desc: "Set deadlines and get a clear picture of what needs your attention today." },
  { icon: "↗", title: "Monitor Progress",  desc: "Visual dashboards show exactly how much you've accomplished at a glance." },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "5rem 1rem 4rem",
        maxWidth: 640,
        margin: "0 auto",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          background: "var(--accent-subtle)", color: "var(--accent)",
          padding: "0.3rem 0.85rem", borderRadius: 99,
          fontSize: 12.5, fontWeight: 600, letterSpacing: "0.04em",
          marginBottom: "1.75rem",
          border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
        }}>
          ✦ Task management, simplified
        </div>

        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3.25rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          marginBottom: "1.25rem",
          color: "var(--text-primary)",
        }}>
          Manage your tasks{" "}
          <span style={{
            color: "var(--accent)",
            background: "linear-gradient(135deg, var(--accent), #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            effortlessly
          </span>
        </h1>

        <p style={{
          fontSize: "1.05rem",
          color: "var(--text-secondary)",
          lineHeight: 1.7,
          marginBottom: "2.25rem",
          maxWidth: 480,
          margin: "0 auto 2.25rem",
        }}>
          TaskFlow helps you organize projects, track progress, and get things done — all in one clean interface.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: "0.95rem", padding: "0.65rem 1.5rem" }}>
                Go to Dashboard →
              </Link>
              <Link to="/tasks/new" className="btn btn-secondary" style={{ fontSize: "0.95rem", padding: "0.65rem 1.5rem" }}>
                + New Task
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: "0.95rem", padding: "0.65rem 1.5rem" }}>
                Get started free →
              </Link>
              <Link to="/tasks" className="btn btn-secondary" style={{ fontSize: "0.95rem", padding: "0.65rem 1.5rem" }}>
                Browse tasks
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)", maxWidth: 720, margin: "0 auto 3rem" }} />

      {/* Features */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1px",
        background: "var(--border)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        maxWidth: 720,
        margin: "0 auto 4rem",
      }}>
        {features.map(f => (
          <div key={f.title} style={{
            background: "var(--bg-card)",
            padding: "1.75rem 1.5rem",
          }}>
            <div style={{
              fontSize: "1.4rem", marginBottom: "0.75rem",
              color: "var(--accent)",
            }}>
              {f.icon}
            </div>
            <p style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.4rem" }}>{f.title}</p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}