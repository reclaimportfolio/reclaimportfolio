import React, { lazy, Suspense, useState, useEffect } from 'react';
import { AuthModal } from './auth/AuthModal.jsx';
import { ProtectedRoute } from './auth/ProtectedRoute.jsx';
import { SessionProvider } from './auth/SessionProvider.jsx';
import { Footer } from './components/Footer.jsx';
import { TopBar } from './components/TopBar.jsx';
import { Ctx } from './context.js';
import { getTranslation } from './i18n.js';
import { Seo } from './Seo.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { AuthPage } from './pages/AuthPages.jsx';
import { CompliancePage } from './pages/CompliancePage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { CryptoPage } from './pages/CryptoPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { IntakePage } from './pages/IntakePage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { PrivacyPage, TermsPage } from './pages/PolicyPages.jsx';
import { PostPage, ResourcesPage } from './pages/ResourcesPage.jsx';
import { ServicesPage } from './pages/ServicesPage.jsx';
import { StocksPage } from './pages/StocksPage.jsx';

const AdminApp = lazy(() => import('./admin/AdminApp.jsx').then((module) => ({ default: module.AdminApp })));
const DashboardLayout = lazy(() => import('./dashboard/DashboardLayout.jsx').then((module) => ({ default: module.DashboardLayout })));

const ROUTE_TO_PATH = {
  home: '/',
  about: '/about',
  services: '/services',
  crypto: '/crypto',
  stocks: '/stocks',
  compliance: '/compliance',
  resources: '/resources',
  contact: '/contact',
  intake: '/intake',
  terms: '/terms-of-use',
  privacy: '/privacy-policy',
  admin: '/admin',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  'not-found': '/404',
};

const PATH_TO_ROUTE = Object.fromEntries(Object.entries(ROUTE_TO_PATH).map(([route, path]) => [path, route]));

function routeFromLocation() {
  return PATH_TO_ROUTE[window.location.pathname] || 'not-found';
}

/* ============ APP / ROUTER ============ */
function App(){
  const [theme,setTheme]=useState('dark');
  const [route,setRoute]=useState(routeFromLocation);
  const [param,setParam]=useState(null);
  const [adminRoute,setAdminRoute]=useState('overview');
  const [language,setLanguage]=useState(()=>localStorage.getItem('language')||'en');
  const [authModal,setAuthModal]=useState(null);
  useEffect(()=>{document.documentElement.setAttribute('data-theme',theme);},[theme]);
  useEffect(()=>{
    document.documentElement.setAttribute('lang',language);
    localStorage.setItem('language',language);
  },[language]);
  useEffect(()=>{
    const sync=()=>setRoute(routeFromLocation());
    window.addEventListener('popstate',sync);
    return ()=>window.removeEventListener('popstate',sync);
  },[]);
  const go=(r,p=null)=>{
    setParam(p);
    setRoute(r);
    setAuthModal(null);
    const nextPath=ROUTE_TO_PATH[r] || '/';
    if(window.location.pathname!==nextPath) window.history.pushState({},'',nextPath);
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const goAdmin=(r,p=null)=>{setParam(p);setAdminRoute(r);window.scrollTo({top:0,behavior:'auto'});};
  const toggleTheme=()=>setTheme(t=>t==='dark'?'light':'dark');
  const t=(path)=>getTranslation(language,path) ?? getTranslation('en',path) ?? path;
  const openAuth=(mode='signup')=>{
    if(window.matchMedia('(min-width: 861px)').matches) setAuthModal(mode);
    else go(mode==='login'?'login':'signup');
  };
  const ctx={theme,toggleTheme,route,go,param,adminRoute,goAdmin,language,setLanguage,t,openAuth};
  const privateFallback = <main className="auth-loading"><span className="auth-spinner" /><span>Loading secure workspace</span></main>;

  const pages={
    home:<HomePage/>,about:<AboutPage/>,services:<ServicesPage/>,
    crypto:<CryptoPage/>,stocks:<StocksPage/>,compliance:<CompliancePage/>,
    resources:<ResourcesPage/>,post:<PostPage/>,
    contact:<ContactPage/>,intake:<IntakePage/>,
    terms:<TermsPage/>,privacy:<PrivacyPage/>,
    login:<AuthPage mode="login"/>,signup:<AuthPage mode="signup"/>,
    'forgot-password':<AuthPage mode="forgot"/>,
    'reset-password':<AuthPage mode="reset"/>,
    dashboard:<ProtectedRoute><Suspense fallback={privateFallback}><DashboardLayout/></Suspense></ProtectedRoute>,
    'not-found':<NotFoundPage/>,
  };

  return (
    <Ctx.Provider value={ctx}>
      <SessionProvider>
        <Seo/>
        {route==='admin'
          ? <Suspense fallback={privateFallback}><AdminApp/></Suspense>
          : route==='dashboard'
            ? pages.dashboard
            : <React.Fragment>
                <TopBar/>
                {pages[route]||<NotFoundPage/>}
                <Footer/>
                <AuthModal
                  mode={authModal || 'signup'}
                  open={!!authModal}
                  onClose={()=>setAuthModal(null)}
                  onSuccess={()=>go('dashboard')}
                />
              </React.Fragment>}
      </SessionProvider>
    </Ctx.Provider>
  );
}

export default App;
