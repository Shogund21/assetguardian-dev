import { cn } from '@/lib/utils';

interface ToggleButtonPairProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
  yesVariant?: 'default' | 'warning' | 'danger';
  noVariant?: 'default' | 'success';
  disabled?: boolean;
  className?: string;
}

export function ToggleButtonPair({
  value,
  onChange,
  yesLabel = 'YES',
  noLabel = 'NO',
  yesVariant = 'default',
  noVariant = 'default',
  disabled = false,
  className,
}: ToggleButtonPairProps) {
  const getYesStyles = () => {
    const selected = value === true;
    const base = 'flex-1 py-3 px-4 text-center font-medium rounded-r-lg transition-all text-sm';
    
    if (disabled) {
      return cn(base, 'bg-muted text-muted-foreground cursor-not-allowed');
    }
    
    if (selected) {
      switch (yesVariant) {
        case 'warning':
          return cn(base, 'bg-amber-500 text-white border-2 border-amber-500');
        case 'danger':
          return cn(base, 'bg-destructive text-destructive-foreground border-2 border-destructive');
        default:
          return cn(base, 'bg-primary text-primary-foreground border-2 border-primary');
      }
    }
    
    return cn(base, 'bg-background text-foreground border-2 border-border hover:bg-accent cursor-pointer');
  };

  const getNoStyles = () => {
    const selected = value === false;
    const base = 'flex-1 py-3 px-4 text-center font-medium rounded-l-lg transition-all text-sm';
    
    if (disabled) {
      return cn(base, 'bg-muted text-muted-foreground cursor-not-allowed');
    }
    
    if (selected) {
      switch (noVariant) {
        case 'success':
          return cn(base, 'bg-green-500 text-white border-2 border-green-500');
        default:
          return cn(base, 'bg-primary text-primary-foreground border-2 border-primary');
      }
    }
    
    return cn(base, 'bg-background text-foreground border-2 border-border hover:bg-accent cursor-pointer');
  };

  return (
    <div className={cn('flex w-full', className)}>
      <button
        type="button"
        onClick={() => !disabled && onChange(false)}
        className={getNoStyles()}
        disabled={disabled}
      >
        {noLabel}
      </button>
      <button
        type="button"
        onClick={() => !disabled && onChange(true)}
        className={getYesStyles()}
        disabled={disabled}
      >
        {yesLabel}
      </button>
    </div>
  );
}
