import { format } from "date-fns";
import type { CompletePMData } from "@/hooks/useChillerPMReport";

export interface ReportSection {
  title: string;
  items: { label: string; value: string | number | null; unit?: string; status?: "normal" | "warning" | "critical" }[];
}

export function formatRiskLevel(level: string | null): { label: string; color: string } {
  switch (level?.toLowerCase()) {
    case "critical":
      return { label: "CRITICAL", color: "#dc2626" };
    case "high":
      return { label: "HIGH", color: "#ea580c" };
    case "medium":
      return { label: "MEDIUM", color: "#ca8a04" };
    case "low":
      return { label: "LOW", color: "#16a34a" };
    default:
      return { label: "N/A", color: "#6b7280" };
  }
}

export function formatValue(value: any, unit?: string): string {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return unit ? `${value.toFixed(1)} ${unit}` : value.toFixed(1);
  return String(value);
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
}

export function getRefrigerantSection(data: any): ReportSection | null {
  if (!data) return null;
  return {
    title: "Refrigerant Inspection",
    items: [
      { label: "Refrigerant Type", value: data.refrigerant_type },
      { label: "Charge", value: data.charge_lbs, unit: "lbs" },
      { label: "Nameplate Charge", value: data.nameplate_charge_lbs, unit: "lbs" },
      { label: "Charge Variance", value: data.charge_variance_pct, unit: "%", status: Math.abs(data.charge_variance_pct || 0) > 10 ? "warning" : "normal" },
      { label: "Leak Detected", value: data.leak_detected, status: data.leak_detected ? "critical" : "normal" },
      { label: "Suction Pressure", value: data.suction_pressure_psig, unit: "psig" },
      { label: "Discharge Pressure", value: data.discharge_pressure_psig, unit: "psig" },
      { label: "Subcooling", value: data.subcooling_f, unit: "°F" },
      { label: "Superheat", value: data.superheat_f, unit: "°F" },
      { label: "Acid Test", value: data.acid_test_passed ? "Passed" : "Failed", status: data.acid_test_passed === false ? "critical" : "normal" },
      { label: "Drier Replaced", value: data.drier_replaced },
    ],
  };
}

export function getOilSection(data: any): ReportSection | null {
  if (!data) return null;
  return {
    title: "Oil Analysis",
    items: [
      { label: "Oil Type", value: data.oil_type },
      { label: "Oil Level", value: data.current_level_pct, unit: "%" },
      { label: "Oil Changed", value: data.oil_changed },
      { label: "Sample Collected", value: data.sample_collected },
      { label: "Viscosity @ 40°C", value: data.viscosity_cst_40c, unit: "cSt" },
      { label: "Acid Number", value: data.acid_number_mgkoh_g, unit: "mg KOH/g", status: (data.acid_number_mgkoh_g || 0) > 0.1 ? "warning" : "normal" },
      { label: "Moisture", value: data.moisture_ppm, unit: "ppm", status: (data.moisture_ppm || 0) > 100 ? "warning" : "normal" },
      { label: "Iron", value: data.iron_ppm, unit: "ppm" },
      { label: "Copper", value: data.copper_ppm, unit: "ppm" },
      { label: "Oil Filter Replaced", value: data.oil_filter_replaced },
      { label: "Oil Heater Functional", value: data.oil_heater_functional },
    ],
  };
}

export function getTubeSection(data: any, bundleType: string): ReportSection | null {
  if (!data) return null;
  const title = bundleType === "evaporator" ? "Evaporator Tubes" : "Condenser Tubes";
  return {
    title,
    items: [
      { label: "Total Tubes", value: data.tube_count_total },
      { label: "Tubes Tested", value: data.tubes_tested_count },
      { label: "Test Method", value: data.test_method },
      { label: "Tubes Plugged", value: data.tubes_plugged_total, status: (data.plugged_pct || 0) > 5 ? "warning" : "normal" },
      { label: "Plugged %", value: data.plugged_pct, unit: "%" },
      { label: "Wall Loss", value: data.wall_loss_pct, unit: "%", status: (data.wall_loss_pct || 0) > 20 ? "critical" : "normal" },
      { label: "Min Wall Thickness", value: data.min_wall_thickness_mils, unit: "mils" },
      { label: "Fouling Severity", value: data.fouling_severity },
      { label: "Tubes Cleaned", value: data.tubes_cleaned },
      { label: "Approach Before", value: data.approach_temp_before_f, unit: "°F" },
      { label: "Approach After", value: data.approach_temp_after_f, unit: "°F" },
      { label: "Est. Remaining Life", value: data.estimated_remaining_life_years, unit: "years" },
    ],
  };
}

export function getElectricalSection(data: any[]): ReportSection | null {
  if (!data?.length) return null;
  const mainMotor = data.find((e) => e.component === "main_motor");
  if (!mainMotor) return null;

  return {
    title: "Electrical - Main Motor",
    items: [
      { label: "Voltage L1-L2", value: mainMotor.voltage_l1_l2, unit: "V" },
      { label: "Voltage L2-L3", value: mainMotor.voltage_l2_l3, unit: "V" },
      { label: "Voltage L3-L1", value: mainMotor.voltage_l3_l1, unit: "V" },
      { label: "Voltage Imbalance", value: mainMotor.voltage_imbalance_pct, unit: "%", status: (mainMotor.voltage_imbalance_pct || 0) > 2 ? "warning" : "normal" },
      { label: "Amperage L1", value: mainMotor.amperage_l1, unit: "A" },
      { label: "Amperage L2", value: mainMotor.amperage_l2, unit: "A" },
      { label: "Amperage L3", value: mainMotor.amperage_l3, unit: "A" },
      { label: "Nameplate FLA", value: mainMotor.nameplate_fla, unit: "A" },
      { label: "Current % of FLA", value: mainMotor.current_pct_fla, unit: "%" },
      { label: "Insulation Resistance", value: mainMotor.insulation_resistance_megohms, unit: "MΩ", status: (mainMotor.insulation_resistance_megohms || 999) < 1 ? "critical" : "normal" },
      { label: "Vibration Acceptable", value: mainMotor.vibration_acceptable },
      { label: "Starter Condition", value: mainMotor.starter_condition },
    ],
  };
}

