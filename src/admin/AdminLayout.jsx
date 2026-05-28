import { useState, useMemo } from 'react';
import {
  LuChartColumn,
  LuBell,
  LuBriefcaseBusiness,
  LuChevronLeft,
  LuChevronRight,
  LuClipboardList,
  LuFileCheck2,
  LuFileText,
  LuHeadphones,
  LuLayoutDashboard,
  LuLogOut,
  LuMenu,
  LuMoon,
  LuSearch,
  LuSun,
  LuUserRound,
  LuUsersRound,
  LuNewspaper,
} from "react-icons/lu";
import { useApp } from '../context.js';

/* ============ ADMIN ============ */
const ADMIN_NAV=[
  ['overview','Overview',LuLayoutDashboard],['cases','Cases',LuBriefcaseBusiness],['intake','Intake Submissions',LuClipboardList],
  ['clients','Clients',LuUsersRound],['documents','Documents',LuFileText],
  ['reports','Reports',LuChartColumn],['tickets','Tickets',LuHeadphones],['newsletter','Newsletter',LuNewspaper],
];
const BRAND_LOGO = "https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779031196/reclaim_logo_svg_o9yyv9.svg";
export function useSortableData(items,initialKey){
  const [sort,setSort]=useState({key:initialKey,dir:'desc'});
  const sorted=useMemo(()=>{
    const s=[...items].sort((a,b)=>{
      let av=a[sort.key],bv=b[sort.key];
      if(av<bv)return sort.dir==='asc'?-1:1;
      if(av>bv)return sort.dir==='asc'?1:-1;
      return 0;
    });
    return s;
  },[items,sort]);
  const onSort=k=>setSort(s=>({key:k,dir:s.key===k&&s.dir==='asc'?'desc':'asc'}));
  return {sorted,onSort,sort};
}
export function AdminLayout({children,onSignOut}){
  const {adminRoute,goAdmin,go,theme,toggleTheme}=useApp();
  const [collapsed,setCollapsed]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const current=(ADMIN_NAV.find(n=>n[0]===adminRoute)||ADMIN_NAV[0])[1];
  const CollapseIcon=collapsed?LuChevronRight:LuChevronLeft;
  return (
    <div className="admin admin-enterprise">
      {mobileOpen&&<div className="scrim" onClick={()=>setMobileOpen(false)}/>}
      <aside className={'admin-sidebar'+(collapsed?' collapsed':'')+(mobileOpen?' mobile-open':'')}>
        <div className="admin-side-brand">
          {!collapsed&&<img src={BRAND_LOGO} alt="ReclaimPortfolio" />}
          <button onClick={()=>setCollapsed(!collapsed)} aria-label={collapsed?'Expand admin menu':'Collapse admin menu'}><CollapseIcon /></button>
        </div>
        <div className="admin-side-status">
          {!collapsed&&<div><strong>Control Center</strong><small>Secure operations</small></div>}
        </div>
        <nav className="admin-side-nav">
          {ADMIN_NAV.map(([r,l,Icon])=>(
            <button key={r} title={l} className={'admin-side-item'+(adminRoute===r?' active':'')}
              onClick={()=>{goAdmin(r);setMobileOpen(false);}}>
              <Icon />{!collapsed&&<span>{l}</span>}
            </button>
          ))}
        </nav>
        <div className="admin-side-foot">
          <button className="admin-side-item" onClick={()=>go('home')}>
            <LuLogOut />{!collapsed&&<span>Exit to Site</span>}
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-top">
          <div className="admin-top-left">
            <button className="icon-btn admin-mobile-burger" onClick={()=>setMobileOpen(true)}><LuMenu /></button>
            <div>
              <span>ADMIN / {current.toUpperCase()}</span>
              <strong>Reclaim Portfolio Operations</strong>
            </div>
          </div>
          <div className="admin-top-actions">
            <label className="admin-global-search">
              <LuSearch />
              <input placeholder="Search cases, clients, wallets..." />
            </label>
            <button className="icon-btn" onClick={toggleTheme}>{theme==='dark'?<LuSun/>:<LuMoon/>}</button>
            <button className="icon-btn"><LuBell/></button>
            <button className="admin-review-chip"><LuFileCheck2/> 12 reviews</button>
            <div className="admin-profile-menu">
              <button className="avatar" style={{width:34,height:34,fontSize:12}} onClick={()=>setProfileOpen((value)=>!value)} aria-label="Admin profile">AC</button>
              {profileOpen&&(
                <div className="admin-profile-dropdown">
                  <strong>Adrian Cole</strong>
                  <span>Super Admin</span>
                  <button><LuUserRound/> Profile</button>
                  <button onClick={onSignOut || (()=>go('home'))}><LuLogOut/> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="admin-body">{children}</div>
      </div>
    </div>
  );
}
