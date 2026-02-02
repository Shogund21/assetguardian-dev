import { useState, useEffect } from 'react';
import { Search, Calendar, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NumberStepper } from '../components/NumberStepper';
import { ChillerWizardFormData } from '@/types/chillerWizard';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Step1Props {
  formData: ChillerWizardFormData;
  updateFormData: <K extends keyof ChillerWizardFormData>(
    key: K,
    value: ChillerWizardFormData[K]
  ) => void;
  errors: string[];
}

interface Equipment {
  id: string;
  name: string;
  location: string;
  type: string | null;
  model: string | null;
  serial_number: string | null;
}

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
}

export function Step1AssetSelection({ formData, updateFormData, errors }: Step1Props) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(true);

  // Fetch chillers (equipment with type = 'Chiller' or similar)
  useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoadingEquipment(true);
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('id, name, location, type, model, serial_number')
          .or('type.ilike.%chiller%,type.ilike.%hvac%,type.is.null')
          .order('name');

        if (error) throw error;
        setEquipment(data || []);
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
      } finally {
        setIsLoadingEquipment(false);
      }
    };

    fetchEquipment();
  }, []);

  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      setIsLoadingTechnicians(true);
      try {
        const { data, error } = await supabase
          .from('technicians')
          .select('id, firstName, lastName')
          .order('lastName');

        if (error) throw error;
        setTechnicians(data || []);
      } catch (error) {
        console.error('Failed to fetch technicians:', error);
      } finally {
        setIsLoadingTechnicians(false);
      }
    };

    fetchTechnicians();
  }, []);

  // Filter equipment by search
  const filteredEquipment = equipment.filter(eq =>
    eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle equipment selection
  const handleEquipmentSelect = (equipmentId: string) => {
    const selected = equipment.find(e => e.id === equipmentId);
    if (selected) {
      updateFormData('equipment_id', equipmentId);
      updateFormData('chiller_model', selected.model);
      updateFormData('chiller_serial', selected.serial_number);
    }
  };

  const hasError = (field: string) => {
    return errors.some(e => e.toLowerCase().includes(field.toLowerCase()));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Select Chiller */}
      <div className="space-y-3">
        <Label className={cn(hasError('chiller') && 'text-destructive')}>
          Select Chiller *
        </Label>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Equipment list */}
        <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-lg p-2">
          {isLoadingEquipment ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading equipment...
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No chillers found
            </div>
          ) : (
            <RadioGroup
              value={formData.equipment_id || ''}
              onValueChange={handleEquipmentSelect}
            >
              {filteredEquipment.map((eq) => (
                <div
                  key={eq.id}
                  className={cn(
                    'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    formData.equipment_id === eq.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => handleEquipmentSelect(eq.id)}
                >
                  <RadioGroupItem value={eq.id} id={eq.id} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{eq.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {eq.location}
                    </div>
                  </div>
                  {formData.equipment_id === eq.id && (
                    <div className="text-primary text-sm font-medium">✓</div>
                  )}
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </div>

      {/* Selected equipment info */}
      {formData.equipment_id && (
        <Card className="bg-muted/50">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Model:</span>
              <span className="font-medium">{formData.chiller_model || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Serial:</span>
              <span className="font-medium">{formData.chiller_serial || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspection Date */}
      <div className="space-y-2">
        <Label htmlFor="inspection_date" className={cn(hasError('date') && 'text-destructive')}>
          <Calendar className="inline h-4 w-4 mr-2" />
          Inspection Date *
        </Label>
        <Input
          id="inspection_date"
          type="date"
          value={formData.inspection_date}
          onChange={(e) => updateFormData('inspection_date', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full"
        />
      </div>

      {/* Lead Technician */}
      <div className="space-y-2">
        <Label className={cn(hasError('technician') && 'text-destructive')}>
          Lead Technician *
        </Label>
        <Select
          value={formData.technician_id || ''}
          onValueChange={(value) => updateFormData('technician_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select technician..." />
          </SelectTrigger>
          <SelectContent>
            {isLoadingTechnicians ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : technicians.length === 0 ? (
              <SelectItem value="none" disabled>
                No technicians found
              </SelectItem>
            ) : (
              technicians.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.firstName} {tech.lastName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Operating Hours */}
      <div className="space-y-2">
        <Label htmlFor="operating_hours">
          <Clock className="inline h-4 w-4 mr-2" />
          Operating Hours (at inspection)
        </Label>
        <NumberStepper
          value={formData.operating_hours_at_inspection}
          onChange={(value) => updateFormData('operating_hours_at_inspection', value)}
          min={0}
          step={100}
          placeholder="Enter hours..."
          unit="hrs"
        />
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
          <ul className="list-disc list-inside text-sm text-destructive space-y-1">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
