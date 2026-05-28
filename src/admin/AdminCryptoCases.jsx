import { useEffect, useMemo, useState } from "react";
import { LuHistory, LuRefreshCw, LuWalletCards } from "react-icons/lu";
import { getAdminAssets, getAdminCases, getAdminTransactions } from "../api.js";
import { getErrorMessage } from "../utils/errorMessages.js";
import { AdminPanel, CryptoLogo, EmptyAdminState, MiniBars, PageHeader, StatusPill } from "./AdminKit.jsx";
import { cryptoAssets } from "./adminData.js";

function assetMeta(symbol = "BTC") {
  return cryptoAssets.find((asset) => asset.symbol === symbol) || cryptoAssets[0];
}

function isCryptoCase(item) {
  const haystack = `${item.category || ""} ${item.asset_type || ""} ${item.description || ""}`.toLowerCase();
  return /(crypto|bitcoin|blockchain|wallet|token|exchange|transaction|btc|eth|usdt|usdc)/.test(haystack);
}

export function AdminCryptoCases() {
  const [cases, setCases] = useState([]);
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function loadCryptoWorkspace() {
      try {
        const [caseRows, assetRows, transactionRows] = await Promise.all([getAdminCases(), getAdminAssets(), getAdminTransactions()]);
        if (!alive) return;
        const cryptoRows = (Array.isArray(caseRows) ? caseRows : []).filter(isCryptoCase);
        setCases(cryptoRows);
        setAssets(Array.isArray(assetRows) ? assetRows : []);
        setTransactions(Array.isArray(transactionRows) ? transactionRows : []);
        setSelectedId((current) => current || String(cryptoRows[0]?.id || ""));
        setError("");
      } catch (err) {
        if (alive) setError(getErrorMessage(err, "Unable to load crypto operations data."));
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadCryptoWorkspace();
    return () => {
      alive = false;
    };
  }, []);

  const selected = cases.find((item) => String(item.id) === String(selectedId)) || cases[0];
  const riskItems = useMemo(() => {
    const total = Math.max(cases.length, 1);
    const high = cases.filter((item) => ["urgent", "high"].includes(item.priority)).length;
    const active = cases.filter((item) => !["resolved", "closed", "rejected"].includes(item.status)).length;
    const documented = cases.filter((item) => item.wallet_address || item.transaction_hash).length;
    return [
      { label: "Active crypto cases", value: Math.round((active / total) * 100) },
      { label: "High priority", value: Math.round((high / total) * 100) },
      { label: "Wallet/TX evidence", value: Math.round((documented / total) * 100) },
      { label: "Resolved", value: Math.round(((cases.length - active) / total) * 100) },
    ];
  }, [cases]);

  return (
    <div>
      <PageHeader
        eyebrow="Crypto investigations"
        title="Forensic operations"
        copy="Blockchain-related cases, client assets, and transaction history are loaded from backend records."
        action={<button className="admin-small-btn"><LuRefreshCw /> Backend synced</button>}
      />
      {error && <div className="auth-alert danger" style={{ marginBottom: 14 }}>{error}</div>}

      <section className="admin-grid-2">
        <AdminPanel title="Investigation queue" copy={loading ? "Loading backend cases" : `${cases.length} blockchain-related matters`}>
          <div className="admin-ops-list">
            {cases.map((item) => (
              <button className="admin-ops-row" key={item.id} onClick={() => setSelectedId(String(item.id))}>
                <div><strong>CASE-{String(item.id).padStart(4, "0")} - {item.asset_type || item.category || "Crypto matter"}</strong><span>{item.email} - {item.wallet_address || item.transaction_hash || "No wallet/TX evidence"}</span></div>
                <StatusPill status={item.priority || item.status} />
              </button>
            ))}
            {!cases.length && <EmptyAdminState title={loading ? "Loading investigations" : "No crypto investigations"} copy="Crypto-related intake cases will appear here once submitted." />}
          </div>
        </AdminPanel>

        <AdminPanel title={selected ? `CASE-${String(selected.id).padStart(4, "0")} workspace` : "Investigation workspace"} copy={selected ? `${selected.full_name} - ${selected.email}` : "Select a backend case"}>
          {selected ? (
            <>
              <div className="admin-grid-3">
                <div className="kv"><span className="k">Priority</span><span className="v"><StatusPill status={selected.priority} /></span></div>
                <div className="kv"><span className="k">Status</span><span className="v"><StatusPill status={selected.status} /></span></div>
                <div className="kv"><span className="k">Value</span><span className="v">{selected.estimated_value || "Not provided"}</span></div>
              </div>
              <div className="key-detail-copy" style={{ marginTop: 14 }}>
                <strong>Case details</strong>
                <p>{selected.description}</p>
              </div>
              <div className="admin-ops-list" style={{ marginTop: 14 }}>
                <div className="admin-ops-row"><div><strong>Wallet address</strong><span className="mono">{selected.wallet_address || "Not provided"}</span></div><StatusPill status={selected.wallet_address ? "Open" : "Reviewing"} /></div>
                <div className="admin-ops-row"><div><strong>Transaction hash</strong><span className="mono">{selected.transaction_hash || "Not provided"}</span></div><StatusPill status={selected.transaction_hash ? "Open" : "Reviewing"} /></div>
              </div>
            </>
          ) : <EmptyAdminState title="No case selected" copy="Select an investigation from the backend queue." />}
        </AdminPanel>
      </section>

      <section className="admin-grid-2" style={{ marginTop: 14 }}>
        <AdminPanel title="Blockchain tracing status">
          <MiniBars items={riskItems} />
        </AdminPanel>
        <AdminPanel title="Backend evidence notes">
          {cases.slice(0, 3).map((item) => (
            <div className="note-item" key={item.id}><div className="note-meta">CASE-{String(item.id).padStart(4, "0")}</div>{item.admin_notes || item.description}</div>
          ))}
          {!cases.length && <EmptyAdminState title="No notes" copy="Case notes will appear after crypto investigations are submitted." />}
        </AdminPanel>
      </section>

      <AdminPanel title="Client crypto asset control" copy="Wallet balances, visibility, and deposit addresses come from admin-managed client assets." action={<LuWalletCards style={{ color: "#C9A55E" }} />} className="admin-asset-control">
        <div className="table-scroll">
          <table>
            <thead><tr><th>Client</th><th>Asset</th><th>Network</th><th>Wallet</th><th>Displayed Balance</th><th>Displayed Value</th><th>Visible</th></tr></thead>
            <tbody>
              {assets.map((asset) => {
                const meta = assetMeta(asset.asset);
                return (
                  <tr key={asset.id}>
                    <td>{asset.clientName || asset.clientEmail || asset.user}</td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><CryptoLogo asset={meta} /><strong>{asset.asset}</strong></div></td>
                    <td>{asset.network}</td>
                    <td className="mono muted">{asset.walletAddress || "Not assigned"}</td>
                    <td>{asset.amount}</td>
                    <td>{asset.fiatValue}</td>
                    <td><StatusPill status={asset.visible ? "Open" : "Closed"} /></td>
                  </tr>
                );
              })}
              {!assets.length && <tr><td colSpan="7">No backend client assets yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <AdminPanel title="Wallet and transaction history" action={<LuHistory style={{ color: "#C9A55E" }} />} style={{ marginTop: 14 }}>
        <div className="admin-ops-list">
          {transactions.slice(0, 8).map((item) => (
            <div className="admin-ops-row" key={item.id}><div><strong>{item.clientName || item.clientEmail || "Client"} - {item.asset}</strong><span>{item.transactionId} - {item.displayAmount} - {item.transactionDate ? new Date(item.transactionDate).toLocaleDateString() : ""}</span></div><StatusPill status={item.statusLabel || item.status} /></div>
          ))}
          {!transactions.length && <EmptyAdminState title="No crypto transactions" copy="Admin-created client transactions will appear here." />}
        </div>
      </AdminPanel>
    </div>
  );
}
