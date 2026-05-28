import { useEffect, useMemo, useState } from "react";
import { LuBriefcaseBusiness, LuNewspaper, LuRefreshCw, LuTrendingUp, LuUsersRound } from "react-icons/lu";
import { getAdminOverview } from "../api.js";
import { getErrorMessage } from "../utils/errorMessages.js";
import { PageHeader, StatCard } from "./AdminKit.jsx";

export function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOverview() {
      try {
        const data = await getAdminOverview();
        setOverview(data);
        setError("");
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load admin overview."));
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  const summary = useMemo(() => {
    const stats = overview?.stats;
    return {
      registeredUsers: stats?.users ?? 0,
      totalCases: stats?.total_cases ?? 0,
      activeCases: stats?.active_cases ?? 0,
      resolvedCases: stats?.resolved_cases ?? 0,
      newsletterSubscribers: stats?.newsletter_subscribers ?? 0,
    };
  }, [overview]);

  const cards = [
    {
      icon: LuUsersRound,
      label: "Total Registered Users",
      value: loading ? "..." : summary.registeredUsers,
      note: "All time",
    },
    {
      icon: LuBriefcaseBusiness,
      label: "Total Cases",
      value: loading ? "..." : summary.totalCases,
      note: `${summary.activeCases ?? 0} active`,
    },
    {
      icon: LuTrendingUp,
      label: "Resolved Cases",
      value: loading ? "..." : summary.resolvedCases ?? 0,
      note: "Closed or resolved",
    },
    {
      icon: LuNewspaper,
      label: "Newsletter Subscribers",
      value: loading ? "..." : summary.newsletterSubscribers ?? 0,
      note: "Active subscribers",
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Admin summary"
        copy="A concise all-time view of users, wallet deposits, recovered value, and pending reports."
        action={<button className="admin-small-btn"><LuRefreshCw /> Updated recently</button>}
      />

      <section className="admin-grid-4" style={{ marginTop: 14 }}>
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>
      {error && <div className="auth-alert danger" style={{ marginTop: 14 }}>{error}</div>}
    </div>
  );
}
