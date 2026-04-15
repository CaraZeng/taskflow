import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const LIMIT = 8;

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function TasksList() {
  const { user } = useAuth();
  const [tasks, setTasks]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [offset, setOffset]       = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("");
  const [toast, setToast]         = useState(null); // { msg, type }

  const debouncedSearch = useDebouncedValue(search, 300);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = useCallback(async (off, srch, stat) => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams({ limit: LIMIT, offset: off });
      if (srch) p.set("search", srch);
      if (stat) p.set("status", stat);
      const res = await fetch(`${API}/tasks?${p}`, { credentials: "include" });
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

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setOffset(0);
    fetchTasks(0, debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter, fetchTasks]);

  // Fetch when page changes (but not when search/filter trigger the reset above)
  useEffect(() => {
    if (offset > 0) fetchTasks(offset, debouncedSearch, statusFilter);
  }, [offset]); // eslint-disable-line

  // Optimistic delete
  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    const prev  = [...tasks];
    const prevT = total;
    setTasks(t => t.filter(x => x.id !== taskId));
    setTotal(n => n - 1);
    try {
      const res = await fetch(`${API}/tasks/${taskId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      showToast("Task deleted.", "success");
    } catch {
      setTasks(prev);
      setTotal(prevT);
      showToast("Failed to delete task. Please try again.", "error");
    }
  };

  const totalPages  = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;
  const canEdit     = (task) => user && (user.role === "admin" || task.project?.userId === user.id);

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
          {toast.msg}
          <button onClick={() => setToast(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <h1 style={{ fontSize:"1.5rem" }}>
          All Tasks{" "}
          {!loading && <span style={{ color:"var(--text-secondary)", fontWeight:400, fontSize:"1rem" }}>({total})</span>}
        </h1>
        {user && <Link to="/tasks/new" className="btn btn-primary">+ New Task</Link>}
      </div>

      {/* Search + Filter */}
      <div className="search-bar" role="search">
        <input
          type="search"
          placeholder="Search tasks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search tasks by title"
        />
        <select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="spinner-wrap" aria-busy="true" aria-label="Loading tasks">
          <div className="spinner" />
          <p style={{ marginTop:"0.75rem" }}>Loading tasks…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="error-state" role="alert">
          <p>⚠️ {error}</p>
          <button className="btn btn-secondary" onClick={() => fetchTasks(offset, debouncedSearch, statusFilter)}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tasks.length === 0 && (
        <div className="empty-state">
          <p style={{ fontSize:"2rem" }}>📭</p>
          <p>{search || statusFilter ? "No tasks match your search." : "No tasks yet."}</p>
          {user && !search && !statusFilter && (
            <Link to="/tasks/new" className="btn btn-primary" style={{ marginTop:"0.5rem" }}>
              Create your first task
            </Link>
          )}
        </div>
      )}

      {/* Task list */}
      {!loading && !error && tasks.length > 0 && (
        <div style={{ display:"grid", gap:"0.75rem" }}>
          {tasks.map(task => (
            <article key={task.id} className="card task-card">
              <div style={{ flex:1 }}>
                <strong>{task.title}</strong>
                {task.project && (
                  <span style={{ marginLeft:"0.5rem", fontSize:"0.8rem", color:"var(--text-secondary)" }}>
                    📁 {task.project.title}
                  </span>
                )}
                {task.description && (
                  <p style={{ color:"var(--text-secondary)", fontSize:"0.9rem", marginTop:"0.25rem" }}>
                    {task.description}
                  </p>
                )}
                {task.dueDate && (
                  <p style={{ fontSize:"0.8rem", color:"var(--text-secondary)", marginTop:"0.25rem" }}>
                    📅 {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexShrink:0 }}>
                <span className={`badge badge-${task.status}`}>{task.status}</span>
                {canEdit(task) && (
                  <>
                    <Link to={`/tasks/${task.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button className="btn btn-secondary" disabled={currentPage === 1}
            onClick={() => setOffset(o => Math.max(0, o - LIMIT))} aria-label="Previous page">
            ← Prev
          </button>
          <span style={{ color:"var(--text-secondary)", fontSize:"0.9rem" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button className="btn btn-secondary" disabled={currentPage === totalPages}
            onClick={() => setOffset(o => o + LIMIT)} aria-label="Next page">
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}