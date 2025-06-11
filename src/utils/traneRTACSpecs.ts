
export interface TraneRTACSpecs {
  model: string;
  capacity: number; // tons
  operatingRanges: {
    evaporator_entering_temp: { min: 54, max: 58, warning: 60, critical: 65 };
    evaporator_leaving_temp: { min: 42, max: 48, warning: 50, critical: 55 };
    condenser_entering_temp: { min: 75, max: 85, warning: 90, critical: 95 };
    condenser_leaving_temp: { min: 85, max: 95, warning: 100, critical: 105 };
    compressor_1_current: { min: 45, max: 145, warning: 160, critical: 175 };
    compressor_2_current: { min: 45, max: 145, warning: 160, critical: 175 };
    suction_pressure: { min: 38, max: 45, warning: 35, critical: 30 };
    discharge_pressure: { min: 180, max: 220, warning: 240, critical: 260 };
    oil_pressure_1: { min: 45, max: 65, warning: 40, critical: 35 };
    oil_pressure_2: { min: 45, max: 65, warning: 40, critical: 35 };
    approach_temp: { min: 6, max: 10, warning: 12, critical: 15 };
    vfd_frequency: { min: 30, max: 60, warning: 65, critical: 70 };
  };
}

export const TRANE_RTAC_250_SPECS: TraneRTACSpecs = {
  model: "RTAC 250",
  capacity: 250,
  operatingRanges: {
    evaporator_entering_temp: { min: 54, max: 58, warning: 60, critical: 65 },
    evaporator_leaving_temp: { min: 42, max: 48, warning: 50, critical: 55 },
    condenser_entering_temp: { min: 75, max: 85, warning: 90, critical: 95 },
    condenser_leaving_temp: { min: 85, max: 95, warning: 100, critical: 105 },
    compressor_1_current: { min: 45, max: 145, warning: 160, critical: 175 },
    compressor_2_current: { min: 45, max: 145, warning: 160, critical: 175 },
    suction_pressure: { min: 38, max: 45, warning: 35, critical: 30 },
    discharge_pressure: { min: 180, max: 220, warning: 240, critical: 260 },
    oil_pressure_1: { min: 45, max: 65, warning: 40, critical: 35 },
    oil_pressure_2: { min: 45, max: 65, warning: 40, critical: 35 },
    approach_temp: { min: 6, max: 10, warning: 12, critical: 15 },
    vfd_frequency: { min: 30, max: 60, warning: 65, critical: 70 }
  }
};

export const getTraneRTACReading = (readingType: string) => {
  return TRANE_RTAC_250_SPECS.operatingRanges[readingType as keyof typeof TRANE_RTAC_250_SPECS.operatingRanges];
};
