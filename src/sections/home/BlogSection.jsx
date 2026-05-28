import { useApp } from '../../context.js';
import { Ico } from '../../icons.jsx';
import { Reveal } from '../../ui.jsx';

function BlogCards({limit}){
  const {go,t}=useApp();
  const blog=t('data.blog');
  const list=limit?blog.slice(0,limit):blog;
  return (
    <div className="grid-3">
      {list.map((p,i)=>(
        <Reveal key={p.id} delay={i*50}>
          <div className="glass glass-hover post-card" style={{cursor:'pointer'}} onClick={()=>go('post',p.id)}>
            <div className="post-thumb"><Ico name={p.cat==='Crypto'||p.cat==='Krypto'?'network':p.cat==='Compliance'?'shield':'archive'}/></div>
            <div className="post-body">
              <span className="post-meta">{p.cat.toUpperCase()} - {p.date}</span>
              <h4>{p.title}</h4>
              <p className="muted" style={{fontSize:13,flex:1}}>{p.excerpt}</p>
              <a className="srow-learn" style={{marginTop:6}}>{t('common.readMore')} <Ico name="arrow"/></a>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function BlogSection(){
  const {t}=useApp();
  return (
    <section className="section">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow section-kicker">{t('home.blogEyebrow')}</span>
          <h2 className="section-title">{t('home.blogTitle')}</h2>
        </Reveal>
        <BlogCards limit={3}/>
      </div>
    </section>
  );
}
