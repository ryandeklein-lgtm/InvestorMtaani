import { Link } from "react-router-dom";
import "./WorkspaceEmptyState.css";

export default function WorkspaceEmptyState({ eyebrow, title, description, actionTo, actionLabel, symbol = "✦" }) {
  return (
    <main className="im-workspace-state">
      <div className="im-workspace-state-glow" aria-hidden="true" />
      <div className="im-workspace-state-inner">
        <Link className="im-workspace-back" to="/home">← Back to dashboard</Link>
        <section className="im-workspace-card" aria-labelledby="workspace-state-title">
          <span className="im-workspace-symbol" aria-hidden="true">{symbol}</span>
          <p className="im-workspace-eyebrow">{eyebrow}</p>
          <h1 id="workspace-state-title">{title}</h1>
          <p className="im-workspace-description">{description}</p>
          {actionTo && actionLabel && <Link className="im-workspace-action" to={actionTo}>{actionLabel}<span aria-hidden="true">→</span></Link>}
        </section>
      </div>
    </main>
  );
}
