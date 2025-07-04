
const statsData = [
  { number: "99%", label: "Prediction Accuracy" },
  { number: "81%", label: "Downtime Reduction" },
  { number: "$8.7M", label: "Average Annual Savings" },
  { number: "24/7", label: "AI Monitoring" }
];

export const LandingStats = () => {
  return (
    <div className="landing-stats">
      <div className="landing-stats__grid">
        {statsData.map((stat, index) => (
          <div key={index} className="landing-stat">
            <div className="landing-stat__number">{stat.number}</div>
            <div className="landing-stat__label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
