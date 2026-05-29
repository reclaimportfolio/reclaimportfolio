import { useEffect, useRef, useState } from "react";
import { useApp } from "../context.js";
import { Ico } from "../icons.jsx";
import { useSession } from "../auth/SessionProvider.jsx";

export function UserMenu({ onAccountSettings }) {
  const { go } = useApp();
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const closeTimerRef = useRef(null);
  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "RP";

  const showMenu = () => {
    window.clearTimeout(closeTimerRef.current);
    setOpen(true);
  };

  const hideMenu = () => {
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => {
    const closeOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(closeTimerRef.current);
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const signOut = () => {
    logout();
    go("login");
  };

  const openAccountSettings = () => {
    setOpen(false);
    onAccountSettings?.();
  };

  return (
    <div
      ref={menuRef}
      className={`user-menu ${open ? "is-open" : ""}`}
      onMouseEnter={showMenu}
      onMouseLeave={hideMenu}
      onFocusCapture={showMenu}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button className="user-trigger" onClick={() => setOpen((value) => !value)} aria-haspopup="menu" aria-expanded={open}>
        <span className="avatar">{initials}</span>
        <span>
          <strong>{user?.name}</strong>
          <small>{user?.role}</small>
        </span>
      </button>
      <div className={`user-popover ${open ? "open" : ""}`} role="menu" aria-hidden={!open}>
        <button role="menuitem" tabIndex={open ? 0 : -1} onClick={openAccountSettings}><Ico name="settings" /> Account settings</button>
        <button className="user-popover-logout" role="menuitem" tabIndex={open ? 0 : -1} onClick={signOut}><Ico name="logout" /> Log out</button>
      </div>
    </div>
  );
}
