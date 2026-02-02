import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NumberStepperProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  showButtons?: boolean;
  decimalPlaces?: number;
}

export function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  placeholder = '0',
  disabled = false,
  className,
  inputClassName,
  showButtons = true,
  decimalPlaces,
}: NumberStepperProps) {
  const handleIncrement = () => {
    const newValue = (value ?? 0) + step;
    if (max !== undefined && newValue > max) return;
    onChange(decimalPlaces !== undefined ? Number(newValue.toFixed(decimalPlaces)) : newValue);
  };

  const handleDecrement = () => {
    const newValue = (value ?? 0) - step;
    if (min !== undefined && newValue < min) return;
    onChange(decimalPlaces !== undefined ? Number(newValue.toFixed(decimalPlaces)) : newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (inputValue === '') {
      onChange(null);
      return;
    }
    
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) return;
    
    if (min !== undefined && numValue < min) return;
    if (max !== undefined && numValue > max) return;
    
    onChange(decimalPlaces !== undefined ? Number(numValue.toFixed(decimalPlaces)) : numValue);
  };

  const displayValue = value !== null && value !== undefined
    ? (decimalPlaces !== undefined ? value.toFixed(decimalPlaces) : String(value))
    : '';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showButtons && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
        >
          <Minus className="h-4 w-4" />
        </Button>
      )}
      
      <div className="relative flex-1">
        <Input
          type="number"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            unit && 'pr-12',
            inputClassName
          )}
          min={min}
          max={max}
          step={step}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      
      {showButtons && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
