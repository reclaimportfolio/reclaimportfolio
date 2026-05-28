# ReclaimPortfolio

Marketing website + admin dashboard for a fictional asset-recovery and blockchain-investigation firm. Built with React + Vite.

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

Other commands:

```bash
npm run build     # production build to /dist
npm run preview   # serve the production build
```

## What's inside

**Public site** (10 pages): Home, About, Services, Asset Recovery, Crypto Investigations, Compliance & Risk, Case Studies, Resources/Blog, Contact, Client Intake. Dark/light theme toggle, responsive nav, scroll reveal, animated counters, validated contact + intake forms.

**Admin dashboard** — reachable via the "Admin Portal" link in the footer. Sidebar nav with 10 sections: Overview, Cases, Intake Submissions, Crypto Investigations, Clients, Documents, Reports, Blog Manager, Team, Settings. The Cases table has working search, status/asset filters and sortable columns; Blog Manager does full CRUD on local state.

Routing is handled by a lightweight context-based router (`src/context.js`) — no external router dependency. State is in-memory, so it resets on refresh.

## Structure

```
src/
  main.jsx            entry point
  App.jsx             root + public/admin route switch
  index.css           full design system (dark + light themes)
  context.js          app context + useApp() hook (routing, theme)
  icons.jsx           inline SVG icon set
  ui.jsx              shared UI: NetGraphic, Reveal, Counter, Btn, Badge, PageHead
  data.js             mock data (cases, clients, blog, team, etc.)
  components/
    TopBar.jsx        sticky public nav
    Footer.jsx        footer + disclaimer
  pages/              the 10 public pages
  admin/              admin layout + 10 admin sections
```

## Design

Manrope + DM Mono. Deep teal/charcoal dark theme with a light mode, glassmorphism panels, SVG grain overlay, thin borders. All recovery language is intentionally non-guaranteeing ("support", "investigate", "review", "case-dependent") with a disclaimer in the footer.

## Backend Connection

Create `.env` from `.env.example`:

```env
# Leave empty when the frontend host proxies /api to the Django backend.
VITE_API_BASE_URL=
VITE_API_TIMEOUT_MS=12000
```

Only public client configuration may use `VITE_*` variables. Stock provider keys and all other secrets belong in `backend/.env`, because Vite exposes prefixed variables in the browser bundle.

Same-origin `/api` proxying is the recommended deployment shape and is also used by the Vite development server. If the backend must be hosted on a separate origin in production, set `VITE_API_BASE_URL` to its HTTPS URL. When this application is served over HTTPS, the API client refuses to send authentication tokens to an insecure HTTP endpoint.

## Security And Performance

- Client and admin JWT sessions are tab-scoped in `sessionStorage`; legacy persistent sessions migrate out of `localStorage` on use.
- The API client removes sensitive request logging, applies request timeouts, deduplicates concurrent GET calls and shares token refresh attempts.
- Dashboard market requests use short-lived session caches and in-flight deduplication; polling pauses while the browser tab is hidden.
- Private dashboard and admin bundles are lazy-loaded, so public pages do not download dashboard chart code until required.
- Intake uploads are rejected client-side above the backend limits: 5 files, 10 MB each and 25 MB total.
- Production source maps are disabled in the Vite build.

The development and preview servers add basic security headers. The production web host or CDN must set equivalent headers and a Content Security Policy permitting only the required API, font, logo and enabled chart-provider domains.

Mock/demo project — not a real service.
