import { useEffect, useMemo, useState } from "react";
import { LuImagePlus, LuPlus, LuSearch } from "react-icons/lu";
import { createAdminResource, deleteAdminResource, listAdminResources, updateAdminResource } from "../api.js";
import { getErrorMessage } from "../utils/errorMessages.js";
import { AdminPanel, EmptyAdminState, PageHeader, StatusPill } from "./AdminKit.jsx";

const initial = { title: "", slug: "", category: "Asset Recovery", excerpt: "", content: "", author: "ReclaimPortfolio", is_published: false };
const slugify = (value = "") => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function AdminBlog(){
  const [q,setQ]=useState("");
  const [posts,setPosts]=useState([]);
  const [form,setForm]=useState(initial);
  const [editing,setEditing]=useState(null);
  const [error,setError]=useState("");

  const load=async()=>{
    try{
      const rows=await listAdminResources();
      setPosts(Array.isArray(rows)?rows:[]);
      setError("");
    }catch(err){
      setError(getErrorMessage(err,"Unable to load resources."));
    }
  };
  useEffect(()=>{load();},[]);

  const postsFiltered=useMemo(()=>posts.filter((post)=>`${post.title} ${post.category} ${post.excerpt}`.toLowerCase().includes(q.toLowerCase())),[posts,q]);
  const set=(key,value)=>setForm((current)=>({...current,[key]:value}));
  const edit=(post)=>{
    setEditing(post.slug);
    setForm({
      title:post.title||"",
      slug:post.slug||"",
      category:post.category||"Asset Recovery",
      excerpt:post.excerpt||"",
      content:post.content||"",
      author:post.author||"ReclaimPortfolio",
      is_published:post.is_published,
    });
  };
  const reset=()=>{setEditing(null);setForm(initial);};
  const save=async(publish=false)=>{
    const payload={...form, slug:form.slug||slugify(form.title), is_published:publish||form.is_published, published_at:publish?new Date().toISOString():null};
    if(!payload.title||!payload.slug){
      setError("Title and slug are required.");
      return;
    }
    try{
      if(editing) await updateAdminResource(editing,payload);
      else await createAdminResource(payload);
      reset();
      await load();
    }catch(err){
      setError(getErrorMessage(err,"Unable to save resource."));
    }
  };
  const togglePublish=async(post)=>{
    try{
      await updateAdminResource(post.slug,{is_published:!post.is_published,published_at:!post.is_published?new Date().toISOString():post.published_at});
      await load();
    }catch(err){
      setError(getErrorMessage(err,"Unable to update publishing status."));
    }
  };
  const remove=async(post)=>{
    try{
      await deleteAdminResource(post.slug);
      await load();
    }catch(err){
      setError(getErrorMessage(err,"Unable to delete resource."));
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Blog manager" title="CMS publishing workspace" copy="Create, edit, publish, unpublish, categorize, and prepare SEO-ready recovery intelligence articles." action={<button className="admin-small-btn primary" onClick={reset}><LuPlus/> Create post</button>} />
      {error&&<div className="auth-alert danger" style={{marginBottom:12}}>{error}</div>}
      <section className="admin-grid-2">
        <AdminPanel title={editing?"Edit resource":"Editor"} copy="Backend-backed resource publishing">
          <div className="field-grid">
            <div className="field"><label>Post title</label><input className="input" value={form.title} onChange={(event)=>set("title",event.target.value)} placeholder="Article headline" /></div>
            <div className="field"><label>Category</label><select className="select" value={form.category} onChange={(event)=>set("category",event.target.value)}><option>Asset Recovery</option><option>Crypto</option><option>Compliance</option></select></div>
          </div>
          <div className="field"><label>Slug</label><input className="input" value={form.slug} onChange={(event)=>set("slug",slugify(event.target.value))} placeholder={slugify(form.title)||"article-slug"} /></div>
          <div className="field"><label>SEO description</label><textarea className="textarea" rows="3" value={form.excerpt} onChange={(event)=>set("excerpt",event.target.value)} placeholder="Search summary..." /></div>
          <div className="field"><label>Content</label><textarea className="textarea" rows="5" value={form.content} onChange={(event)=>set("content",event.target.value)} placeholder="Article content..." /></div>
          <div className="upload-box"><LuImagePlus style={{width:24,height:24,color:"#C9A55E",margin:"0 auto 8px"}}/>Resource content saves directly to the backend resource table.</div>
          <div className="admin-inline-actions" style={{marginTop:14}}><button className="admin-small-btn primary" onClick={()=>save(false)}>Save draft</button><button className="admin-small-btn" onClick={()=>save(true)}>Publish</button><button className="admin-small-btn" onClick={reset}>Reset</button></div>
        </AdminPanel>
        <AdminPanel title="Publishing controls">
          {["Categories","SEO metadata","Draft approvals","Article audit trail"].map((item,index)=><div className="admin-ops-row" key={item}><div><strong>{item}</strong><span>CMS control module</span></div><StatusPill status={index<2?"Open":"Draft"}/></div>)}
        </AdminPanel>
      </section>
      <AdminPanel title="Posts" className="admin-blog-list">
        <div className="toolbar"><div className="search-box"><LuSearch/><input placeholder="Search posts..." value={q} onChange={(event)=>setQ(event.target.value)} /></div></div>
        <div className="table-scroll"><table><thead><tr><th>Title</th><th>Category</th><th>Author</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>{postsFiltered.map((post)=><tr key={post.id}><td><strong>{post.title}</strong><div className="muted" style={{fontSize:11}}>{post.excerpt}</div></td><td>{post.category}</td><td>{post.author}</td><td className="mono muted">{post.published_at?new Date(post.published_at).toLocaleDateString():"Draft"}</td><td><StatusPill status={post.is_published?"Published":"Draft"}/></td><td><div className="admin-inline-actions"><button onClick={()=>edit(post)}>Edit</button><button onClick={()=>togglePublish(post)}>{post.is_published?"Unpublish":"Publish"}</button><button onClick={()=>remove(post)}>Delete</button></div></td></tr>)}
        {!postsFiltered.length&&<tr><td colSpan="6"><EmptyAdminState title="No resources" copy="Published resources and drafts will appear here." /></td></tr>}
        </tbody></table></div>
      </AdminPanel>
    </div>
  );
}
