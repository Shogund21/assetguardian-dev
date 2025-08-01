import { supabase } from "@/integrations/supabase/client";

export interface EnergyReading {
  timestamp: string;
  powerConsumption: number; // kW
  efficiency: number; // EER or COP
  cost: number; // USD per hour
  coolingLoad: number; // tons
}

export interface EnergyRecommendation {
  type: 'optimization' | 'maintenance' | 'operational' | 'cost_saving';
  title: string;
  description: string;
  potentialSavings: number; // USD per month
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementationCost: number;
  paybackMonths: number;
}

export interface EnergyEfficiencyData {
  currentPowerConsumption: number;
  currentEfficiency: number;
  optimalEfficiency: number;
  dailyCost: number;
  potentialSavings: number;
  recommendations: EnergyRecommendation[];
  trends: {
    powerTrend: 'increasing' | 'decreasing' | 'stable';
    efficiencyTrend: 'improving' | 'declining' | 'stable';
    costTrend: 'rising' | 'falling' | 'stable';
  };
}

export class ChillerEnergyService {
  private static readonly ENERGY_COST_PER_KWH = 0.12; // USD per kWh
  private static readonly OPTIMAL_EER = 12; // Energy Efficiency Ratio baseline
  private static readonly OPTIMAL_COP = 3.5; // Coefficient of Performance baseline

  // Sensor mapping configurations to handle different naming conventions
  private static readonly CURRENT_SENSOR_TYPES = [
    // Actual database sensor types found in the system
    'amperage_l1', 'amperage_l2', 'amperage_l3',
    'compressor_current_l1', 'compressor_current_l2', 'compressor_current_l3',
    'percent_rla_l1', 'percent_rla_l2', 'percent_rla_l3',
    // Original expected names (fallbacks)
    'compressor_1_current', 'compressor_2_current',
    'starter_motor_current_l1', 'starter_motor_current_l2', 'starter_motor_current_l3',
    'compressor_current_a', 'compressor_current_b', 'compressor_current_c',
    'motor_current_phase_1', 'motor_current_phase_2', 'motor_current_phase_3'
  ];

  private static readonly TEMPERATURE_SENSOR_TYPES = {
    entering: [
      'evaporator_entering_water_temperature', // Actual database name
      'condenser_entering_water_temperature', // Alternative for calculation
      'chilled_water_entering_temp',
      'evaporator_entering_temp', // Original expected name
      'evap_entering_temp'
    ],
    leaving: [
      'evaporator_leaving_water_temperature', // Actual database name (not present in current data)
      'condenser_leaving_water_temperature', // Actual database name
      'chilled_water_leaving_temp', 
      'evaporator_leaving_temp', // Original expected name
      'evap_leaving_temp'
    ]
  };

  // Helper method to find available sensor readings with fallback types
  private static async getSensorReadings(equipmentId: string, sensorTypes: string[], timeRange: number = 30) {
    console.log(`🔍 Searching for sensor data - Equipment: ${equipmentId}`);
    console.log(`📊 Looking for sensor types: ${sensorTypes.join(', ')}`);
    console.log(`⏰ Time range: ${timeRange} minutes`);

    // First try recent data
    let { data: readings } = await supabase
      .from('sensor_readings')
      .select('sensor_type, value, timestamp_utc, source, reading_mode')
      .eq('equipment_id', equipmentId)
      .in('sensor_type', sensorTypes)
      .gte('timestamp_utc', new Date(Date.now() - 1000 * 60 * timeRange).toISOString())
      .order('timestamp_utc', { ascending: false });

    // If no recent data, try extending the search to 7 days
    if (!readings || readings.length === 0) {
      console.log(`⚠️ No recent data found, extending search to 7 days`);
      const { data: extendedReadings } = await supabase
        .from('sensor_readings')
        .select('sensor_type, value, timestamp_utc, source, reading_mode')
        .eq('equipment_id', equipmentId)
        .in('sensor_type', sensorTypes)
        .gte('timestamp_utc', new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString())
        .order('timestamp_utc', { ascending: false })
        .limit(50);
      readings = extendedReadings || [];
    }

    console.log(`✅ Found ${readings?.length || 0} sensor readings`);
    if (readings && readings.length > 0) {
      const latestReading = readings[0];
      console.log(`📅 Latest reading: ${latestReading.timestamp_utc} (${latestReading.sensor_type})`);
      console.log(`🎯 Data sources: ${[...new Set(readings.map(r => r.source))].join(', ')}`);
      console.log(`📝 Reading modes: ${[...new Set(readings.map(r => r.reading_mode))].join(', ')}`);
    }

    return readings || [];
  }

