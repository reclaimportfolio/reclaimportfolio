import { apiRequest } from "../lib/apiClient.js";

export const submitContactMessage = (payload) => apiRequest("contact/", { method: "POST", body: payload });
