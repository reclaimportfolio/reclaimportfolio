import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  changePassword as changePasswordRequest,
  confirmPasswordReset as confirmPasswordResetRequest,
  loginClient,
  logoutClient,
  registerClient,
  requestPasswordReset,
  getSession,
  storeSession,
} from "../api.js";

const SessionContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    name: user.name || user.full_name || user.username || user.email,
    fullName: user.full_name || user.name || "",
    isAdmin: Boolean(["staff", "admin"].includes(user.role)),
  };
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => getSession());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function hydrate() {
      if (!session?.access) {
        if (alive) setLoading(false);
        return;
      }
      try {
        const user = await getCurrentUser();
        if (!alive) return;
        const nextSession = { ...session, user: normalizeUser(user) };
        storeSession(nextSession);
        setSession(nextSession);
      } catch {
        storeSession(null);
        if (alive) setSession(null);
      } finally {
        if (alive) setLoading(false);
      }
    }
    hydrate();
    return () => {
      alive = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api = useMemo(() => ({
    session,
    user: normalizeUser(session?.user),
    loading,
    async signUp(form) {
      const response = await registerClient({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.fullName.trim(),
        username: form.username.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
      const nextSession = {
        access: response.access,
        refresh: response.refresh,
        user: normalizeUser(response.user),
      };
      storeSession(nextSession);
      setSession(nextSession);
      return nextSession;
    },
    async signIn(form) {
      const response = await loginClient({
        identifier: form.identifier.trim(),
        password: form.password,
      });
      const nextSession = {
        access: response.access,
        refresh: response.refresh,
        user: normalizeUser(response.user),
      };
      storeSession(nextSession);
      setSession(nextSession);
      return nextSession;
    },
    async requestPasswordReset(email) {
      return requestPasswordReset(email.trim().toLowerCase());
    },
    async confirmPasswordReset(payload) {
      return confirmPasswordResetRequest({
        uid: payload.uid,
        token: payload.token,
        new_password: payload.newPassword,
      });
    },
    async changePassword(payload) {
      return changePasswordRequest({
        current_password: payload.currentPassword,
        new_password: payload.newPassword,
      });
    },
    async refreshCurrentUser() {
      if (!session?.access) return null;
      const response = await getCurrentUser();
      const nextSession = { ...session, user: normalizeUser(response) };
      storeSession(nextSession);
      setSession(nextSession);
      return response;
    },
    async logout() {
      try {
        await logoutClient(session?.refresh);
      } catch {
        // Local session cleanup still needs to happen if the token is expired.
      }
      storeSession(null);
      setSession(null);
    },
  }), [loading, session]);

  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
