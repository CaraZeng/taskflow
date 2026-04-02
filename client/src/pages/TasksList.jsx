import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const LIMIT = 8;

export default function TasksList() {
  const [tasks, setTasks]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [offset, setOffset]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchTasks = useCallback(async (off = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:3000/tasks?limit=${LIMIT}&offset=${off}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to load tasks.");
      const data = await res.json();
      setTasks(data.tasks);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(offset); }, [fetchTasks, offset]);

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  // ── Loading ──
  if (loading) return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <p style={{ marginTop: "0.75rem" }}>Loading tasks…</p>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className="error-state">
      <p>⚠️ {error}</p>
      <button className="btn btn-secondary" onClick={() => fetchTasks(offset)}>Try Again</button>
    </div>
  );

  // ── Empty ──
  if (tasks.length === 0) return (
    <div className="empty-state">
      <p style={{ fontSize: "2rem" }}>📭</p>
      <p>No tasks yet.</p>
      <Link to="/tasks/new" className="btn btn-primary">Create your first task</Link>
    </div>
  );

  // ── Success ──
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem" }}>All Tasks <span style={{ color: "var(--text-secondary)", fontWeight: 400, fontSize: "1rem" }}>({total})</span></h1>
        <Link to="/tasks/new" className="btn btn-primary">+ New Task</Link>
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {tasks.map(task => (
          <div key={task.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <strong>{task.title}</strong>
              {task.project && (
                <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  📁 {task.project.title}
                </span>
              )}
              {task.description && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>{task.description}</p>
              )}
              {task.dueDate && (
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  📅 {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <span className={`badge badge-${task.status}`}>{task.status}</span>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-secondary" disabled={currentPage === 1}
            onClick={() => setOffset(o => Math.max(0, o - LIMIT))}>
            ← Prev
          </button>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button className="btn btn-secondary" disabled={currentPage === totalPages}
            onClick={() => setOffset(o => o + LIMIT)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}