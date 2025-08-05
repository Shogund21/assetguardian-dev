export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          company: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_passwords: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
      ai_access_requests: {
        Row: {
          created_at: string | null
          feature_name: string
          id: string
          justification: string | null
          requested_at: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_email: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          feature_name?: string
          id?: string
          justification?: string | null
          requested_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_email: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          feature_name?: string
          id?: string
          justification?: string | null
          requested_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_email?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      ai_feature_permissions: {
        Row: {
          created_at: string | null
          disabled_at: string | null
          enabled_at: string | null
          enabled_by: string | null
          feature_name: string
          id: string
          updated_at: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          enabled_by?: string | null
          feature_name?: string
          id?: string
          updated_at?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          enabled_by?: string | null
          feature_name?: string
          id?: string
          updated_at?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_tracking: {
        Row: {
          ai_provider: string
          api_calls_count: number | null
          confidence_score: number | null
          created_at: string | null
          equipment_id: string | null
          error_message: string | null
          estimated_cost_usd: number | null
          feature_name: string
          id: string
          operation_type: string
          response_time_ms: number | null
          session_id: string | null
          success: boolean | null
          tokens_input: number | null
          tokens_output: number | null
          user_email: string
          user_id: string
        }
        Insert: {
          ai_provider: string
          api_calls_count?: number | null
          confidence_score?: number | null
          created_at?: string | null
          equipment_id?: string | null
          error_message?: string | null
          estimated_cost_usd?: number | null
          feature_name?: string
          id?: string
          operation_type: string
          response_time_ms?: number | null
          session_id?: string | null
          success?: boolean | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_email: string
          user_id: string
        }
        Update: {
          ai_provider?: string
          api_calls_count?: number | null
          confidence_score?: number | null
          created_at?: string | null
          equipment_id?: string | null
          error_message?: string | null
          estimated_cost_usd?: number | null
          feature_name?: string
          id?: string
          operation_type?: string
          response_time_ms?: number | null
          session_id?: string | null
          success?: boolean | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          reason: string | null
          record_id: string | null
          session_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          record_id?: string | null
          session_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          record_id?: string | null
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
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
      chat_sessions: {
        Row: {
          created_at: string | null
          email_sent: boolean | null
          id: string
          lead_qualified: boolean | null
          messages: Json[] | null
          session_id: string | null
          updated_at: string | null
          visitor_info: Json | null
        }
        Insert: {
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          lead_qualified?: boolean | null
          messages?: Json[] | null
          session_id?: string | null
          updated_at?: string | null
          visitor_info?: Json | null
        }
        Update: {
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          lead_qualified?: boolean | null
          messages?: Json[] | null
          session_id?: string | null
          updated_at?: string | null
          visitor_info?: Json | null
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
          is_trial: boolean | null
          logo_url: string | null
          name: string
          trial_created_at: string | null
          trial_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_trial?: boolean | null
          logo_url?: string | null
          name: string
          trial_created_at?: string | null
          trial_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_trial?: boolean | null
          logo_url?: string | null
          name?: string
          trial_created_at?: string | null
          trial_expires_at?: string | null
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
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "trial_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      condenser_maintenance: {
        Row: {
          approach_temperature: number | null
          chemicals_used: string[] | null
          cleaning_method: string | null
          coil_condition_after: string | null
          coil_condition_before: string | null
          created_at: string | null
          efficiency_improvement_percent: number | null
          equipment_id: string
          id: string
          next_service_date: string | null
          notes: string | null
          service_cost: number | null
          service_date: string
          service_type: string
          technician_name: string | null
          updated_at: string | null
          water_flow_rate_gpm: number | null
          water_temperature_in: number | null
          water_temperature_out: number | null
        }
        Insert: {
          approach_temperature?: number | null
          chemicals_used?: string[] | null
          cleaning_method?: string | null
          coil_condition_after?: string | null
          coil_condition_before?: string | null
          created_at?: string | null
          efficiency_improvement_percent?: number | null
          equipment_id: string
          id?: string
          next_service_date?: string | null
          notes?: string | null
          service_cost?: number | null
          service_date: string
          service_type: string
          technician_name?: string | null
          updated_at?: string | null
          water_flow_rate_gpm?: number | null
          water_temperature_in?: number | null
          water_temperature_out?: number | null
        }
        Update: {
          approach_temperature?: number | null
          chemicals_used?: string[] | null
          cleaning_method?: string | null
          coil_condition_after?: string | null
          coil_condition_before?: string | null
          created_at?: string | null
          efficiency_improvement_percent?: number | null
          equipment_id?: string
          id?: string
          next_service_date?: string | null
          notes?: string | null
          service_cost?: number | null
          service_date?: string
          service_type?: string
          technician_name?: string | null
          updated_at?: string | null
          water_flow_rate_gpm?: number | null
          water_temperature_in?: number | null
          water_temperature_out?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "condenser_maintenance_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
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
          {
            foreignKeyName: "equipment_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "trial_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_live_points: {
        Row: {
          created_at: string
          equipment_id: string
          id: string
          last_updated: string
          points: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_id: string
          id?: string
          last_updated?: string
          points?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_id?: string
          id?: string
          last_updated?: string
          points?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_live_points_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: true
            referencedRelation: "equipment"
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
      extracted_readings_staging: {
        Row: {
          batch_id: string | null
          confidence: number | null
          created_at: string
          equipment_id: string | null
          extracted_at: string
          id: string
          image_filename: string
          image_id: string
          is_saved: boolean | null
          location_on_image: string | null
          sensor_type: string
          unit: string
          value: number
        }
        Insert: {
          batch_id?: string | null
          confidence?: number | null
          created_at?: string
          equipment_id?: string | null
          extracted_at?: string
          id?: string
          image_filename: string
          image_id: string
          is_saved?: boolean | null
          location_on_image?: string | null
          sensor_type: string
          unit: string
          value: number
        }
        Update: {
          batch_id?: string | null
          confidence?: number | null
          created_at?: string
          equipment_id?: string | null
          extracted_at?: string
          id?: string
          image_filename?: string
          image_id?: string
          is_saved?: boolean | null
          location_on_image?: string | null
          sensor_type?: string
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "extracted_readings_staging_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "image_analysis_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_login_attempts: {
        Row: {
          attempt_count: number | null
          created_at: string
          email: string | null
          id: string
          ip_address: unknown | null
          last_attempt: string
          locked_until: string | null
          user_agent: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown | null
          last_attempt?: string
          locked_until?: string | null
          user_agent?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown | null
          last_attempt?: string
          locked_until?: string | null
          user_agent?: string | null
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
          location_id: string | null
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
          location_id?: string | null
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
          location_id?: string | null
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
            foreignKeyName: "filter_changes_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
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
      hvac_diag_messages: {
        Row: {
          body: Json
          created_at: string
          id: string
          sender: string
          session_id: string
        }
        Insert: {
          body?: Json
          created_at?: string
          id?: string
          sender: string
          session_id: string
        }
        Update: {
          body?: Json
          created_at?: string
          id?: string
          sender?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hvac_diag_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "hvac_diag_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      hvac_diag_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          equipment_id: string | null
          id: string
          resolved: boolean
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          equipment_id?: string | null
          id?: string
          resolved?: boolean
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          equipment_id?: string | null
          id?: string
          resolved?: boolean
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hvac_diag_sessions_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      hvac_diagnostic_sessions: {
        Row: {
          analyst_notes: string | null
          confidence_score: number | null
          cost_analysis: Json | null
          created_at: string | null
          created_by: string | null
          critical_findings: string[] | null
          data_sources_used: string[] | null
          diagnostic_type: string
          equipment_id: string
          estimated_remaining_life_months: number | null
          id: string
          maintenance_priority: string | null
          overall_health_score: number | null
          recommendations: string[] | null
          session_date: string | null
          updated_at: string | null
        }
        Insert: {
          analyst_notes?: string | null
          confidence_score?: number | null
          cost_analysis?: Json | null
          created_at?: string | null
          created_by?: string | null
          critical_findings?: string[] | null
          data_sources_used?: string[] | null
          diagnostic_type: string
          equipment_id: string
          estimated_remaining_life_months?: number | null
          id?: string
          maintenance_priority?: string | null
          overall_health_score?: number | null
          recommendations?: string[] | null
          session_date?: string | null
          updated_at?: string | null
        }
        Update: {
          analyst_notes?: string | null
          confidence_score?: number | null
          cost_analysis?: Json | null
          created_at?: string | null
          created_by?: string | null
          critical_findings?: string[] | null
          data_sources_used?: string[] | null
          diagnostic_type?: string
          equipment_id?: string
          estimated_remaining_life_months?: number | null
          id?: string
          maintenance_priority?: string | null
          overall_health_score?: number | null
          recommendations?: string[] | null
          session_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hvac_diagnostic_sessions_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
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
          ambient_temperature: number | null
          bearings_lubricated: boolean | null
          belt_condition: string | null
          belts_inspected: boolean | null
          check_date: string | null
          chemical_treatment_status: string | null
          chiller_pressure_reading: number | null
          chiller_temperature_reading: number | null
          city_conductivity_us_cm: number | null
          cleanliness_level: string | null
          coils_cleaned: boolean | null
          coils_condition: string | null
          company_id: string | null
          compressor_condition: string | null
          compressor_discharge_pressure: number | null
          compressor_discharge_temp: number | null
          compressor_oil_pressure: number | null
          compressor_oil_temp: number | null
          compressor_subcooling: number | null
          compressor_suction_pressure: number | null
          compressor_suction_temp: number | null
          compressor_superheat: number | null
          condenser_approach_temp: number | null
          condenser_condition: string | null
          condenser_entering_water_temp: number | null
          condenser_flow_rate: number | null
          condenser_leaving_water_temp: number | null
          condenser_pressure_drop: number | null
          control_panel_condition: string | null
          control_system_status: string | null
          cooling_capacity_tons: number | null
          corrective_actions: string | null
          created_at: string | null
          dampers_operation: string | null
          door_operation: string | null
          drain_pan_status: string | null
          drainage_system_status: string | null
          drift_eliminators_condition: string | null
          efficiency_cop: number | null
          electrical_connections_condition: string | null
          elevator_lighting: string | null
          elevator_notes: string | null
          elevator_operation: string | null
          emergency_phone: string | null
          emergency_shutdown_status: string | null
          energy_consumption_kwh: number | null
          equipment_id: string | null
          equipment_type: string | null
          evaporator_approach_temp: number | null
          evaporator_condition: string | null
          evaporator_entering_water_temp: number | null
          evaporator_flow_rate: number | null
          evaporator_leaving_water_temp: number | null
          evaporator_pressure_drop: number | null
          fan_assembly_status: string | null
          fan_bearings_lubricated: boolean | null
          fan_belt_condition: string | null
          fan_noise_level: string | null
          fill_media_condition: string | null
          filters_replaced: boolean | null
          floor_condition: string | null
          follow_up_required: boolean | null
          general_inspection: string | null
          hand_dryer_status: string | null
          heating_capacity_btuh: number | null
          humidity_level: number | null
          id: string
          images: string[] | null
          inspection_notes: string | null
          labor_cost: number | null
          location_id: string | null
          maintenance_duration_minutes: number | null
          maintenance_frequency: string | null
          maintenance_recommendations: string | null
          motor_amperage_rla: number | null
          motor_condition: string | null
          motor_lubrication_status: string | null
          motor_temperature: number | null
          motor_vibration: number | null
          motor_voltage_phase1: number | null
          motor_voltage_phase2: number | null
          motor_voltage_phase3: number | null
          next_inspection_date: string | null
          notes: string | null
          oil_level_status: string | null
          operating_hours: number | null
          parts_cost: number | null
          parts_used: Json | null
          pump_seals_condition: string | null
          reading_mode: string | null
          refrigerant_checked: boolean | null
          refrigerant_level: string | null
          restroom_notes: string | null
          safety_features_status: string | null
          safety_switches_status: string | null
          seasonal_preparation_status: string | null
          sensor_status: string | null
          sensors_operation: string | null
          sink_status: string | null
          soap_supply: string | null
          status: Database["public"]["Enums"]["maintenance_check_status"] | null
          strainer_status: string | null
          sump_basin_condition: string | null
          system_efficiency_rating: number | null
          technician_id: string | null
          toilet_paper_supply: string | null
          toilet_status: string | null
          tower_conductivity_us_cm: number | null
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
          water_conductivity: number | null
          water_ph_level: number | null
          water_system_status: string | null
        }
        Insert: {
          air_filter_cleaned?: boolean | null
          air_filter_status?: string | null
          airflow_reading?: number | null
          airflow_unit?: string | null
          ambient_temperature?: number | null
          bearings_lubricated?: boolean | null
          belt_condition?: string | null
          belts_inspected?: boolean | null
          check_date?: string | null
          chemical_treatment_status?: string | null
          chiller_pressure_reading?: number | null
          chiller_temperature_reading?: number | null
          city_conductivity_us_cm?: number | null
          cleanliness_level?: string | null
          coils_cleaned?: boolean | null
          coils_condition?: string | null
          company_id?: string | null
          compressor_condition?: string | null
          compressor_discharge_pressure?: number | null
          compressor_discharge_temp?: number | null
          compressor_oil_pressure?: number | null
          compressor_oil_temp?: number | null
          compressor_subcooling?: number | null
          compressor_suction_pressure?: number | null
          compressor_suction_temp?: number | null
          compressor_superheat?: number | null
          condenser_approach_temp?: number | null
          condenser_condition?: string | null
          condenser_entering_water_temp?: number | null
          condenser_flow_rate?: number | null
          condenser_leaving_water_temp?: number | null
          condenser_pressure_drop?: number | null
          control_panel_condition?: string | null
          control_system_status?: string | null
          cooling_capacity_tons?: number | null
          corrective_actions?: string | null
          created_at?: string | null
          dampers_operation?: string | null
          door_operation?: string | null
          drain_pan_status?: string | null
          drainage_system_status?: string | null
          drift_eliminators_condition?: string | null
          efficiency_cop?: number | null
          electrical_connections_condition?: string | null
          elevator_lighting?: string | null
          elevator_notes?: string | null
          elevator_operation?: string | null
          emergency_phone?: string | null
          emergency_shutdown_status?: string | null
          energy_consumption_kwh?: number | null
          equipment_id?: string | null
          equipment_type?: string | null
          evaporator_approach_temp?: number | null
          evaporator_condition?: string | null
          evaporator_entering_water_temp?: number | null
          evaporator_flow_rate?: number | null
          evaporator_leaving_water_temp?: number | null
          evaporator_pressure_drop?: number | null
          fan_assembly_status?: string | null
          fan_bearings_lubricated?: boolean | null
          fan_belt_condition?: string | null
          fan_noise_level?: string | null
          fill_media_condition?: string | null
          filters_replaced?: boolean | null
          floor_condition?: string | null
          follow_up_required?: boolean | null
          general_inspection?: string | null
          hand_dryer_status?: string | null
          heating_capacity_btuh?: number | null
          humidity_level?: number | null
          id?: string
          images?: string[] | null
          inspection_notes?: string | null
          labor_cost?: number | null
          location_id?: string | null
          maintenance_duration_minutes?: number | null
          maintenance_frequency?: string | null
          maintenance_recommendations?: string | null
          motor_amperage_rla?: number | null
          motor_condition?: string | null
          motor_lubrication_status?: string | null
          motor_temperature?: number | null
          motor_vibration?: number | null
          motor_voltage_phase1?: number | null
          motor_voltage_phase2?: number | null
          motor_voltage_phase3?: number | null
          next_inspection_date?: string | null
          notes?: string | null
          oil_level_status?: string | null
          operating_hours?: number | null
          parts_cost?: number | null
          parts_used?: Json | null
          pump_seals_condition?: string | null
          reading_mode?: string | null
          refrigerant_checked?: boolean | null
          refrigerant_level?: string | null
          restroom_notes?: string | null
          safety_features_status?: string | null
          safety_switches_status?: string | null
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
          system_efficiency_rating?: number | null
          technician_id?: string | null
          toilet_paper_supply?: string | null
          toilet_status?: string | null
          tower_conductivity_us_cm?: number | null
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
          water_conductivity?: number | null
          water_ph_level?: number | null
          water_system_status?: string | null
        }
        Update: {
          air_filter_cleaned?: boolean | null
          air_filter_status?: string | null
          airflow_reading?: number | null
          airflow_unit?: string | null
          ambient_temperature?: number | null
          bearings_lubricated?: boolean | null
          belt_condition?: string | null
          belts_inspected?: boolean | null
          check_date?: string | null
          chemical_treatment_status?: string | null
          chiller_pressure_reading?: number | null
          chiller_temperature_reading?: number | null
          city_conductivity_us_cm?: number | null
          cleanliness_level?: string | null
          coils_cleaned?: boolean | null
          coils_condition?: string | null
          company_id?: string | null
          compressor_condition?: string | null
          compressor_discharge_pressure?: number | null
          compressor_discharge_temp?: number | null
          compressor_oil_pressure?: number | null
          compressor_oil_temp?: number | null
          compressor_subcooling?: number | null
          compressor_suction_pressure?: number | null
          compressor_suction_temp?: number | null
          compressor_superheat?: number | null
          condenser_approach_temp?: number | null
          condenser_condition?: string | null
          condenser_entering_water_temp?: number | null
          condenser_flow_rate?: number | null
          condenser_leaving_water_temp?: number | null
          condenser_pressure_drop?: number | null
          control_panel_condition?: string | null
          control_system_status?: string | null
          cooling_capacity_tons?: number | null
          corrective_actions?: string | null
          created_at?: string | null
          dampers_operation?: string | null
          door_operation?: string | null
          drain_pan_status?: string | null
          drainage_system_status?: string | null
          drift_eliminators_condition?: string | null
          efficiency_cop?: number | null
          electrical_connections_condition?: string | null
          elevator_lighting?: string | null
          elevator_notes?: string | null
          elevator_operation?: string | null
          emergency_phone?: string | null
          emergency_shutdown_status?: string | null
          energy_consumption_kwh?: number | null
          equipment_id?: string | null
          equipment_type?: string | null
          evaporator_approach_temp?: number | null
          evaporator_condition?: string | null
          evaporator_entering_water_temp?: number | null
          evaporator_flow_rate?: number | null
          evaporator_leaving_water_temp?: number | null
          evaporator_pressure_drop?: number | null
          fan_assembly_status?: string | null
          fan_bearings_lubricated?: boolean | null
          fan_belt_condition?: string | null
          fan_noise_level?: string | null
          fill_media_condition?: string | null
          filters_replaced?: boolean | null
          floor_condition?: string | null
          follow_up_required?: boolean | null
          general_inspection?: string | null
          hand_dryer_status?: string | null
          heating_capacity_btuh?: number | null
          humidity_level?: number | null
          id?: string
          images?: string[] | null
          inspection_notes?: string | null
          labor_cost?: number | null
          location_id?: string | null
          maintenance_duration_minutes?: number | null
          maintenance_frequency?: string | null
          maintenance_recommendations?: string | null
          motor_amperage_rla?: number | null
          motor_condition?: string | null
          motor_lubrication_status?: string | null
          motor_temperature?: number | null
          motor_vibration?: number | null
          motor_voltage_phase1?: number | null
          motor_voltage_phase2?: number | null
          motor_voltage_phase3?: number | null
          next_inspection_date?: string | null
          notes?: string | null
          oil_level_status?: string | null
          operating_hours?: number | null
          parts_cost?: number | null
          parts_used?: Json | null
          pump_seals_condition?: string | null
          reading_mode?: string | null
          refrigerant_checked?: boolean | null
          refrigerant_level?: string | null
          restroom_notes?: string | null
          safety_features_status?: string | null
          safety_switches_status?: string | null
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
          system_efficiency_rating?: number | null
          technician_id?: string | null
          toilet_paper_supply?: string | null
          toilet_status?: string | null
          tower_conductivity_us_cm?: number | null
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
          water_conductivity?: number | null
          water_ph_level?: number | null
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
            foreignKeyName: "hvac_maintenance_checks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "trial_companies"
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
      image_analysis_batches: {
        Row: {
          batch_name: string
          company_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          equipment_id: string | null
          equipment_name: string | null
          equipment_type: string | null
          id: string
          metadata: Json | null
          processed_images: number
          status: string
          total_images: number
          total_readings: number
        }
        Insert: {
          batch_name: string
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          equipment_id?: string | null
          equipment_name?: string | null
          equipment_type?: string | null
          id?: string
          metadata?: Json | null
          processed_images?: number
          status?: string
          total_images?: number
          total_readings?: number
        }
        Update: {
          batch_name?: string
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          equipment_id?: string | null
          equipment_name?: string | null
          equipment_type?: string | null
          id?: string
          metadata?: Json | null
          processed_images?: number
          status?: string
          total_images?: number
          total_readings?: number
        }
        Relationships: [
          {
            foreignKeyName: "image_analysis_batches_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
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
          {
            foreignKeyName: "locations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "trial_companies"
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
            foreignKeyName: "maintenance_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "trial_companies"
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
      manual_maintenance_logs: {
        Row: {
          cost_usd: number | null
          created_at: string | null
          description: string
          equipment_id: string
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          labor_hours: number | null
          log_date: string
          maintenance_type: string
          parts_replaced: string[] | null
          severity: string | null
          technician_name: string | null
          updated_at: string | null
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string | null
          description: string
          equipment_id: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          labor_hours?: number | null
          log_date: string
          maintenance_type: string
          parts_replaced?: string[] | null
          severity?: string | null
          technician_name?: string | null
          updated_at?: string | null
        }
        Update: {
          cost_usd?: number | null
          created_at?: string | null
          description?: string
          equipment_id?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          labor_hours?: number | null
          log_date?: string
          maintenance_type?: string
          parts_replaced?: string[] | null
          severity?: string | null
          technician_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manual_maintenance_logs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_notifications: {
        Row: {
          admin_id: string
          admin_notes: string | null
          created_at: string
          custom_email_sent_at: string | null
          id: string
          status: string
          supabase_reset_initiated_at: string | null
          tracking_token: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          admin_id: string
          admin_notes?: string | null
          created_at?: string
          custom_email_sent_at?: string | null
          id?: string
          status?: string
          supabase_reset_initiated_at?: string | null
          tracking_token: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          admin_id?: string
          admin_notes?: string | null
          created_at?: string
          custom_email_sent_at?: string | null
          id?: string
          status?: string
          supabase_reset_initiated_at?: string | null
          tracking_token?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_requests: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown | null
          is_used: boolean | null
          reset_token: string
          used_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_used?: boolean | null
          reset_token: string
          used_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_used?: boolean | null
          reset_token?: string
          used_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          api_endpoint: string | null
          created_at: string | null
          error_message: string | null
          error_occurred: boolean | null
          id: string
          load_time_ms: number | null
          metric_type: string
          page_route: string | null
          response_time_ms: number | null
          session_id: string | null
          timestamp_utc: string | null
          user_id: string | null
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string | null
          error_message?: string | null
          error_occurred?: boolean | null
          id?: string
          load_time_ms?: number | null
          metric_type: string
          page_route?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          timestamp_utc?: string | null
          user_id?: string | null
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string | null
          error_message?: string | null
          error_occurred?: boolean | null
          id?: string
          load_time_ms?: number | null
          metric_type?: string
          page_route?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          timestamp_utc?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "trial_companies"
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
      refrigerant_reports: {
        Row: {
          certification_number: string | null
          charge_amount_lbs: number | null
          created_at: string | null
          equipment_id: string
          id: string
          leak_locations: string[] | null
          leak_severity: string | null
          leak_test_passed: boolean
          next_test_date: string | null
          pressure_high_side: number | null
          pressure_low_side: number | null
          refrigerant_type: string
          report_date: string
          subcooling_temp: number | null
          superheat_temp: number | null
          technician_name: string | null
          updated_at: string | null
        }
        Insert: {
          certification_number?: string | null
          charge_amount_lbs?: number | null
          created_at?: string | null
          equipment_id: string
          id?: string
          leak_locations?: string[] | null
          leak_severity?: string | null
          leak_test_passed: boolean
          next_test_date?: string | null
          pressure_high_side?: number | null
          pressure_low_side?: number | null
          refrigerant_type: string
          report_date: string
          subcooling_temp?: number | null
          superheat_temp?: number | null
          technician_name?: string | null
          updated_at?: string | null
        }
        Update: {
          certification_number?: string | null
          charge_amount_lbs?: number | null
          created_at?: string | null
          equipment_id?: string
          id?: string
          leak_locations?: string[] | null
          leak_severity?: string | null
          leak_test_passed?: boolean
          next_test_date?: string | null
          pressure_high_side?: number | null
          pressure_low_side?: number | null
          refrigerant_type?: string
          report_date?: string
          subcooling_temp?: number | null
          superheat_temp?: number | null
          technician_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refrigerant_reports_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
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
          account_status: string | null
          company_id: string | null
          company_name: string | null
          createdAt: string | null
          email: string
          firstName: string
          id: string
          isAvailable: boolean | null
          lastName: string
          phone: string
          registration_date: string | null
          specialization: string
          status: string | null
          updatedAt: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          account_status?: string | null
          company_id?: string | null
          company_name?: string | null
          createdAt?: string | null
          email: string
          firstName: string
          id?: string
          isAvailable?: boolean | null
          lastName: string
          phone: string
          registration_date?: string | null
          specialization: string
          status?: string | null
          updatedAt?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          account_status?: string | null
          company_id?: string | null
          company_name?: string | null
          createdAt?: string | null
          email?: string
          firstName?: string
          id?: string
          isAvailable?: boolean | null
          lastName?: string
          phone?: string
          registration_date?: string | null
          specialization?: string
          status?: string | null
          updatedAt?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technicians_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "trial_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          action_details: Json | null
          activity_type: string
          component_name: string | null
          created_at: string | null
          feature_name: string | null
          id: string
          page_route: string | null
          session_id: string | null
          timestamp_utc: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          activity_type: string
          component_name?: string | null
          created_at?: string | null
          feature_name?: string | null
          id?: string
          page_route?: string | null
          session_id?: string | null
          timestamp_utc?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          activity_type?: string
          component_name?: string | null
          created_at?: string | null
          feature_name?: string | null
          id?: string
          page_route?: string | null
          session_id?: string | null
          timestamp_utc?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_engagement_metrics: {
        Row: {
          bounce_rate: number | null
          created_at: string | null
          date_recorded: string | null
          id: string
          last_active_at: string | null
          login_count: number | null
          most_used_features: string[] | null
          pages_per_session: number | null
          total_session_duration_minutes: number | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bounce_rate?: number | null
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          last_active_at?: string | null
          login_count?: number | null
          most_used_features?: string[] | null
          pages_per_session?: number | null
          total_session_duration_minutes?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bounce_rate?: number | null
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          last_active_at?: string | null
          login_count?: number | null
          most_used_features?: string[] | null
          pages_per_session?: number | null
          total_session_duration_minutes?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          actions_count: number | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          ip_address: unknown | null
          pages_visited: number | null
          session_id: string
          started_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          actions_count?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          pages_visited?: number | null
          session_id: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          actions_count?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          pages_visited?: number | null
          session_id?: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vibration_analysis: {
        Row: {
          alignment_status: string | null
          amplitude_mils: number | null
          analysis_date: string
          analyst_name: string | null
          bearing_condition: string | null
          created_at: string | null
          equipment_id: string
          frequency_hz: number | null
          id: string
          measurement_location: string
          motor_condition: string | null
          next_analysis_date: string | null
          overall_condition: string | null
          recommendations: string | null
          updated_at: string | null
          vibration_acceleration: number | null
          vibration_velocity: number | null
        }
        Insert: {
          alignment_status?: string | null
          amplitude_mils?: number | null
          analysis_date: string
          analyst_name?: string | null
          bearing_condition?: string | null
          created_at?: string | null
          equipment_id: string
          frequency_hz?: number | null
          id?: string
          measurement_location: string
          motor_condition?: string | null
          next_analysis_date?: string | null
          overall_condition?: string | null
          recommendations?: string | null
          updated_at?: string | null
          vibration_acceleration?: number | null
          vibration_velocity?: number | null
        }
        Update: {
          alignment_status?: string | null
          amplitude_mils?: number | null
          analysis_date?: string
          analyst_name?: string | null
          bearing_condition?: string | null
          created_at?: string | null
          equipment_id?: string
          frequency_hz?: number | null
          id?: string
          measurement_location?: string
          motor_condition?: string | null
          next_analysis_date?: string | null
          overall_condition?: string | null
          recommendations?: string | null
          updated_at?: string | null
          vibration_acceleration?: number | null
          vibration_velocity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vibration_analysis_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
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
      trial_companies: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          days_remaining: number | null
          id: string | null
          is_expired: boolean | null
          is_trial: boolean | null
          logo_url: string | null
          name: string | null
          trial_created_at: string | null
          trial_expires_at: string | null
          updated_at: string | null
          user_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_send_password_reset_email: {
        Args: { p_user_email: string; p_admin_notes?: string }
        Returns: Json
      }
      assign_user_to_demo_company: {
        Args: { p_user_email: string }
        Returns: string
      }
      calculate_filter_status: {
        Args: { p_due: string }
        Returns: string
      }
      can_access_all_data: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_modify_data: {
        Args: { p_company_id: string }
        Returns: boolean
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
      cleanup_expired_trials: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_complete_trial_company: {
        Args: {
          p_company_name: string
          p_user_email: string
          p_user_first_name?: string
          p_user_last_name?: string
        }
        Returns: {
          company_id: string
          trial_expires_at: string
          days_remaining: number
          demo_data_created: boolean
        }[]
      }
      create_trial_company: {
        Args: {
          p_company_name: string
          p_user_email: string
          p_user_first_name?: string
          p_user_last_name?: string
        }
        Returns: string
      }
      dashboard_payload: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      debug_auth_uid: {
        Args: Record<PropertyKey, never>
        Returns: {
          auth_uid: string
          current_user_name: string
          session_user_name: string
          has_jwt: boolean
        }[]
      }
      delete_equipment: {
        Args: { p_equipment_id: string }
        Returns: Json
      }
      delete_project: {
        Args: { p_project_id: string }
        Returns: Json
      }
      end_user_session: {
        Args: {
          p_session_id: string
          p_pages_visited?: number
          p_actions_count?: number
        }
        Returns: undefined
      }
      equipment_dropdown: {
        Args: { p_company_id?: string; p_search?: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      extend_trial: {
        Args: { p_company_id: string; p_additional_days?: number }
        Returns: string
      }
      generate_demo_data: {
        Args: { p_company_id: string; p_company_name: string }
        Returns: undefined
      }
      get_all_companies_for_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          logo_url: string
          address: string
          contact_email: string
          contact_phone: string
          created_at: string
          updated_at: string
        }[]
      }
      get_audit_logs_with_profiles: {
        Args: {
          p_start_date?: string
          p_end_date?: string
          p_table_name?: string
          p_action?: string
          p_user_id?: string
          p_limit?: number
        }
        Returns: {
          id: string
          user_id: string
          action: string
          table_name: string
          record_id: string
          old_values: Json
          new_values: Json
          reason: string
          metadata: Json
          created_at: string
          ip_address: unknown
          user_agent: string
          session_id: string
          user_first_name: string
          user_last_name: string
          user_email: string
        }[]
      }
      get_current_user_company: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_id: string
          company_name: string
          user_role: string
          is_admin: boolean
        }[]
      }
      get_demo_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_equipment_data: {
        Args: {
          p_company_id?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
        }
        Returns: {
          id: string
          name: string
          type: string
          model: string
          serial_number: string
          location: string
          status: string
          lastMaintenance: string
          nextMaintenance: string
          company_id: string
          created_at: string
          updated_at: string
        }[]
      }
      get_maintenance_history: {
        Args: { p_equipment_id?: string; p_limit?: number; p_offset?: number }
        Returns: {
          id: string
          equipment_id: string
          technician_id: string
          check_date: string
          status: Database["public"]["Enums"]["maintenance_check_status"]
          equipment_name: string
          equipment_type: string
          equipment_location: string
          technician_name: string
          notes: string
          company_id: string
          location_id: string
          location_name: string
          location_store_number: string
          maintenance_frequency: string
          reading_mode: string
          chiller_pressure_reading: number
          chiller_temperature_reading: number
          air_filter_status: string
          belt_condition: string
          refrigerant_level: string
          unusual_noise: boolean
          vibration_observed: boolean
          oil_level_status: string
          condenser_condition: string
          unusual_noise_description: string
          vibration_description: string
          air_filter_cleaned: boolean
          fan_belt_condition: string
          fan_bearings_lubricated: boolean
          fan_noise_level: string
          dampers_operation: string
          coils_condition: string
          sensors_operation: string
          motor_condition: string
          drain_pan_status: string
          airflow_reading: number
          airflow_unit: string
          troubleshooting_notes: string
          corrective_actions: string
          maintenance_recommendations: string
          elevator_operation: string
          door_operation: string
          unusual_noise_elevator: boolean
          vibration_elevator: boolean
          emergency_phone: string
          elevator_lighting: string
          elevator_notes: string
          safety_features_status: string
          sink_status: string
          toilet_status: string
          urinal_status: string
          hand_dryer_status: string
          cleanliness_level: string
          soap_supply: string
          toilet_paper_supply: string
          floor_condition: string
          restroom_notes: string
          fill_media_condition: string
          drift_eliminators_condition: string
          fan_assembly_status: string
          motor_lubrication_status: string
          pump_seals_condition: string
          strainer_status: string
          sump_basin_condition: string
          water_system_status: string
          drainage_system_status: string
          control_system_status: string
          sensor_status: string
          seasonal_preparation_status: string
          vibration_monitoring: string
          emergency_shutdown_status: string
          city_conductivity_us_cm: number
          tower_conductivity_us_cm: number
          general_inspection: string
          images: string[]
        }[]
      }
      get_performance_metrics_with_profiles: {
        Args: { p_limit?: number }
        Returns: {
          id: string
          user_id: string
          session_id: string
          metric_type: string
          page_route: string
          load_time_ms: number
          api_endpoint: string
          response_time_ms: number
          error_occurred: boolean
          error_message: string
          timestamp_utc: string
          created_at: string
          user_first_name: string
          user_last_name: string
          user_email: string
        }[]
      }
      get_projects_data: {
        Args: {
          p_company_id?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
        }
        Returns: {
          id: string
          name: string
          description: string
          status: string
          priority: string
          location: string
          startdate: string
          enddate: string
          createdat: string
          updatedat: string
          company_id: string
        }[]
      }
      get_recent_activities: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          description: string
          timestamp_val: string
          type: string
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
      get_technicians_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          firstName: string
          lastName: string
          email: string
          phone: string
          specialization: string
          company_id: string
          user_role: string
          is_admin: boolean
          company_name: string
          status: string
          isAvailable: boolean
          account_status: string
          user_id: string
        }[]
      }
      get_trial_info: {
        Args: { p_company_id: string }
        Returns: {
          is_trial: boolean
          expires_at: string
          days_remaining: number
          is_expired: boolean
        }[]
      }
      get_user_activities_with_profiles: {
        Args: { p_limit?: number }
        Returns: {
          id: string
          user_id: string
          session_id: string
          activity_type: string
          page_route: string
          feature_name: string
          component_name: string
          action_details: Json
          timestamp_utc: string
          created_at: string
          user_first_name: string
          user_last_name: string
          user_email: string
        }[]
      }
      get_user_company: {
        Args: Record<PropertyKey, never>
        Returns: {
          company: Json
        }[]
      }
      get_user_sessions_with_profiles: {
        Args: { p_limit?: number }
        Returns: {
          id: string
          user_id: string
          session_id: string
          started_at: string
          ended_at: string
          duration_seconds: number
          pages_visited: number
          actions_count: number
          ip_address: unknown
          user_agent: string
          created_at: string
          user_first_name: string
          user_last_name: string
          user_email: string
        }[]
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_demo_user: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      is_member_of: {
        Args: { company_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_trial_expired: {
        Args: { p_company_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_table_name: string
          p_record_id?: string
          p_old_values?: Json
          p_new_values?: Json
          p_reason?: string
          p_metadata?: Json
        }
        Returns: string
      }
      log_performance_metric: {
        Args: {
          p_user_id: string
          p_session_id: string
          p_metric_type: string
          p_page_route?: string
          p_load_time_ms?: number
          p_api_endpoint?: string
          p_response_time_ms?: number
          p_error_occurred?: boolean
          p_error_message?: string
        }
        Returns: string
      }
      log_user_activity: {
        Args: {
          p_user_id: string
          p_session_id: string
          p_activity_type: string
          p_page_route?: string
          p_feature_name?: string
          p_component_name?: string
          p_action_details?: Json
        }
        Returns: string
      }
      migrate_user_to_uuid: {
        Args: { p_email: string; p_user_id: string }
        Returns: undefined
      }
      request_password_reset: {
        Args: {
          email_address: string
          client_ip?: unknown
          user_agent?: string
        }
        Returns: Json
      }
      reset_password: {
        Args: { reset_token: string; new_password: string }
        Returns: Json
      }
      save_staged_readings_to_sensors: {
        Args: { p_batch_id: string }
        Returns: Json
      }
      set_claim: {
        Args: { uid: string; claim: string; value: string }
        Returns: undefined
      }
      set_equipment_status: {
        Args: { p_equipment_id: string; p_status: string }
        Returns: undefined
      }
      set_project_priority: {
        Args: { p_project_id: string; p_priority: string }
        Returns: undefined
      }
      set_project_status: {
        Args: { p_project_id: string; p_status: string }
        Returns: undefined
      }
      set_technician_status: {
        Args: {
          p_technician_id: string
          p_new_status: string
          p_account_status?: string
          p_user_enabled?: boolean
        }
        Returns: undefined
      }
      start_user_session: {
        Args: {
          p_user_id: string
          p_session_id: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      super_admin_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      track_failed_login: {
        Args: { p_email: string; p_ip_address?: unknown; p_user_agent?: string }
        Returns: boolean
      }
      update_technician_role: {
        Args: {
          p_technician_id: string
          p_new_role: string
          p_is_admin?: boolean
        }
        Returns: undefined
      }
      verify_admin_access: {
        Args: { user_email: string; provided_password: string }
        Returns: Json
      }
      verify_password_reset_token: {
        Args: { reset_token: string }
        Returns: Json
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
