import { useEffect, useMemo, useState } from "react";
import { LuCircleCheck, LuCircleX, LuFlag, LuSearch, LuUserCheck } from "react-icons/lu";
import { getAdminCases, updateAdminCase } from "../api.js";
import { getErrorMessage } from "../utils/errorMessages.js";
import { AdminPanel, PageHeader, StatusPill } from "./AdminKit.jsx";

export function AdminIntake(){
  const [q,setQ]=useState("");
  const [items,setItems]=useState([]);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let alive=true;
    async function load(){
      try{
        const rows=await getAdminCases();
        if(alive){
          setItems(Array.isArray(rows)?rows:[]);
          setError("");
        }
      }catch(err){
        if(alive)setError(getErrorMessage(err,"Unable to load intake submissions."));
      }finally{
        if(alive)setLoading(false);
      }
    }
    load();
    return()=>{alive=false;};
  },[]);
  const updateStatus=async(id,status)=>{
    try{
      const updated=await updateAdminCase(id,{status});
      setItems((current)=>current.map((item)=>item.id===id?updated:item));
    }catch(err){
      setError(getErrorMessage(err,"Unable to update case status."));
    }
  };
  const rows=useMemo(()=>items.filter((item)=>
    `${item.full_name} ${item.email} ${item.asset_type} ${item.category}`.toLowerCase().includes(q.toLowerCase())
  ),[items,q]);
  return (
    <div>
      <PageHeader eyebrow="Intake submissions" title="Onboarding review queue" copy="Review recovery requests, approve or reject intake, flag suspicious submissions, and assign to investigation teams." />
      <AdminPanel>
        {error&&<div className="auth-alert danger" style={{marginBottom:12}}>{error}</div>}
        <div className="toolbar">
          <div className="search-box"><LuSearch/><input placeholder="Search submitted forms..." value={q} onChange={(event)=>setQ(event.target.value)} /></div>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>ID</th><th>Applicant</th><th>Claim type</th><th>Est. value</th><th>Category</th><th>Evidence</th><th>Status</th><th>Review actions</th></tr></thead>
            <tbody>
              {rows.map((item)=>(
                <tr key={item.id}>
                  <td className="mono">CASE-{String(item.id).padStart(4,"0")}</td>
                  <td><strong>{item.full_name}</strong><div className="muted" style={{fontSize:11}}>{item.email}</div></td>
                  <td>{item.asset_type}</td><td>{item.estimated_value||"Not provided"}</td><td>{item.category}</td><td>{item.evidence?.length||0}</td><td><StatusPill status={String(item.status).replace(/_/g," ")}/></td>
                  <td><div className="admin-inline-actions"><button onClick={()=>updateStatus(item.id,"under_review")}><LuCircleCheck/> Approve</button><button onClick={()=>updateStatus(item.id,"rejected")}><LuCircleX/> Reject</button><button onClick={()=>updateStatus(item.id,"investigation")}><LuFlag/> Flag</button><button onClick={()=>updateStatus(item.id,"awaiting_documents")}><LuUserCheck/> Assign</button></div></td>
                </tr>
              ))}
              {!rows.length&&<tr><td colSpan="8">{loading?"Loading intake submissions...":"No intake submissions found."}</td></tr>}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
