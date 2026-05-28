import { useEffect, useMemo, useState } from "react";
import { LuMail, LuSearch } from "react-icons/lu";
import { getAdminMessages, updateAdminMessage } from "../api.js";
import { getErrorMessage } from "../utils/errorMessages.js";
import { AdminPanel, EmptyAdminState, PageHeader, StatusPill } from "./AdminKit.jsx";

const statuses = ["new", "reviewed", "closed"];
const label = (value = "") => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const rows = await getAdminMessages();
      setMessages(Array.isArray(rows) ? rows : []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load contact messages."));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const updated = await updateAdminMessage(id, { status });
      setMessages((current) => current.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update message."));
    }
  };

  const filtered = useMemo(() => messages.filter((message) =>
    `${message.name} ${message.email} ${message.message} ${message.status}`.toLowerCase().includes(query.toLowerCase())
  ), [messages, query]);

  return (
    <div>
      <PageHeader eyebrow="Messages" title="Contact message management" copy="Review and close public contact form submissions." />
      <AdminPanel>
        {error && <div className="auth-alert danger" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="toolbar"><div className="search-box"><LuSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages..." /></div></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Sender</th><th>Message</th><th>Status</th><th>Received</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map((message) => (
                <tr key={message.id}>
                  <td><strong>{message.name}</strong><div className="muted" style={{ fontSize: 11 }}>{message.email}</div></td>
                  <td>{message.message}</td>
                  <td><StatusPill status={label(message.status)} /></td>
                  <td className="mono muted">{new Date(message.created_at).toLocaleDateString()}</td>
                  <td><select value={message.status} onChange={(event) => updateStatus(message.id, event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan="5"><EmptyAdminState title="No messages" copy="Contact form submissions will appear here." /></td></tr>}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