export function getPerformanceSection(data: any): ReportSection | null {
  if (!data) return null;
  return {
    title: "Performance Test",
    items: [
      { label: "Test Date", value: formatDate(data.test_date) },
      { label: "Load", value: data.load_pct, unit: "%" },
      { label: "CHW Supply", value: data.chilled_water_supply_f, unit: "°F" },
      { label: "CHW Return", value: data.chilled_water_return_f, unit: "°F" },
      { label: "CHW ΔT", value: data.chw_delta_t_f, unit: "°F" },
      { label: "CHW Flow", value: data.chw_flow_gpm, unit: "GPM" },
      { label: "CW Supply", value: data.condenser_water_supply_f, unit: "°F" },
      { label: "CW Return", value: data.condenser_water_return_f, unit: "°F" },
      { label: "Tons Actual", value: data.tons_actual },
      { label: "Tons Design", value: data.tons_design },
      { label: "Capacity", value: data.capacity_pct, unit: "%", status: (data.capacity_pct || 100) < 90 ? "warning" : "normal" },
      { label: "kW Input", value: data.kw_input, unit: "kW" },
      { label: "kW/Ton", value: data.kw_per_ton, status: (data.kw_per_ton || 0) > (data.design_kw_per_ton || 999) * 1.1 ? "warning" : "normal" },
      { label: "Design kW/Ton", value: data.design_kw_per_ton },
      { label: "Efficiency Variance", value: data.efficiency_variance_pct, unit: "%", status: (data.efficiency_variance_pct || 0) > 10 ? "warning" : "normal" },
      { label: "Meets Design Capacity", value: data.meets_design_capacity },
      { label: "Meets Design Efficiency", value: data.meets_design_efficiency },
    ],
  };
}

export function generateReportText(data: CompletePMData): string {
  const { pm, refrigerant, oil, tubeEvaporator, tubeCondenser, electrical, performance, findings } = data;
  const lines: string[] = [];

  lines.push("=" .repeat(60));
  lines.push("ANNUAL CHILLER PM INSPECTION REPORT");
  lines.push("=" .repeat(60));
  lines.push("");
  lines.push(`Equipment: ${pm.equipment?.name || "Unknown"}`);
  lines.push(`Location: ${pm.equipment?.location || "N/A"}`);
  lines.push(`Model: ${pm.chiller_model || "N/A"}`);
  lines.push(`Serial: ${pm.chiller_serial || "N/A"}`);
  lines.push("");
  lines.push(`Inspection Date: ${formatDate(pm.inspection_date)}`);
  lines.push(`Inspection Year: ${pm.inspection_year}`);
  lines.push(`Technician: ${pm.technician ? `${pm.technician.firstName} ${pm.technician.lastName}` : "N/A"}`);
  lines.push("");
  lines.push("-".repeat(60));
  lines.push("RISK ASSESSMENT");
  lines.push("-".repeat(60));
  lines.push(`Overall Risk Score: ${pm.overall_risk_score?.toFixed(0) || "N/A"} / 100`);
  lines.push(`Risk Level: ${formatRiskLevel(pm.overall_risk_level).label}`);
  lines.push(`Requires Immediate Action: ${pm.requires_immediate_action ? "YES" : "No"}`);
  lines.push("");

  if (findings.length > 0) {
    lines.push("-".repeat(60));
    lines.push("FINDINGS");
    lines.push("-".repeat(60));
    findings.forEach((f: any, i: number) => {
      lines.push(`${i + 1}. [${f.severity?.toUpperCase()}] ${f.description}`);
      if (f.recommended_action) lines.push(`   Action: ${f.recommended_action}`);
    });
    lines.push("");
  }

  const sections = [
    getRefrigerantSection(refrigerant),
    getOilSection(oil),
    getTubeSection(tubeEvaporator, "evaporator"),
    getTubeSection(tubeCondenser, "condenser"),
    getElectricalSection(electrical),
    getPerformanceSection(performance),
  ].filter(Boolean);

  sections.forEach((section) => {
    if (!section) return;
    lines.push("-".repeat(60));
    lines.push(section.title.toUpperCase());
    lines.push("-".repeat(60));
    section.items.forEach((item) => {
      lines.push(`${item.label}: ${formatValue(item.value, item.unit)}`);
    });
    lines.push("");
  });

  lines.push("=" .repeat(60));
  lines.push(`Report Generated: ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}`);
  lines.push("=" .repeat(60));

  return lines.join("\n");
}

export function downloadTextReport(data: CompletePMData): void {
  const text = generateReportText(data);
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chiller-pm-report-${data.pm.equipment?.name || "unknown"}-${data.pm.inspection_year}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
