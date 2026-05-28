import { apiRequest } from "../lib/apiClient.js";

export const listSupportTickets = (scope = "client") => apiRequest("support/", { auth: true, scope });
export const getSupportTicket = (ticketId, scope = "client") => apiRequest(`support/${ticketId}/`, { auth: true, scope });
export const createSupportTicket = (payload) => apiRequest("support/", { method: "POST", body: payload, auth: true });
export const updateSupportTicket = (ticketId, payload) => apiRequest(`support/${ticketId}/`, { method: "PATCH", body: payload, auth: true, scope: "admin" });
export const markSupportTicketRead = (ticketId, scope = "client") => apiRequest(`support/${ticketId}/read/`, { method: "POST", auth: true, scope });
export const listTicketMessages = (ticketId, scope = "client") => apiRequest(`support/${ticketId}/messages/`, { auth: true, scope });
export const sendTicketMessage = (ticketId, payload, scope = "client") => apiRequest(`support/${ticketId}/messages/`, { method: "POST", body: payload, auth: true, scope });
