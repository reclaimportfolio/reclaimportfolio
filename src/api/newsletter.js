import { apiRequest } from "../lib/apiClient.js";

export const subscribeNewsletter = (payload) => apiRequest("newsletter/subscribe/", { method: "POST", body: payload });
