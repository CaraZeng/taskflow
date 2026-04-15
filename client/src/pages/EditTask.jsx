import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function validate(f) {
  const e = {};
  if (!f.title.trim() || f.title.trim().length < 2) e.title = "Title must be at least 2 characters.";
  if (f.dueDate && new Date(f.dueDate) < new Date(new Date().toDateString())) e.dueDate = "Due date cannot be in the past.";
  return e;
}

export default function EditTask() {
  const { id } = useParams();
  const nav = useNavigate();
  const [fields, setFields]   = useState({ title:"", description:"", status:"todo", dueDate:"" });
  const [touched, setTouched] = useState({});
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetch(`${API}/tasks/${id}`, { credentials:"include" })
      .then(r => r.json())
      .then(task => {
        setFields({
          title: task.title,
          description: task.description || "",
          status: task.status,
          dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        });
      })
      .catch(() => setServerError("Failed to load task."))
      .finally(() => setFetchLoading(false));
  }, [id]);

  const errors = validate(fields);
  const set = k => e => setFields(f => ({ ...f, [k]: e.target.value }));
  const blur = k => () => setTouched(t => ({ ...t, [k]: true }));

  const handleSubmit = async e => {
    e.preventDefault();
    setTouched({ title:true, dueDate:true });
    if (Object.keys(errors).length) return;
    setSaving(true);
    setServerError("");
    try {
      const res = await fetch(`${API}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type":"application/json" },
        credentials: "include",
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) return setServerError(data.error || "Failed to update task.");
      nav("/tasks");
    } catch { setServerError("Network error."); }
    finally { setSaving(false); }
  };

  if (fetchLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth:560 }}>
      <h1 style={{ fontSize:"1.5rem", marginBottom:"1.5rem" }}>Edit Task</h1>
      {serverError && <p className="field-error" style={{ marginBottom:"1rem" }}>{serverError}</p>}
      <form onSubmit={handleSubmit} noValidate className="card">
        <div className="form-group">
          <label htmlFor="title">Task title *</label>
          <input id="title" type="text" value={fields.title}
            onChange={set("title")} onBlur={blur("title")}
            className={touched.title && errors.title ? "error" : ""} />
          {touched.title && errors.title && <span className="field-error">{errors.title}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={3} value={fields.description} onChange={set("description")} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" value={fields.status} onChange={set("status")}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
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
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
        </div>
      </form>
    </div>
  );
}