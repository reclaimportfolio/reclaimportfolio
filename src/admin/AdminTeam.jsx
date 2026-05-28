import { useEffect, useMemo, useState } from "react";
import { LuRefreshCw, LuShieldCheck } from "react-icons/lu";
import { getAdminCases, getAdminUsers } from "../api.js";
import { getErrorMessage } from "../utils/errorMessages.js";
import { AdminPanel, EmptyAdminState, PageHeader, StatusPill } from "./AdminKit.jsx";

const initials = (name = "") => name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "AD";

export function AdminTeam() {
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function loadTeam() {
      try {
        const [userRows, caseRows] = await Promise.all([getAdminUsers(), getAdminCases()]);
        if (!alive) return;
        setUsers(Array.isArray(userRows) ? userRows : []);
        setCases(Array.isArray(caseRows) ? caseRows : []);
        setError("");
      } catch (err) {
        if (alive) setError(getErrorMessage(err, "Unable to load team data."));
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadTeam();
    return () => {
      alive = false;
    };
  }, []);

  const staff = useMemo(() => users.filter((user) => ["staff", "admin"].includes(user.role)), [users]);
  const activeCaseCount = (userId) => cases.filter((item) => String(item.assigned_to || "") === String(userId)).length;

  return (
    <div>
      <PageHeader
        eyebrow="Team management"
        title="Staff, roles, and permissions"
        copy="Staff and admin accounts are loaded from the backend user directory."
        action={<button className="admin-small-btn"><LuRefreshCw /> Backend synced</button>}
      />
      {error && <div className="auth-alert danger" style={{ marginBottom: 14 }}>{error}</div>}
      <section className="admin-grid-3">
        {staff.map((member) => {
          const displayName = member.full_name || member.name || member.email;
          return (
            <AdminPanel key={member.id}>
              <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 14 }}>
                <span className="avatar" style={{ width: 44, height: 44, fontSize: 14 }}>{initials(displayName)}</span>
                <div><strong>{displayName}</strong><div className="muted" style={{ fontSize: 12 }}>{member.email}</div></div>
              </div>
              <div className="kv"><span className="k">Portal role</span><span className="v"><StatusPill status={member.role} /></span></div>
              <div className="kv"><span className="k">Django staff</span><span className="v">{member.is_staff ? "Enabled" : "Disabled"}</span></div>
              <div className="kv"><span className="k">Active cases</span><span className="v">{activeCaseCount(member.id)}</span></div>
              <div className="kv"><span className="k">Access</span><span className="v"><LuShieldCheck /> Admin portal</span></div>
            </AdminPanel>
          );
        })}
        {!staff.length && <AdminPanel><EmptyAdminState title={loading ? "Loading team" : "No staff users"} copy="Assign a backend user the staff or admin role to show them here." /></AdminPanel>}
      </section>
      <AdminPanel title="Role policy" style={{ marginTop: 14 }}>
        <div className="admin-ops-list">
          {[
            "Only users with role staff or admin can enter the admin portal.",
            "Case assignment accepts staff/admin users only.",
            "Support assignment accepts staff/admin users only.",
            "Client users remain blocked from all /api/admin endpoints.",
          ].map((item) => <div className="admin-ops-row" key={item}><div><strong>{item}</strong><span>Backend enforced</span></div><StatusPill status="Verified" /></div>)}
        </div>
      </AdminPanel>
    </div>
  );
}
