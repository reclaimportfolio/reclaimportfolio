import { Badge } from "../ui.jsx";
import { AssetIcon } from "../components/dashboard/AssetIcon.jsx";

export function PageHeader({ eyebrow, title, copy, action }) {
  return (
    <div className="admin-page-head">
      <div>
        <span>{eyebrow}</span>
        <h1 className="admin-h1">{title}</h1>
        {copy && <p>{copy}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, note, tone = "default" }) {
  return (
    <article className={`admin-card admin-stat ${tone}`}>
      {Icon && <Icon />}
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function AdminPanel({ title, copy, action, children, className = "" }) {
  return (
    <section className={`admin-card admin-panel ${className}`}>
      {(title || action) && (
        <div className="admin-panel-head">
          <div>
            {title && <h3>{title}</h3>}
            {copy && <p>{copy}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusPill({ status }) {
  return <Badge s={status} />;
}

export function MiniBars({ items }) {
  return (
    <div className="admin-bars">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <div><i style={{ width: `${item.value}%` }} /></div>
          <strong>{item.value}%</strong>
        </div>
      ))}
    </div>
  );
}

export function EmptyAdminState({ title = "No records found", copy = "Adjust the filters or add a new record." }) {
  return <div className="admin-empty"><strong>{title}</strong><span>{copy}</span></div>;
}

export function CryptoLogo({ asset }) {
  return <AssetIcon asset={{ type: "crypto", ...asset }} size={30} className="admin-crypto-logo" />;
}
