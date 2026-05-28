import { useCallback, useMemo, useState } from "react";
import { formatFileSize } from "./documentUploads.js";
import { createCaseReportRecord, listCaseReports, updateCaseReport } from "./api.js";
import { useVisiblePolling } from "./utils/useVisiblePolling.js";

const maxFileSize = 10 * 1024 * 1024;
const maxFiles = 5;
const maxEncodedUploadInputSize = 20 * 1024 * 1024;
const allowedTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const nowIso = () => new Date().toISOString();
const makeId = () => `RPT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
const makeDocId = () => `DOC-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
const clean = (value = "") => String(value).replace(/[<>]/g, "").trim();

export const reportStatusLabels = {
  reviewing: "Reviewing",
  verified: "Verified",
  processing: "Processing",
};

export const reportStatuses = Object.keys(reportStatusLabels);

export const reportCategories = [
  "Unclaimed Property Recovery",
  "Financial Asset Recovery",
  "Cryptocurrency Investigation",
  "Crypto Compliance & Risk",
  "Fraud & Scam Case Review",
  "Institutional Recovery Support",
  "Other",
];

export function normalizeReportStatus(status = "reviewing") {
  const value = String(status).trim().toLowerCase();
  if (value === "verified") return "verified";
  if (value === "processing") return "processing";
  return "reviewing";
}

export function getReportStatusLabel(status) {
  return reportStatusLabels[normalizeReportStatus(status)];
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

async function normalizeFiles(files = [], caseId, clientId) {
  const list = Array.from(files).filter(Boolean);
  if (list.length > maxFiles) throw new Error("Upload no more than 5 evidence files.");
  if (list.reduce((total, file) => total + file.size, 0) > maxEncodedUploadInputSize) {
    throw new Error("Case report attachments must total 20 MB or less.");
  }
  const documents = [];
  for (const file of list) {
    if (!allowedTypes.has(file.type)) throw new Error("Upload PDF, image, DOC, or DOCX evidence files.");
    if (file.size > maxFileSize) throw new Error("Each evidence file must be 10 MB or less.");
    const documentName = clean(file.name);
    documents.push({
      id: makeDocId(),
      caseId,
      clientId,
      documentName,
      documentType: "Evidence",
      fileUrl: await readFileAsDataUrl(file),
      fileName: documentName,
      fileSize: file.size,
      size: formatFileSize(file.size),
      mimeType: file.type,
      uploadedAt: nowIso(),
    });
  }
  return documents;
}

function normalizeReport(report) {
  const status = normalizeReportStatus(report.status);
  const id = report.id ? String(report.id) : makeId();
  return {
    ...report,
    id,
    clientId: String(report.clientId || report.user || ""),
    clientName: clean(report.clientName || report.client_name || report.full_name || "Client"),
    clientEmail: clean(report.clientEmail || report.client_email || report.email),
    amountInvolved: clean(report.amountInvolved || report.amount_involved),
    assetType: clean(report.assetType || report.asset_type),
    walletAddressOrTxHash: clean(report.walletAddressOrTxHash || report.wallet_address_or_tx_hash),
    preferredContactMethod: clean(report.preferredContactMethod || report.preferred_contact_method),
    incidentDate: clean(report.incidentDate || report.incident_date),
    status,
    statusLabel: getReportStatusLabel(status),
    documents: Array.isArray(report.documents) ? report.documents : [],
    adminNote: report.adminNote || report.admin_note || "",
    createdAt: report.createdAt || report.created_at || nowIso(),
    updatedAt: report.updatedAt || report.updated_at || report.created_at || nowIso(),
  };
}

export async function createCaseReport({ client, form, files }) {
  if (!client?.id) throw new Error("A signed-in client is required.");
  if (!clean(form.title)) throw new Error("Case title is required.");
  if (!clean(form.description)) throw new Error("Complaint details are required.");
  const id = makeId();
  const createdAt = nowIso();
  const documents = await normalizeFiles(files, id, client.id);
  const payload = {
    title: clean(form.title),
    category: clean(form.category) || reportCategories[0],
    description: clean(form.description),
    amount_involved: clean(form.amountInvolved),
    asset_type: clean(form.assetType),
    wallet_address_or_tx_hash: clean(form.walletAddressOrTxHash),
    incident_date: clean(form.incidentDate),
    preferred_contact_method: clean(form.preferredContactMethod),
    documents,
  };
  const created = await createCaseReportRecord(payload);
  return normalizeReport({
    ...created,
    id: created.id || id,
    clientId: client.id,
    clientName: clean(client.name) || "Client",
    clientEmail: clean(client.email),
    createdAt,
    updatedAt: createdAt,
  });
}

export async function updateCaseReportReview({ reportId, status, adminNote = "", reviewedBy = "Admin" }) {
  const nextStatus = normalizeReportStatus(status);
  const updatedAt = nowIso();
  const updated = await updateCaseReport(reportId, {
    status: nextStatus,
    admin_note: clean(adminNote),
  });
  return normalizeReport({
    ...updated,
    updatedAt,
    reviewedAt: updatedAt,
    reviewedBy: clean(reviewedBy) || "Admin",
  });
}

export function useCaseReports({ clientId = "", role = "client", pollMs = 5000 } = {}) {
  const [reports, setReports] = useState([]);
  const refresh = useCallback(async () => {
    try {
      const rows = await listCaseReports();
      setReports(Array.isArray(rows) ? rows.map(normalizeReport) : []);
    } catch {
      setReports([]);
    }
  }, []);

  useVisiblePolling(refresh, pollMs);

  return useMemo(() => {
    const visible = role === "admin" ? reports : reports.filter((item) => item.clientId === String(clientId));
    return visible.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [clientId, role, reports]);
}
