import { useCallback, useMemo, useState } from "react";
import { createDocument, deleteAdminDocument, listDocuments, updateAdminDocument } from "./api.js";
import { useVisiblePolling } from "./utils/useVisiblePolling.js";

const nowIso = () => new Date().toISOString();
const makeId = () => `DOC-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
const clean = (value = "") => String(value).replace(/[<>]/g, "").trim();
const allowedTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const maxFileSize = 10 * 1024 * 1024;

export const documentStatusLabels = {
  reviewing: "Reviewing",
  verified: "Verified",
  denied: "Denied",
};

export const documentStatuses = Object.keys(documentStatusLabels);
export const kycRequiredDocumentTypes = [
  "Government ID",
  "Proof of address",
  "Wallet ownership proof",
  "Recovery authorization",
];

const normalizeKycKey = (value = "") => String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

export function normalizeDocumentStatus(status = "reviewing") {
  const value = String(status).trim().toLowerCase().replace(/\s+/g, "_");
  if (value === "verified") return "verified";
  if (value === "denied" || value === "rejected") return "denied";
  return "reviewing";
}

export function getDocumentLabel(status) {
  return documentStatusLabels[normalizeDocumentStatus(status)];
}

export function getLatestKycDocuments(uploads = []) {
  const requiredKeys = new Set(kycRequiredDocumentTypes.map(normalizeKycKey));
  return uploads
    .filter((upload) => requiredKeys.has(normalizeKycKey(upload.documentType)))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .reduce((latest, upload) => {
      const key = normalizeKycKey(upload.documentType);
      if (!latest[key]) latest[key] = upload;
      return latest;
    }, {});
}

export function getKycState(user, uploads = []) {
  const userStatus = normalizeDocumentStatus(user?.verificationStatus || user?.verification_status || "unverified");
  const latest = getLatestKycDocuments(uploads);
  const items = kycRequiredDocumentTypes.map((type) => {
    const document = latest[normalizeKycKey(type)];
    return {
      type,
      document,
      status: document ? normalizeDocumentStatus(document.status) : "missing",
      statusLabel: document ? getDocumentLabel(document.status) : "Missing",
    };
  });
  const verifiedCount = items.filter((item) => item.status === "verified").length;
  const submittedCount = items.filter((item) => item.document).length;
  const deniedCount = items.filter((item) => item.status === "denied").length;
  const allVerified = verifiedCount === kycRequiredDocumentTypes.length;
  const approved = userStatus === "verified" || (userStatus !== "denied" && allVerified);
  const status = approved
    ? "verified"
    : userStatus === "denied" || deniedCount
      ? "denied"
      : submittedCount
        ? "reviewing"
        : "unverified";

  return {
    approved,
    status,
    statusLabel: status === "unverified" ? "Unverified" : getDocumentLabel(status),
    items,
    submittedCount,
    verifiedCount,
    deniedCount,
    missingCount: kycRequiredDocumentTypes.length - submittedCount,
    requiredCount: kycRequiredDocumentTypes.length,
  };
}

function normalizeUpload(upload) {
  const documentName = clean(upload.documentName || upload.document_name || upload.name || upload.fileName || upload.file_name || "Document");
  const documentType = clean(upload.documentType || upload.document_type || upload.category || "Evidence");
  const fileName = clean(upload.fileName || upload.file_name || upload.name || documentName);
  const status = normalizeDocumentStatus(upload.status);
  return {
    ...upload,
    id: upload.id ? String(upload.id) : makeId(),
    clientId: String(upload.clientId || upload.user || ""),
    clientName: clean(upload.clientName || upload.client_name || "Client"),
    clientEmail: clean(upload.clientEmail || upload.client_email),
    caseId: clean(upload.caseId || upload.case || "Unassigned"),
    documentName,
    documentType,
    fileName: clean(upload.file_name || fileName),
    fileSize: upload.file_size ?? upload.fileSize ?? upload.rawFileSize ?? 0,
    size: upload.size || formatFileSize(upload.fileSize ?? upload.rawFileSize ?? 0),
    mimeType: upload.mime_type || upload.mimeType || "",
    fileUrl: upload.file_url || upload.fileUrl || "",
    status,
    statusLabel: getDocumentLabel(status),
    adminNote: upload.adminNote || upload.admin_note || "",
    uploadedAt: upload.uploadedAt || upload.created_at || nowIso(),
  };
}

export function formatFileSize(bytes = 0) {
  if (!bytes) return "Unknown";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function createDocumentUpload({ client, file, category, caseId }) {
  if (!client?.id) throw new Error("A signed-in client is required.");
  if (!file) throw new Error("Choose a file before sending.");
  if (!allowedTypes.has(file.type)) throw new Error("Upload a PDF, image, DOC, or DOCX file.");
  if (file.size > maxFileSize) throw new Error("File size must be 10 MB or less.");
  const documentName = clean(file.name);
  const documentType = clean(category) || "Evidence";
  const upload = {
    id: makeId(),
    clientId: client.id,
    clientName: clean(client.name) || "Client",
    clientEmail: clean(client.email),
    caseId: clean(caseId) || "Unassigned",
    documentName,
    documentType,
    fileName: documentName,
    fileSize: file.size,
    mimeType: file.type,
    name: documentName,
    category: documentType,
    size: formatFileSize(file.size),
    rawFileSize: file.size,
    uploadedAt: nowIso(),
    status: "reviewing",
    adminNote: "",
  };
  const formData = new FormData();
  if (caseId && /^\d+$/.test(String(caseId))) formData.append("case", String(caseId));
  formData.append("document_name", upload.documentName);
  formData.append("document_type", upload.documentType);
  formData.append("file_name", upload.fileName);
  formData.append("file_size", String(upload.fileSize));
  formData.append("size", upload.size);
  formData.append("mime_type", upload.mimeType);
  formData.append("file", file, upload.fileName);
  const created = await createDocument(formData);
  return normalizeUpload({
    ...created,
    clientId: client.id,
    clientName: clean(client.name) || "Client",
    clientEmail: clean(client.email),
  });
}

export async function updateDocumentReview({ documentId, status, adminNote = "", reviewedBy = "Admin" }) {
  const nextStatus = normalizeDocumentStatus(status);
  const updated = await updateAdminDocument(documentId, {
    status: nextStatus,
    admin_note: clean(adminNote),
  });
  return normalizeUpload({
    ...updated,
    reviewedAt: nowIso(),
    reviewedBy: clean(reviewedBy) || "Admin",
  });
}

export async function deleteDocumentUpload(documentId) {
  await deleteAdminDocument(documentId);
  return String(documentId);
}

export function useDocumentUploads({ clientId = "", role = "client", pollMs = 5000 } = {}) {
  const [uploads, setUploads] = useState([]);
  const refresh = useCallback(async () => {
    try {
      const rows = await listDocuments({ scope: role === "admin" ? "admin" : "client" });
      setUploads(Array.isArray(rows) ? rows.map(normalizeUpload) : []);
    } catch {
      setUploads([]);
    }
  }, [role]);

  useVisiblePolling(refresh, pollMs);

  return useMemo(() => {
    const visible = role === "admin" ? uploads : uploads.filter((item) => item.clientId === String(clientId));
    return visible.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  }, [clientId, role, uploads]);
}
