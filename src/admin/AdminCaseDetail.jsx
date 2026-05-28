import { useEffect, useState } from 'react';
import { LuDownload, LuEye } from 'react-icons/lu';
import { getAdminCase, getAdminUsers, updateAdminCase } from '../api.js';
import { useApp } from '../context.js';
import { useDocumentUploads } from '../documentUploads.js';
import { Ico } from '../icons.jsx';
import { Badge } from '../ui.jsx';
import { getErrorMessage } from '../utils/errorMessages.js';
import { downloadFileUrl, openFileUrl } from '../utils/filePreview.js';

const statusOptions=['submitted','under_review','investigation','awaiting_documents','recovery_in_progress','resolved','rejected','closed'];
const label=(value='')=>String(value).replace(/_/g,' ').replace(/\b\w/g,(letter)=>letter.toUpperCase());
const formatDate=(value)=>value?new Date(value).toLocaleDateString():'Not provided';
const display=(value,fallback='Not provided')=>value||fallback;
const fileSizeLabel=(value)=>value?`${value} bytes`:'Unknown size';

export function AdminCaseDetail(){
  const {param,goAdmin}=useApp();
  const [caseItem,setCaseItem]=useState(null);
  const [staffUsers,setStaffUsers]=useState([]);
  const [form,setForm]=useState({status:'submitted',priority:'normal',assigned_to:'',admin_notes:''});
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [saving,setSaving]=useState(false);
  const documents=useDocumentUploads({role:'admin'}).filter((doc)=>String(doc.caseId)===String(param));

  useEffect(()=>{
    let alive=true;
    async function loadCase(){
      try{
        const [item, users]=await Promise.all([getAdminCase(param), getAdminUsers()]);
        if(alive){
          setCaseItem(item);
          setStaffUsers(Array.isArray(users)?users.filter((user)=>user.role==='staff'||user.role==='admin'||user.is_staff||user.is_superuser):[]);
          setForm({
            status:item.status||'submitted',
            priority:item.priority||'normal',
            assigned_to:item.assigned_to?String(item.assigned_to):'',
            admin_notes:item.admin_notes||'',
          });
          setError('');
          setNotice('');
        }
      }catch(err){
        if(alive)setError(getErrorMessage(err,'Unable to load case.'));
      }
    }
    loadCase();
    return()=>{alive=false;};
  },[param]);

  const saveCase=async()=>{
    setSaving(true);
    setNotice('');
    try{
      const updated=await updateAdminCase(param,{
        status:form.status,
        priority:form.priority,
        assigned_to:form.assigned_to?Number(form.assigned_to):null,
        admin_notes:form.admin_notes,
      });
      setCaseItem(updated);
      setForm({
        status:updated.status||form.status,
        priority:updated.priority||form.priority,
        assigned_to:updated.assigned_to?String(updated.assigned_to):'',
        admin_notes:updated.admin_notes||'',
      });
      setError('');
      setNotice('Case updated.');
    }catch(err){
      setError(getErrorMessage(err,'Unable to update case.'));
    }finally{
      setSaving(false);
    }
  };

  if(error&&!caseItem)return <div><a className="back-link" onClick={()=>goAdmin('cases')}><Ico name="arrowL"/>Back to Cases</a><div className="auth-alert danger">{error}</div></div>;
  if(!caseItem)return <div><a className="back-link" onClick={()=>goAdmin('cases')}><Ico name="arrowL"/>Back to Cases</a><div className="auth-loading glass"><span className="auth-spinner"/> Loading case</div></div>;

  const intakeEvidence=Array.isArray(caseItem.evidence)?caseItem.evidence:[];
  const assignedName=caseItem.assigned_to_email||'Unassigned';
  const evidenceItems=[
    ...intakeEvidence.map((doc)=>({
      id:`case-evidence-${doc.id}`,
      name:doc.original_name||'Evidence file',
      size:fileSizeLabel(doc.file_size),
      url:doc.file_url,
    })),
    ...documents.map((doc)=>({
      id:`client-document-${doc.id}`,
      name:doc.documentName||doc.fileName||'Evidence file',
      size:doc.size||fileSizeLabel(doc.fileSize),
      url:doc.fileUrl,
    })),
  ];

  return (
    <div>
      <a className="back-link" onClick={()=>goAdmin('cases')}><Ico name="arrowL"/>Back to Cases</a>
      {error&&<div className="auth-alert danger" style={{marginBottom:12}}>{error}</div>}
      {notice&&<div className="auth-alert success" style={{marginBottom:12}}>{notice}</div>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:12,marginBottom:20}}>
        <div>
          <h1 className="admin-h1">CASE-{String(caseItem.id).padStart(4,'0')} - {caseItem.full_name||caseItem.email||'Client'}</h1>
          <p className="muted" style={{fontSize:13,marginTop:4}}>{caseItem.category||'Uncategorized'} - {caseItem.asset_type||'Asset not provided'}</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <Badge s={label(form.priority||caseItem.priority)}/>
          <Badge s={label(form.status||caseItem.status)}/>
        </div>
      </div>

      <div className="admin-ticket-detail-grid">
        <div><span>Status</span><strong>{label(caseItem.status)}</strong></div>
        <div><span>Priority</span><strong>{label(caseItem.priority)}</strong></div>
        <div><span>Assigned staff</span><strong>{assignedName}</strong></div>
        <div><span>Opened</span><strong>{formatDate(caseItem.created_at)}</strong></div>
        <div><span>Last updated</span><strong>{formatDate(caseItem.updated_at)}</strong></div>
        <div><span>Estimated value</span><strong>{display(caseItem.estimated_value)}</strong></div>
      </div>

      <div className="detail-grid">
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div className="glass panel">
            <div className="panel-head"><h3>Case Summary</h3></div>
            <p className="muted" style={{fontSize:13.5,lineHeight:1.7}}>{caseItem.description||'No description provided.'}</p>
          </div>
          <div className="glass panel">
            <div className="panel-head"><h3>Wallet / Transaction Details</h3></div>
            <div className="kv"><span className="k">Asset type</span><span className="v">{display(caseItem.asset_type)}</span></div>
            <div className="kv"><span className="k">Wallet address</span><span className="v mono">{display(caseItem.wallet_address)}</span></div>
            <div className="kv"><span className="k">Transaction hash</span><span className="v mono">{display(caseItem.transaction_hash)}</span></div>
          </div>
          <div className="glass panel">
            <div className="panel-head"><h3>Evidence</h3></div>
            {!evidenceItems.length?<p className="muted" style={{fontSize:13}}>No evidence documents attached yet.</p>:( 
              <div className="admin-ops-list">
                {evidenceItems.map((doc)=>(
                  <div className="admin-ops-row" key={doc.id}>
                    <div style={{minWidth:0}}>
                      <strong style={{display:'flex',gap:10,alignItems:'center'}}><Ico name="doc" style={{width:15,height:15,color:'var(--accent-2)'}}/>{doc.name}</strong>
                      <span>{doc.size}</span>
                    </div>
                    <div className="admin-inline-actions">
                      <button disabled={!doc.url} onClick={()=>openFileUrl(doc.url)}><LuEye /> Preview</button>
                      <button disabled={!doc.url} onClick={()=>downloadFileUrl(doc.url, doc.name)}><LuDownload /> Download</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div className="glass panel">
            <div className="panel-head"><h3>Admin Controls</h3></div>
            <div className="admin-form-grid" style={{gridTemplateColumns:'1fr'}}>
              <label className="field">Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{statusOptions.map(s=><option key={s} value={s}>{label(s)}</option>)}</select></label>
              <label className="field">Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{['low','normal','high','urgent'].map(s=><option key={s} value={s}>{label(s)}</option>)}</select></label>
              <label className="field">Assigned staff<select value={form.assigned_to} onChange={e=>setForm({...form,assigned_to:e.target.value})}>
                <option value="">Unassigned</option>
                {staffUsers.map((user)=><option key={user.id} value={user.id}>{user.full_name||user.name||user.email}</option>)}
              </select></label>
              <label className="field">Internal notes<textarea rows="5" value={form.admin_notes} onChange={e=>setForm({...form,admin_notes:e.target.value})} placeholder="Internal case notes for the admin team" /></label>
            </div>
            <div className="admin-inline-actions" style={{marginTop:12}}><button className="admin-small-btn primary" onClick={saveCase} disabled={saving}>{saving?'Saving...':'Save case'}</button></div>
          </div>
          <div className="glass panel">
            <div className="panel-head"><h3>Client Information</h3></div>
            <div className="kv"><span className="k">Client</span><span className="v">{display(caseItem.full_name)}</span></div>
            <div className="kv"><span className="k">Email</span><span className="v">{display(caseItem.email)}</span></div>
            <div className="kv"><span className="k">Phone</span><span className="v">{display(caseItem.phone)}</span></div>
            <div className="kv"><span className="k">Country</span><span className="v">{display(caseItem.country)}</span></div>
            <div className="kv"><span className="k">Case ID</span><span className="v mono">CASE-{String(caseItem.id).padStart(4,'0')}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
