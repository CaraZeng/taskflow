import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProjects = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch("/projects");
      if (!res.ok) throw new Error("Failed to load projects.");
      setProjects(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    const prev = [...projects];
    setProjects(p => p.filter(x => x.id !== id));
    try {
      const res = await apiFetch(`/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Project deleted.", "success");
    } catch {
      setProjects(prev);
      showToast("Failed to delete project.", "error");
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error) return (
    <div className="error-state" role="alert">
      <p>⚠ {error}</p>
      <button className="btn btn-secondary" onClick={fetchProjects}>Try Again</button>
    </div>
  );

  return (
    <div>
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
          {toast.msg}
          <button onClick={() => setToast(null)} aria-label="Dismiss">×</button>
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <h1 style={{ fontSize:"1.3rem", fontWeight:600 }}>My Projects</h1>
        <Link to="/projects/new" className="btn btn-primary">+ New Project</Link>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize:"2rem" }}>📁</p>
          <p>No projects yet.</p>
          <Link to="/projects/new" className="btn btn-primary" style={{ marginTop:"0.5rem" }}>Create your first project</Link>
        </div>
      ) : (
        <div style={{ display:"grid", gap:"0.75rem" }}>
          {projects.map(p => (
            <article key={p.id} className="card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"0.75rem" }}>
              <div>
                <strong>{p.title}</strong>
                {p.description && <p style={{ color:"var(--text-secondary)", fontSize:"0.9rem", marginTop:"0.2rem" }}>{p.description}</p>}
                <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", marginTop:"0.2rem" }}>
                  {p._count?.tasks ?? 0} task{p._count?.tasks !== 1 ? "s" : ""}
                </p>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}