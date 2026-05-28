import { useEffect, useState } from "react";
import { Ico } from "../icons.jsx";
import { LoginForm } from "./LoginForm.jsx";
import { SignupForm } from "./SignupForm.jsx";

const AUTH_IMAGE = "https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779016048/Titanium_Gradient_Basic_Apple_Guy_w6d4os.jpg";
const BRAND_LOGO = "https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779031196/reclaim_logo_svg_o9yyv9.svg";
const AUTH_SLIDES = [
  {
    title: "Trace digital wealth.",
    text: "Follow wallet movement, exchange exposure, and recovery pathways from one secure client workspace.",
  },
  {
    title: "Protect sensitive evidence.",
    text: "Upload statements, screenshots, IDs, and correspondence into a private investigation vault.",
  },
  {
    title: "Coordinate recovery action.",
    text: "Track claims, case status, support messages, and analyst reports without losing context.",
  },
];

export function AuthModal({ mode = "signup", open, onClose, onSuccess }) {
  const [tab, setTab] = useState(mode);

  useEffect(() => setTab(mode), [mode, open]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="auth-modal" role="dialog" aria-modal="true" aria-label="Client authentication">
      <button className="auth-modal-backdrop" aria-label="Close authentication" onClick={onClose} />
      <div className="auth-suite auth-modal-card">
        <button className="auth-close" type="button" onClick={onClose} aria-label="Close">
          <Ico name="x" />
        </button>
        <AuthVisualPanel />
        <div className="auth-card auth-form-panel">
          <AuthHeader tab={tab} setTab={setTab} />
          {tab === "login"
            ? <LoginForm compact onSuccess={onSuccess} switchToSignup={() => setTab("signup")} />
            : <SignupForm compact onSuccess={onSuccess} switchToLogin={() => setTab("login")} />}
        </div>
      </div>
    </div>
  );
}

export function AuthVisualPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % AUTH_SLIDES.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="auth-visual-panel">
      <img src={AUTH_IMAGE} alt="" aria-hidden="true" />
      <div className="auth-visual-scrim" />
      <img className="auth-visual-logo" src={BRAND_LOGO} alt="ReclaimPortfolio" />
      <div className="auth-visual-carousel" aria-live="polite">
        {AUTH_SLIDES.map((slide, index) => (
          <div key={slide.title} className={`auth-slide ${active === index ? "active" : ""}`}>
            <h2>{slide.title}</h2>
            <p>{slide.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthHeader({ tab, setTab, title }) {
  return (
    <div className="auth-head">
      <span className="eyebrow">Secure Client Access</span>
      <h1>{title || (tab === "login" ? "Sign in to your recovery workspace." : "Create your protected client account.")}</h1>
      <p>Encrypted case collaboration, evidence handling, and investigation reporting for ReclaimPortfolio clients.</p>
      <div className="auth-tabs" role="tablist">
        <button className={tab === "login" ? "active" : ""} type="button" onClick={() => setTab("login")}>Sign In</button>
        <button className={tab === "signup" ? "active" : ""} type="button" onClick={() => setTab("signup")}>Create Account</button>
      </div>
    </div>
  );
}
