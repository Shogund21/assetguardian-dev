
interface MaintenanceDetailFieldProps {
  label: string;
  value: any;
  isRequired?: boolean;
}

const MaintenanceDetailField = ({ label, value, isRequired = false }: MaintenanceDetailFieldProps) => {
  const formatValue = (value: any) => {
    if (value === null) return "Not Checked";
    if (value === undefined) return "Not recorded";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value instanceof Date) return value.toLocaleDateString();
    if (value === "") return "Not specified";
    return value.toString();
  };

  const getStatusIndicator = () => {
    if (!isRequired) return null;
    
    const hasValue = value !== null && value !== undefined && value !== "";
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-2 ${
        hasValue 
          ? 'bg-green-100 text-green-800' 
          : 'bg-orange-100 text-orange-800'
      }`}>
        {hasValue ? '✓ Complete' : '⚠ Missing'}
      </span>
    );
  };

  const hasValue = value !== null && value !== undefined && value !== "";
  const textColor = value === null ? 'italic text-gray-400' : 
                   isRequired && !hasValue ? 'text-orange-600' : 'text-gray-600';

  return (
    <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <span className="font-medium text-gray-700 flex items-center">
        {label}
        {isRequired && (
          <span className="text-red-500 ml-1" title="Required field">*</span>
        )}
      </span>
      <span className={`flex items-center justify-between ${textColor}`}>
        <span>{formatValue(value)}</span>
        {getStatusIndicator()}
      </span>
    </div>
  );
};

export default MaintenanceDetailField;
