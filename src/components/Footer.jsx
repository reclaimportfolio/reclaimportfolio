import { useState } from 'react';
import { useApp } from '../context.js';
import { Ico } from '../icons.jsx';
import { subscribeNewsletter } from '../api.js';
import { getErrorMessage } from '../utils/errorMessages.js';

const BRAND_LOGO = 'https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779031196/reclaim_logo_svg_o9yyv9.svg';

export function Footer(){
  const {go,t}=useApp();
  const [email,setEmail]=useState('');
  const [status,setStatus]=useState('');
  const [loading,setLoading]=useState(false);

  const subscribe=async(event)=>{
    event.preventDefault();
    if(!/^[^@]+@[^@]+\.[^@]+$/.test(email)){
      setStatus('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await subscribeNewsletter({ email: email.trim().toLowerCase(), source: 'website-footer' });
      setStatus('Subscribed. We will send only useful recovery intelligence.');
      setEmail('');
    } catch (error) {
      setStatus(getErrorMessage(error,'Unable to subscribe at this time.'));
    } finally {
      setLoading(false);
    }
  };

  const columns=[
    {label:'Recovery',links:[['Crypto Tracing','crypto'],[t('nav.stocks'),'stocks'],['Compliance','compliance'],['Case Intake','intake']]},
    {label:'Solutions',links:[['Investigations','services'],['Fraud Claims','intake'],['Secure Reports','resources']]},
    {label:'Resources',links:[['Guides','resources'],['Reports','resources'],['Compliance','compliance']]},
    {label:'Company',links:[['About','about'],['Contact','contact'],['Services','services']]},
  ];

  return (
    <footer className="footer">
      <div className="wrap">
        <section className="newsletter-band">
          <div className="newsletter-copy">
            <h2>Subscribe our<br/>newsletter</h2>
            <p>Receive asset recovery insights, blockchain investigation updates, and practical guidance for protecting digital wealth.</p>
          </div>
          <form className="newsletter-form" onSubmit={subscribe}>
            <label>Stay up to date</label>
            <div className="newsletter-control">
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" type="email" />
              <button type="submit" disabled={loading}>{loading?'Sending':'Subscribe'}</button>
            </div>
            <p>By subscribing you agree to our <button type="button" onClick={()=>go('privacy')}>Privacy Policy</button></p>
            {status&&<div className={`newsletter-status ${status.startsWith('Subscribed')?'success':'error'}`}>{status}</div>}
          </form>
        </section>

        <div className="footer-terminal">
          <div className="footer-link-wall">
            {columns.map((column)=>(
              <div className="footer-column" key={column.label}>
                <h5>{column.label}</h5>
                {column.links.map(([label,route])=>(
                  <button key={label} className="footer-link" onClick={()=>go(route)}>{label}</button>
                ))}
              </div>
            ))}

            <div className="footer-column footer-action-column">
              <h5>Access</h5>
              <button className="footer-pill primary" onClick={()=>go('intake')}>{t('common.startRecovery')}</button>
              <div className="footer-legal-stack">
                <button onClick={()=>go('terms')}>Terms of Use</button>
                <button onClick={()=>go('privacy')}>Privacy Policy</button>
                <button onClick={()=>go('compliance')}>Security</button>
              </div>
            </div>
          </div>

          <div className="footer-brand-row">
            <button className="footer-mega-brand" onClick={()=>go('home')} aria-label="Go home">
              <img className="footer-brand-logo-img" src={BRAND_LOGO} alt={`${t('common.brandA')}${t('common.brandB')}`} />
            </button>

            <div className="footer-meta">
              <p>{t('footer.text')}</p>
              <div className="footer-socials">
                {['twitter','linkedin','mail','globe'].map(s=>(
                  <a key={s} className="icon-btn" aria-label={s}><Ico name={s}/></a>
                ))}
              </div>
              <span>{t('footer.rights')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
