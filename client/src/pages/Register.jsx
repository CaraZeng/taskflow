import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";

function validate(fields) {
  const errors = {};
  if (!fields.name.trim() || fields.name.trim().length < 2)
    errors.name = "Name must be at least 2 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = "Enter a valid email address.";
  if (fields.password.length < 8)
    errors.password = "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(fields.password))
    errors.password = (errors.password || "") + " Must include an uppercase letter.";
  if (fields.password !== fields.confirm)
    errors.confirm = "Passwords do not match.";
  return errors;
}

export default function Register() {
  const { setUser } = useAuth();
  const nav = useNavigate();

  const [fields, setFields] = useState({ name: "", email: "", password: "", confirm: "" });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const errors = validate(fields);
  const set = k => e => setFields(f => ({ ...f, [k]: e.target.value }));
  const blur = k => () => setTouched(t => ({ ...t, [k]: true }));

  const handleSubmit = async e => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (Object.keys(errors).length) return;

    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: fields.name, email: fields.email, password: fields.password }),
      });
      const data = await res.json();
      if (!res.ok) return setServerError(data.error || "Registration failed.");
      setUser(data);
      nav("/tasks");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box card">
        <h1>Create account</h1>
        {serverError && <p className="field-error" style={{ marginBottom: "1rem" }}>{serverError}</p>}
        <form onSubmit={handleSubmit} noValidate>
          {[
            { key: "name",     label: "Full name",       type: "text",     placeholder: "Jane Doe" },
            { key: "email",    label: "Email",           type: "email",    placeholder: "jane@example.com" },
            { key: "password", label: "Password",        type: "password", placeholder: "Min 8 chars + uppercase" },
            { key: "confirm",  label: "Confirm password",type: "password", placeholder: "Repeat password" },
          ].map(({ key, label, type, placeholder }) => (
            <div className="form-group" key={key}>
              <label htmlFor={key}>{label}</label>
              <input
                id={key} type={type} placeholder={placeholder}
                value={fields[key]}
                onChange={set(key)} onBlur={blur(key)}
                className={touched[key] && errors[key] ? "error" : ""}
              />
              {touched[key] && errors[key] && (
                <span className="field-error">{errors[key]}</span>
              )}
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}