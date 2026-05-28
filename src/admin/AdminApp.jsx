import { AdminCaseDetail } from './AdminCaseDetail.jsx';
import { AdminCases } from './AdminCases.jsx';
import { AdminClients } from './AdminClients.jsx';
import { AdminCryptoCases } from './AdminCryptoCases.jsx';
import { AdminDocuments } from './AdminDocuments.jsx';
import { AdminIntake } from './AdminIntake.jsx';
import { AdminLayout } from './AdminLayout.jsx';
import { AdminNewsletter } from './AdminNewsletter.jsx';
import { AdminOverview } from './AdminOverview.jsx';
import { AdminReports } from './AdminReports.jsx';
import { AdminTeam } from './AdminTeam.jsx';
import { AdminTickets } from './AdminTickets.jsx';
import { AdminLogin } from './AdminLogin.jsx';
import { useApp } from '../context.js';
import { useEffect, useState } from 'react';
import { getAdminSession, getAdminUser, logoutAdmin, storeAdminSession } from '../api.js';

function readAdminSession() {
  return getAdminSession();
}

export function AdminApp(){
  const {adminRoute,goAdmin}=useApp();
  const [adminSession,setAdminSession]=useState(()=>readAdminSession());
  const [loading,setLoading]=useState(Boolean(adminSession?.access));
  const [authError,setAuthError]=useState("");

  useEffect(()=>{
    let alive=true;
    async function verify(){
      if(!adminSession?.access){
        setLoading(false);
        return;
      }
      try{
        const user=await getAdminUser();
        if(!alive)return;
        const next={...adminSession,user};
        storeAdminSession(next);
        setAdminSession(next);
      }catch{
        storeAdminSession(null);
        if(alive){
          setAdminSession(null);
          setAuthError("Admin session expired. Please sign in again.");
        }
      }finally{
        if(alive)setLoading(false);
      }
    }
    verify();
    return()=>{alive=false;};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const authenticate=(profile)=>{
    const session={...profile,createdAt:new Date().toISOString()};
    storeAdminSession(session);
    setAdminSession(session);
    goAdmin("overview");
  };
  const signOut=async()=>{
    try{
      await logoutAdmin(adminSession?.refresh);
    }catch{
      // Token may already be expired; local cleanup still matters.
    }
    storeAdminSession(null);
    setAdminSession(null);
  };
  const pages={
    overview:<AdminOverview/>,cases:<AdminCases/>,'case-detail':<AdminCaseDetail/>,
    intake:<AdminIntake/>,'crypto-cases':<AdminCryptoCases/>,clients:<AdminClients/>,
    documents:<AdminDocuments/>,reports:<AdminReports/>,tickets:<AdminTickets/>,
    newsletter:<AdminNewsletter/>,
    team:<AdminTeam/>,
  };
  if(loading) return <main className="admin-login-page"><div className="auth-loading glass"><span className="auth-spinner" /><span>Validating admin session</span></div></main>;
  if(!adminSession) return <AdminLogin onAuthenticated={authenticate} initialStatus={authError}/>;
  return <AdminLayout onSignOut={signOut}>{pages[adminRoute]||<AdminOverview/>}</AdminLayout>;
}
