import { useEffect } from "react";
import { useApp } from "../context.js";
import { useSession } from "./SessionProvider.jsx";

export function ProtectedRoute({ children }) {
  const { go } = useApp();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) go("login", { from: "dashboard" });
  }, [go, loading, user]);

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-loading glass">
          <span className="auth-spinner" />
          <span>Validating secure session</span>
        </div>
      </main>
    );
  }

  if (!user) return null;
  return children;
}
