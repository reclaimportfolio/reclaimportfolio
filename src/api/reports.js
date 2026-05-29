import { apiRequest } from "../lib/apiClient.js";

export const listCaseReports = () => apiRequest("reports/", { auth: true });
export const createCaseReportRecord = (payload) => apiRequest("reports/", { method: "POST", body: payload, auth: true });
export const getCaseReport = (reportId) => apiRequest(`reports/${reportId}/`, { auth: true });
export const updateCaseReport = (reportId, payload) => apiRequest(`admin/reports/${reportId}/`, { method: "PATCH", body: payload, auth: true, scope: "admin" });
export const createAdminCaseReport = (caseId, payload) => apiRequest(`admin/cases/${caseId}/reports/`, { method: "POST", body: payload, auth: true, scope: "admin" });
export const listDocuments = ({ scope = "client" } = {}) => {
  const isAdmin = scope === "admin";
  return apiRequest(isAdmin ? "admin/documents/" : "documents/", { auth: true, scope: isAdmin ? "admin" : "client" });
};
export const createDocument = (payload) => apiRequest("documents/", { method: "POST", body: payload, auth: true });
export const updateAdminDocument = (documentId, payload) => apiRequest(`admin/documents/${documentId}/`, { method: "PATCH", body: payload, auth: true, scope: "admin" });
export const deleteAdminDocument = (documentId) => apiRequest(`admin/documents/${documentId}/`, { method: "DELETE", auth: true, scope: "admin" });
