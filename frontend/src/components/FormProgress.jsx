export default function FormProgress({ completed, total, sections }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div role="progressbar" aria-label="Required form fields completed" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed} style={{ flex: 1, height: 7, overflow: "hidden", borderRadius: 99, background: "#dbe4ed" }}>
          <span style={{ display: "block", width: `${percent}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#1da995,#7666e9)", transition: "width .2s ease" }} />
        </div>
        <strong style={{ flex: "0 0 auto", color: "#334155", fontSize: 12 }}>{completed}/{total} complete</strong>
      </div>
      <nav aria-label="Form sections" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {sections.map(({ id, label }, index) => (
          <a key={id} href={`#${id}`} style={{ display: "inline-flex", minHeight: 40, alignItems: "center", gap: 7, padding: "0 11px", border: "1px solid #d5e0e9", borderRadius: 999, background: "rgba(255,255,255,.75)", color: "#334155", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            <span aria-hidden="true" style={{ color: "#0f9f8d", fontFamily: "monospace", fontSize: 10 }}>{String(index + 1).padStart(2, "0")}</span>{label}
          </a>
        ))}
      </nav>
    </div>
  );
}
