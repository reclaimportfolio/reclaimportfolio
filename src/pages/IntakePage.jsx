import { useRef, useState } from 'react';
import { useApp } from '../context.js';
import { Ico } from '../icons.jsx';
import { Btn, PageHead, Reveal } from '../ui.jsx';
import { submitIntake } from '../api.js';
import { getErrorMessage, getFieldErrors } from '../utils/errorMessages.js';

const MAX_EVIDENCE_FILES = 5;
const MAX_EVIDENCE_FILE_SIZE = 10 * 1024 * 1024;
const MAX_EVIDENCE_TOTAL_SIZE = 25 * 1024 * 1024;

export function IntakePage(){
  const {t}=useApp();
  const init={name:'',email:'',phone:'',country:'',asset:'',value:'',cat:'',desc:'',wallet:'',tx:'',consent:false};
  const [f,setF]=useState(init);
  const [files,setFiles]=useState([]);
  const [err,setErr]=useState({});
  const [sent,setSent]=useState(false);
  const [loading,setLoading]=useState(false);
  const fileInputRef=useRef(null);
  const cryptoAssets=t('data.assets').slice(8,12);
  const isCrypto=cryptoAssets.includes(f.asset);
  const set=(k,v)=>setF({...f,[k]:v});
  const selectEvidence = (event) => {
    const selected = Array.from(event.target.files || []);
    let evidenceError = "";
    if (selected.length > MAX_EVIDENCE_FILES) evidenceError = "Upload no more than 5 evidence files.";
    else if (selected.some((file) => file.size > MAX_EVIDENCE_FILE_SIZE)) evidenceError = "Each evidence file must be 10 MB or less.";
    else if (selected.reduce((total, file) => total + file.size, 0) > MAX_EVIDENCE_TOTAL_SIZE) evidenceError = "Evidence files must total 25 MB or less.";
    if (evidenceError) {
      setFiles([]);
      setErr((current) => ({ ...current, evidence: evidenceError }));
      event.target.value = "";
      return;
    }
    setErr((current) => ({ ...current, evidence: "" }));
    setFiles(selected);
  };
  const submit=async()=>{
    if(loading) return;
    const e={};
    if(!f.name.trim())e.name=t('pages.intake.required');
    if(!/^[^@]+@[^@]+\.[^@]+$/.test(f.email))e.email=t('pages.intake.validEmail');
    if(!f.phone.trim())e.phone=t('pages.intake.required');
    if(!f.country.trim())e.country=t('pages.intake.required');
    if(!f.asset)e.asset=t('pages.intake.selectAssetErr');
    if(!f.cat)e.cat=t('pages.intake.selectCatErr');
    if(f.desc.trim().length<20)e.desc=t('pages.intake.descErr');
    if(!f.consent)e.consent=t('pages.intake.consentErr');
    setErr(e);
    if(Object.keys(e).length) return;
    setLoading(true);
    try {
      await submitIntake({
        full_name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
        country: f.country.trim(),
        asset_type: f.asset,
        estimated_value: f.value,
        category: f.cat,
        description: f.desc.trim(),
        wallet_address: f.wallet.trim(),
        transaction_hash: f.tx.trim(),
        consent: f.consent,
      }, files);
      setSent(true);
      window.scrollTo({top:0,behavior:'smooth'});
    } catch (error) {
      const fields=getFieldErrors(error);
      setErr({
        name:fields.full_name,
        email:fields.email,
        phone:fields.phone,
        country:fields.country,
        asset:fields.asset_type,
        value:fields.estimated_value,
        cat:fields.category,
        desc:fields.description,
        evidence:fields.evidence,
        consent:fields.consent,
        submit:getErrorMessage(error,'Unable to submit your intake request. Please try again.'),
      });
    } finally {
      setLoading(false);
    }
  };
  if(sent)return (
    <main>
      <section className="section">
        <div className="wrap" style={{maxWidth:640}}>
          <div className="glass success-box">
            <div className="success-ic"><Ico name="check"/></div>
            <h2 className="h2" style={{fontSize:'1.8rem',marginBottom:12}}>{t('pages.intake.successTitle')}</h2>
            <p className="muted" style={{fontSize:15,lineHeight:1.7}}>{t('pages.intake.successText')}</p>
            <div style={{marginTop:26,display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
              <Btn primary onClick={()=>{setF(init);setFiles([]);setSent(false);}}>{t('pages.intake.another')}</Btn>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
  return (
    <main>
      <PageHead eyebrow={t('pages.intake.eyebrow')} title={t('pages.intake.title')} sub={t('pages.intake.sub')}/>
      <section className="section-sm">
        <div className="wrap" style={{maxWidth:760}}>
          <Reveal>
            <div className="glass" style={{padding:'36px 36px 30px'}}>
              <div className="grid-2" style={{gap:'0 24px'}}>
                <Field label={t('pages.intake.fullName')} err={err.name}><input className="input" value={f.name} onChange={e=>set('name',e.target.value)}/></Field>
                <Field label={t('pages.intake.email')} err={err.email}><input className="input" value={f.email} onChange={e=>set('email',e.target.value)}/></Field>
                <Field label={t('pages.intake.phone')} err={err.phone}><input className="input" value={f.phone} onChange={e=>set('phone',e.target.value)}/></Field>
                <Field label={t('pages.intake.country')} err={err.country}><input className="input" value={f.country} onChange={e=>set('country',e.target.value)}/></Field>
                <Field label={t('pages.intake.assetType')} err={err.asset}>
                  <select className="select" value={f.asset} onChange={e=>set('asset',e.target.value)}>
                    <option value="">{t('pages.intake.selectAsset')}</option>
                    {t('data.assets').map(a=><option key={a}>{a}</option>)}
                  </select>
                </Field>
                <div className="field">
                  <label>{t('pages.intake.value')}</label>
                  <select className="select" value={f.value} onChange={e=>set('value',e.target.value)}>
                    <option value="">{t('pages.intake.selectRange')}</option>
                    {t('pages.intake.ranges').map(v=><option key={v}>{v}</option>)}
                  </select>
                </div>
                <Field label={t('pages.intake.category')} err={err.cat}>
                  <select className="select" value={f.cat} onChange={e=>set('cat',e.target.value)}>
                    <option value="">{t('pages.intake.selectCategory')}</option>
                    {t('pages.intake.categories').map(c=><option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div className="field">
                <label>{t('pages.intake.desc')} <span className="req">*</span></label>
                <textarea className="textarea" placeholder={t('pages.intake.descPlaceholder')} value={f.desc} onChange={e=>set('desc',e.target.value)}/>
                {err.desc&&<div className="field-err">{err.desc}</div>}
              </div>
              {isCrypto&&(
                <div style={{padding:'4px 0 4px'}}>
                  <div className="eyebrow" style={{marginBottom:14}}>{t('pages.intake.cryptoDetails')}</div>
                  <div className="grid-2" style={{gap:'0 24px'}}>
                    <div className="field"><label>{t('pages.intake.wallet')}</label><input className="input mono" placeholder="0x... / bc1..." value={f.wallet} onChange={e=>set('wallet',e.target.value)}/></div>
                    <div className="field"><label>{t('pages.intake.tx')}</label><input className="input mono" placeholder="0x..." value={f.tx} onChange={e=>set('tx',e.target.value)}/></div>
                  </div>
                </div>
              )}
              <div className="field">
                <label>{t('pages.intake.upload')}</label>
                <button type="button" className="upload-box" onClick={()=>fileInputRef.current?.click()} style={{width:'100%'}}>
                  <Ico name="doc" style={{width:22,height:22,margin:'0 auto 8px'}}/>
                  {files.length ? `${files.length} file(s) selected` : t('pages.intake.uploadText')}
                </button>
                <input ref={fileInputRef} type="file" hidden multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={selectEvidence}/>
                {err.evidence&&<div className="field-err">{err.evidence}</div>}
              </div>
              <div className="field">
                <label className="checkrow"><input type="checkbox" checked={f.consent} onChange={e=>set('consent',e.target.checked)}/><span>{t('pages.intake.consent')}</span></label>
                {err.consent&&<div className="field-err">{err.consent}</div>}
              </div>
              <Btn primary icon={loading?null:"arrow"} onClick={submit}>{loading?'Submitting...':t('pages.intake.submit')}</Btn>
              {err.submit && <div className="field-err" style={{marginTop:12}}>{err.submit}</div>}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function Field({label,err,children}){
  return (
    <div className="field">
      <label>{label} <span className="req">*</span></label>
      {children}
      {err&&<div className="field-err">{err}</div>}
    </div>
  );
}
