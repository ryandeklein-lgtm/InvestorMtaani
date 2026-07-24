import StatCard from "./StatCard";
import "../theme/Dashboard.css";

export default function DashboardStats({ stats = [] }) {
  return (
    <div className="dashboard-stats">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          subtitle={stat.subtitle}
          color={stat.color}
        />
      ))}
    </div>
  );
}