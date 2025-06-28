
interface LandingEmailFormProps {
  email: string;
  message: string;
  messageType: "success" | "error" | "info" | "";
  isSubmitting: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LandingEmailForm = ({
  email,
  message,
  messageType,
  isSubmitting,
  onEmailChange,
  onSubmit
}: LandingEmailFormProps) => {
  return (
    <form onSubmit={onSubmit} className="landing-email-form">
      <div className="landing-email-form__wrapper">
        <input
          type="email"
          value={email}
          onChange={onEmailChange}
          placeholder="Enter your work email to access the AI platform"
          className="landing-email-form__input"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="landing-email-form__button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Analyzing Access..." : "Access AI Platform"}
        </button>
      </div>
      
      {message && (
        <div className={`landing-form-message ${messageType}`}>
          {message}
        </div>
      )}
    </form>
  );
};
