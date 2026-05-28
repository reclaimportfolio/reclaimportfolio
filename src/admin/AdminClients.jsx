import { useCallback, useEffect, useMemo, useState } from "react";
import { LuDownload, LuEye, LuNotebookPen, LuPencil, LuPlus, LuSearch, LuTrash2, LuWallet, LuX } from "react-icons/lu";
import {
  clientAssetSymbols,
  clientStockSymbols,
  removeClientAsset,
  upsertClientAsset,
  useClientAssets,
} from "../clientAssets.js";
import {
  createClientTransaction,
  deleteClientTransaction,
  transactionAssets,
  transactionStatusLabels,
  transactionStatuses,
  transactionTypeLabels,
  transactionTypes,
  updateClientTransaction,
  useClientTransactions,
} from "../clientTransactions.js";
import { getAdminAssetPrices, getAdminUsers, requestPasswordReset, updateAdminUser } from "../api.js";
import { getReportStatusLabel, reportStatuses, updateCaseReportReview, useCaseReports } from "../caseReports.js";
import { documentStatuses, getDocumentLabel, updateDocumentReview, useDocumentUploads } from "../documentUploads.js";
import { AdminPanel, EmptyAdminState, PageHeader, StatusPill } from "./AdminKit.jsx";
import { cryptoAssets } from "./adminData.js";
import { getErrorMessage } from "../utils/errorMessages.js";
import { downloadFileUrl, openFileUrl } from "../utils/filePreview.js";
import { AssetIcon } from "../components/dashboard/AssetIcon.jsx";
import { getStockAssetMeta } from "../lib/assetIconResolver.js";

const registrationStatuses = ["pending", "approved", "rejected", "suspended"];
const verificationStatuses = ["unverified", "reviewing", "verified", "denied"];
const stableAssetSymbols = new Set(["USDT", "USDC"]);
const stableNetworkOptions = [
  "Ethereum ERC-20",
  "TRON TRC20",
  "BNB Smart Chain BEP-20",
  "Polygon PoS",
  "Solana SPL",
];

function labelStatus(value = "") {
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function money(value = "") {
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numeric) ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numeric) : value || "$0";
}

