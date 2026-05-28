import { apiRequest } from "../lib/apiClient.js";

const MAX_EVIDENCE_FILES = 5;
const MAX_EVIDENCE_FILE_SIZE = 10 * 1024 * 1024;
const MAX_EVIDENCE_TOTAL_SIZE = 25 * 1024 * 1024;

export function submitIntake(payload, files = []) {
  const evidence = Array.from(files || []).filter(Boolean);
  if (evidence.length > MAX_EVIDENCE_FILES) throw new Error("Upload no more than 5 evidence files.");
  if (evidence.some((file) => file.size > MAX_EVIDENCE_FILE_SIZE)) throw new Error("Each evidence file must be 10 MB or less.");
  if (evidence.reduce((total, file) => total + file.size, 0) > MAX_EVIDENCE_TOTAL_SIZE) {
    throw new Error("Evidence files must total 25 MB or less.");
  }
  if (!evidence.length) return apiRequest("intake/", { method: "POST", body: payload });
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    form.append(key, typeof value === "boolean" ? String(value) : value ?? "");
  });
  evidence.forEach((file) => form.append("evidence", file));
  return apiRequest("intake/", { method: "POST", body: form });
}
export const getMyCases = () => apiRequest("intake/my-cases/", { auth: true });
export const getMyCaseDetail = (caseId) => apiRequest(`intake/${caseId}/`, { auth: true });
