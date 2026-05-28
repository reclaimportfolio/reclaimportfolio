import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context.js';
import { Ico } from '../icons.jsx';
import { Btn, PageHead, Reveal } from '../ui.jsx';
import { getResource, listResources } from '../api.js';

export function ResourcesPage(){
  const {go,t}=useApp();
  const fallbackBlog=t('data.blog');
  const [resources,setResources]=useState([]);
  const [q,setQ]=useState('');
  const [cat,setCat]=useState(t('pages.resources.all'));
  const all=t('pages.resources.all');
  useEffect(()=>setCat(all),[all]);
  useEffect(()=>{
    let alive=true;
    async function loadResources(){
      try{
        const rows=await listResources();
        if(alive)setResources(Array.isArray(rows)?rows:[]);
      }catch{
        if(alive)setResources([]);
      }
    }
    loadResources();
    return()=>{alive=false;};
  },[]);
  const blog=resources.length?resources.map((item)=>({
    id:item.slug,
    slug:item.slug,
    title:item.title,
    cat:item.category||'Resource',
    excerpt:item.excerpt,
    date:item.published_at?new Date(item.published_at).toLocaleDateString():'',
    author:item.author||'ReclaimPortfolio',
    body:(item.content||item.excerpt||'').split(/\n+/).filter(Boolean),
  })):fallbackBlog;
  const cats=[all,...new Set(blog.map(b=>b.cat))];
  const list=useMemo(()=>blog.filter(b=>
    (cat===all||b.cat===cat) &&
    (b.title.toLowerCase().includes(q.toLowerCase())||b.excerpt.toLowerCase().includes(q.toLowerCase()))
  ),[q,cat,all,blog]);
  return (
    <main>
      <PageHead eyebrow={t('pages.resources.eyebrow')} title={t('pages.resources.title')} sub={t('pages.resources.sub')}/>
      <section className="section-sm">
        <div className="wrap">
          <div className="toolbar" style={{marginBottom:32}}>
            <div className="search-box">
              <Ico name="search"/>
              <input placeholder={t('pages.resources.search')} value={q} onChange={e=>setQ(e.target.value)}/>
            </div>
            <select className="tsel" value={cat} onChange={e=>setCat(e.target.value)}>
              {cats.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          {list.length===0
            ? <p className="muted" style={{padding:'40px 0'}}>{t('pages.resources.empty')}</p>
            : <div className="grid-3">
                {list.map((p)=>(
                  <div key={p.id} className="glass glass-hover post-card" style={{cursor:'pointer'}} onClick={()=>go('post',p.slug||p.id)}>
                    <div className="post-thumb"><Ico name={p.cat==='Crypto'||p.cat==='Krypto'?'network':p.cat==='Compliance'?'shield':'archive'}/></div>
                    <div className="post-body">
                      <span className="post-meta">{p.cat.toUpperCase()} - {p.date}</span>
                      <h4>{p.title}</h4>
                      <p className="muted" style={{fontSize:13,flex:1}}>{p.excerpt}</p>
                      <a className="srow-learn" style={{marginTop:6}}>{t('common.readMore')} <Ico name="arrow"/></a>
                    </div>
                  </div>
                ))}
              </div>}
        </div>
      </section>
    </main>
  );
}

export function PostPage(){
  const {param,go,t}=useApp();
  const fallbackBlog=t('data.blog');
  const [remotePost,setRemotePost]=useState(null);
  useEffect(()=>{
    let alive=true;
    async function loadPost(){
      if(!param||typeof param!=='string')return;
      try{
        const item=await getResource(param);
        if(alive)setRemotePost({
          id:item.slug,
          slug:item.slug,
          title:item.title,
          cat:item.category||'Resource',
          excerpt:item.excerpt,
          date:item.published_at?new Date(item.published_at).toLocaleDateString():'',
          author:item.author||'ReclaimPortfolio',
          body:(item.content||item.excerpt||'').split(/\n+/).filter(Boolean),
        });
      }catch{
        if(alive)setRemotePost(null);
      }
    }
    loadPost();
    return()=>{alive=false;};
  },[param]);
  const post=remotePost||fallbackBlog.find(b=>b.id===param)||fallbackBlog[0];
  return (
    <main>
      <div className="page-head">
        <div className="hero-glow" style={{opacity:.5}}/>
        <div className="wrap" style={{position:'relative',zIndex:2,maxWidth:780}}>
          <a className="back-link" onClick={()=>go('resources')}><Ico name="arrowL"/>{t('pages.resources.back')}</a>
          <span className="post-meta">{post.cat.toUpperCase()} - {post.date} - {post.author}</span>
          <h1 className="display" style={{fontSize:'clamp(2rem,4vw,3.2rem)',margin:'14px 0'}}>{post.title}</h1>
        </div>
      </div>
      <section className="section-sm">
        <div className="wrap" style={{maxWidth:780}}>
          {post.body.map((p,i)=>(
            <Reveal key={i} delay={i*40}>
              <p style={{fontSize:16.5,lineHeight:1.8,marginBottom:22,color:i===0?'var(--text)':'var(--muted)'}}>{p}</p>
            </Reveal>
          ))}
          <div className="divider" style={{margin:'30px 0'}}/>
          <p className="muted" style={{fontSize:12.5,lineHeight:1.7}}>{t('pages.resources.disclaimer')}</p>
          <div style={{marginTop:30}}><Btn primary icon="arrow" onClick={()=>go('intake')}>{t('pages.resources.review')}</Btn></div>
        </div>
      </section>
    </main>
  );
}
