import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import {
  LuBell,
  LuChartLine,
  LuFileText,
  LuHeadphones,
  LuLayoutDashboard,
  LuListChecks,
  LuLockKeyhole,
  LuRepeat2,
  LuReceiptText,
  LuSettings,
  LuWallet,
  LuX,
} from "react-icons/lu";
import { useSession } from "../auth/SessionProvider.jsx";

const primaryNav = [
  ["overview", "Overview", LuLayoutDashboard],
  ["report-case", "Report Case", LuReceiptText],
  ["wallet", "Wallet", LuWallet],
  ["stocks", "Stocks", LuChartLine],
  ["transactions", "Transactions", LuListChecks],
  ["swap", "Swap", LuRepeat2],
  ["markets", "Markets", LuChartLine],
  ["settings", "Settings", LuSettings, "settings"],
  ["support", "Support", LuHeadphones, "support"],
  ["reports", "Reports", LuFileText, "reports"],
  ["notifications", "Notifications", LuBell, "notifications"],
];

const BRAND_LOGO = "https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779031196/reclaim_logo_svg_o9yyv9.svg";

export function Sidebar({ active = "overview", setActive, mobileOpen = false, kycLocked = false, collapsed = false, onCollapsedChange }) {
  const { user } = useSession();
  const CollapseIcon = collapsed ? IoMdArrowDropright : IoMdArrowDropleft;
  const displayName = user?.name || user?.username || "Client";
  const displayMeta = user?.email || user?.role || "Client account";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "RP";

  return (
    <aside className={`client-sidebar premium-sidebar ai-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-brand-row">
        <button className="side-logo client-side-logo" onClick={() => setActive("overview")} title="ReclaimPortfolio">
          <img src={BRAND_LOGO} alt="ReclaimPortfolio" />
        </button>
        <button className="sidebar-collapse" onClick={() => onCollapsedChange?.(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <CollapseIcon />
        </button>
        <button className="sidebar-close" onClick={() => setActive(active)} aria-label="Close navigation">
          <LuX />
        </button>
      </div>

      <nav className="side-nav premium-side-nav" aria-label="Client portal navigation">
        {primaryNav.map(([id, label, Icon, activeKey]) => {
          const locked = kycLocked && id !== "settings";
          return (
            <button
              key={id}
              title={locked ? "Complete KYC first" : label}
              className={`side-item ${active === (activeKey || id) ? "active" : ""} ${locked ? "locked" : ""}`}
              onClick={() => setActive(id)}
            >
              <Icon />
              <span>{label}</span>
              {locked && <LuLockKeyhole className="side-lock" />}
            </button>
          );
        })}
      </nav>
      <div className="client-sidebar-foot">
        <span className="sidebar-avatar">{initials}</span>
        <div>
          <strong>{displayName}</strong>
          <small>{displayMeta}</small>
        </div>
      </div>
    </aside>
  );
}
