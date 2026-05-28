import { useState } from "react";
import { useApp } from "../context.js";
import { Btn } from "../ui.jsx";
import { useSession } from "./SessionProvider.jsx";
import { getErrorMessage, getFieldErrors } from "../utils/errorMessages.js";

const initial = { fullName: "", email: "", phone: "", address: "", username: "", password: "", confirmPassword: "", accept: false };

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) errors.email = "Enter a valid email address.";
  if (!form.phone.trim()) errors.phone = "Phone number is required.";
  if (!form.address.trim()) errors.address = "Address is required.";
  if (!/^[a-zA-Z0-9._-]{3,24}$/.test(form.username)) errors.username = "Use 3-24 letters, numbers, dots, dashes, or underscores.";
  if (form.password.length < 10) errors.password = "Use at least 10 characters.";
  if (!/[0-9]/.test(form.password) || !/[A-Z]/.test(form.password)) errors.password = "Include an uppercase letter and a number.";
  if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords must match.";
  if (!form.accept) errors.accept = "Terms and privacy acknowledgment is required.";
  return errors;
}

export function SignupForm({ onSuccess, compact = false, switchToLogin }) {
  const { go } = useApp();
  const { signUp } = useSession();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((valueMap) => ({ ...valueMap, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setStatus("");
    try {
      await signUp(form);
      setStatus("Account secured. Preparing your client workspace.");
      window.setTimeout(() => onSuccess?.(), 420);
    } catch (err) {
      const backendFields = getFieldErrors(err);
      setErrors((current) => ({
        ...current,
        ...backendFields,
        fullName: backendFields.full_name || current.fullName,
      }));
      setStatus(getErrorMessage(err, "Unable to create your account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-field-grid">
        <div className="field">
          <label>Full Name <span className="req">*</span></label>
          <input className={`input ${errors.fullName ? "input-invalid" : ""}`} value={form.fullName} onChange={(event) => set("fullName", event.target.value)} autoComplete="name" />
          {errors.fullName && <div className="field-err">{errors.fullName}</div>}
        </div>
        <div className="field">
          <label>Username <span className="req">*</span></label>
          <input className={`input ${errors.username ? "input-invalid" : ""}`} value={form.username} onChange={(event) => set("username", event.target.value)} autoComplete="username" />
          {errors.username && <div className="field-err">{errors.username}</div>}
        </div>
      </div>

      <div className="field">
        <label>Email Address <span className="req">*</span></label>
        <input className={`input ${errors.email ? "input-invalid" : ""}`} value={form.email} onChange={(event) => set("email", event.target.value)} autoComplete="email" />
        {errors.email && <div className="field-err">{errors.email}</div>}
      </div>

      <div className="auth-field-grid">
        <div className="field">
          <label>Phone Number <span className="req">*</span></label>
          <input className={`input ${errors.phone ? "input-invalid" : ""}`} value={form.phone} onChange={(event) => set("phone", event.target.value)} autoComplete="tel" />
          {errors.phone && <div className="field-err">{errors.phone}</div>}
        </div>
        <div className="field">
          <label>Address <span className="req">*</span></label>
          <input className={`input ${errors.address ? "input-invalid" : ""}`} value={form.address} onChange={(event) => set("address", event.target.value)} autoComplete="street-address" />
          {errors.address && <div className="field-err">{errors.address}</div>}
        </div>
      </div>

      <div className="auth-field-grid">
        <div className="field">
          <label>Password <span className="req">*</span></label>
          <input className={`input ${errors.password ? "input-invalid" : ""}`} type="password" value={form.password} onChange={(event) => set("password", event.target.value)} autoComplete="new-password" />
          {errors.password && <div className="field-err">{errors.password}</div>}
        </div>
        <div className="field">
          <label>Confirm Password <span className="req">*</span></label>
          <input className={`input ${errors.confirmPassword ? "input-invalid" : ""}`} type="password" value={form.confirmPassword} onChange={(event) => set("confirmPassword", event.target.value)} autoComplete="new-password" />
          {errors.confirmPassword && <div className="field-err">{errors.confirmPassword}</div>}
        </div>
      </div>

      <label className="checkrow auth-check">
        <input type="checkbox" checked={form.accept} onChange={(event) => set("accept", event.target.checked)} />
        <span>I acknowledge ReclaimPortfolio's terms, privacy standards, and confidential case handling policy.</span>
      </label>
      {errors.accept && <div className="field-err">{errors.accept}</div>}

      {status && <div className={`auth-alert ${status.includes("secured") ? "success" : "danger"}`}>{status}</div>}

      <Btn primary icon={loading ? null : "arrow"}>{loading ? <span className="auth-button-loading"><span className="auth-spinner" /> Creating account</span> : "Create Account"}</Btn>

      {!compact && (
        <p className="auth-switch">
          Already have access? <button type="button" onClick={switchToLogin || (() => go("login"))}>Sign in</button>
        </p>
      )}
    </form>
  );
}
