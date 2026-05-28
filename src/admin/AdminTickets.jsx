import { useEffect, useMemo, useRef, useState } from "react";
import { LuSearch, LuSend } from "react-icons/lu";
import { getAdminUsers } from "../api.js";
import {
  markTicketRead,
  priorityLabels,
  sendTicketMessage,
  statusLabels,
  ticketStatuses,
  updateTicket,
  useTicketStore,
} from "../supportTickets.js";
import { AdminPanel, EmptyAdminState, PageHeader } from "./AdminKit.jsx";
import { getErrorMessage } from "../utils/errorMessages.js";

const adminUser = { id: "admin-support", name: "Support Admin" };
const formatTicketTime = (value) =>
  value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "";

export function AdminTickets() {
  const { tickets, messagesByTicket, refresh, loading, error } = useTicketStore({ role: "admin" });
  const [staffUsers, setStaffUsers] = useState([]);
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = status === "all" || ticket.status === status;
      const matchesPriority = priority === "all" || ticket.priority === priority;
      const haystack = `${ticket.title} ${ticket.clientName} ${ticket.clientEmail} ${ticket.category}`.toLowerCase();
      return matchesStatus && matchesPriority && haystack.includes(query.toLowerCase());
    });
  }, [priority, query, status, tickets]);
  const selected = tickets.find((ticket) => ticket.id === selectedId) || filtered[0] || tickets[0];
  const selectedMessages = selected ? messagesByTicket[selected.id] || [] : [];

  useEffect(() => {
    let alive = true;
    async function loadStaff() {
      try {
        const rows = await getAdminUsers();
        if (!alive) return;
        setStaffUsers((Array.isArray(rows) ? rows : []).filter((user) => ["staff", "admin"].includes(user.role)));
      } catch {
        if (alive) setStaffUsers([]);
      }
    }
    loadStaff();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!selected?.id) return;
    markTicketRead(selected.id, "admin").then(refresh).catch(() => {});
  }, [refresh, selected?.id, selectedMessages.length]);

  return (
    <div>
      <PageHeader
        eyebrow="Support tickets"
        title="Client ticket management"
        copy="Review client support requests, manage status, assign ownership, and reply in the shared conversation thread."
      />
      <section className="admin-ticket-layout">
        <AdminPanel title="Ticket queue" copy={`${filtered.length} matching tickets`}>
          {error && <div className="portal-inline-error">{error}</div>}
          <div className="admin-ticket-filters">
            <div className="search-box"><LuSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search client, email, or title..." /></div>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All tickets</option>
              {ticketStatuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
            </select>
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              <option value="all">All priorities</option>
              {Object.entries(priorityLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <div className="admin-ticket-list">
            {loading ? (
              <EmptyAdminState title="Loading tickets" copy="Fetching client support conversations." />
            ) : filtered.length ? filtered.map((ticket) => (
              <button className={`admin-ticket-item ${selected?.id === ticket.id ? "active" : ""}`} key={ticket.id} onClick={() => setSelectedId(ticket.id)}>
                <div>
                  <strong>{ticket.title}</strong>
                  <span>{ticket.clientName} - {ticket.clientEmail}</span>
                </div>
                <TicketStatusBadge status={ticket.status} />
                {ticket.unreadForAdmin > 0 && <em>{ticket.unreadForAdmin}</em>}
              </button>
            )) : <EmptyAdminState title="No tickets found" copy="Adjust filters or wait for client submissions." />}
          </div>
        </AdminPanel>

        {selected ? (
          <AdminTicketDetail ticket={selected} messages={selectedMessages} staffUsers={staffUsers} onRefresh={refresh} />
        ) : (
          <AdminPanel><EmptyAdminState title="No ticket selected" copy="Choose a ticket to open the support conversation." /></AdminPanel>
        )}
      </section>
    </div>
  );
}

function AdminTicketDetail({ ticket, messages, staffUsers, onRefresh }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedToId || "");
  const scrollRef = useRef(null);

  useEffect(() => {
    setStatus(ticket.status);
    setAssignedTo(ticket.assignedToId || "");
  }, [ticket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, ticket.id]);

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const saveControls = async () => {
    setSaving(true);
    setError("");
    try {
      await updateTicket({ ticketId: ticket.id, status, assignedTo });
      await onRefresh?.();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update ticket."));
    } finally {
      setSaving(false);
    }
  };
  const send = async (event) => {
    event.preventDefault();
    if (!draft.trim()) {
      setError("Enter a reply before sending.");
      return;
    }
    setError("");
    setSending(true);
    try {
      await sendTicketMessage({ ticketId: ticket.id, sender: adminUser, senderRole: "admin", message: draft });
      setDraft("");
      await onRefresh?.();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to send reply."));
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminPanel title={ticket.title} copy={`${ticket.id} - updated ${formatTicketTime(ticket.updatedAt)}`}>
      <div className="admin-ticket-detail-grid">
        <div><span>Client</span><strong>{ticket.clientName}</strong></div>
        <div><span>Email</span><strong>{ticket.clientEmail}</strong></div>
        <div><span>Category</span><strong>{ticket.category}</strong></div>
        <div><span>Priority</span><TicketPriorityBadge priority={ticket.priority} /></div>
        <div><span>Created</span><strong>{formatTicketTime(ticket.createdAt)}</strong></div>
        <div><span>Last message</span><strong>{formatTicketTime(ticket.lastMessageAt)}</strong></div>
      </div>
      <div className="admin-ticket-controls">
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{ticketStatuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select></label>
        <label>Assign to<select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}><option value="">Unassigned</option>{staffUsers.map((member) => <option key={member.id} value={member.id}>{member.full_name || member.email}</option>)}</select></label>
        <button className="admin-small-btn primary" onClick={saveControls} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
      </div>
      <div className="admin-ticket-chat">
        {messages.length ? messages.map((message) => <AdminTicketMessage key={message.id} message={message} />) : <EmptyAdminState title="No messages" copy="Client and admin messages will appear here." />}
        <div ref={scrollRef} />
      </div>
      {error && <div className="field-error">{error}</div>}
      <form className="admin-ticket-reply" onSubmit={send}>
        <textarea rows="3" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Reply to client..." />
        <button className="admin-small-btn primary" type="submit" disabled={sending || !draft.trim()}><LuSend /> {sending ? "Sending..." : "Send reply"}</button>
      </form>
    </AdminPanel>
  );
}

function AdminTicketMessage({ message }) {
  const mine = message.senderRole === "admin";
  return (
    <div className={`ticket-message ${mine ? "mine" : "theirs"}`}>
      <div><strong>{message.senderName}</strong><small>{message.senderRole} - {formatTicketTime(message.createdAt)}</small></div>
      <p>{message.message}</p>
    </div>
  );
}

function TicketStatusBadge({ status }) {
  return <span className={`ticket-status ${status}`}>{statusLabels[status] || status}</span>;
}

function TicketPriorityBadge({ priority }) {
  return <span className={`ticket-priority ${priority}`}>{priorityLabels[priority] || priority}</span>;
}
