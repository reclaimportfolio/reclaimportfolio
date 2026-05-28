import { useState, useEffect } from "react";
import { useApp } from "../context.js";
import { Ico } from "../icons.jsx";
import { LANGUAGES } from "../i18n.js";
import { Btn } from "../ui.jsx";

/* ============ NAV ============ */
const NAV = [
  ["nav.about", "about"],
  ["nav.services", "services"],
  ["nav.fullCrypto", "crypto", "nav.crypto"],
  ["nav.stocks", "stocks"],
  ["nav.resources", "resources"],
  ["nav.contact", "contact"],
];

const BRAND_LOGO = "https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779031196/reclaim_logo_svg_o9yyv9.svg";

export function TopBar() {
  const { route, go, theme, toggleTheme, language, setLanguage, t, openAuth } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const nav = (r) => {
    setOpen(false);
    setLangOpen(false);
    go(r);
  };

  return (
    <header className={`topbar ${scrolled ? "scrolled" : ""}`}>
      <div className="wrap nav-wrap">
        <div className="nav">
          <nav className="nav-links" aria-label="Main navigation">
            {NAV.map(([label, r, shortLabel]) => (
              <button
                key={r}
                className={`nav-link ${route === r ? "active" : ""}`}
                onClick={() => nav(r)}
              >
                {t(shortLabel || label)}
              </button>
            ))}
          </nav>

          <button className="logo" onClick={() => nav("home")} aria-label="Go home">
            <img className="brand-logo-img" src={BRAND_LOGO} alt={`${t("common.brandA")}${t("common.brandB")}`} />
          </button>

          <div className="nav-actions">
            <LanguageDropdown
              language={language}
              setLanguage={setLanguage}
              open={langOpen}
              setOpen={setLangOpen}
            />

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <div className="theme-toggle-track">
                <div className={`theme-toggle-thumb ${theme}`}>
                  <Ico name={theme === "dark" ? "sun" : "moon"} />
                </div>
              </div>
            </button>

            <div className="hide-mobile-btn">
              <Btn primary sm icon="arrow" onClick={() => openAuth("signup")}>
                {t("common.startRecovery")}
              </Btn>
            </div>

            <div className="nav-right">
              <button
                className={`burger ${open ? "open" : ""}`}
                onClick={() => setOpen((v) => !v)}
                aria-label="Open menu"
                aria-expanded={open}
              >
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`mobile-backdrop ${open ? "open" : ""}`}
        onClick={() => {
          setOpen(false);
          setLangOpen(false);
        }}
      />

      <aside className={`mobile-menu ${open ? "open" : ""}`}>
        <div className="mobile-menu-head">
          <span>{t("common.menu")}</span>

          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu">
            <Ico name="x" />
          </button>
        </div>

        <div className="mobile-menu-links">
          {NAV.map(([label, r]) => (
            <button
              key={r}
              className={`mobile-nav-link ${route === r ? "active" : ""}`}
              onClick={() => nav(r)}
            >
              <span>{t(label)}</span>
              <Ico name="arrow" />
            </button>
          ))}
        </div>

        <div className="mobile-menu-cta">
          <LanguageDropdown
            language={language}
            setLanguage={setLanguage}
            open={langOpen}
            setOpen={setLangOpen}
            mobile
          />

          <Btn primary icon="arrow" onClick={() => { setOpen(false); openAuth("signup"); }}>
            {t("common.startRecovery")}
          </Btn>

          {false && <button className="admin-link" onClick={() => nav("admin")}>
            {t("common.adminPortal")} <span>→</span>
          </button>}
        </div>
      </aside>
    </header>
  );
}

function LanguageDropdown({ language, setLanguage, open, setOpen, mobile = false }) {
  const active = LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];
  const options = LANGUAGES.filter((item) => item.code !== language);

  const chooseLanguage = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div className={`language-dropdown ${mobile ? "mobile-language-dropdown" : ""}`}>
      <button
        className={`language-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
      >
        <span>{active.label}</span>
        <Ico name="arrow" />
      </button>

      <div className={`language-menu ${open ? "open" : ""}`} role="menu">
        {options.map((item) => (
          <button
            key={item.code}
            className="language-menu-item"
            onClick={() => chooseLanguage(item.code)}
            role="menuitem"
          >
            <span>{item.label}</span>
            <small>{item.name}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
