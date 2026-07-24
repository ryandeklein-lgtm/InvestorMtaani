import "../theme/Cards.css";

export default function Card({
  children,
  title,
  subtitle,
  className = "",
}) {
  return (
    <div className={`im-card ${className}`}>
      {(title || subtitle) && (
        <div className="im-card-header">
          {title && <h2 className="im-card-title">{title}</h2>}

          {subtitle && (
            <p className="im-card-subtitle">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="im-card-body">
        {children}
      </div>
    </div>
  );
}