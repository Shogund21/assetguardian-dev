export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean | null
        }
        Insert: {
          created_at?: string | null
          id: string
          is_admin?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
        }
        Relationships: []
      }
      automated_work_orders: {
        Row: {
          alert_id: string | null
          asset_id: string
          assigned_at: string | null
          assigned_team: string | null
          completed_at: string | null
          created_at: string
          description: string
          due_hours: number
          id: string
          priority: string
          status: string
          title: string
        }
        Insert: {
          alert_id?: string | null
          asset_id: string
          assigned_at?: string | null
          assigned_team?: string | null
          completed_at?: string | null
          created_at?: string
          description: string
          due_hours: number
          id?: string
          priority: string
          status?: string
          title: string
        }
        Update: {
          alert_id?: string | null
          asset_id?: string
          assigned_at?: string | null
          assigned_team?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          due_hours?: number
          id?: string
          priority?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_users: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          is_admin: boolean
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          is_admin?: boolean
          role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          is_admin?: boolean
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          lastMaintenance: string | null
          location: string
          model: string | null
          name: string
          nextMaintenance: string | null
          serial_number: string | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          lastMaintenance?: string | null
          location: string
          model?: string | null
          name: string
          nextMaintenance?: string | null
          serial_number?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          lastMaintenance?: string | null
          location?: string
          model?: string | null
          name?: string
          nextMaintenance?: string | null
          serial_number?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_thresholds: {
        Row: {
          created_at: string
          critical_threshold: number
          equipment_id: string
          id: string
          sensor_type: string
          unit: string
          updated_at: string
          warning_threshold: number
        }
        Insert: {
          created_at?: string
          critical_threshold: number
          equipment_id: string
          id?: string
          sensor_type: string
          unit: string
          updated_at?: string
          warning_threshold: number
        }
        Update: {
          created_at?: string
          critical_threshold?: number
          equipment_id?: string
          id?: string
          sensor_type?: string
          unit?: string
          updated_at?: string
          warning_threshold?: number
        }
        Relationships: []
      }
      filter_changes: {
        Row: {
          created_at: string
          due_date: string
          equipment_id: string
          filter_condition: string | null
          filter_size: string
          filter_type: string
          id: string
          installation_date: string
          notes: string | null
          status: Database["public"]["Enums"]["filter_change_status"]
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date: string
          equipment_id: string
          filter_condition?: string | null
          filter_size: string
          filter_type: string
          id?: string
          installation_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["filter_change_status"]
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string
          equipment_id?: string
          filter_condition?: string | null
          filter_size?: string
          filter_type?: string
          id?: string
          installation_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["filter_change_status"]
          technician_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "filter_changes_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filter_changes_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      hvac_maintenance_checks: {
        Row: {
          air_filter_cleaned: boolean | null
          air_filter_status: string | null
          airflow_reading: number | null
          airflow_unit: string | null
          belt_condition: string | null
          check_date: string | null
          chiller_pressure_reading: number | null
          chiller_temperature_reading: number | null
          cleanliness_level: string | null
          coils_condition: string | null
          company_id: string | null
          condenser_condition: string | null
          control_system_status: string | null
          corrective_actions: string | null
          created_at: string | null
          dampers_operation: string | null
          door_operation: string | null
          drain_pan_status: string | null
          drainage_system_status: string | null
          drift_eliminators_condition: string | null
          elevator_lighting: string | null
          elevator_notes: string | null
          elevator_operation: string | null
          emergency_phone: string | null
          emergency_shutdown_status: string | null
          equipment_id: string | null
          equipment_type: string | null
          fan_assembly_status: string | null
          fan_bearings_lubricated: boolean | null
          fan_belt_condition: string | null
          fan_noise_level: string | null
          fill_media_condition: string | null
          floor_condition: string | null
          general_inspection: string | null
          hand_dryer_status: string | null
          id: string
          images: string[] | null
          location_id: string | null
          maintenance_frequency: string | null
          maintenance_recommendations: string | null
          motor_condition: string | null
          motor_lubrication_status: string | null
          notes: string | null
          oil_level_status: string | null
          pump_seals_condition: string | null
          reading_mode: string | null
          refrigerant_level: string | null
          restroom_notes: string | null
          safety_features_status: string | null
          seasonal_preparation_status: string | null
          sensor_status: string | null
          sensors_operation: string | null
          sink_status: string | null
          soap_supply: string | null
          status: Database["public"]["Enums"]["maintenance_check_status"] | null
          strainer_status: string | null
          sump_basin_condition: string | null
          technician_id: string | null
          toilet_paper_supply: string | null
          toilet_status: string | null
          troubleshooting_notes: string | null
          unusual_noise: boolean | null
          unusual_noise_description: string | null
          unusual_noise_elevator: boolean | null
          updated_at: string | null
          urinal_status: string | null
          vibration_description: string | null
          vibration_elevator: boolean | null
          vibration_monitoring: string | null
          vibration_observed: boolean | null
          water_system_status: string | null
        }
        Insert: {
          air_filter_cleaned?: boolean | null
          air_filter_status?: string | null
          airflow_reading?: number | null
          airflow_unit?: string | null
          belt_condition?: string | null
          check_date?: string | null
          chiller_pressure_reading?: number | null
          chiller_temperature_reading?: number | null
          cleanliness_level?: string | null
          coils_condition?: string | null
          company_id?: string | null
          condenser_condition?: string | null
          control_system_status?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          dampers_operation?: string | null
          door_operation?: string | null
          drain_pan_status?: string | null
          drainage_system_status?: string | null
          drift_eliminators_condition?: string | null
          elevator_lighting?: string | null
          elevator_notes?: string | null
          elevator_operation?: string | null
          emergency_phone?: string | null
          emergency_shutdown_status?: string | null
          equipment_id?: string | null
          equipment_type?: string | null
          fan_assembly_status?: string | null
          fan_bearings_lubricated?: boolean | null
          fan_belt_condition?: string | null
          fan_noise_level?: string | null
          fill_media_condition?: string | null
          floor_condition?: string | null
          general_inspection?: string | null
          hand_dryer_status?: string | null
          id?: string
          images?: string[] | null
          location_id?: string | null
          maintenance_frequency?: string | null
          maintenance_recommendations?: string | null
          motor_condition?: string | null
          motor_lubrication_status?: string | null
          notes?: string | null
          oil_level_status?: string | null
          pump_seals_condition?: string | null
          reading_mode?: string | null
          refrigerant_level?: string | null
          restroom_notes?: string | null
          safety_features_status?: string | null
          seasonal_preparation_status?: string | null
          sensor_status?: string | null
          sensors_operation?: string | null
          sink_status?: string | null
          soap_supply?: string | null
          status?:
            | Database["public"]["Enums"]["maintenance_check_status"]
            | null
          strainer_status?: string | null
          sump_basin_condition?: string | null
          technician_id?: string | null
          toilet_paper_supply?: string | null
          toilet_status?: string | null
          troubleshooting_notes?: string | null
          unusual_noise?: boolean | null
          unusual_noise_description?: string | null
          unusual_noise_elevator?: boolean | null
          updated_at?: string | null
          urinal_status?: string | null
          vibration_description?: string | null
          vibration_elevator?: boolean | null
          vibration_monitoring?: string | null
          vibration_observed?: boolean | null
          water_system_status?: string | null
        }
        Update: {
          air_filter_cleaned?: boolean | null
          air_filter_status?: string | null
          airflow_reading?: number | null
          airflow_unit?: string | null
          belt_condition?: string | null
          check_date?: string | null
          chiller_pressure_reading?: number | null
          chiller_temperature_reading?: number | null
          cleanliness_level?: string | null
          coils_condition?: string | null
          company_id?: string | null
          condenser_condition?: string | null
          control_system_status?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          dampers_operation?: string | null
          door_operation?: string | null
          drain_pan_status?: string | null
          drainage_system_status?: string | null
          drift_eliminators_condition?: string | null
          elevator_lighting?: string | null
          elevator_notes?: string | null
          elevator_operation?: string | null
          emergency_phone?: string | null
          emergency_shutdown_status?: string | null
          equipment_id?: string | null
          equipment_type?: string | null
          fan_assembly_status?: string | null
          fan_bearings_lubricated?: boolean | null
          fan_belt_condition?: string | null
          fan_noise_level?: string | null
          fill_media_condition?: string | null
          floor_condition?: string | null
          general_inspection?: string | null
          hand_dryer_status?: string | null
          id?: string
          images?: string[] | null
          location_id?: string | null
          maintenance_frequency?: string | null
          maintenance_recommendations?: string | null
          motor_condition?: string | null
          motor_lubrication_status?: string | null
          notes?: string | null
          oil_level_status?: string | null
          pump_seals_condition?: string | null
          reading_mode?: string | null
          refrigerant_level?: string | null
          restroom_notes?: string | null
          safety_features_status?: string | null
          seasonal_preparation_status?: string | null
          sensor_status?: string | null
          sensors_operation?: string | null
          sink_status?: string | null
          soap_supply?: string | null
          status?:
            | Database["public"]["Enums"]["maintenance_check_status"]
            | null
          strainer_status?: string | null
          sump_basin_condition?: string | null
          technician_id?: string | null
          toilet_paper_supply?: string | null
          toilet_status?: string | null
          troubleshooting_notes?: string | null
          unusual_noise?: boolean | null
          unusual_noise_description?: string | null
          unusual_noise_elevator?: boolean | null
          updated_at?: string | null
          urinal_status?: string | null
          vibration_description?: string | null
          vibration_elevator?: boolean | null
          vibration_monitoring?: string | null
          vibration_observed?: boolean | null
          water_system_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hvac_maintenance_checks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hvac_maintenance_checks_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hvac_maintenance_checks_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string | null
          store_number: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          store_number: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          store_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_documents: {
        Row: {
          category: string
          comments: string | null
          company_id: string | null
          equipment_id: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          maintenance_check_id: string | null
          project_id: string | null
          tags: string[] | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          category: string
          comments?: string | null
          company_id?: string | null
          equipment_id?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          maintenance_check_id?: string | null
          project_id?: string | null
          tags?: string[] | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          comments?: string | null
          company_id?: string | null
          equipment_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          maintenance_check_id?: string | null
          project_id?: string | null
          tags?: string[] | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_documents_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_documents_maintenance_check_id_fkey"
            columns: ["maintenance_check_id"]
            isOneToOne: false
            referencedRelation: "hvac_maintenance_checks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_alerts: {
        Row: {
          asset_id: string
          confidence_score: number | null
          created_at: string
          data_quality: Json | null
          degradation_analysis: Json | null
          finding: string
          id: string
          maintenance_windows: Json | null
          performance_trends: Json | null
          predictive_timeline: Json | null
          recommendation: string
          resolved_at: string | null
          risk_level: string
          work_order_id: string | null
        }
        Insert: {
          asset_id: string
          confidence_score?: number | null
          created_at?: string
          data_quality?: Json | null
          degradation_analysis?: Json | null
          finding: string
          id?: string
          maintenance_windows?: Json | null
          performance_trends?: Json | null
          predictive_timeline?: Json | null
          recommendation: string
          resolved_at?: string | null
          risk_level: string
          work_order_id?: string | null
        }
        Update: {
          asset_id?: string
          confidence_score?: number | null
          created_at?: string
          data_quality?: Json | null
          degradation_analysis?: Json | null
          finding?: string
          id?: string
          maintenance_windows?: Json | null
          performance_trends?: Json | null
          predictive_timeline?: Json | null
          recommendation?: string
          resolved_at?: string | null
          risk_level?: string
          work_order_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          company_id: string | null
          createdat: string | null
          description: string | null
          enddate: string | null
          id: string
          location: string | null
          name: string
          priority: string
          startdate: string | null
          status: string
          updatedat: string | null
        }
        Insert: {
          company_id?: string | null
          createdat?: string | null
          description?: string | null
          enddate?: string | null
          id?: string
          location?: string | null
          name: string
          priority: string
          startdate?: string | null
          status: string
          updatedat?: string | null
        }
        Update: {
          company_id?: string | null
          createdat?: string | null
          description?: string | null
          enddate?: string | null
          id?: string
          location?: string | null
          name?: string
          priority?: string
          startdate?: string | null
          status?: string
          updatedat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      refactoring_rules: {
        Row: {
          created_at: string | null
          description: string | null
          file_pattern: string | null
          id: string
          is_active: boolean | null
          name: string
          pattern: string
          replacement: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_pattern?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          pattern: string
          replacement: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_pattern?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          pattern?: string
          replacement?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sensor_readings: {
        Row: {
          created_at: string
          equipment_id: string
          id: string
          reading_mode: string | null
          sensor_type: string
          source: string | null
          timestamp_utc: string
          unit: string
          value: number
        }
        Insert: {
          created_at?: string
          equipment_id: string
          id?: string
          reading_mode?: string | null
          sensor_type: string
          source?: string | null
          timestamp_utc?: string
          unit: string
          value: number
        }
        Update: {
          created_at?: string
          equipment_id?: string
          id?: string
          reading_mode?: string | null
          sensor_type?: string
          source?: string | null
          timestamp_utc?: string
          unit?: string
          value?: number
        }
        Relationships: []
      }
      technicians: {
        Row: {
          company_id: string | null
          createdAt: string | null
          email: string
          firstName: string
          id: string
          isAvailable: boolean | null
          lastName: string
          phone: string
          specialization: string
          updatedAt: string | null
        }
        Insert: {
          company_id?: string | null
          createdAt?: string | null
          email: string
          firstName: string
          id?: string
          isAvailable?: boolean | null
          lastName: string
          phone: string
          specialization: string
          updatedAt?: string | null
        }
        Update: {
          company_id?: string | null
          createdAt?: string | null
          email?: string
          firstName?: string
          id?: string
          isAvailable?: boolean | null
          lastName?: string
          phone?: string
          specialization?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      filter_changes_view: {
        Row: {
          created_at: string | null
          due_date: string | null
          equipment_id: string | null
          filter_condition: string | null
          filter_size: string | null
          filter_type: string | null
          id: string | null
          installation_date: string | null
          notes: string | null
          status: Database["public"]["Enums"]["filter_change_status"] | null
          status_calc: string | null
          technician_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          equipment_id?: string | null
          filter_condition?: string | null
          filter_size?: string | null
          filter_type?: string | null
          id?: string | null
          installation_date?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["filter_change_status"] | null
          status_calc?: never
          technician_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          equipment_id?: string | null
          filter_condition?: string | null
          filter_size?: string | null
          filter_type?: string | null
          id?: string | null
          installation_date?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["filter_change_status"] | null
          status_calc?: never
          technician_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "filter_changes_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filter_changes_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_filter_status: {
        Args: { p_due: string }
        Returns: string
      }
      check_threshold_violations: {
        Args: { p_equipment_id: string }
        Returns: {
          sensor_type: string
          current_value: number
          warning_threshold: number
          critical_threshold: number
          violation_level: string
          unit: string
        }[]
      }
      get_sensor_analysis: {
        Args: { p_equipment_id: string; p_hours?: number }
        Returns: {
          sensor_type: string
          latest_value: number
          avg_value: number
          min_value: number
          max_value: number
          reading_count: number
          trend_direction: string
          unit: string
        }[]
      }
      get_user_company: {
        Args: Record<PropertyKey, never>
        Returns: {
          company: Json
        }[]
      }
      is_member_of: {
        Args: { company_id: string }
        Returns: boolean
      }
      set_claim: {
        Args: { uid: string; claim: string; value: string }
        Returns: undefined
      }
    }
    Enums: {
      filter_change_status: "active" | "completed" | "overdue"
      maintenance_check_status: "completed" | "pending" | "issue_found"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      filter_change_status: ["active", "completed", "overdue"],
      maintenance_check_status: ["completed", "pending", "issue_found"],
    },
  },
} as const
