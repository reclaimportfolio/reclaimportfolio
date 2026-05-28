import { useApp } from "../context.js";
import { Ico } from "../icons.jsx";

export function NotFoundPage() {
  const { go } = useApp();

  return (
    <main className="not-found-page">
      <section className="wrap">
        <div className="not-found-card">
          <div className="not-found-copy">
            <span className="mono">404 Not Found</span>
            <h1>Oops! We couldn't find that page.</h1>
            <p>The page you are looking for may have moved, expired, or never existed in this secure workspace.</p>
            <button className="not-found-btn" onClick={() => go("home")}>
              Back to Home
              <span><Ico name="arrow" /></span>
            </button>
          </div>

          <div className="not-found-code" aria-hidden="true">404</div>
        </div>
      </section>
    </main>
  );
}
