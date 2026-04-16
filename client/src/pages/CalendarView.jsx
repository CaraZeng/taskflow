import { useState, useEffect, useRef } from "react";
import { useAuth } from "../App";
import { apiFetch } from "../api";

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_COLOR = {
  "todo":        { bg:"#e0f2fe", color:"#0369a1", dot:"#0ea5e9" },
  "in-progress": { bg:"#fef9c3", color:"#92400e", dot:"#f59e0b" },
  "done":        { bg:"#dcfce7", color:"#166534", dot:"#22c55e" },
};

export default function CalendarView() {
  const { user } = useAuth();
  const today = new Date();
  const [year, setYear]         = useState(today.getFullYear());
  const [month, setMonth]       = useState(today.getMonth());
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);

  // Create modal
  const [createModal, setCreateModal] = useState(false);
  const [selected, setSelected]       = useState(null);
  const [form, setForm]               = useState({ title:"", projectId:"", status:"todo" });
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState("");

  // Detail panel
  const [detailTask, setDetailTask] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  // Drag
  const dragTaskId = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    apiFetch("/tasks?limit=200").then(r => r.json()).then(d => setTasks(d.tasks || []));
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

  const openCreate = (d) => {
    if (!user) return;
    setSelected(dateStr(d));
    setForm({ title:"", projectId: projects[0]?.id || "", status:"todo" });
    setFormError(""); setCreateModal(true);
  };

  const handleCreate = async () => {
    if (!form.title.trim() || form.title.trim().length < 2) return setFormError("Title must be at least 2 characters.");
    if (!form.projectId) return setFormError("Please select a project.");
    setSaving(true);
    try {
      const res = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ title: form.title.trim(), status: form.status, projectId: Number(form.projectId), dueDate: selected }),
      });
      const data = await res.json();
      if (!res.ok) return setFormError(data.error || "Failed.");
      setTasks(t => [...t, data]);
      setCreateModal(false);
      showToast("Task created!");
    } catch { setFormError("Network error."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (taskId) => {
    const prev = [...tasks];
    setTasks(t => t.filter(x => x.id !== taskId));
    setDetailTask(null);
    try {
      const res = await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Task deleted.", "success");
    } catch {
      setTasks(prev);
      showToast("Failed to delete.", "error");
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    const prev = [...tasks];
    const updated = { ...task, status: newStatus };
    setTasks(t => t.map(x => x.id === task.id ? updated : x));
    setDetailTask(updated);
    try {
      const res = await apiFetch(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ title: task.title, description: task.description, status: newStatus, dueDate: task.dueDate }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setTasks(prev);
      setDetailTask(task);
      showToast("Failed to update status.", "error");
    }
  };

  // Drag handlers
  const handleDragStart = (e, taskId) => {
    dragTaskId.current = taskId;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e, d) => {
    e.preventDefault();
    const taskId = dragTaskId.current;
    if (!taskId || !d) return;
    const newDate = dateStr(d);
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.dueDate?.startsWith(newDate)) return;
    const prev = [...tasks];
    setTasks(t => t.map(x => x.id === taskId ? { ...x, dueDate: newDate + "T00:00:00.000Z" } : x));
    try {
      const res = await apiFetch(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ title: task.title, description: task.description, status: task.status, dueDate: newDate }),
      });
      if (!res.ok) throw new Error();
      showToast("Task moved!", "success");
    } catch {
      setTasks(prev);
      showToast("Failed to move task.", "error");
    }
    dragTaskId.current = null;
  };

  return (
    <div style={{ maxWidth:960 }}>
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
          {toast.msg}
          <button onClick={() => setToast(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <div>
          <h1 style={{ fontSize:"1.3rem", fontWeight:600, letterSpacing:"-0.02em" }}>Calendar</h1>
          <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
            {user ? "Click a day to add · Click a task to edit · Drag to reschedule" : "Log in to manage tasks"}
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap" }}>
          {/* Legend */}
          <div style={{ display:"flex", gap:"0.5rem", marginRight:"0.5rem" }}>
            {Object.entries(STATUS_COLOR).map(([s, c]) => (
              <span key={s} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"var(--text-muted)" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:c.dot, display:"inline-block" }} />
                {s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase()+s.slice(1)}
              </span>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={prevMonth}>←</button>
          <span style={{ fontWeight:600, fontSize:"1rem", minWidth:160, textAlign:"center" }}>{MONTHS[month]} {year}</span>
          <button className="btn btn-secondary btn-sm" onClick={nextMonth}>→</button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}>Today</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ border:"1px solid var(--border)", borderRadius:12, overflow:"hidden", background:"var(--bg-card)" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:"var(--bg-secondary)" }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding:"0.5rem", textAlign:"center", fontSize:11.5, fontWeight:600, color:"var(--text-muted)", letterSpacing:"0.05em", textTransform:"uppercase", borderBottom:"1px solid var(--border)" }}>{d}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {cells.map((d, i) => {
            const dayTasks  = d ? tasksForDay(d) : [];
            const todayCell = d && isToday(d);
            return (
              <div key={i}
                onClick={() => d && user && openCreate(d)}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.background="var(--bg-hover)"; }}
                onDragLeave={e => { e.currentTarget.style.background = todayCell ? "color-mix(in srgb, var(--accent) 8%, var(--bg-card))" : "var(--bg-card)"; }}
                onDrop={e => { e.currentTarget.style.background = todayCell ? "color-mix(in srgb, var(--accent) 8%, var(--bg-card))" : "var(--bg-card)"; handleDrop(e, d); }}
                style={{
                  minHeight:90, padding:"0.4rem 0.5rem",
                  borderRight: (i+1)%7!==0 ? "1px solid var(--border)" : "none",
                  borderBottom: i < cells.length-7 ? "1px solid var(--border)" : "none",
                  background: todayCell ? "color-mix(in srgb, var(--accent) 8%, var(--bg-card))" : "var(--bg-card)",
                  cursor: d && user ? "pointer" : "default",
                  transition:"background 0.1s",
                }}
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
                      {dayTasks.slice(0,3).map(t => {
                        const sc = STATUS_COLOR[t.status] || STATUS_COLOR.todo;
                        return (
                          <div key={t.id}
                            draggable
                            onDragStart={e => { e.stopPropagation(); handleDragStart(e, t.id); }}
                            onClick={e => { e.stopPropagation(); setDetailTask(t); }}
                            style={{
                              fontSize:11, padding:"2px 6px", borderRadius:3,
                              background: sc.bg, color: sc.color,
                              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                              fontWeight:500, cursor:"grab",
                              display:"flex", alignItems:"center", gap:4,
                            }}
                          >
                            <span style={{ width:6, height:6, borderRadius:"50%", background:sc.dot, flexShrink:0 }} />
                            {t.title}
                          </div>
                        );
                      })}
                      {dayTasks.length > 3 && <span style={{ fontSize:10.5, color:"var(--text-muted)", paddingLeft:3 }}>+{dayTasks.length-3} more</span>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      {detailTask && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
          onClick={e => { if (e.target === e.currentTarget) setDetailTask(null); }}>
          <div className="card" style={{ width:"100%", maxWidth:400 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
              <div>
                <h2 style={{ fontSize:"1rem", fontWeight:600 }}>{detailTask.title}</h2>
                {detailTask.dueDate && (
                  <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                    📅 {new Date(detailTask.dueDate).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })}
                  </p>
                )}
                {detailTask.project && (
                  <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>📁 {detailTask.project.title}</p>
                )}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetailTask(null)}>✕</button>
            </div>

            {detailTask.description && (
              <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:"1rem", padding:"0.5rem 0.75rem", background:"var(--bg-secondary)", borderRadius:6 }}>
                {detailTask.description}
              </p>
            )}

            <div className="form-group">
              <label>Status</label>
              <div style={{ display:"flex", gap:"0.5rem" }}>
                {Object.entries(STATUS_COLOR).map(([s, c]) => (
                  <button key={s}
                    onClick={() => handleStatusChange(detailTask, s)}
                    style={{
                      flex:1, padding:"0.4rem 0.5rem", borderRadius:6, border:"2px solid",
                      borderColor: detailTask.status === s ? c.dot : "transparent",
                      background: c.bg, color: c.color,
                      fontSize:11, fontWeight:600, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:4,
                    }}
                  >
                    <span style={{ width:7, height:7, borderRadius:"50%", background:c.dot }} />
                    {s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase()+s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"1rem" }}>
              <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm(`Delete "${detailTask.title}"?`)) handleDelete(detailTask.id); }}>
                🗑 Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModal && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
          onClick={e => { if (e.target === e.currentTarget) setCreateModal(false); }}>
          <div className="card" style={{ width:"100%", maxWidth:420 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
              <div>
                <h2 style={{ fontSize:"1rem", fontWeight:600 }}>New Task</h2>
                <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{selected}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setCreateModal(false)}>✕</button>
            </div>
            {formError && <p className="field-error" style={{ marginBottom:"0.75rem" }}>{formError}</p>}
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
              <label>Status</label>
              <div style={{ display:"flex", gap:"0.5rem" }}>
                {Object.entries(STATUS_COLOR).map(([s, c]) => (
                  <button key={s} type="button"
                    onClick={() => setForm(f => ({ ...f, status: s }))}
                    style={{
                      flex:1, padding:"0.4rem 0.5rem", borderRadius:6, border:"2px solid",
                      borderColor: form.status === s ? c.dot : "transparent",
                      background: c.bg, color: c.color,
                      fontSize:11, fontWeight:600, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:4,
                    }}
                  >
                    <span style={{ width:7, height:7, borderRadius:"50%", background:c.dot }} />
                    {s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase()+s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", gap:"0.5rem", justifyContent:"flex-end", marginTop:"0.75rem" }}>
              <button className="btn btn-secondary" onClick={() => setCreateModal(false)}>Cancel</button>
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