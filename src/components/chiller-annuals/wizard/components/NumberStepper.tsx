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
          // 48px touch target for mobile
          className="h-12 w-12 shrink-0 active:scale-95 touch-manipulation"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
        >
          <Minus className="h-5 w-5" />
        </Button>
      )}
      
      <div className="relative flex-1">
        <Input
          type="number"
          inputMode="decimal"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            // min-h-[48px] for touch-friendly input, larger text for mobile
            'min-h-[48px] text-center text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
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
          // 48px touch target for mobile
          className="h-12 w-12 shrink-0 active:scale-95 touch-manipulation"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
