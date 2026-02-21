import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, RefreshCw, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const CONDITION_OPTIONS = [
  { value: "1", label: "1 — Excellent" },
  { value: "2", label: "2 — Good" },
  { value: "3", label: "3 — Fair" },
  { value: "4", label: "4 — Poor" },
  { value: "5", label: "5 — Critical" },
];

const RISK_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-green-100 text-green-800 border-green-300",
};

interface ChillerDetailsFormProps {
  equipmentId: string;
  installationDate: string | null;
  expectedLifeYears: number | null;
  conditionRating: number | null;
}

export default function ChillerDetailsForm({
  equipmentId,
  installationDate,
  expectedLifeYears,
  conditionRating,
}: ChillerDetailsFormProps) {
  const queryClient = useQueryClient();

  const [date, setDate] = useState<Date | undefined>(
    installationDate ? new Date(installationDate) : undefined
  );
  const [lifeYears, setLifeYears] = useState<number>(expectedLifeYears ?? 25);
  const [rating, setRating] = useState<string>(
    conditionRating != null ? String(conditionRating) : ""
  );
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ["asset_health", equipmentId],
    queryFn: async () => {
      const { data } = await supabase
        .from("asset_health")
        .select("*")
        .eq("equipment_id", equipmentId)
        .maybeSingle();
      return data;
    },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("equipment")
        .update({
          installation_date: date ? format(date, "yyyy-MM-dd") : null,
          expected_life_years: lifeYears,
          condition_rating: rating ? Number(rating) : null,
        })
        .eq("id", equipmentId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["equipment", equipmentId] });
      toast({ title: "Chiller details saved" });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const { error } = await supabase.rpc("calculate_chiller_health_scores");
      if (error) throw error;
      await refetchHealth();
      toast({ title: "Health score recalculated" });
    } catch (e: any) {
      toast({ title: "Recalculation failed", description: e.message, variant: "destructive" });
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-black">Edit Chiller Details</CardTitle>
        {healthData && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Health:</span>
            <span className="text-lg font-bold">{healthData.health_score}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium border",
                RISK_COLORS[healthData.risk_level] ?? "bg-muted text-muted-foreground"
              )}
            >
              {healthData.risk_level}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Installation Date */}
          <div className="space-y-2">
            <Label>Installation Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Expected Life Years */}
          <div className="space-y-2">
            <Label>Expected Life (years)</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={lifeYears}
              onChange={(e) => setLifeYears(Number(e.target.value))}
            />
          </div>

          {/* Condition Rating */}
          <div className="space-y-2">
            <Label>Condition Rating</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button variant="outline" onClick={handleRecalculate} disabled={recalculating}>
            <RefreshCw className={cn("h-4 w-4 mr-2", recalculating && "animate-spin")} />
            {recalculating ? "Recalculating…" : "Recalculate Health Score"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
