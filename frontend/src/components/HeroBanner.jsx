import "../theme/Dashboard.css";

export default function HeroBanner({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="hero-banner">
      <div className="hero-banner-content">
        <h1 className="hero-banner-title">
          {title}
        </h1>

        <p className="hero-banner-subtitle">
          {subtitle}
        </p>
      </div>

      {children && (
        <div className="hero-banner-actions">
          {children}
        </div>
      )}
    </section>
  );
}