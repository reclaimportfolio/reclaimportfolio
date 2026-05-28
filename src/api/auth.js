import { apiRequest } from "../lib/apiClient.js";

export const registerClient = (profile) => apiRequest("auth/register/", { method: "POST", body: profile });
export const loginClient = (credentials) => apiRequest("auth/login/", { method: "POST", body: credentials });
export const logoutClient = (refresh) => apiRequest("auth/logout/", { method: "POST", body: { refresh }, auth: true });
export const getCurrentUser = () => apiRequest("auth/me/", { auth: true });
export const changePassword = (payload) => apiRequest("auth/password-change/", { method: "POST", body: payload, auth: true });
export const requestPasswordReset = (email) => apiRequest("auth/password-reset/", { method: "POST", body: { email } });
export const confirmPasswordReset = (payload) => apiRequest("auth/password-reset-confirm/", { method: "POST", body: payload });

export const loginAdmin = (credentials) => apiRequest("auth/admin-login/", { method: "POST", body: credentials, scope: "admin" });
export const logoutAdmin = (refresh) => apiRequest("auth/admin-logout/", { method: "POST", body: { refresh }, auth: true, scope: "admin" });
export const getAdminUser = () => apiRequest("auth/admin/me/", { auth: true, scope: "admin" });
