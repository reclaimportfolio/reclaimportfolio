import { useState } from "react";
import { LuArrowLeft, LuEye, LuEyeOff, LuLockKeyhole } from "react-icons/lu";
import { useApp } from "../context.js";
import { loginAdmin } from "../api.js";
import { getErrorMessage } from "../utils/errorMessages.js";

const BRAND_LOGO = "https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779031196/reclaim_logo_svg_o9yyv9.svg";

export function AdminLogin({ onAuthenticated, initialStatus = "" }) {
  const { go } = useApp();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const email = form.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid admin email.";
    if (!form.password) nextErrors.password = "Password is required.";
    else if (form.password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    setErrors(nextErrors);
    setStatus("");
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const response = await loginAdmin({ identifier: email, password: form.password });
      const session = {
        access: response.access,
        refresh: response.refresh,
        user: response.user,
      };
      setStatus("Access verified. Opening admin dashboard.");
      window.setTimeout(() => onAuthenticated?.(session), 320);
    } catch (error) {
      setStatus(getErrorMessage(error, "Admin access could not be verified."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-shell">
        <aside className="admin-login-visual" aria-label="Admin portal security context">
          <div className="admin-login-brand">
            <img src={BRAND_LOGO} alt="Reclaim Portfolio" />
            <span>Admin Portal</span>
          </div>
        </aside>

        <section className="admin-login-card" aria-label="Admin sign in form">
          <button className="admin-login-back" type="button" onClick={() => go("home")}><LuArrowLeft /> Back to website</button>
          <div className="admin-login-card-head">
            <span><LuLockKeyhole /></span>
            <div>
              <h2>Sign in</h2>
            </div>
          </div>

          <form className="admin-login-form" onSubmit={submit}>
            <label className="field">Email
              <input className={errors.email ? "input-invalid" : ""} type="email" value={form.email} onChange={(event) => set("email", event.target.value)} autoComplete="username" placeholder="admin@reclaimportfolio.com" />
              {errors.email && <span className="field-err">{errors.email}</span>}
            </label>

            <label className="field">Password
              <div className={`admin-password-field ${errors.password ? "input-invalid" : ""}`}>
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => set("password", event.target.value)} autoComplete="current-password" placeholder="Enter password" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <LuEyeOff /> : <LuEye />}
                </button>
              </div>
              {errors.password && <span className="field-err">{errors.password}</span>}
            </label>

            <div className="admin-login-row session-actions">
              <button type="button" className="auth-link" onClick={() => setStatus("Password recovery is handled by the system administrator.")}>Forgot password?</button>
            </div>

            {status && <div className={`auth-alert ${status.includes("verified") ? "success" : "danger"}`}>{status}</div>}

            <button className="admin-login-submit" type="submit" disabled={loading}>
              {loading ? "Verifying access" : "Sign In"}
            </button>
          </form>

        </section>
      </section>
    </main>
  );
}
