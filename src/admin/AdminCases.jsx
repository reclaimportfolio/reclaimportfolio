import { useCallback, useEffect, useMemo, useState } from "react";
import { LuRefreshCw, LuSearch } from "react-icons/lu";
import { getAdminCases } from "../api.js";
import { useApp } from "../context.js";
import { getErrorMessage } from "../utils/errorMessages.js";
import { AdminPanel, EmptyAdminState, PageHeader, StatusPill } from "./AdminKit.jsx";

const stages = ["Submitted", "Under Review", "Investigation", "Awaiting Documents", "Recovery In Progress", "Resolved", "Rejected", "Closed"];
const titleize = (value = "") => String(value).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function normalizeCase(item) {
  return {
    id: item.id,
    displayId: `CASE-${String(item.id).padStart(4, "0")}`,
    client: item.full_name || item.email || "Client",
    email: item.email,
    asset: item.asset_type || "Not provided",
    cat: item.category || "Uncategorized",
    priority: titleize(item.priority || "normal"),
    status: titleize(item.status || "submitted"),
    rawStatus: item.status || "submitted",
    inv: item.assigned_to_email || "Unassigned",
    date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Not provided",
    evidence: Array.isArray(item.evidence) ? item.evidence : [],
    adminNotes: item.admin_notes || "",
  };
}

export function AdminCases() {
  const { goAdmin } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getAdminCases();
      setCases(Array.isArray(rows) ? rows.map(normalizeCase) : []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load admin cases."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const rows = await getAdminCases();
        if (alive) {
          setCases(Array.isArray(rows) ? rows.map(normalizeCase) : []);
          setError("");
        }
      } catch (err) {
        if (alive) setError(getErrorMessage(err, "Unable to load admin cases."));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => cases.filter((item) => {
    const matchesStatus = status === "All" || item.status === status;
    const matchesPriority = priority === "All" || item.priority === priority;
    const matchesText = `${item.displayId} ${item.client} ${item.email} ${item.asset} ${item.cat}`.toLowerCase().includes(q.toLowerCase());
    return matchesStatus && matchesPriority && matchesText;
  }), [cases, priority, q, status]);

  return (
    <div>
      <PageHeader
        eyebrow="Case operations"
        title="Recovery case management"
        copy="Manage active, pending, and closed cases with staff assignments, timelines, priority controls, and recovery stages."
        action={<button className="admin-small-btn" onClick={loadCases} disabled={loading}><LuRefreshCw /> {loading ? "Syncing" : "Refresh cases"}</button>}
      />

      <AdminPanel>
        {error && <div className="auth-alert danger" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="toolbar">
          <div className="search-box"><LuSearch /><input placeholder="Search case, client, asset..." value={q} onChange={(event) => setQ(event.target.value)} /></div>
          <select className="tsel" value={status} onChange={(event) => setStatus(event.target.value)}>{["All", ...stages].map((item) => <option key={item}>{item}</option>)}</select>
          <select className="tsel" value={priority} onChange={(event) => setPriority(event.target.value)}>{["All", "Urgent", "High", "Normal", "Low"].map((item) => <option key={item}>{item}</option>)}</select>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Case</th><th>Client</th><th>Asset</th><th>Category</th><th>Evidence</th><th>Priority</th><th>Status</th><th>Staff</th><th>Progress</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map((item, index) => (
                <tr key={item.id}>
                  <td className="mono">{item.displayId}</td>
                  <td><strong>{item.client}</strong><div className="muted" style={{ fontSize: 11 }}>Opened {item.date}</div></td>
                  <td>{item.asset}</td>
                  <td className="muted">{item.cat}</td>
                  <td>{item.evidence.length}</td>
                  <td><StatusPill status={item.priority} /></td>
                  <td><StatusPill status={item.status} /></td>
                  <td>{item.inv}</td>
                  <td><div className="case-health" style={{ padding: 0, border: 0, background: "transparent" }}><div><i style={{ width: `${[88, 74, 46, 100][index % 4]}%` }} /></div></div></td>
                  <td><span className="tlink" onClick={() => goAdmin("case-detail", item.id)}>Open</span></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan="10"><EmptyAdminState title={loading ? "Loading cases" : "No cases"} copy={loading ? "Fetching backend cases." : "Case submissions will appear here."} /></td></tr>}
            </tbody>
          </table>
        </div>
      </AdminPanel>

    </div>
  );
}
