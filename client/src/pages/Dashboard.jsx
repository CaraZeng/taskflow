import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 140 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            {label}
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: color || "var(--text-primary)" }}>
            {value ?? "—"}
          </p>
        </div>
        <span style={{ fontSize: 20, opacity: 0.6 }}>{icon}</span>
      </div>
    </div>
  );
}

function DonutChart({ done, inProgress, todo }) {
  const total = done + inProgress + todo || 1;
  const pctDone = done / total;
  const pctInProgress = inProgress / total;

  const r = 48;
  const circ = 2 * Math.PI * r;
  const doneDash   = pctDone * circ;
  const ipDash     = pctInProgress * circ;
  const todoDash   = circ - doneDash - ipDash;

  const doneOffset = 0;
  const ipOffset   = -(doneDash);
  const todoOffset = -(doneDash + ipDash);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
      <svg width={120} height={120} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
        <circle cx={60} cy={60} r={r} fill="none" stroke="var(--border)" strokeWidth={14} />
        {todo > 0 && (
          <circle cx={60} cy={60} r={r} fill="none"
            stroke="var(--border)" strokeWidth={14}
            strokeDasharray={`${todoDash} ${circ - todoDash}`}
            strokeDashoffset={todoOffset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }} />
        )}
        {inProgress > 0 && (
          <circle cx={60} cy={60} r={r} fill="none"
            stroke="var(--warning)" strokeWidth={14}
            strokeDasharray={`${ipDash} ${circ - ipDash}`}
            strokeDashoffset={ipOffset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }} />
        )}
        {done > 0 && (
          <circle cx={60} cy={60} r={r} fill="none"
            stroke="var(--success)" strokeWidth={14}
            strokeDasharray={`${doneDash} ${circ - doneDash}`}
            strokeDashoffset={doneOffset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }} />
        )}
        <text x={60} y={64} textAnchor="middle" fontSize={15} fontWeight={700}
          fill="var(--text-primary)" fontFamily="inherit">
          {total === 1 && done + inProgress + todo === 0 ? "0" : Math.round((done / total) * 100)}%
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {[
          { label: "Done",        value: done,       color: "var(--success)" },
          { label: "In Progress", value: inProgress, color: "var(--warning)" },
          { label: "Todo",        value: todo,        color: "var(--text-muted)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: "var(--text-secondary)", minWidth: 80 }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch(`${API}/stats`, { credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setStats)
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error) return (
    <div className="error-state" role="alert">
      <p>⚠ {error}</p>
    </div>
  );

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <StatCard label="Total Tasks"  value={stats.total}      icon="📋" />
        <StatCard label="Completed"    value={stats.done}       icon="✅" color="var(--success)" />
        <StatCard label="In Progress"  value={stats.inProgress} icon="⚡" color="var(--warning)" />
        <StatCard label="Projects"     value={stats.projects}   icon="📁" />
      </div>

      {/* Progress + Donut */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Overall Progress</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {stats.done} of {stats.total} tasks completed
            </p>
          </div>
          <span style={{
            fontSize: 13, fontWeight: 600, padding: "0.25rem 0.65rem",
            borderRadius: 99, background: "var(--success-subtle)", color: "var(--success)"
          }}>
            {completionRate}% done
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: `linear-gradient(90deg, var(--success) ${completionRate}%, var(--warning) ${completionRate}% ${completionRate + (stats.total > 0 ? stats.inProgress / stats.total * 100 : 0)}%)`,
            width: `${completionRate + (stats.total > 0 ? stats.inProgress / stats.total * 100 : 0)}%`,
            transition: "width 0.5s ease",
          }} />
        </div>

        <DonutChart done={stats.done} inProgress={stats.inProgress} todo={stats.todo} />
      </div>

      {/* Quick actions */}
      <div className="card">
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: "0.75rem" }}>Quick Actions</p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link to="/tasks/new"   className="btn btn-primary btn-sm">+ New Task</Link>
          <Link to="/projects/new" className="btn btn-secondary btn-sm">+ New Project</Link>
          <Link to="/tasks"       className="btn btn-secondary btn-sm">View all tasks</Link>
        </div>
      </div>
    </div>
  );
}