import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="im-not-found">
      <div className="im-not-found-orbit im-not-found-orbit-one" aria-hidden="true" />
      <div className="im-not-found-orbit im-not-found-orbit-two" aria-hidden="true" />
      <section className="im-not-found-content">
        <p className="im-not-found-eyebrow"><span /> INVESTOR MTAANI · NAVIGATION</p>
        <p className="im-not-found-code">404</p>
        <h1>We couldn’t find that page.</h1>
        <p className="im-not-found-copy">The address may be outdated, or the page may have moved. You can return to the marketplace and continue from there.</p>
        <div className="im-not-found-actions">
          <Link to="/" className="im-not-found-primary">Go to home <span aria-hidden="true">→</span></Link>
          <Link to="/browse" className="im-not-found-secondary">Browse businesses</Link>
        </div>
      </section>
    </main>
  );
}