  static async calculateCurrentEnergyConsumption(equipmentId: string): Promise<number> {
    try {
      // Get recent motor current readings with fallback sensor types
      const currentReadings = await this.getSensorReadings(equipmentId, this.CURRENT_SENSOR_TYPES, 30);

      if (currentReadings.length === 0) {
        console.log(`No current sensor readings found for equipment ${equipmentId}. Tried sensor types:`, this.CURRENT_SENSOR_TYPES);
        return 0;
      }

      // Log which sensor types were found for debugging
      const foundSensorTypes = [...new Set(currentReadings.map(r => r.sensor_type))];
      console.log(`Found current readings from sensor types: ${foundSensorTypes.join(', ')} for equipment ${equipmentId}`);

      // Calculate average current and estimate power consumption
      // Typical chiller: Power (kW) ≈ Current (A) × Voltage (480V) × √3 × Power Factor (0.85) / 1000
      const avgCurrent = currentReadings.reduce((sum, reading) => sum + reading.value, 0) / currentReadings.length;
      const estimatedPower = (avgCurrent * 480 * Math.sqrt(3) * 0.85) / 1000;
      
      return Math.round(estimatedPower * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error('Error calculating energy consumption:', error);
      return 0;
    }
  }

  static async calculateEfficiencyRatio(equipmentId: string): Promise<number> {
    try {
      // Get recent temperature readings with fallback sensor types
      const allTempTypes = [...this.TEMPERATURE_SENSOR_TYPES.entering, ...this.TEMPERATURE_SENSOR_TYPES.leaving];
      const tempReadings = await this.getSensorReadings(equipmentId, allTempTypes, 30);

      if (tempReadings.length === 0) {
        console.log(`No temperature sensor readings found for equipment ${equipmentId}. Tried sensor types:`, allTempTypes);
        return this.OPTIMAL_EER; // Return baseline if no data
      }

      // Find entering and leaving temperatures using flexible sensor name matching
      let enteringTemp = 55; // Default fallback
      let leavingTemp = 45; // Default fallback

      // Try to find entering temperature from available readings
      for (const sensorType of this.TEMPERATURE_SENSOR_TYPES.entering) {
        const reading = tempReadings.find(r => r.sensor_type === sensorType);
        if (reading) {
          enteringTemp = reading.value;
          console.log(`Found entering temp from sensor: ${sensorType} = ${enteringTemp}°F`);
          break;
        }
      }

      // Try to find leaving temperature from available readings
      for (const sensorType of this.TEMPERATURE_SENSOR_TYPES.leaving) {
        const reading = tempReadings.find(r => r.sensor_type === sensorType);
        if (reading) {
          leavingTemp = reading.value;
          console.log(`Found leaving temp from sensor: ${sensorType} = ${leavingTemp}°F`);
          break;
        }
      }
      
      // Calculate cooling capacity (simplified)
      const tempDiff = enteringTemp - leavingTemp;
      const coolingCapacity = tempDiff * 12; // Simplified BTU/h calculation
      
      const powerConsumption = await this.calculateCurrentEnergyConsumption(equipmentId);
      if (powerConsumption === 0) return this.OPTIMAL_EER;
      
      // EER = Cooling Capacity (BTU/h) / Power Input (W)
      const eer = coolingCapacity / (powerConsumption * 1000);
      
      return Math.round(eer * 10) / 10;
    } catch (error) {
      console.error('Error calculating efficiency ratio:', error);
      return this.OPTIMAL_EER;
    }
  }

  static async getEnergyEfficiencyData(equipmentId: string): Promise<EnergyEfficiencyData> {
    try {
      const currentPowerConsumption = await this.calculateCurrentEnergyConsumption(equipmentId);
      const currentEfficiency = await this.calculateEfficiencyRatio(equipmentId);
      const dailyCost = currentPowerConsumption * 24 * this.ENERGY_COST_PER_KWH;
      
      // Calculate potential savings based on efficiency gap
      const efficiencyGap = this.OPTIMAL_EER - currentEfficiency;
      const potentialSavings = (efficiencyGap / this.OPTIMAL_EER) * dailyCost * 30; // Monthly savings
      
      const recommendations = await this.generateRecommendations(equipmentId, currentEfficiency, currentPowerConsumption);
      const trends = await this.calculateTrends(equipmentId);

      return {
        currentPowerConsumption,
        currentEfficiency,
        optimalEfficiency: this.OPTIMAL_EER,
        dailyCost,
        potentialSavings: Math.max(0, potentialSavings),
        recommendations,
        trends
      };
    } catch (error) {
      console.error('Error getting energy efficiency data:', error);
      throw error;
    }
  }

  private static async generateRecommendations(
    equipmentId: string, 
    currentEfficiency: number, 
    powerConsumption: number
  ): Promise<EnergyRecommendation[]> {
    const recommendations: EnergyRecommendation[] = [];

    // Efficiency-based recommendations
    if (currentEfficiency < this.OPTIMAL_EER * 0.8) {
      recommendations.push({
        type: 'maintenance',
        title: 'Clean Condenser Coils',
        description: 'Dirty condenser coils reduce heat transfer efficiency. Regular cleaning can improve EER by 10-15%.',
        potentialSavings: powerConsumption * 24 * this.ENERGY_COST_PER_KWH * 30 * 0.12,
        priority: 'high',
        implementationCost: 150,
        paybackMonths: 1
      });
    }

    if (currentEfficiency < this.OPTIMAL_EER * 0.9) {
      recommendations.push({
        type: 'optimization',
        title: 'Optimize Chilled Water Temperature',
        description: 'Increasing chilled water setpoint by 2°F can reduce energy consumption by 6-8%.',
        potentialSavings: powerConsumption * 24 * this.ENERGY_COST_PER_KWH * 30 * 0.07,
        priority: 'medium',
        implementationCost: 0,
        paybackMonths: 0
      });
    }

    // Power consumption recommendations
    if (powerConsumption > 200) {
      recommendations.push({
        type: 'operational',
        title: 'Implement Variable Speed Drive Control',
        description: 'VSD can reduce energy consumption by 20-40% during part-load conditions.',
        potentialSavings: powerConsumption * 24 * this.ENERGY_COST_PER_KWH * 30 * 0.25,
        priority: 'high',
        implementationCost: 5000,
        paybackMonths: 8
      });
    }

    recommendations.push({
      type: 'cost_saving',
      title: 'Schedule Peak Load Management',
      description: 'Shift non-critical cooling loads to off-peak hours to reduce demand charges.',
      potentialSavings: powerConsumption * 24 * this.ENERGY_COST_PER_KWH * 30 * 0.15,
      priority: 'medium',
      implementationCost: 200,
      paybackMonths: 2
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private static async calculateTrends(equipmentId: string): Promise<EnergyEfficiencyData['trends']> {
    try {
      // Get power consumption trend from current readings over the last 7 days with fallback sensor types
      const weeklyReadings = await this.getSensorReadings(equipmentId, this.CURRENT_SENSOR_TYPES, 7 * 24 * 60);

      if (weeklyReadings.length < 10) {
        return {
          powerTrend: 'stable',
          efficiencyTrend: 'stable',
          costTrend: 'stable'
        };
      }

      // Calculate trend slopes
      const firstHalf = weeklyReadings.slice(0, Math.floor(weeklyReadings.length / 2));
      const secondHalf = weeklyReadings.slice(Math.floor(weeklyReadings.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, r) => sum + r.value, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, r) => sum + r.value, 0) / secondHalf.length;
      
      const changePct = ((secondAvg - firstAvg) / firstAvg) * 100;
      
      const powerTrend = changePct > 5 ? 'increasing' : changePct < -5 ? 'decreasing' : 'stable';
      const efficiencyTrend = changePct > 5 ? 'declining' : changePct < -5 ? 'improving' : 'stable';
      const costTrend = changePct > 5 ? 'rising' : changePct < -5 ? 'falling' : 'stable';

      return { powerTrend, efficiencyTrend, costTrend };
    } catch (error) {
      console.error('Error calculating trends:', error);
      return {
        powerTrend: 'stable',
        efficiencyTrend: 'stable',
        costTrend: 'stable'
      };
    }
  }

  static async getEnergyHistory(equipmentId: string, days: number = 7): Promise<EnergyReading[]> {
    try {
      const readings = await this.getSensorReadings(equipmentId, this.CURRENT_SENSOR_TYPES, days * 24 * 60);

      if (readings.length === 0) return [];

      // Group readings by hour and calculate energy metrics
      const hourlyData = new Map<string, number[]>();
      
      readings.forEach(reading => {
        const hour = new Date(reading.timestamp_utc).toISOString().slice(0, 13);
        if (!hourlyData.has(hour)) {
          hourlyData.set(hour, []);
        }
        hourlyData.get(hour)!.push(reading.value);
      });

      const energyHistory: EnergyReading[] = [];
      
      for (const [hour, currents] of hourlyData) {
        const avgCurrent = currents.reduce((sum, c) => sum + c, 0) / currents.length;
        const powerConsumption = (avgCurrent * 480 * Math.sqrt(3) * 0.85) / 1000;
        const efficiency = Math.min(this.OPTIMAL_EER, powerConsumption > 0 ? (100 / powerConsumption) * 10 : 0);
        const cost = powerConsumption * this.ENERGY_COST_PER_KWH;
        
        energyHistory.push({
          timestamp: hour + ':00:00.000Z',
          powerConsumption: Math.round(powerConsumption * 10) / 10,
          efficiency: Math.round(efficiency * 10) / 10,
          cost: Math.round(cost * 100) / 100,
          coolingLoad: Math.round((powerConsumption / 0.8) * 10) / 10 // Estimated cooling load
        });
      }

      return energyHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('Error getting energy history:', error);
      return [];
    }
  }
}