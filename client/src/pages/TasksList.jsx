import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const LIMIT = 10;

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const STATUS_ICON = { todo: "○", "in-progress": "◑", done: "●" };
const STATUS_LABEL = { todo: "Todo", "in-progress": "In Progress", done: "Done" };

export default function TasksList() {
  const { user } = useAuth();
  const [tasks, setTasks]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [offset, setOffset]       = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("");
  const [toast, setToast]         = useState(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = useCallback(async (off, srch, stat) => {
    setLoading(true); setError(null);
    try {
      const p = new URLSearchParams({ limit: LIMIT, offset: off });
      if (srch) p.set("search", srch);
      if (stat) p.set("status", stat);
      const res = await fetch(`${API}/tasks?${p}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load tasks.");
      const data = await res.json();
      setTasks(data.tasks);
      setTotal(data.total);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setOffset(0);
    fetchTasks(0, debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter, fetchTasks]);

  useEffect(() => {
    if (offset > 0) fetchTasks(offset, debouncedSearch, statusFilter);
  }, [offset]); // eslint-disable-line

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    const prev = [...tasks];
    const prevT = total;
    setTasks(t => t.filter(x => x.id !== taskId));
    setTotal(n => n - 1);
    try {
      const res = await fetch(`${API}/tasks/${taskId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      showToast("Task deleted.", "success");
    } catch {
      setTasks(prev); setTotal(prevT);
      showToast("Failed to delete task.", "error");
    }
  };

  const totalPages  = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;
  const canEdit     = (task) => user && (user.role === "admin" || task.project?.userId === user.id);

  return (
    <div>
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
          {toast.msg}
          <button onClick={() => setToast(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <div>
          <h1 style={{ fontSize:"1.3rem", fontWeight:600, letterSpacing:"-0.02em" }}>Tasks</h1>
          {!loading && (
            <p style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"2px" }}>
              {total} task{total !== 1 ? "s" : ""}
              {(search || statusFilter) ? " matching filters" : " total"}
            </p>
          )}
        </div>
        {user && (
          <Link to="/tasks/new" className="btn btn-primary">
            <span style={{ fontSize:"16px", lineHeight:1 }}>+</span> New Task
          </Link>
        )}
      </div>

      {/* Search + Filter */}
      <div className="search-bar" role="search">
        <input
          type="search"
          placeholder="Search tasks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search tasks"
          style={{ fontSize:"13px" }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          aria-label="Filter by status"
          style={{ fontSize:"13px" }}
        >
          <option value="">All statuses</option>
          <option value="todo">○ Todo</option>
          <option value="in-progress">◑ In Progress</option>
          <option value="done">● Done</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="spinner-wrap" aria-busy="true">
          <div className="spinner" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="error-state" role="alert">
          <p>⚠ {error}</p>
          <button className="btn btn-secondary" onClick={() => fetchTasks(offset, debouncedSearch, statusFilter)}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tasks.length === 0 && (
        <div className="empty-state">
          <p style={{ fontSize:"28px", marginBottom:"0.5rem" }}>○</p>
          <p style={{ fontWeight:500, color:"var(--text-secondary)" }}>
            {search || statusFilter ? "No tasks match your search." : "No tasks yet."}
          </p>
          {user && !search && !statusFilter && (
            <Link to="/tasks/new" className="btn btn-primary" style={{ marginTop:"0.75rem" }}>
              Create your first task
            </Link>
          )}
        </div>
      )}

      {/* Task list — Linear style */}
      {!loading && !error && tasks.length > 0 && (
        <div className="task-list">
          {tasks.map(task => (
            <article key={task.id} className="task-row" style={{ gap:"0.75rem" }}>

              {/* Status icon */}
              <span
                style={{
                  fontSize:"14px", flexShrink:0,
                  color: task.status === "done" ? "var(--success)"
                       : task.status === "in-progress" ? "var(--warning)"
                       : "var(--text-muted)",
                }}
                title={STATUS_LABEL[task.status]}
              >
                {STATUS_ICON[task.status]}
              </span>

              {/* Title + meta */}
              <div style={{ flex:1, minWidth:0 }}>
                <span style={{
                  fontWeight: 450,
                  fontSize: "13.5px",
                  color: task.status === "done" ? "var(--text-muted)" : "var(--text-primary)",
                  textDecoration: task.status === "done" ? "line-through" : "none",
                  display: "block",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {task.title}
                </span>
                <div style={{ display:"flex", gap:"0.75rem", marginTop:"2px", flexWrap:"wrap" }}>
                  {task.project && (
                    <span style={{ fontSize:"11.5px", color:"var(--text-muted)" }}>
                      {task.project.title}
                    </span>
                  )}
                  {task.dueDate && (
                    <span style={{
                      fontSize:"11.5px",
                      color: new Date(task.dueDate) < new Date() && task.status !== "done"
                        ? "var(--danger)" : "var(--text-muted)",
                    }}>
                      {new Date(task.dueDate).toLocaleDateString("en-US", { month:"short", day:"numeric" })}
                    </span>
                  )}
                </div>
              </div>

              {/* Badge */}
              <span className={`badge badge-${task.status}`} style={{ flexShrink:0 }}>
                {STATUS_LABEL[task.status]}
              </span>

              {/* Actions */}
              {canEdit(task) && (
                <div style={{ display:"flex", gap:"0.25rem", flexShrink:0, opacity:0, transition:"opacity 0.15s" }}
                  className="task-actions">
                  <Link to={`/tasks/${task.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(task.id)}
                    style={{ color:"var(--danger)" }}>
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button className="btn btn-secondary btn-sm" disabled={currentPage === 1}
            onClick={() => setOffset(o => Math.max(0, o - LIMIT))}>← Prev</button>
          <span>{currentPage} / {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={currentPage === totalPages}
            onClick={() => setOffset(o => o + LIMIT)}>Next →</button>
        </nav>
      )}

      {/* Hover reveal for task actions */}
      <style>{`
        .task-row:hover .task-actions { opacity: 1 !important; }
      `}</style>
    </div>
  );
}