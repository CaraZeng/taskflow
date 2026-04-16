import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { apiFetch } from "../api";

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CalendarView() {
  const { user } = useAuth();
  const today = new Date();
  const [year, setYear]         = useState(today.getFullYear());
  const [month, setMonth]       = useState(today.getMonth());
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ title:"", projectId:"", status:"todo" });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    apiFetch("/tasks?limit=100").then(r => r.json()).then(d => setTasks(d.tasks || []));
    if (user) {
      apiFetch("/projects").then(r => r.json()).then(d => setProjects(Array.isArray(d) ? d : []));
    }
  }, [user]);

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const dateStr = (d) => d ? `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}` : null;
  const tasksForDay = (d) => { const ds = dateStr(d); return tasks.filter(t => t.dueDate?.startsWith(ds)); };
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const openModal = (d) => {
    if (!user) return;
    setSelected(dateStr(d));
    setForm({ title:"", projectId: projects[0]?.id || "", status:"todo" });
    setError(""); setModal(true);
  };

  const handleDeleteTask = async (taskId) => {
  const prev = [...tasks];
  setTasks(t => t.filter(x => x.id !== taskId));
  try {
    const res = await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok) throw new Error();
    showToast("Task deleted.", "success");
  } catch {
    setTasks(prev);
    showToast("Failed to delete task.", "error");
  }
};

  const handleCreate = async () => {
    if (!form.title.trim() || form.title.trim().length < 2) return setError("Title must be at least 2 characters.");
    if (!form.projectId) return setError("Please select a project.");
    setSaving(true);
    try {
      const res = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ title: form.title.trim(), status: form.status, projectId: Number(form.projectId), dueDate: selected }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Failed to create task.");
      setTasks(t => [...t, data]);
      setModal(false);
      showToast("Task created!");
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth:900 }}>
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
          {toast.msg}
          <button onClick={() => setToast(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <div>
          <h1 style={{ fontSize:"1.3rem", fontWeight:600, letterSpacing:"-0.02em" }}>Calendar</h1>
          <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
            {user ? "Click any day to create a task" : "Log in to create tasks"}
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
          <button className="btn btn-secondary btn-sm" onClick={prevMonth}>←</button>
          <span style={{ fontWeight:600, fontSize:"1rem", minWidth:160, textAlign:"center" }}>{MONTHS[month]} {year}</span>
          <button className="btn btn-secondary btn-sm" onClick={nextMonth}>→</button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}>Today</button>
        </div>
      </div>

      <div style={{ border:"1px solid var(--border)", borderRadius:12, overflow:"hidden", background:"var(--bg-card)" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:"var(--bg-secondary)" }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding:"0.5rem", textAlign:"center", fontSize:11.5, fontWeight:600, color:"var(--text-muted)", letterSpacing:"0.05em", textTransform:"uppercase", borderBottom:"1px solid var(--border)" }}>{d}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {cells.map((d, i) => {
            const dayTasks = d ? tasksForDay(d) : [];
            const todayCell = d && isToday(d);
            return (
              <div key={i} onClick={() => d && user && openModal(d)}
                style={{
                  minHeight:90, padding:"0.4rem 0.5rem",
                  borderRight: (i+1)%7 !== 0 ? "1px solid var(--border)" : "none",
                  borderBottom: i < cells.length-7 ? "1px solid var(--border)" : "none",
                  background: todayCell ? "color-mix(in srgb, var(--accent) 8%, var(--bg-card))" : "var(--bg-card)",
                  cursor: d && user ? "pointer" : "default",
                  transition:"background 0.1s",
                }}
                onMouseEnter={e => { if (d && user) e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = todayCell ? "color-mix(in srgb, var(--accent) 8%, var(--bg-card))" : "var(--bg-card)"; }}
              >
                {d && (
                  <>
                    <span style={{
                      display:"inline-flex", alignItems:"center", justifyContent:"center",
                      width:24, height:24, borderRadius:"50%", fontSize:12.5,
                      fontWeight: todayCell ? 700 : 400,
                      background: todayCell ? "var(--accent)" : "transparent",
                      color: todayCell ? "#fff" : "var(--text-primary)",
                      marginBottom:4,
                    }}>{d}</span>
                    <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                    {dayTasks.slice(0,3).map(t => (
                    <div key={t.id}
                        onClick={e => { e.stopPropagation(); if (window.confirm(`Delete "${t.title}"?`)) handleDeleteTask(t.id); }}
                        style={{
                        fontSize:11, padding:"1px 5px", borderRadius:3,
                        background: t.status === "done" ? "var(--success-subtle)" : t.status === "in-progress" ? "#fef3c7" : "var(--accent-subtle)",
                        color: t.status === "done" ? "var(--success)" : t.status === "in-progress" ? "#92400e" : "var(--accent)",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:500,
                        cursor:"pointer",
                        }}
                        title="Click to delete"
                    >{t.title}</div>
                    ))}
                      {dayTasks.length > 3 && <span style={{ fontSize:10.5, color:"var(--text-muted)", paddingLeft:3 }}>+{dayTasks.length-3} more</span>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {modal && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="card" style={{ width:"100%", maxWidth:420 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
              <div>
                <h2 style={{ fontSize:"1rem", fontWeight:600 }}>New Task</h2>
                <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{selected}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            {error && <p className="field-error" style={{ marginBottom:"0.75rem" }}>{error}</p>}
            <div className="form-group">
              <label htmlFor="cal-title">Task title *</label>
              <input id="cal-title" type="text" placeholder="e.g. Study for exam"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
            </div>
            <div className="form-group">
              <label htmlFor="cal-project">Project *</label>
              <select id="cal-project" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                <option value="">— Select a project —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="cal-status">Status</label>
              <select id="cal-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="todo">○ Todo</option>
                <option value="in-progress">◑ In Progress</option>
                <option value="done">● Done</option>
              </select>
            </div>
            <div style={{ display:"flex", gap:"0.5rem", justifyContent:"flex-end", marginTop:"0.5rem" }}>
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? "Creating…" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}