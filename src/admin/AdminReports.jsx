import { useMemo } from "react";
import { LuDownload, LuFileText, LuRefreshCw } from "react-icons/lu";
import { useCaseReports } from "../caseReports.js";
import { AdminPanel, PageHeader, StatCard, StatusPill } from "./AdminKit.jsx";

export function AdminReports(){
  const reports=useCaseReports({role:"admin"});
  const stats=useMemo(()=>({
    total:reports.length,
    reviewing:reports.filter((report)=>report.status==="reviewing").length,
    verified:reports.filter((report)=>report.status==="verified").length,
    processing:reports.filter((report)=>report.status==="processing").length,
  }),[reports]);
  const downloadReportSummary=(report)=>{
    const blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;
    link.download=`report-${report.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div>
      <PageHeader eyebrow="Reports" title="Recovery and investigation reporting" copy="Review recovery reports, investigation reports, financial summaries, and client activity exports." action={<button className="admin-small-btn"><LuRefreshCw/> Backend synced</button>} />
      <section className="admin-grid-4">
        <StatCard icon={LuFileText} label="All reports" value={stats.total} note="backend records" />
        <StatCard icon={LuFileText} label="Reviewing" value={stats.reviewing} note="needs review" />
        <StatCard icon={LuFileText} label="Verified" value={stats.verified} note="client-visible" />
        <StatCard icon={LuFileText} label="Processing" value={stats.processing} note="active work" />
      </section>
      <AdminPanel title="Report center" style={{marginTop:14}}>
        <div className="table-scroll"><table><thead><tr><th>ID</th><th>Title</th><th>Client</th><th>Category</th><th>Updated</th><th>Status</th><th>Export</th></tr></thead><tbody>{reports.map((report)=><tr key={report.id}><td className="mono">RPT-{String(report.id).padStart(4,"0")}</td><td><strong>{report.title}</strong></td><td>{report.clientName||"Client"}</td><td>{report.category}</td><td className="mono muted">{new Date(report.updatedAt).toLocaleDateString()}</td><td><StatusPill status={report.statusLabel}/></td><td><button className="admin-small-btn" onClick={()=>downloadReportSummary(report)}><LuDownload/> JSON</button></td></tr>)}
        {!reports.length&&<tr><td colSpan="7">No backend reports yet.</td></tr>}
        </tbody></table></div>
      </AdminPanel>
    </div>
  );
}
