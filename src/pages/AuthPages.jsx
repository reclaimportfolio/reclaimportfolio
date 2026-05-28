import { useEffect } from "react";
import { useApp } from "../context.js";
import { AuthHeader, AuthVisualPanel } from "../auth/AuthModal.jsx";
import { ForgotPasswordForm } from "../auth/ForgotPasswordForm.jsx";
import { LoginForm } from "../auth/LoginForm.jsx";
import { ResetPasswordForm } from "../auth/ResetPasswordForm.jsx";
import { SignupForm } from "../auth/SignupForm.jsx";
import { useSession } from "../auth/SessionProvider.jsx";

export function AuthPage({ mode }) {
  const { go } = useApp();
  const { user } = useSession();
  const isLogin = mode === "login";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";

  useEffect(() => {
    if (user && !isReset) go("dashboard");
  }, [go, isReset, user]);

  return (
    <main className="auth-page">
      <div className="auth-bg-grid" />
      <section className="wrap auth-page-grid">
        <div className="auth-suite">
          <AuthVisualPanel />
          <div className="auth-card auth-form-panel">
            {isForgot || isReset ? (
              <>
                <div className="auth-head">
                  <span className="eyebrow">Credential Recovery</span>
                  <h1>{isReset ? "Choose a new password." : "Reset access securely."}</h1>
                  <p>{isReset ? "Enter a new password for your client workspace." : "Enter your client email and we will issue reset instructions without revealing account status."}</p>
                </div>
                {isReset ? <ResetPasswordForm /> : <ForgotPasswordForm />}
              </>
            ) : (
              <>
                <AuthHeader tab={isLogin ? "login" : "signup"} setTab={(tab) => go(tab === "login" ? "login" : "signup")} />
                {isLogin ? <LoginForm onSuccess={() => go("dashboard")} /> : <SignupForm onSuccess={() => go("dashboard")} />}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
