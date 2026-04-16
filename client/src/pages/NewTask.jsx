import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

function validate(f) {
  const e = {};
  if (!f.title.trim() || f.title.trim().length < 2) e.title = "Title must be at least 2 characters.";
  if (!f.projectId) e.projectId = "Please select a project.";
  if (f.dueDate && new Date(f.dueDate) < new Date(new Date().toDateString())) e.dueDate = "Due date cannot be in the past.";
  return e;
}

export default function NewTask() {
  const nav = useNavigate();
  const [fields, setFields]     = useState({ title:"", description:"", status:"todo", dueDate:"", projectId:"" });
  const [touched, setTouched]   = useState({});
  const [projects, setProjects] = useState([]);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [projLoading, setProjLoading] = useState(true);

  useEffect(() => {
    apiFetch("/projects")
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .finally(() => setProjLoading(false));
  }, []);

  const errors = validate(fields);
  const set  = k => e => setFields(f => ({ ...f, [k]: e.target.value }));
  const blur = k => () => setTouched(t => ({ ...t, [k]: true }));

  const handleSubmit = async e => {
    e.preventDefault();
    setTouched({ title:true, projectId:true, dueDate:true });
    if (Object.keys(errors).length) return;
    setLoading(true); setServerError("");
    try {
      const res = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ ...fields, projectId: Number(fields.projectId) }),
      });
      const data = await res.json();
      if (!res.ok) return setServerError(data.error || "Failed to create task.");
      nav("/tasks");
    } catch { setServerError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:560 }}>
      <h1 style={{ fontSize:"1.3rem", fontWeight:600, marginBottom:"1.5rem" }}>New Task</h1>
      {serverError && <p className="field-error" style={{ marginBottom:"1rem" }}>{serverError}</p>}
      <form onSubmit={handleSubmit} noValidate className="card">
        <div className="form-group">
          <label htmlFor="title">Task title *</label>
          <input id="title" type="text" placeholder="e.g. Write project proposal"
            value={fields.title} onChange={set("title")} onBlur={blur("title")}
            className={touched.title && errors.title ? "error" : ""} />
          {touched.title && errors.title && <span className="field-error">{errors.title}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={3} placeholder="Optional details…"
            value={fields.description} onChange={set("description")} />
        </div>
        <div className="form-group">
          <label htmlFor="projectId">Project *</label>
          {projLoading ? (
            <p style={{ color:"var(--text-muted)", fontSize:"0.9rem" }}>Loading projects…</p>
          ) : (
            <select id="projectId" value={fields.projectId}
              onChange={set("projectId")} onBlur={blur("projectId")}
              className={touched.projectId && errors.projectId ? "error" : ""}>
              <option value="">— Select a project —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          )}
          {touched.projectId && errors.projectId && <span className="field-error">{errors.projectId}</span>}
          {!projLoading && projects.length === 0 && (
            <span className="field-error">
              No projects yet.{" "}
              <a href="/projects/new">Create one first →</a>
            </span>
          )}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" value={fields.status} onChange={set("status")}>
              <option value="todo">○ Todo</option>
              <option value="in-progress">◑ In Progress</option>
              <option value="done">● Done</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dueDate">Due date</label>
            <input id="dueDate" type="date" value={fields.dueDate}
              onChange={set("dueDate")} onBlur={blur("dueDate")}
              className={touched.dueDate && errors.dueDate ? "error" : ""} />
            {touched.dueDate && errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:"0.75rem", marginTop:"0.5rem" }}>
          <button type="button" className="btn btn-secondary" onClick={() => nav("/tasks")}>Cancel</button>
          <button className="btn btn-primary" disabled={loading}>{loading ? "Creating…" : "Create Task"}</button>
        </div>
      </form>
    </div>
  );
}