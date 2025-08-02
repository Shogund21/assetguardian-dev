import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function useSortedData<T>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction || !data) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle dates
      if (isDate(aValue) && isDate(bValue)) {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortConfig.direction === 'asc' 
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle strings
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return { sortedData, sortConfig, handleSort };
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function isDate(value: any): boolean {
  if (!value) return false;
  const dateString = String(value);
  return !isNaN(Date.parse(dateString)) && dateString.includes('-');
}