function numericMoney(value = "") {
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatUsd(value = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function assetTypeFor(asset = {}) {
  const type = String(asset.assetType || asset.asset_type || asset.type || "").toLowerCase();
  if (type === "stock") return "stock";
  return clientStockSymbols.includes(String(asset.asset || asset.symbol || "").toUpperCase()) ? "stock" : "crypto";
}

function unitPriceFor(asset = {}) {
  const amount = numericMoney(asset.amount);
  const fiat = numericMoney(asset.fiatValue || asset.fiat_value);
  if (amount > 0 && fiat > 0) return Number((fiat / amount).toFixed(8));
  return assetMeta(asset.asset, assetTypeFor(asset)).price || 0;
}

function assetMeta(symbol = "ETH", type = "crypto") {
  const cleanSymbol = String(symbol || "ETH").toUpperCase();
  if (type === "stock" || clientStockSymbols.includes(cleanSymbol)) {
    return { ...getStockAssetMeta(cleanSymbol), network: "US Equities", price: 0 };
  }
  return cryptoAssets.find((asset) => asset.symbol === cleanSymbol) || cryptoAssets[1] || cryptoAssets[0];
}

function networkForAsset(symbol, fallback = "", type = "crypto") {
  if (type === "stock" || clientStockSymbols.includes(String(symbol || "").toUpperCase())) return fallback || "US Equities";
  if (stableAssetSymbols.has(symbol)) return stableNetworkOptions.includes(fallback) ? fallback : stableNetworkOptions[0];
  return fallback || assetMeta(symbol, type).network;
}

function makeClientFromPortalUser(user, related = {}) {
  return {
    id: user.id,
    name: user.name || user.username || "Client",
    email: user.email || "",
    phone: user.phone || "Not provided",
    address: user.address || "Not provided",
    createdAt: user.createdAt || "",
    registrationStatus: user.registrationStatus || "pending",
    verificationStatus: user.verificationStatus || user.verification_status || "reviewing",
    lastActivityAt: related.lastActivityAt || user.lastLogin || user.createdAt || "",
    notes: user.adminNotes || user.admin_notes || user.notes || ["Client registered through the portal."],
    passwordResetRequired: Boolean(user.passwordResetRequired || user.password_reset_required),
    passwordResetRequestedAt: user.passwordResetRequestedAt || user.password_reset_requested_at || "",
    passwordResetLinkSentAt: user.passwordResetLinkSentAt || user.password_reset_link_sent_at || "",
    source: "portal",
  };
}

function openClientDocument(doc) {
  openFileUrl(doc.fileUrl);
}

function downloadClientDocument(doc) {
  downloadFileUrl(doc.fileUrl, doc.fileName || doc.documentName);
}

export function AdminClients() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedId, setSelectedId] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [portalUsers, setPortalUsers] = useState([]);
  const [loadError, setLoadError] = useState("");
  const uploadedDocuments = useDocumentUploads({ role: "admin" });
  const adminTransactions = useClientTransactions({ role: "admin" });
  const reports = useCaseReports({ role: "admin" });
  const clientAssets = useClientAssets({ role: "admin" });

  useEffect(() => {
    async function loadUsers() {
      try {
        const rows = await getAdminUsers();
        const users = Array.isArray(rows) ? rows.map((user) => ({
          id: String(user.id),
          name: user.full_name || user.name || user.username || user.email,
          email: user.email,
          phone: user.phone || "Not provided",
          address: user.address || "Not provided",
          createdAt: user.date_joined,
          registrationStatus: user.is_active ? "approved" : "suspended",
          verificationStatus: user.verificationStatus || user.verification_status || (user.role === "client" ? "reviewing" : "verified"),
          adminNotes: user.adminNotes || user.admin_notes || [],
          passwordResetRequired: user.passwordResetRequired || user.password_reset_required,
          passwordResetRequestedAt: user.passwordResetRequestedAt || user.password_reset_requested_at,
          passwordResetLinkSentAt: user.passwordResetLinkSentAt || user.password_reset_link_sent_at,
          role: user.role,
          isStaff: user.is_staff,
        })) : [];
        setPortalUsers(users);
        setLoadError("");
      } catch (error) {
        setLoadError(getErrorMessage(error, "Unable to load backend users."));
      }
    }
    loadUsers();
  }, []);

  const clients = useMemo(() => {
    const ids = new Set();
    const relatedFor = (id, email) => {
      const relatedTx = adminTransactions.filter((tx) => tx.clientId === id || tx.clientEmail === email);
      const relatedReports = reports.filter((report) => report.clientId === id || report.clientEmail === email);
      const dates = [...relatedTx.map((tx) => tx.updatedAt || tx.createdAt), ...relatedReports.map((report) => report.updatedAt || report.createdAt)].filter(Boolean);
      return { lastActivityAt: dates.sort((a, b) => new Date(b) - new Date(a))[0] || "" };
    };
    const portal = portalUsers.map((user) => {
        ids.add(user.id);
        return makeClientFromPortalUser(user, relatedFor(user.id, user.email));
      });
    const generated = [...uploadedDocuments, ...adminTransactions, ...reports]
      .filter((item) => item.clientId && !ids.has(item.clientId))
      .map((item) => {
        ids.add(item.clientId);
        return makeClientFromPortalUser({
          id: item.clientId,
          name: item.clientName || "Client",
          email: item.clientEmail || "",
          phone: "Not provided",
          address: "Not provided",
          createdAt: item.createdAt || item.uploadedAt || item.updatedAt,
        }, relatedFor(item.clientId, item.clientEmail));
      });
    return [...portal, ...generated].filter((client) =>
      `${client.name} ${client.email} ${client.phone} ${client.registrationStatus} ${client.verificationStatus}`.toLowerCase().includes(q.toLowerCase()),
    );
  }, [adminTransactions, portalUsers, q, reports, uploadedDocuments]);

  const selected = clients.find((client) => client.id === selectedId) || clients[0];
  const selectedDocs = uploadedDocuments.filter((doc) => doc.clientId === selected?.id || doc.clientEmail === selected?.email);
  const selectedReports = reports.filter((report) => report.clientId === selected?.id || report.clientEmail === selected?.email);
  const selectedTransactions = adminTransactions.filter((tx) => tx.clientId === selected?.id || tx.clientEmail === selected?.email);
  const assignedAssets = clientAssets.filter((asset) => asset.clientId === selected?.id);
  const displayedAssets = assignedAssets;

  const updateClientMeta = async (patch, target = selected) => {
    if (!target) return;
    const apiPatch = {};
    if (patch.registrationStatus) apiPatch.is_active = patch.registrationStatus !== "suspended" && patch.registrationStatus !== "rejected";
    if (patch.verificationStatus) apiPatch.verification_status = patch.verificationStatus;
    if (patch.notes) apiPatch.admin_notes = patch.notes;
    if (patch.passwordResetRequired !== undefined) apiPatch.password_reset_required = patch.passwordResetRequired;
    if (patch.passwordResetRequestedAt) apiPatch.password_reset_requested_at = patch.passwordResetRequestedAt;
    if (patch.passwordResetLinkSentAt) apiPatch.password_reset_link_sent_at = patch.passwordResetLinkSentAt;
    if (patch.role) apiPatch.role = patch.role;
    if (Object.keys(apiPatch).length) await updateAdminUser(target.id, apiPatch);
    setPortalUsers((current) => current.map((user) => user.id === target.id ? { ...user, ...patch } : user));
  };

  if (detailOpen && selected) {
    return (
      <div>
        <PageHeader
          eyebrow="Client profile"
          title={selected.name}
          copy={`${selected.email} - ${selected.phone} - Registered ${selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "Not provided"}`}
          action={<button className="admin-small-btn" onClick={() => setDetailOpen(false)}>Back to clients</button>}
        />

        <section className="admin-grid-2" style={{ marginTop: 14 }}>
          <AdminPanel title="Client details" copy="Manage client profile, assets, wallets, transactions, documents, reports, and internal notes.">
            <div className="admin-inline-actions" style={{ marginBottom: 14 }}>
              {["profile", "assets", "transactions", "wallets", "documents", "cases", "notes"].map((tab) => (
                <button key={tab} className={`admin-small-btn ${activeTab === tab ? "primary" : ""}`} onClick={() => setActiveTab(tab)}>{labelStatus(tab)}</button>
              ))}
            </div>
            {activeTab === "profile" && <ClientProfileTab client={selected} updateClientMeta={updateClientMeta} />}
            {activeTab === "assets" && <AssetsTab client={selected} assets={displayedAssets} transactions={selectedTransactions} setModal={setModal} />}
            {activeTab === "transactions" && <TransactionsTab transactions={selectedTransactions} setModal={setModal} />}
            {activeTab === "wallets" && <WalletsTab client={selected} assets={displayedAssets} setModal={setModal} />}
            {activeTab === "documents" && <DocumentsTab docs={selectedDocs} />}
            {activeTab === "cases" && <CasesTab reports={selectedReports} setModal={setModal} />}
            {activeTab === "notes" && <NotesTab notes={selected.notes || []} setModal={setModal} />}
          </AdminPanel>

          <AdminPanel title="Account snapshot" copy="Current client controls">
            <div className="admin-grid-2">
              <div className="kv"><span className="k">Registration</span><span className="v"><StatusPill status={labelStatus(selected.registrationStatus)} /></span></div>
              <div className="kv"><span className="k">Verification</span><span className="v"><StatusPill status={labelStatus(selected.verificationStatus)} /></span></div>
              <div className="kv"><span className="k">Visible assets</span><span className="v">{displayedAssets.filter((asset) => asset.visible !== false).length}</span></div>
              <div className="kv"><span className="k">Transactions</span><span className="v">{selectedTransactions.length}</span></div>
              <div className="kv"><span className="k">Documents</span><span className="v">{selectedDocs.length}</span></div>
              <div className="kv"><span className="k">Reports</span><span className="v">{selectedReports.length}</span></div>
            </div>
          </AdminPanel>
        </section>

        {modal && <ClientModal modal={modal} client={selected} onClose={() => setModal(null)} updateClientMeta={updateClientMeta} />}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Client management"
        title="Registered users"
        copy="Review registrations, manage balances, assign wallets, add transactions, and review client evidence."
      />

      <AdminPanel>
        {loadError && <div className="auth-alert danger" style={{ marginBottom: 12 }}>{loadError}</div>}
        <div className="toolbar">
          <div className="search-box"><LuSearch /><input placeholder="Search users by name, email, phone, or status..." value={q} onChange={(event) => setQ(event.target.value)} /></div>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Client</th><th>Phone</th><th>Registered</th><th>Registration</th><th>Verification</th><th>Wallets</th><th>Reports</th><th>Last activity</th><th>Actions</th></tr></thead>
            <tbody>
              {clients.map((client) => {
                const walletCount = clientAssets.filter((asset) => asset.clientId === client.id && asset.visible !== false).length;
                const reportCount = reports.filter((report) => report.clientId === client.id || report.clientEmail === client.email).length;
                return (
                  <tr key={client.id} className={selected?.id === client.id ? "active" : ""}>
                    <td><strong>{client.name}</strong><div className="muted" style={{ fontSize: 11 }}>{client.email}</div></td>
                    <td>{client.phone}</td>
                    <td className="mono muted">{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "Not provided"}</td>
                    <td><StatusPill status={labelStatus(client.registrationStatus)} /></td>
                    <td><StatusPill status={labelStatus(client.verificationStatus)} /></td>
                    <td>{walletCount ? `${walletCount} assigned` : "None"}</td>
                    <td>{reportCount}</td>
                    <td className="mono muted">{client.lastActivityAt ? new Date(client.lastActivityAt).toLocaleDateString() : "No activity"}</td>
                    <td>
                      <div className="admin-inline-actions">
                        <button className="admin-small-btn" onClick={() => { setSelectedId(client.id); setActiveTab("profile"); setDetailOpen(true); }}><LuEye /> Open</button>
                        <button className="admin-small-btn" onClick={() => { setSelectedId(client.id); setModal({ type: "send-reset-link", client }); }}>Reset link</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!clients.length && <tr><td colSpan="9"><EmptyAdminState title="No registered users" copy="Client registrations will appear here." /></td></tr>}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      {modal && selected && <ClientModal modal={modal} client={selected} onClose={() => setModal(null)} updateClientMeta={updateClientMeta} />}
    </div>
  );
}

function ClientProfileTab({ client, updateClientMeta, setModal }) {
  return (
    <div className="screen-stack">
      <div className="admin-form-grid">
        <div className="kv"><span className="k">Full name</span><span className="v">{client.name}</span></div>
        <div className="kv"><span className="k">Email</span><span className="v">{client.email}</span></div>
        <div className="kv"><span className="k">Phone</span><span className="v">{client.phone}</span></div>
        <div className="kv"><span className="k">Address</span><span className="v">{client.address}</span></div>
        <label className="field">Registration status<select value={client.registrationStatus} onChange={(event) => updateClientMeta({ registrationStatus: event.target.value })}>{registrationStatuses.map((item) => <option key={item} value={item}>{labelStatus(item)}</option>)}</select></label>
        <label className="field">Verification status<select value={client.verificationStatus} onChange={(event) => updateClientMeta({ verificationStatus: event.target.value })}>{verificationStatuses.map((item) => <option key={item} value={item}>{labelStatus(item)}</option>)}</select></label>
      </div>
      <div className="admin-inline-actions">
        <button className="admin-small-btn primary" onClick={() => setModal?.({ type: "reset-password" })}>Reset password</button>
        <button className="admin-small-btn" onClick={() => setModal?.({ type: "send-reset-link" })}>Send password reset link</button>
      </div>
      <div className="security-note"><LuWallet /> Passwords are never shown here. Client accounts store password hashes only.</div>
    </div>
  );
}

function AssetsTab({ client, assets, transactions, setModal }) {
  return (
    <div className="admin-ops-list">
      <div className="admin-inline-actions">
        <button className="admin-small-btn primary" onClick={() => setModal({ type: "asset", assetType: "crypto" })}><LuPlus /> Add crypto asset</button>
        <button className="admin-small-btn primary" onClick={() => setModal({ type: "asset", assetType: "stock" })}><LuPlus /> Add stock</button>
      </div>
      {assets.map((asset) => <AssetRow key={asset.id} asset={asset} transactions={transactions} setModal={setModal} />)}
      {!assets.length && <EmptyAdminState title="No assets assigned" copy="Add assets to control what appears on this client dashboard." />}
    </div>
  );
}

function AssetRow({ asset, transactions, setModal }) {
  const type = assetTypeFor(asset);
  const meta = assetMeta(asset.asset, type);
  const coinTransactions = transactions.filter((tx) => tx.asset === asset.asset);
  const assetLabel = type === "stock" ? "Stock" : "Crypto";
  return (
    <div className="admin-ops-row">
      <div>
        <strong><AssetIcon asset={{ ...meta, type }} size={24} /> {asset.asset} - {asset.amount} {type === "stock" ? "shares" : ""}</strong>
        <span>{assetLabel} - {money(asset.fiatValue)} - {asset.visible === false ? "Hidden" : "Visible"} - {asset.network}</span>
        <span className="mono">{type === "stock" ? (asset.label || `${asset.asset} position`) : (asset.walletAddress || "No deposit wallet assigned")}</span>
      </div>
      <div className="admin-inline-actions">
        <StatusPill status={asset.active === false ? "Closed" : "Open"} />
        <button onClick={() => setModal({ type: "coin-detail", asset, transactions: coinTransactions })}>View details</button>
        <button onClick={() => setModal({ type: "asset", asset })}><LuPencil /> {type === "stock" ? "Edit Position" : "Edit Balance"}</button>
        <button onClick={() => setModal({ type: "transaction", asset })}><LuPlus /> Add Transaction</button>
        <button onClick={() => setModal({ type: "coin-transactions", asset, transactions: coinTransactions })}>View Transactions</button>
        {type !== "stock" && <button onClick={() => setModal({ type: "asset", asset })}><LuWallet /> Assign Wallet</button>}
        {!asset.demo && <button onClick={() => setModal({ type: "delete-asset", asset })}><LuTrash2 /> Remove</button>}
      </div>
    </div>
  );
}

function WalletsTab({ assets, setModal }) {
  const walletAssets = assets.filter((asset) => assetTypeFor(asset) !== "stock");
  return (
    <div className="admin-ops-list">
      <div className="admin-inline-actions"><button className="admin-small-btn primary" onClick={() => setModal({ type: "asset", assetType: "crypto" })}><LuWallet /> Assign wallet</button></div>
      {walletAssets.map((asset) => (
        <div className="admin-ops-row" key={asset.id}>
          <div><strong>{asset.label || `${asset.asset} wallet`}</strong><span className="mono">{asset.walletAddress || "No wallet address assigned"}</span><span>{asset.asset} - {asset.network}</span></div>
          <div className="admin-inline-actions"><StatusPill status={asset.active === false ? "Closed" : "Open"} /><button onClick={() => setModal({ type: "asset", asset })}>Edit</button></div>
        </div>
      ))}
      {!walletAssets.length && <EmptyAdminState title="No wallets assigned" copy="Crypto wallets appear here after an admin assigns them." />}
    </div>
  );
}

function TransactionsTab({ transactions, setModal }) {
  return (
    <div className="admin-ops-list">
      <div className="admin-inline-actions"><button className="admin-small-btn primary" onClick={() => setModal({ type: "transaction" })}><LuPlus /> Add transaction</button></div>
      {transactions.map((tx) => (
        <div className="admin-ops-row" key={tx.id}>
          <div><strong>{tx.transactionId} - {tx.typeLabel}</strong><span>{tx.displayAmount} - {tx.fiatValue} - {new Date(tx.transactionDate).toLocaleDateString()}</span></div>
          <div className="admin-inline-actions"><StatusPill status={tx.statusLabel} /><button onClick={() => setModal({ type: "transaction", transaction: tx })}>Edit</button><button onClick={() => setModal({ type: "delete-transaction", transaction: tx })}>Delete</button></div>
        </div>
      ))}
      {!transactions.length && <EmptyAdminState title="No transactions" copy="Add a transaction to show it on this client dashboard only." />}
    </div>
  );
}

function DocumentsTab({ docs }) {
  return (
    <div className="admin-ops-list">
      {docs.map((doc) => <DocumentReviewRow key={doc.id} doc={doc} />)}
      {!docs.length && <EmptyAdminState title="No documents" copy="Client uploads will appear here." />}
    </div>
  );
}

function DocumentReviewRow({ doc }) {
  const [status, setStatus] = useState(doc.status);
  const [note, setNote] = useState(doc.adminNote || "");
  const save = async () => updateDocumentReview({ documentId: doc.id, status, adminNote: note, reviewedBy: "Admin" });
  return (
    <div className="admin-ops-row">
      <div><strong>{doc.documentName}</strong><span>{doc.documentType} - {doc.size} - {new Date(doc.uploadedAt).toLocaleDateString()}</span></div>
      <div className="admin-inline-actions">
        <StatusPill status={getDocumentLabel(status)} />
        <button disabled={!doc.fileUrl} onClick={() => openClientDocument(doc)}><LuEye /> Preview</button>
        <button disabled={!doc.fileUrl} onClick={() => downloadClientDocument(doc)}><LuDownload /> Download</button>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>{documentStatuses.map((item) => <option key={item} value={item}>{getDocumentLabel(item)}</option>)}</select>
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Admin note" />
        <button className="admin-small-btn primary" onClick={save}>Save</button>
      </div>
    </div>
  );
}

function CasesTab({ reports, setModal }) {
  return (
    <div className="admin-ops-list">
      {reports.map((report) => (
        <div className="admin-ops-row" key={report.id}>
          <div><strong>{report.title}</strong><span>{report.category} - {report.documents.length} documents</span></div>
          <div className="admin-inline-actions"><StatusPill status={report.statusLabel} /><button onClick={() => setModal({ type: "case", report })}>Review</button></div>
        </div>
      ))}
      {!reports.length && <EmptyAdminState title="No case reports" copy="Submitted reports will appear here." />}
    </div>
  );
}

function NotesTab({ notes, setModal }) {
  return (
    <div className="admin-ops-list">
      <div className="admin-inline-actions"><button className="admin-small-btn primary" onClick={() => setModal({ type: "note" })}><LuNotebookPen /> Add note</button></div>
      {notes.map((note, index) => <div className="note-item" key={`${note}-${index}`}><div className="note-meta">Internal note {index + 1}</div>{note}</div>)}
    </div>
  );
}

function ClientModal({ modal, client, onClose, updateClientMeta }) {
  const title = {
    asset: modal.asset ? "Edit client asset" : modal.assetType === "stock" ? "Add client stock" : "Add client crypto asset",
    "delete-asset": "Remove client asset",
    "coin-detail": `${modal.asset?.asset || "Asset"} details`,
    "coin-transactions": `${modal.asset?.asset || "Asset"} transactions`,
    transaction: modal.transaction ? "Edit transaction" : "Add transaction",
    "delete-transaction": "Delete transaction",
    case: "Review case report",
    note: "Add internal note",
    "reset-password": "Reset client password",
    "send-reset-link": "Send password reset link",
  }[modal.type];
  const targetClient = modal.client || client;
  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <button className="admin-modal-backdrop" aria-label="Close modal" onClick={onClose} />
      <div className="admin-modal-card">
        <div className="admin-modal-head">
          <div><span className="eyebrow">{client.name}</span><h3>{title}</h3></div>
          <button className="admin-icon-btn" aria-label="Close modal" onClick={onClose}><LuX /></button>
        </div>
        <div className="admin-modal-body">
          {modal.type === "asset" && <AssetForm client={targetClient} asset={modal.asset} initialAssetType={modal.assetType} onClose={onClose} />}
          {modal.type === "delete-asset" && <DeleteAssetForm asset={modal.asset} onClose={onClose} />}
          {modal.type === "coin-detail" && <CoinDetail asset={modal.asset} transactions={modal.transactions || []} />}
          {modal.type === "coin-transactions" && <CoinTransactions asset={modal.asset} transactions={modal.transactions || []} />}
          {modal.type === "transaction" && <TransactionForm client={targetClient} transaction={modal.transaction} asset={modal.asset} onClose={onClose} />}
          {modal.type === "delete-transaction" && <DeleteTransactionForm transaction={modal.transaction} onClose={onClose} />}
          {modal.type === "case" && <CaseReviewForm report={modal.report} onClose={onClose} />}
          {modal.type === "note" && <NoteForm client={targetClient} updateClientMeta={updateClientMeta} onClose={onClose} />}
          {modal.type === "reset-password" && <PasswordResetAction client={targetClient} updateClientMeta={updateClientMeta} onClose={onClose} mode="force" />}
          {modal.type === "send-reset-link" && <PasswordResetAction client={targetClient} updateClientMeta={updateClientMeta} onClose={onClose} mode="link" />}
        </div>
        <div className="admin-modal-actions"><button className="admin-small-btn" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

function CoinDetail({ asset, transactions }) {
  const type = assetTypeFor(asset);
  const meta = assetMeta(asset?.asset, type);
  return (
    <div className="admin-form-grid">
      <div className="kv"><span className="k">Asset</span><span className="v"><AssetIcon asset={{ ...meta, type }} size={24} /> {asset?.assetName || meta.name}</span></div>
      <div className="kv"><span className="k">Category</span><span className="v">{type === "stock" ? "Stock" : "Crypto"}</span></div>
      <div className="kv"><span className="k">{type === "stock" ? "Shares" : "Balance"}</span><span className="v">{asset?.amount} {type === "stock" ? "shares" : asset?.asset}</span></div>
      <div className="kv"><span className="k">Fiat value</span><span className="v">{money(asset?.fiatValue)}</span></div>
      <div className="kv"><span className="k">Visibility</span><span className="v">{asset?.visible === false ? "Hidden" : "Visible"}</span></div>
      <div className="kv"><span className="k">Network</span><span className="v">{asset?.network || "Not assigned"}</span></div>
      <div className="kv"><span className="k">{type === "stock" ? "Position status" : "Wallet status"}</span><span className="v">{asset?.active === false ? "Inactive" : "Active"}</span></div>
      {type !== "stock" && <div className="kv span-2"><span className="k">Deposit wallet</span><span className="v mono">{asset?.walletAddress || "No wallet assigned"}</span></div>}
      {asset?.memoOrTag && <div className="kv span-2"><span className="k">Memo / tag</span><span className="v mono">{asset.memoOrTag}</span></div>}
      <div className="kv"><span className="k">Transactions</span><span className="v">{transactions.length}</span></div>
    </div>
  );
}

function CoinTransactions({ asset, transactions }) {
  return (
    <div className="admin-ops-list">
      {transactions.map((tx) => (
        <div className="admin-ops-row" key={tx.id}>
          <div><strong>{tx.transactionId} - {tx.typeLabel}</strong><span>{tx.displayAmount} - {tx.fiatValue} - {new Date(tx.transactionDate).toLocaleDateString()}</span></div>
          <StatusPill status={tx.statusLabel} />
        </div>
      ))}
      {!transactions.length && <EmptyAdminState title={`No ${asset?.asset || "asset"} transactions`} copy="Use Add Transaction from the asset row to create one." />}
    </div>
  );
}

function AssetForm({ client, asset, initialAssetType = "crypto", onClose }) {
  const initialType = asset ? assetTypeFor(asset) : initialAssetType;
  const initialSymbol = asset?.asset || (initialType === "stock" ? clientStockSymbols[0] : "ETH");
  const meta = assetMeta(initialSymbol, initialType);
  const [priceRows, setPriceRows] = useState({});
  const [priceMeta, setPriceMeta] = useState({ loading: true, source: "fallback", error: "" });
  const [form, setForm] = useState({
    id: asset?.demo ? "" : asset?.id,
    assetType: initialType,
    asset: initialSymbol,
    assetName: asset?.assetName || meta.name,
    amount: asset?.amount || "",
    unitPrice: String(unitPriceFor(asset || { asset: meta.symbol })),
    currency: asset?.currency || "USD",
    network: networkForAsset(asset?.asset || meta.symbol, asset?.network || meta.network, initialType),
    walletAddress: asset?.walletAddress || "",
    memoOrTag: asset?.memoOrTag || "",
    label: asset?.label || "",
    internalNote: asset?.internalNote || "",
    visible: asset?.visible !== false,
    active: asset?.active !== false,
  });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const priceFor = useCallback((symbol) => {
    return priceRows[symbol]?.price ?? assetMeta(symbol, form.assetType).price ?? 0;
  }, [form.assetType, priceRows]);
  const stableSelected = form.assetType === "crypto" && stableAssetSymbols.has(form.asset);
  const assetOptions = form.assetType === "stock" ? clientStockSymbols : clientAssetSymbols;
  const selectedPriceSource = priceRows[form.asset]?.source || priceMeta.source;
  const priceFeedLabel = priceMeta.loading
    ? "Loading market prices"
    : selectedPriceSource === "fallback"
      ? "Using fallback market prices"
      : form.assetType === "stock"
        ? "Using live stock market prices"
        : "Using live CoinGecko prices";

  useEffect(() => {
    let alive = true;
    async function loadPrices() {
      try {
        const data = await getAdminAssetPrices();
        const bySymbol = Object.fromEntries((data?.prices || []).map((row) => [row.symbol, row]));
        if (!alive) return;
        setPriceRows(bySymbol);
        setPriceMeta({ loading: false, source: data?.source || "fallback", error: "" });
        setForm((current) => {
          const live = bySymbol[current.asset];
          if (!live) return current;
          return {
            ...current,
            unitPrice: String(live.price || current.unitPrice || 0),
            assetName: current.assetName || live.name,
            network: networkForAsset(current.asset, current.network || live.network, current.assetType),
          };
        });
      } catch (error) {
        if (!alive) return;
        setPriceMeta({ loading: false, source: "fallback", error: getErrorMessage(error, "Using fallback asset prices.") });
      }
    }
    loadPrices();
    return () => {
      alive = false;
    };
  }, []);

  const autoFiatValue = useMemo(() => {
    return formatUsd(numericMoney(form.amount) * numericMoney(form.unitPrice));
  }, [form.amount, form.unitPrice]);
  const walletLooksValid = !form.walletAddress || form.walletAddress.trim().length >= 8;
  const save = async () => {
    if (form.assetType !== "stock" && !walletLooksValid) return;
    const nextMeta = assetMeta(form.asset, form.assetType);
    await upsertClientAsset({ client, asset: { ...form, fiatValue: autoFiatValue, assetName: form.assetName || nextMeta.name }, updatedBy: "Admin" });
    onClose();
  };
  return (
    <div className="admin-form-grid">
      <label className="field">Category<select value={form.assetType} onChange={(event) => {
        const nextType = event.target.value;
        const nextSymbol = nextType === "stock" ? clientStockSymbols[0] : clientAssetSymbols[0];
        const next = assetMeta(nextSymbol, nextType);
        const live = priceRows[nextSymbol];
        setForm({
          ...form,
          assetType: nextType,
          asset: nextSymbol,
          assetName: live?.name || next.name,
          network: networkForAsset(nextSymbol, live?.network || next.network, nextType),
          unitPrice: String(live?.price ?? next.price ?? 0),
          walletAddress: nextType === "stock" ? "" : form.walletAddress,
          memoOrTag: nextType === "stock" ? "" : form.memoOrTag,
          label: `${nextSymbol} ${nextType === "stock" ? "position" : "wallet"}`,
        });
      }}><option value="crypto">Crypto</option><option value="stock">Stock</option></select></label>
      <label className="field">Asset<select value={form.asset} onChange={(event) => { const next = assetMeta(event.target.value, form.assetType); const live = priceRows[event.target.value]; setForm({ ...form, asset: event.target.value, assetName: live?.name || next.name, network: networkForAsset(event.target.value, live?.network || next.network, form.assetType), unitPrice: String(live?.price ?? priceFor(event.target.value)) }); }}>{assetOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="field">Asset name<input value={form.assetName} onChange={(event) => set("assetName", event.target.value)} /></label>
      <label className="field">{form.assetType === "stock" ? "Shares" : "Amount"}<input value={form.amount} onChange={(event) => set("amount", event.target.value)} placeholder={form.assetType === "stock" ? "0" : "0.0000"} /></label>
      <label className="field">Unit price (USD)<input value={form.unitPrice} readOnly aria-readonly="true" placeholder="0.00" inputMode="decimal" /></label>
      <label className="field">Portfolio value<input value={autoFiatValue} readOnly aria-readonly="true" /></label>
      <label className="field">Currency<input value={form.currency} onChange={(event) => set("currency", event.target.value)} /></label>
      <div className="admin-warning-box span-2">
        <strong>{priceFeedLabel}</strong>
        <span>{priceMeta.error || (form.assetType === "stock" ? "Stock unit price and visible position value are calculated automatically from the backend market quote." : "Portfolio value is calculated automatically from amount and the backend USD unit price.")}</span>
      </div>
      {stableSelected ? (
        <label className="field">Network<select value={form.network} onChange={(event) => set("network", event.target.value)}>
          {stableNetworkOptions.map((network) => <option key={network} value={network}>{network}</option>)}
        </select></label>
      ) : (
        <label className="field">Network<input value={form.network} onChange={(event) => set("network", event.target.value)} readOnly={form.assetType !== "stock"} aria-readonly={form.assetType !== "stock"} /></label>
      )}
      {form.assetType !== "stock" && <label className="field span-2">Wallet address<input className="mono" value={form.walletAddress} onChange={(event) => set("walletAddress", event.target.value)} /></label>}
      {form.assetType !== "stock" && !walletLooksValid && <div className="field-error span-2">Enter a valid wallet address or leave it empty.</div>}
      {form.assetType !== "stock" && <label className="field">Memo / tag<input className="mono" value={form.memoOrTag} onChange={(event) => set("memoOrTag", event.target.value)} placeholder="Optional" /></label>}
      <label className="field">{form.assetType === "stock" ? "Position label" : "Wallet label"}<input value={form.label} onChange={(event) => set("label", event.target.value)} /></label>
      <label className="field">Visibility<select value={form.visible ? "visible" : "hidden"} onChange={(event) => set("visible", event.target.value === "visible")}><option value="visible">Visible</option><option value="hidden">Hidden</option></select></label>
      <label className="field">{form.assetType === "stock" ? "Position status" : "Wallet status"}<select value={form.active ? "active" : "inactive"} onChange={(event) => set("active", event.target.value === "active")}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
      <label className="field span-2">{form.assetType === "stock" ? "Internal position note" : "Internal wallet note"}<textarea rows="3" value={form.internalNote} onChange={(event) => set("internalNote", event.target.value)} /></label>
      <div className="admin-inline-actions span-2"><button className="admin-small-btn primary" onClick={save}>Save asset</button></div>
    </div>
  );
}

function DeleteAssetForm({ asset, onClose }) {
  const type = assetTypeFor(asset);
  const remove = async () => {
    if (asset?.id) await removeClientAsset(asset.id);
    onClose();
  };
  return <div className="screen-stack"><div className="admin-warning-box"><strong>Remove {asset?.asset}</strong><span>This hides the {type === "stock" ? "stock position" : "asset and wallet assignment"} from the client dashboard.</span></div><button className="admin-small-btn primary" onClick={remove}>Remove asset</button></div>;
}

function TransactionForm({ client, transaction, asset, onClose }) {
  const initialAsset = transaction?.asset || asset?.asset || "ETH";
  const initialAssetType = assetTypeFor(transaction || asset || { asset: initialAsset });
  const [priceRows, setPriceRows] = useState({});
  const [priceMeta, setPriceMeta] = useState({ loading: true, source: "fallback", error: "" });
  const [form, setForm] = useState({
    transactionId: transaction?.transactionId || `TX-${Math.floor(9000 + Math.random() * 900)}`,
    type: transaction?.type || "deposit",
    asset: initialAsset,
    amount: transaction?.amount || "",
    unitPrice: String(unitPriceFor(transaction || asset || { asset: initialAsset })),
    direction: transaction?.direction || "credit",
    status: transaction?.status || "pending",
    network: networkForAsset(initialAsset, transaction?.network || asset?.network, initialAssetType),
    txHash: transaction?.txHash || "",
    transactionDate: transaction?.transactionDate ? String(transaction.transactionDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
    clientNote: transaction?.clientNote || "",
    internalNote: transaction?.internalNote || "",
  });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const currentAssetType = clientStockSymbols.includes(String(form.asset || "").toUpperCase()) ? "stock" : "crypto";
  const priceFor = useCallback((symbol) => {
    const type = clientStockSymbols.includes(String(symbol || "").toUpperCase()) ? "stock" : "crypto";
    return priceRows[symbol]?.price ?? assetMeta(symbol, type).price ?? 0;
  }, [priceRows]);
  const stableSelected = currentAssetType === "crypto" && stableAssetSymbols.has(form.asset);
  const selectedPriceSource = priceRows[form.asset]?.source || priceMeta.source;
  const priceFeedLabel = priceMeta.loading
    ? "Loading market prices"
    : selectedPriceSource === "fallback"
      ? "Using fallback market prices"
      : currentAssetType === "stock"
        ? "Using live stock market prices"
        : "Using live CoinGecko prices";

  useEffect(() => {
    let alive = true;
    async function loadPrices() {
      try {
        const data = await getAdminAssetPrices();
        const bySymbol = Object.fromEntries((data?.prices || []).map((row) => [row.symbol, row]));
        if (!alive) return;
        setPriceRows(bySymbol);
        setPriceMeta({ loading: false, source: data?.source || "fallback", error: "" });
        setForm((current) => {
          const live = bySymbol[current.asset];
          if (!live) return current;
          const type = clientStockSymbols.includes(String(current.asset || "").toUpperCase()) ? "stock" : "crypto";
          return {
            ...current,
            unitPrice: String(live.price || current.unitPrice || 0),
            network: networkForAsset(current.asset, current.network || live.network, type),
          };
        });
      } catch (error) {
        if (!alive) return;
        setPriceMeta({ loading: false, source: "fallback", error: getErrorMessage(error, "Using fallback asset prices.") });
      }
    }
    loadPrices();
    return () => {
      alive = false;
    };
  }, []);

  const autoFiatValue = useMemo(() => {
    return formatUsd(numericMoney(form.amount) * numericMoney(form.unitPrice));
  }, [form.amount, form.unitPrice]);

  const save = async () => {
    const data = { ...form, fiatValue: autoFiatValue, transactionDate: new Date(form.transactionDate || Date.now()).toISOString() };
    if (transaction?.id) await updateClientTransaction({ id: transaction.id, data, updatedBy: "Admin" });
    else await createClientTransaction({ client, data, createdBy: "Admin" });
    onClose();
  };
  return (
    <div className="admin-form-grid">
      <label className="field">Transaction ID<input value={form.transactionId} onChange={(event) => set("transactionId", event.target.value)} /></label>
      <label className="field">Type<select value={form.type} onChange={(event) => set("type", event.target.value)}>{transactionTypes.map((item) => <option key={item} value={item}>{transactionTypeLabels[item]}</option>)}</select></label>
      <label className="field">Asset<select value={form.asset} onChange={(event) => {
        const nextType = clientStockSymbols.includes(String(event.target.value).toUpperCase()) ? "stock" : "crypto";
        setForm((current) => ({
          ...current,
          asset: event.target.value,
          network: networkForAsset(event.target.value, current.network, nextType),
          unitPrice: String(priceRows[event.target.value]?.price ?? priceFor(event.target.value)),
        }));
      }}>{transactionAssets.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="field">Direction<select value={form.direction} onChange={(event) => set("direction", event.target.value)}><option value="credit">Credit</option><option value="debit">Debit</option></select></label>
      <label className="field">Amount<input value={form.amount} onChange={(event) => set("amount", event.target.value)} /></label>
      <label className="field">Unit price (USD)<input value={form.unitPrice} readOnly aria-readonly="true" /></label>
      <label className="field">Fiat value<input value={autoFiatValue} readOnly aria-readonly="true" /></label>
      <label className="field">Status<select value={form.status} onChange={(event) => set("status", event.target.value)}>{transactionStatuses.map((item) => <option key={item} value={item}>{transactionStatusLabels[item]}</option>)}</select></label>
      <div className="admin-warning-box span-2">
        <strong>{priceFeedLabel}</strong>
        <span>{priceMeta.error || (currentAssetType === "stock" ? "Stock transaction value is calculated automatically from the backend market quote." : "Transaction fiat value is calculated automatically from amount and the backend USD unit price.")}</span>
      </div>
      <label className="field">Date<input type="date" value={form.transactionDate} onChange={(event) => set("transactionDate", event.target.value)} /></label>
      {stableSelected ? (
        <label className="field">Network<select value={form.network} onChange={(event) => set("network", event.target.value)}>
          {stableNetworkOptions.map((network) => <option key={network} value={network}>{network}</option>)}
        </select></label>
      ) : (
        <label className="field">Network<input value={form.network} onChange={(event) => set("network", event.target.value)} readOnly={currentAssetType !== "stock"} aria-readonly={currentAssetType !== "stock"} /></label>
      )}
      <label className="field span-2">Transaction hash<input className="mono" value={form.txHash} onChange={(event) => set("txHash", event.target.value)} /></label>
      <label className="field span-2">Client-visible note<textarea rows="3" value={form.clientNote} onChange={(event) => set("clientNote", event.target.value)} /></label>
      <label className="field span-2">Internal note<textarea rows="3" value={form.internalNote} onChange={(event) => set("internalNote", event.target.value)} /></label>
      <div className="admin-inline-actions span-2"><button className="admin-small-btn primary" onClick={save}>Save transaction</button></div>
    </div>
  );
}

function DeleteTransactionForm({ transaction, onClose }) {
  const remove = async () => {
    if (transaction?.id) await deleteClientTransaction(transaction.id);
    onClose();
  };
  return <div className="screen-stack"><div className="admin-warning-box"><strong>Delete {transaction?.transactionId}</strong><span>This removes the record from the client dashboard.</span></div><button className="admin-small-btn primary" onClick={remove}>Delete transaction</button></div>;
}

function PasswordResetAction({ client, updateClientMeta, onClose, mode }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLink = mode === "link";
  const runAction = async () => {
    if (!client?.email || loading) return;
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(client.email);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to request password reset."));
      setLoading(false);
      return;
    }
    const timestamp = new Date().toISOString();
    await updateClientMeta?.(
      isLink
        ? { passwordResetLinkSentAt: timestamp }
        : { passwordResetRequired: true, passwordResetRequestedAt: timestamp },
      client,
    );
    setSent(true);
    setLoading(false);
  };
  return (
    <div className="screen-stack">
      <div className="admin-warning-box">
        <strong>{isLink ? "Send reset link" : "Require password reset"}</strong>
        <span>
          {isLink
            ? `A password reset link will be sent to ${client?.email || "the client email"} when email delivery is connected.`
            : "The client account will be marked for password reset. No password value is displayed or stored in plain text."}
        </span>
      </div>
      {sent && <div className="auth-alert success">{isLink ? "Password reset link action recorded." : "Password reset requirement recorded."}</div>}
      {error && <div className="auth-alert danger">{error}</div>}
      <div className="admin-inline-actions">
        <button className="admin-small-btn primary" onClick={runAction}>{loading ? "Sending" : isLink ? "Send password reset link" : "Reset password"}</button>
        {sent && <button className="admin-small-btn" onClick={onClose}>Done</button>}
      </div>
    </div>
  );
}

function CaseReviewForm({ report, onClose }) {
  const [status, setStatus] = useState(report.status);
  const [adminNote, setAdminNote] = useState(report.adminNote || "");
  const save = async () => {
    await updateCaseReportReview({ reportId: report.id, status, adminNote, reviewedBy: "Admin" });
    onClose();
  };
  return (
    <div className="admin-form-grid">
      <div className="kv span-2"><span className="k">Case</span><span className="v">{report.title}</span></div>
      <label className="field">Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{reportStatuses.map((item) => <option key={item} value={item}>{getReportStatusLabel(item)}</option>)}</select></label>
      <label className="field span-2">Admin note<textarea rows="4" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} /></label>
      <div className="admin-inline-actions span-2"><button className="admin-small-btn primary" onClick={save}>Save case review</button></div>
    </div>
  );
}

function NoteForm({ client, updateClientMeta, onClose }) {
  const [note, setNote] = useState("");
  const save = async () => {
    const notes = [note, ...(client.notes || [])].filter(Boolean);
    await updateClientMeta({ notes });
    onClose();
  };
  return <div className="admin-form-grid"><label className="field span-2">Internal note<textarea rows="5" value={note} onChange={(event) => setNote(event.target.value)} /></label><div className="admin-inline-actions span-2"><button className="admin-small-btn primary" onClick={save}>Save note</button></div></div>;
}
