import { apiRequest } from "../lib/apiClient.js";

export const listResources = () => apiRequest("resources/");
export const getResource = (slug) => apiRequest(`resources/${slug}/`);
export const listAdminResources = () => apiRequest("admin/resources/", { auth: true, scope: "admin" });
export const createAdminResource = (payload) => apiRequest("admin/resources/", { method: "POST", body: payload, auth: true, scope: "admin" });
export const updateAdminResource = (slug, payload) => apiRequest(`admin/resources/${slug}/`, { method: "PATCH", body: payload, auth: true, scope: "admin" });
export const deleteAdminResource = (slug) => apiRequest(`admin/resources/${slug}/`, { method: "DELETE", auth: true, scope: "admin" });
