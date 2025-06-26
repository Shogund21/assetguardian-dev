
export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-500 border-red-600';
    case 'high': return 'bg-orange-500 border-orange-600';
    case 'medium': return 'bg-yellow-500 border-yellow-600';
    case 'low': return 'bg-green-500 border-green-600';
    default: return 'bg-gray-500 border-gray-600';
  }
};

export const getWindowTypeColor = (windowType: string) => {
  switch (windowType) {
    case 'optimal': return 'border-green-500 bg-green-50';
    case 'acceptable': return 'border-yellow-500 bg-yellow-50';
    case 'critical': return 'border-red-500 bg-red-50';
    default: return 'border-gray-500 bg-gray-50';
  }
};

export const getWindowTypeBadgeVariant = (windowType: string) => {
  switch (windowType) {
    case 'optimal': return 'default';
    case 'acceptable': return 'secondary';
    case 'critical': return 'destructive';
    default: return 'outline';
  }
};
