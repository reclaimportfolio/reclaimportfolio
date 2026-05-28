import { useState } from "react";
import { useApp } from "../context.js";
import { Btn } from "../ui.jsx";
import { useSession } from "./SessionProvider.jsx";
import { getErrorMessage } from "../utils/errorMessages.js";

export function ForgotPasswordForm() {
  const { go } = useApp();
  const { requestPasswordReset } = useSession();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setError("Enter the email connected to your client workspace.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to send reset instructions."));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-form">
        <div className="auth-alert success">If an account exists, secure reset instructions have been sent.</div>
        <Btn primary icon="arrow" onClick={() => go("login")}>Return to Sign In</Btn>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="field">
        <label>Email Address <span className="req">*</span></label>
        <input className={`input ${error ? "input-invalid" : ""}`} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        {error && <div className="field-err">{error}</div>}
      </div>
      <Btn primary icon={loading ? null : "arrow"}>{loading ? <span className="auth-button-loading"><span className="auth-spinner" /> Sending</span> : "Send Reset Link"}</Btn>
      <p className="auth-switch"><button type="button" onClick={() => go("login")}>Back to secure sign in</button></p>
    </form>
  );
}
