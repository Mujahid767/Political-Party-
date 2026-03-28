interface Props {
  label: string;
  value: string | number;
  icon: string;
  color?: 'gold'|'blue'|'green'|'red'|'purple'|'cyan';
  change?: string;
}
export default function StatsCard({ label, value, icon, color='gold', change }: Props) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{typeof value==='number'?value.toLocaleString():value}</div>
      {change && <div className="stat-change">{change}</div>}
    </div>
  );
}
