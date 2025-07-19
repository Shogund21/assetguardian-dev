
interface MaintenanceDetailFieldProps {
  label: string;
  value: any;
}

const MaintenanceDetailField = ({ label, value }: MaintenanceDetailFieldProps) => {
  const formatValue = (value: any) => {
    if (value === null) return "Not Checked";
    if (value === undefined) return "Not recorded";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value instanceof Date) return value.toLocaleDateString();
    if (value === "") return "Not specified";
    return value.toString();
  };

  return (
    <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <span className="font-medium text-gray-700">{label}</span>
      <span className={`text-gray-600 ${value === null ? 'italic text-gray-400' : ''}`}>
        {formatValue(value)}
      </span>
    </div>
  );
};

export default MaintenanceDetailField;
