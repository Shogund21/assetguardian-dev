import MaintenanceDetailField from "./MaintenanceDetailField";

interface MaintenanceDetailsSectionProps {
  title: string;
  fields: Array<{ label: string; value: any; isRequired?: boolean }>;
}

const MaintenanceDetailsSection = ({ title, fields }: MaintenanceDetailsSectionProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium text-gray-900 mb-3">{title}</h3>
      <div className="space-y-1">
        {fields.map((field, index) => (
          <MaintenanceDetailField
            key={`${field.label}-${index}`}
            label={field.label}
            value={field.value}
            isRequired={field.isRequired}
          />
        ))}
      </div>
    </div>
  );
};

export default MaintenanceDetailsSection;