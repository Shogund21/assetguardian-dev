
interface LandingEmailFormProps {
  formData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    company: string;
    reason: string;
  };
  message: string;
  messageType: "success" | "error" | "info" | "";
  isSubmitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LandingEmailForm = ({
  formData,
  message,
  messageType,
  isSubmitting,
  onInputChange,
  onSubmit
}: LandingEmailFormProps) => {
  return (
    <form onSubmit={onSubmit} className="landing-email-form">
      <div className="landing-email-form__wrapper space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            placeholder="First Name"
            className="landing-email-form__input"
            disabled={isSubmitting}
            required
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            placeholder="Last Name"
            className="landing-email-form__input"
            disabled={isSubmitting}
            required
          />
        </div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onInputChange}
          placeholder="Enter your work email"
          className="landing-email-form__input"
          disabled={isSubmitting}
          required
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={onInputChange}
          placeholder="Phone Number (optional)"
          className="landing-email-form__input"
          disabled={isSubmitting}
        />
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={onInputChange}
          placeholder="Company/Organization"
          className="landing-email-form__input"
          disabled={isSubmitting}
          required
        />
        <textarea
          name="reason"
          value={formData.reason}
          onChange={onInputChange}
          placeholder="Briefly explain your role and how you plan to use Asset Guardian"
          className="landing-email-form__input min-h-[100px] resize-none"
          disabled={isSubmitting}
          required
        />
        <button
          type="submit"
          className="landing-email-form__button w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting Request..." : "Request Access"}
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
