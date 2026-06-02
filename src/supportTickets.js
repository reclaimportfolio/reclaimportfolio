import { useCallback, useMemo, useState } from "react";
import {
  createSupportTicket,
  deleteSupportTicket,
  listSupportTickets,
  listTicketMessages,
  markSupportTicketRead,
  sendTicketMessage as sendTicketMessageApi,
  updateSupportTicket,
} from "./api.js";
import { useVisiblePolling } from "./utils/useVisiblePolling.js";

const clean = (value = "") => String(value ?? "").replace(/[<>]/g, "").trim();

export const ticketStatuses = ["open", "pending", "in_progress", "resolved", "closed"];
export const ticketPriorities = ["low", "medium", "high", "urgent"];

export const statusLabels = {
  open: "Open",
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

function normalizeMessage(message = {}) {
  return {
    ...message,
    id: String(message.id || ""),
    ticketId: String(message.ticketId || message.ticket_id || message.ticket || ""),
    senderId: String(message.sender || message.senderId || ""),
    senderRole: message.senderRole || message.sender_role || "client",
    senderName: clean(message.senderName || message.sender_name || "Client"),
    message: clean(message.message),
    createdAt: message.createdAt || message.created_at || new Date().toISOString(),
    readByClient: Boolean(message.readByClient ?? message.read_by_client),
    readByAdmin: Boolean(message.readByAdmin ?? message.read_by_admin),
  };
}

function normalizeTicket(ticket = {}) {
  const messages = Array.isArray(ticket.messages) ? ticket.messages.map(normalizeMessage) : [];
  return {
    ...ticket,
    id: String(ticket.id || ""),
    clientId: String(ticket.clientId || ticket.user || ""),
    clientName: clean(ticket.clientName || ticket.client_name || "Client"),
    clientEmail: clean(ticket.clientEmail || ticket.client_email),
    title: clean(ticket.title),
    category: clean(ticket.category || "General support"),
    priority: ticketPriorities.includes(ticket.priority) ? ticket.priority : "medium",
    status: ticketStatuses.includes(ticket.status) ? ticket.status : "open",
    createdAt: ticket.createdAt || ticket.created_at || new Date().toISOString(),
    updatedAt: ticket.updatedAt || ticket.updated_at || new Date().toISOString(),
    lastMessageAt: ticket.lastMessageAt || ticket.last_message_at || ticket.updated_at || new Date().toISOString(),
    unreadForClient: Number(ticket.unreadForClient ?? ticket.unread_for_client ?? 0),
    unreadForAdmin: Number(ticket.unreadForAdmin ?? ticket.unread_for_admin ?? 0),
    assignedToId: String(ticket.assignedToId || ticket.assigned_to || ""),
    assignedTo: ticket.assignedTo || ticket.assigned_to_name || ticket.assigned_to_email || "",
    messages,
  };
}

export async function getTicketSnapshot() {
  const tickets = await listSupportTickets();
  const normalizedTickets = Array.isArray(tickets) ? tickets.map(normalizeTicket) : [];
  const messages = normalizedTickets.flatMap((ticket) => ticket.messages);
  return { tickets: normalizedTickets, messages };
}

export async function createTicket({ client, title, category, priority, message }) {
  if (!client?.id) throw new Error("A signed-in client is required.");
  if (!clean(title)) throw new Error("Ticket title is required.");
  if (!clean(message)) throw new Error("Ticket message is required.");
  const ticket = await createSupportTicket({
    title: clean(title),
    category: clean(category) || "General support",
    priority: ticketPriorities.includes(priority) ? priority : "medium",
    initial_message: clean(message),
  });
  return normalizeTicket(ticket);
}

export async function sendTicketMessage({ ticketId, senderRole = "client", message }) {
  if (!clean(message)) throw new Error("Message cannot be empty.");
  const created = await sendTicketMessageApi(ticketId, { message: clean(message) }, senderRole === "admin" ? "admin" : "client");
  return normalizeMessage(created);
}

export async function markTicketRead(ticketId, role = "client") {
  if (!ticketId) return null;
  const updated = await markSupportTicketRead(ticketId, role === "admin" ? "admin" : "client");
  return normalizeTicket(updated);
}

export async function updateTicket({ ticketId, status, assignedTo }) {
  const payload = {};
  if (ticketStatuses.includes(status)) payload.status = status;
  if (assignedTo !== undefined) {
    payload.assigned_to = /^\d+$/.test(String(assignedTo)) ? Number(assignedTo) : null;
  }
  const updated = await updateSupportTicket(ticketId, payload);
  return normalizeTicket(updated);
}

export async function deleteTicket(ticketId) {
  if (!ticketId) throw new Error("Ticket ID is required.");
  await deleteSupportTicket(ticketId);
  return true;
}

export function useTicketStore({ role = "client", clientId = "", pollMs = 5000 } = {}) {
  const [snapshot, setSnapshot] = useState({ tickets: [], messages: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setError("");
      const scope = role === "admin" ? "admin" : "client";
      const tickets = await listSupportTickets(scope);
      const normalizedTickets = Array.isArray(tickets) ? tickets.map(normalizeTicket) : [];
      const messagesByTicketEntries = await Promise.all(
        normalizedTickets.map(async (ticket) => {
          try {
            const messages = await listTicketMessages(ticket.id, scope);
            return [ticket.id, Array.isArray(messages) ? messages.map(normalizeMessage) : ticket.messages];
          } catch {
            return [ticket.id, ticket.messages];
          }
        }),
      );
      const messages = messagesByTicketEntries.flatMap(([, rows]) => rows);
      setSnapshot({ tickets: normalizedTickets, messages });
    } catch (err) {
      setError(err?.message || "Unable to load support tickets.");
      setSnapshot({ tickets: [], messages: [] });
    } finally {
      setLoading(false);
    }
  }, [role]);

  useVisiblePolling(refresh, pollMs);

  const tickets = useMemo(() => {
    const visible = role === "admin" ? snapshot.tickets : snapshot.tickets.filter((ticket) => ticket.clientId === String(clientId));
    return [...visible].sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt));
  }, [clientId, role, snapshot.tickets]);

  const messagesByTicket = useMemo(() => snapshot.messages.reduce((acc, message) => {
    if (!acc[message.ticketId]) acc[message.ticketId] = [];
    acc[message.ticketId].push(message);
    return acc;
  }, {}), [snapshot.messages]);

  return { tickets, messagesByTicket, refresh, loading, error };
}
