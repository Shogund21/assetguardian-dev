// Utility function to calculate filter status based on due date
// Replaces the calculate_filter_status database function from filter_changes_view

export type FilterStatusCalc = 'overdue' | 'due_soon' | 'upcoming';

export function calculateFilterStatus(dueDate: string | Date): FilterStatusCalc {
  const due = new Date(dueDate);
  const now = new Date();
  
  // Calculate days remaining
  const diffTime = due.getTime() - now.getTime();
  const daysRemaining = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysRemaining <= 0) {
    return 'overdue';
  } else if (daysRemaining <= 14) {
    return 'due_soon';
  } else {
    return 'upcoming';
  }
}
