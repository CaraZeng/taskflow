import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminPanel() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [toast, setToast]     = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/admin/users`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load users.");
      setUsers(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    const prev = [...users];
    setUsers(u => u.map(x => x.id === user.id ? { ...x, role: newRole } : x));
    try {
      const res = await fetch(`${API}/admin/users/${user.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      showToast(`${user.name} is now ${newRole}.`);
    } catch {
      setUsers(prev);
      showToast("Failed to update role.", "error");
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    const prev = [...users];
    setUsers(u => u.filter(x => x.id !== user.id));
    try {
      const res = await fetch(`${API}/admin/users/${user.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      showToast(`${user.name} deleted.`);
    } catch {
      setUsers(prev);
      showToast("Failed to delete user.", "error");
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error) return (
    <div className="error-state" role="alert">
      <p>⚠️ {error}</p>
      <button className="btn btn-secondary" onClick={fetchUsers}>Try Again</button>
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
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
        Admin Panel — Users ({users.length})
      </h1>
      {users.length === 0 ? (
        <div className="empty-state"><p>No users found.</p></div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {users.map(u => (
            <div key={u.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <strong>{u.name}</strong>
                <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {u.email}
                </span>
                <div style={{ marginTop: "0.2rem" }}>
                  <span className={`badge ${u.role === "admin" ? "badge-in-progress" : "badge-todo"}`}>
                    {u.role}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => toggleRole(u)}>
                  Make {u.role === "admin" ? "User" : "Admin"}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}