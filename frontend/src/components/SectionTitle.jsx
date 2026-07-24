import "../theme/Global.css";

export default function SectionTitle({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <div className={`section-title ${className}`}>
      <div>
        <h2 className="section-heading">
          {title}
        </h2>

        {subtitle && (
          <p className="section-subheading">
            {subtitle}
          </p>
        )}
      </div>

      {children && (
        <div className="section-actions">
          {children}
        </div>
      )}
    </div>
  );
}