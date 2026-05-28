import { useApp } from '../context.js';
import { Ico } from '../icons.jsx';
import { PageHead, Reveal } from '../ui.jsx';

export function ContactPage(){
  const {t}=useApp();
  const details=t('pages.contact.details');

  return (
    <main>
      <PageHead eyebrow={t('pages.contact.eyebrow')} title={t('pages.contact.title')} sub={t('pages.contact.sub')}/>
      <section className="contact-page-section contact-table-section">
        <div className="wrap">
          <Reveal>
            <div className="contact-table-panel">
              <div className="contact-table-head">
                <h2 className="section-title two-line-title">{t('pages.contact.tableTitle')}</h2>
                <p className="section-copy">{t('pages.contact.tableText')}</p>
              </div>

              <div className="contact-info-table" role="table" aria-label={t('pages.contact.tableTitle')}>
                <div className="contact-info-row contact-info-header" role="row">
                  <span role="columnheader">{t('pages.contact.tableType')}</span>
                  <span role="columnheader">{t('pages.contact.tableDetails')}</span>
                </div>
                {details.map(([ic,label,value])=>(
                  <div className="contact-info-row" role="row" key={label}>
                    <span role="cell">
                      <span className="contact-info-icon"><Ico name={ic}/></span>
                      {label}
                    </span>
                    <strong role="cell">{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
