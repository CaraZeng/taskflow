import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewProject() {
  const nav = useNavigate();
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (title.trim().length < 2) return setError("Title must be at least 2 characters.");

    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3000/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Failed to create project.");
      nav("/tasks/new");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>New Project</h1>
      <form onSubmit={handleSubmit} className="card">
        {error && <p className="field-error" style={{ marginBottom: "1rem" }}>{error}</p>}
        <div className="form-group">
          <label htmlFor="title">Project name *</label>
          <input id="title" type="text" placeholder="e.g. Website Redesign"
            value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="desc">Description</label>
          <textarea id="desc" rows={3} placeholder="Optional…"
            value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="button" className="btn btn-secondary" onClick={() => nav(-1)}>Cancel</button>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Creating…" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}