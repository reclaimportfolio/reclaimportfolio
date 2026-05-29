import { useMemo, useState } from "react";
import { LuCircleAlert, LuDownload, LuEye, LuFileCheck2, LuFileSearch, LuFileText, LuSearch, LuShieldCheck, LuTrash2 } from "react-icons/lu";
import {
  deleteDocumentUpload,
  documentStatuses,
  getDocumentLabel,
  updateDocumentReview,
  useDocumentUploads,
} from "../documentUploads.js";
import { downloadFileUrl, openFileUrl } from "../utils/filePreview.js";
import { AdminPanel, EmptyAdminState, PageHeader, StatusPill } from "./AdminKit.jsx";

function openDocument(doc) {
  openFileUrl(doc.fileUrl);
}

function downloadDocument(doc) {
  downloadFileUrl(doc.fileUrl, doc.fileName || doc.documentName);
}

export function AdminDocuments(){
  const clientUploads = useDocumentUploads({ role: "admin" });
  const [query,setQuery]=useState("");
  const [status,setStatus]=useState("all");
  const [type,setType]=useState("all");
  const [selected,setSelected]=useState(null);
  const [review,setReview]=useState({ status:"reviewing", adminNote:"" });
  const [deletedIds,setDeletedIds]=useState(()=>new Set());
  const [deletingId,setDeletingId]=useState("");

  const visibleUploads=useMemo(()=>clientUploads.filter((doc)=>!deletedIds.has(String(doc.id))),[clientUploads,deletedIds]);
  const documentTypes=useMemo(()=>Array.from(new Set(visibleUploads.map((doc)=>doc.documentType))).filter(Boolean),[visibleUploads]);
  const filtered=useMemo(()=>visibleUploads.filter((doc)=>{
    const haystack=`${doc.clientName} ${doc.clientEmail} ${doc.documentName} ${doc.documentType} ${doc.statusLabel}`.toLowerCase();
    const matchesQuery=haystack.includes(query.toLowerCase());
    const matchesStatus=status==="all"||doc.status===status;
    const matchesType=type==="all"||doc.documentType===type;
    return matchesQuery&&matchesStatus&&matchesType;
  }),[visibleUploads,query,status,type]);
  const counts=useMemo(()=>({
    total:visibleUploads.length,
    reviewing:visibleUploads.filter((doc)=>doc.status==="reviewing").length,
    verified:visibleUploads.filter((doc)=>doc.status==="verified").length,
    denied:visibleUploads.filter((doc)=>doc.status==="denied").length,
  }),[visibleUploads]);

  const selectDoc=(doc)=>{
    setSelected(doc);
    setReview({ status:doc.status, adminNote:doc.adminNote||"" });
  };
  const saveReview=async()=>{
    if(!selected) return;
    const updated=await updateDocumentReview({ documentId:selected.id, status:review.status, adminNote:review.adminNote, reviewedBy:"Admin" });
    setSelected(updated);
  };
  const deleteDoc=async(doc)=>{
    if(!doc||!window.confirm(`Delete ${doc.documentName}? This removes the uploaded file for admin and client views.`)) return;
    setDeletingId(String(doc.id));
    try{
      await deleteDocumentUpload(doc.id);
      setDeletedIds((current)=>new Set([...current,String(doc.id)]));
      if(String(selected?.id)===String(doc.id)) setSelected(null);
    }finally{
      setDeletingId("");
    }
  };
  const summaryCards=[
    { label:"Total Documents", value:counts.total, note:"uploaded records", icon:LuFileText },
    { label:"Reviewing", value:counts.reviewing, note:"waiting for decision", icon:LuFileSearch },
    { label:"Verified", value:counts.verified, note:"accepted evidence", icon:LuShieldCheck },
    { label:"Denied", value:counts.denied, note:"needs replacement", icon:LuCircleAlert },
  ];

  return (
    <div className="admin-documents-page">
      <PageHeader eyebrow="Document management" title="Evidence and verification vault" copy="Review uploaded client documents and keep verification status synced to the client dashboard." />

      <section className="admin-doc-summary">
        {summaryCards.map(({label,value,note,icon:Icon})=>(
          <article className="admin-doc-summary-card" key={label}>
            <span><Icon /></span>
            <div>
              <small>{label}</small>
              <strong>{value}</strong>
              <em>{note}</em>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-doc-workspace">
        <AdminPanel title="Document preview" copy={selected ? selected.documentName : "Select a document from the register"}>
          <div className="admin-document-preview">
            {selected ? (
              <div>
                <LuFileCheck2 />
                <strong>{selected.documentName}</strong>
                <p className="muted">{selected.mimeType || "Stored document"} - {selected.size}</p>
                <dl className="admin-doc-preview-meta">
                  <div><dt>Client</dt><dd>{selected.clientName}</dd></div>
                  <div><dt>Case</dt><dd>{selected.caseId}</dd></div>
                  <div><dt>Type</dt><dd>{selected.documentType}</dd></div>
                  <div><dt>Status</dt><dd><StatusPill status={getDocumentLabel(review.status)} /></dd></div>
                </dl>
                <div className="admin-inline-actions">
                  <button disabled={!selected.fileUrl} onClick={()=>openDocument(selected)}><LuEye/> Preview</button>
                  <button disabled={!selected.fileUrl} onClick={()=>downloadDocument(selected)}><LuDownload/> Download</button>
                  <button onClick={()=>deleteDoc(selected)} disabled={deletingId===String(selected.id)}><LuTrash2/> {deletingId===String(selected.id)?"Deleting":"Delete"}</button>
                </div>
              </div>
            ) : (
              <div><LuFileCheck2 /><strong>Selected document preview</strong><p className="muted">Choose a submitted file to preview, download, or review.</p></div>
            )}
          </div>
        </AdminPanel>
        <AdminPanel title="Review decision" copy={selected ? `${selected.clientName} - ${selected.clientEmail}` : "Choose a document to update status"}>
          {selected ? (
            <div className="admin-doc-review-card">
              <div className="admin-doc-status-tabs">
                {documentStatuses.map((item)=>(
                  <button key={item} className={review.status===item?"active":""} onClick={()=>setReview({...review,status:item})}>
                    {getDocumentLabel(item)}
                  </button>
                ))}
              </div>
              <div className="admin-doc-review-facts">
                <div><span>Uploaded</span><strong>{new Date(selected.uploadedAt).toLocaleString()}</strong></div>
                <div><span>Document ID</span><strong className="mono">{selected.id}</strong></div>
              </div>
              <label className="field">Admin review note
                <textarea rows="4" value={review.adminNote} onChange={(event)=>setReview({...review,adminNote:event.target.value})} placeholder="Optional note visible to the client" />
              </label>
              <div className="admin-inline-actions">
                <button className="admin-small-btn primary" onClick={saveReview}>Save review</button>
                <StatusPill status={getDocumentLabel(review.status)} />
              </div>
            </div>
          ) : (
            <EmptyAdminState title="No document selected" copy="Use Preview or Review from the uploaded documents table." />
          )}
        </AdminPanel>
      </section>

      <AdminPanel title="Submitted documents" className="admin-doc-table">
        <div className="toolbar admin-doc-toolbar">
          <div className="search-box"><LuSearch/><input placeholder="Search client, email, type, or status..." value={query} onChange={(event)=>setQuery(event.target.value)} /></div>
          <select value={status} onChange={(event)=>setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {documentStatuses.map((item)=><option key={item} value={item}>{getDocumentLabel(item)}</option>)}
          </select>
          <select value={type} onChange={(event)=>setType(event.target.value)}>
            <option value="all">All document types</option>
            {documentTypes.map((item)=><option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="table-scroll admin-doc-table-scroll"><table><thead><tr><th>Document</th><th>Client</th><th>Case</th><th>Category</th><th>Size</th><th>Uploaded</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {filtered.map((doc)=><tr key={doc.id} className={selected?.id===doc.id?"active":""}><td><strong>{doc.documentName}</strong><div className="mono muted" style={{fontSize:11}}>{doc.id}</div></td><td><strong>{doc.clientName}</strong><div className="muted" style={{fontSize:11}}>{doc.clientEmail}</div></td><td className="mono">{doc.caseId}</td><td>{doc.documentType}</td><td>{doc.size}</td><td className="mono muted">{new Date(doc.uploadedAt).toLocaleDateString()}</td><td><StatusPill status={doc.statusLabel}/></td><td><div className="admin-inline-actions"><button onClick={()=>selectDoc(doc)}><LuEye/> Preview</button><button disabled={!doc.fileUrl} onClick={()=>downloadDocument(doc)}><LuDownload/> Download</button><button onClick={()=>selectDoc(doc)}>Review</button><button onClick={()=>deleteDoc(doc)} disabled={deletingId===String(doc.id)}><LuTrash2/> {deletingId===String(doc.id)?"Deleting":"Delete"}</button></div></td></tr>)}
        </tbody></table></div>
        <div className="admin-doc-mobile-list">
          {filtered.map((doc)=>(
            <article className={selected?.id===doc.id?"active":""} key={doc.id}>
              <div>
                <strong>{doc.documentName}</strong>
                <StatusPill status={doc.statusLabel}/>
              </div>
              <span>{doc.clientName} - {doc.documentType}</span>
              <small>{doc.caseId} - {new Date(doc.uploadedAt).toLocaleDateString()} - {doc.size}</small>
              <div className="admin-inline-actions">
                <button onClick={()=>selectDoc(doc)}><LuEye/> Preview</button>
                <button disabled={!doc.fileUrl} onClick={()=>downloadDocument(doc)}><LuDownload/> Download</button>
                <button onClick={()=>selectDoc(doc)}>Review</button>
                <button onClick={()=>deleteDoc(doc)} disabled={deletingId===String(doc.id)}><LuTrash2/> {deletingId===String(doc.id)?"Deleting":"Delete"}</button>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length&&<EmptyAdminState title="No uploaded documents" copy="Client uploads will appear here for review." />}
      </AdminPanel>
    </div>
  );
}
