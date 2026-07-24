import Card from "./Card";
import "../theme/Cards.css";

export default function StatCard({
  title,
  value,
  icon,
  color = "#16a34a",
  subtitle,
}) {
  return (
    <Card className="stat-card">
      <div className="stat-card-top">
        <div
          className="stat-card-icon"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>

        <div>
          <p className="stat-card-title">
            {title}
          </p>

          <h2 className="stat-card-value">
            {value}
          </h2>

          {subtitle && (
            <p className="stat-card-subtitle">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}