import { useEffect, useMemo, useState } from "react";
import { LuDownload, LuSearch } from "react-icons/lu";
import { getAdminNewsletter, updateAdminNewsletterSubscriber } from "../api.js";
import { getErrorMessage } from "../utils/errorMessages.js";
import { AdminPanel, EmptyAdminState, PageHeader, StatusPill } from "./AdminKit.jsx";

function csvCell(value = "") {
  const text = String(value ?? "");
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadSubscribersCsv(subscribers) {
  const rows = [
    ["email", "source", "status", "subscribed_at"],
    ...subscribers.map((subscriber) => [
      subscriber.email,
      subscriber.source || "Website",
      subscriber.is_active ? "active" : "inactive",
      subscriber.created_at || "",
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `newsletter-emails-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const rows = await getAdminNewsletter();
        setSubscribers(Array.isArray(rows) ? rows : []);
        setError("");
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load newsletter subscribers."));
      }
    }
    load();
  }, []);

  const toggle = async (subscriber) => {
    try {
      const updated = await updateAdminNewsletterSubscriber(subscriber.id, { is_active: !subscriber.is_active });
      setSubscribers((current) => current.map((item) => (item.id === subscriber.id ? updated : item)));
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update subscriber."));
    }
  };

  const filtered = useMemo(() => subscribers.filter((item) =>
    `${item.email} ${item.source}`.toLowerCase().includes(query.toLowerCase())
  ), [query, subscribers]);

  return (
    <div>
      <PageHeader
        eyebrow="Newsletter"
        title="Subscriber management"
        copy="Review subscription sources, export collected emails, and activate or deactivate recipients."
        action={<button className="admin-small-btn" onClick={() => downloadSubscribersCsv(subscribers)} disabled={!subscribers.length}><LuDownload /> Download emails</button>}
      />
      <AdminPanel>
        {error && <div className="auth-alert danger" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="toolbar"><div className="search-box"><LuSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subscribers..." /></div></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Email</th><th>Source</th><th>Status</th><th>Subscribed</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td><strong>{subscriber.email}</strong></td>
                  <td>{subscriber.source || "Website"}</td>
                  <td><StatusPill status={subscriber.is_active ? "Open" : "Closed"} /></td>
                  <td className="mono muted">{new Date(subscriber.created_at).toLocaleDateString()}</td>
                  <td><button className="admin-small-btn" onClick={() => toggle(subscriber)}>{subscriber.is_active ? "Deactivate" : "Reactivate"}</button></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan="5"><EmptyAdminState title="No subscribers" copy="Newsletter signups will appear here." /></td></tr>}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
