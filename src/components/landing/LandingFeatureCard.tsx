
interface LandingFeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export const LandingFeatureCard = ({ icon, title, description }: LandingFeatureCardProps) => {
  return (
    <div className="landing-feature">
      <i className={`${icon} landing-feature__icon`}></i>
      <h3 className="landing-feature__title">{title}</h3>
      <p className="landing-feature__description">{description}</p>
    </div>
  );
};
