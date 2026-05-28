import { useMemo, useState } from "react";
import { useApp } from "../context.js";
import { Btn } from "../ui.jsx";
import { getErrorMessage } from "../utils/errorMessages.js";
import { useSession } from "./SessionProvider.jsx";

export function ResetPasswordForm() {
  const { go } = useApp();
  const { confirmPasswordReset } = useSession();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const uid = params.get("uid") || "";
  const token = params.get("token") || "";
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasLink = Boolean(uid && token);

  const submit = async (event) => {
    event.preventDefault();
    if (!hasLink) {
      setError("Reset link is missing or incomplete. Request a new password reset link.");
      return;
    }
    if (form.password.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await confirmPasswordReset({ uid, token, newPassword: form.password });
      window.history.replaceState({}, "", "/reset-password");
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to reset password. Request a fresh link and try again."));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-form">
        <div className="auth-alert success">Password updated. You can now sign in with your new password.</div>
        <Btn primary icon="arrow" onClick={() => go("login")}>Return to Sign In</Btn>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {!hasLink && <div className="auth-alert danger">Reset link is missing or incomplete.</div>}
      <div className="field">
        <label>New Password <span className="req">*</span></label>
        <input
          className={`input ${error ? "input-invalid" : ""}`}
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          autoComplete="new-password"
        />
      </div>
      <div className="field">
        <label>Confirm Password <span className="req">*</span></label>
        <input
          className={`input ${error ? "input-invalid" : ""}`}
          type="password"
          value={form.confirm}
          onChange={(event) => setForm({ ...form, confirm: event.target.value })}
          autoComplete="new-password"
        />
        {error && <div className="field-err">{error}</div>}
      </div>
      <Btn primary icon={loading ? null : "arrow"} disabled={loading || !hasLink}>
        {loading ? <span className="auth-button-loading"><span className="auth-spinner" /> Updating</span> : "Update Password"}
      </Btn>
      <p className="auth-switch"><button type="button" onClick={() => go("forgot-password")}>Request a new link</button></p>
    </form>
  );
}
