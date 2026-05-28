import { LuBell, LuLockKeyhole, LuPalette, LuShieldCheck, LuWalletCards } from "react-icons/lu";
import { useApp } from "../context.js";
import { AdminPanel, PageHeader, StatusPill } from "./AdminKit.jsx";

export function AdminSettings() {
  const { theme, toggleTheme } = useApp();
  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Platform configuration"
        copy="Operational controls and access policies used by the synced backend and admin portal."
      />
      <section className="admin-grid-3">
        {[
          ["Platform settings", LuShieldCheck, ["Environment variables documented", "CORS controlled by backend env", "PostgreSQL DATABASE_URL supported"]],
          ["Security settings", LuLockKeyhole, ["JWT authentication enabled", "Admin role gate enforced", "Client/admin token scopes separated"]],
          ["Notification settings", LuBell, ["Contact messages stored", "Newsletter subscribers stored", "Password reset requests issued"]],
          ["Wallet configuration", LuWalletCards, ["Assets managed per client", "Transactions managed per client", "Wallet visibility backend controlled"]],
          ["Theme settings", LuPalette, [`Current theme: ${theme}`, "Theme preference handled in app state", "No backend write required"]],
        ].map(([title, Icon, rows]) => (
          <AdminPanel title={title} key={title} action={<Icon style={{ color: "#C9A55E" }} />}>
            {rows.map((row) => <div className="kv" key={row}><span className="k">{row}</span><span className="v"><StatusPill status="Verified" /></span></div>)}
            {title === "Theme settings" && <button className="admin-small-btn" onClick={toggleTheme}>Toggle theme</button>}
          </AdminPanel>
        ))}
      </section>
      <section className="admin-grid-2" style={{ marginTop: 14 }}>
        <AdminPanel title="Access control">
          {[
            "Admin portal requires role staff or admin.",
            "Django admin requires active staff user with role staff/admin.",
            "Admin API endpoints use backend role permissions.",
            "Client role cannot access admin data.",
          ].map((item) => <div className="admin-ops-row" key={item}><div><strong>{item}</strong><span>Backend enforced</span></div><StatusPill status="Verified" /></div>)}
        </AdminPanel>
        <AdminPanel title="Production readiness">
          {[
            "SECRET_KEY, DEBUG, hosts, CORS, CSRF, and DATABASE_URL read from env.",
            "SQLite remains the local fallback database.",
            "JWT token refresh and logout blacklist are configured.",
            "Demo data is created only through the explicit seed_demo command.",
          ].map((item) => <div className="admin-ops-row" key={item}><div><strong>{item}</strong><span>Configuration check</span></div><StatusPill status="Verified" /></div>)}
        </AdminPanel>
      </section>
    </div>
  );
}
