import { useState } from "react";
import { useApp } from "../context.js";
import { Btn } from "../ui.jsx";
import { useSession } from "./SessionProvider.jsx";
import { getErrorMessage, getFieldErrors } from "../utils/errorMessages.js";

const initial = { identifier: "", password: "" };

export function LoginForm({ onSuccess, compact = false, switchToSignup }) {
  const { go } = useApp();
  const { signIn } = useSession();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((valueMap) => ({ ...valueMap, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.identifier.trim()) nextErrors.identifier = "Email or username is required.";
    if (!form.password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setStatus("");
    try {
      await signIn(form);
      setStatus("Session secured. Opening your client portal.");
      window.setTimeout(() => onSuccess?.(), 360);
    } catch (err) {
      setErrors((current) => ({ ...current, ...getFieldErrors(err) }));
      setStatus(getErrorMessage(err, "Unable to sign in."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="field">
        <label>Email or Username <span className="req">*</span></label>
        <input className={`input ${errors.identifier ? "input-invalid" : ""}`} value={form.identifier} onChange={(event) => set("identifier", event.target.value)} autoComplete="username" />
        {errors.identifier && <div className="field-err">{errors.identifier}</div>}
      </div>

      <div className="field">
        <label>Password <span className="req">*</span></label>
        <input className={`input ${errors.password ? "input-invalid" : ""}`} type="password" value={form.password} onChange={(event) => set("password", event.target.value)} autoComplete="current-password" />
        {errors.password && <div className="field-err">{errors.password}</div>}
      </div>

      <div className="auth-row session-actions">
        <button className="auth-link" type="button" onClick={() => go("forgot-password")}>Forgot password?</button>
      </div>

      {status && <div className={`auth-alert ${status.includes("secured") ? "success" : "danger"}`}>{status}</div>}

      <Btn primary icon={loading ? null : "arrow"}>{loading ? <span className="auth-button-loading"><span className="auth-spinner" /> Signing in</span> : "Sign In"}</Btn>

      {!compact && (
        <p className="auth-switch">
          New to ReclaimPortfolio? <button type="button" onClick={switchToSignup || (() => go("signup"))}>Create account</button>
        </p>
      )}
    </form>
  );
}
