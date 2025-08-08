export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          created_at: string;
          is_admin: boolean;
        };
        Insert: {
          id: string;
          created_at?: string;
          is_admin?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          is_admin?: boolean;
        };
        Relationships: [];
      };
      automated_work_orders: {
        Row: {
          id: string;
          asset_id: string;
          title: string;
          description: string;
          priority: "low" | "medium" | "high";
          status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
          due_hours: number;
          assigned_team: string | null;
          created_at: string;
          assigned_at: string | null;
          completed_at: string | null;
          alert_id: string | null;
        };
        Insert: {
          id?: string;
          asset_id: string;
          title: string;
          description: string;
          priority: "low" | "medium" | "high";
          status?: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
          due_hours: number;
          assigned_team?: string | null;
          created_at?: string;
          assigned_at?: string | null;
          completed_at?: string | null;
          alert_id?: string | null;
        };
        Update: {
          id?: string;
          asset_id?: string;
          title?: string;
          description?: string;
          priority?: "low" | "medium" | "high";
          status?: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
          due_hours?: number;
          assigned_team?: string | null;
          created_at?: string;
          assigned_at?: string | null;
          completed_at?: string | null;
          alert_id?: string | null;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          name: string;
          address: string;
          contact_email: string;
          contact_phone: string;
          logo_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          contact_email: string;
          contact_phone: string;
          logo_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          contact_email?: string;
          contact_phone?: string;
          logo_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      company_users: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      equipment: {
        Row: {
          id: string;
          name: string;
          location: string;
          type: string;
          status: string;
          serial_number: string | null;
          model: string | null;
          year: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          type: string;
          status?: string;
          serial_number?: string | null;
          model?: string | null;
          year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          type?: string;
          status?: string;
          serial_number?: string | null;
          model?: string | null;
          year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      equipment_thresholds: {
        Row: {
          id: string;
          equipment_id: string;
          sensor_type: string;
          warning_threshold: number;
          critical_threshold: number;
          unit: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          sensor_type: string;
          warning_threshold: number;
          critical_threshold: number;
          unit: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          equipment_id?: string;
          sensor_type?: string;
          warning_threshold?: number;
          critical_threshold?: number;
          unit?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      filter_changes: {
        Row: {
          id: string;
          equipment_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          equipment_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      hvac_maintenance_checks: {
        Row: {
          id: string;
          equipment_id: string;
          technician_id: string;
          check_date: string;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
          maintenance_frequency: string | null;
          unusual_noise_elevator: boolean | null;
          vibration_elevator: boolean | null;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          technician_id: string;
          check_date: string;
          status: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          maintenance_frequency?: string | null;
          unusual_noise_elevator?: boolean | null;
          vibration_elevator?: boolean | null;
        };
        Update: {
          id?: string;
          equipment_id?: string;
          technician_id?: string;
          check_date?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          maintenance_frequency?: string | null;
          unusual_noise_elevator?: boolean | null;
          vibration_elevator?: boolean | null;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          id: string;
          name: string;
          store_number: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          store_number?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          store_number?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      maintenance_documents: {
        Row: {
          id: string;
          check_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          check_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          check_id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          uploaded_at?: string;
        };
        Relationships: [];
      };
      predictive_alerts: {
        Row: {
          id: string;
          asset_id: string;
          risk_level: "low" | "medium" | "high";
          finding: string;
          recommendation: string;
          confidence_score: number | null;
          created_at: string;
          resolved_at: string | null;
          work_order_id: string | null;
          data_quality: any | null;
          predictive_timeline: any | null;
          degradation_analysis: any | null;
          maintenance_windows: any | null;
          performance_trends: any | null;
        };
        Insert: {
          id?: string;
          asset_id: string;
          risk_level: "low" | "medium" | "high";
          finding: string;
          recommendation: string;
          confidence_score?: number | null;
          created_at?: string;
          resolved_at?: string | null;
          work_order_id?: string | null;
          data_quality?: any | null;
          predictive_timeline?: any | null;
          degradation_analysis?: any | null;
          maintenance_windows?: any | null;
          performance_trends?: any | null;
        };
        Update: {
          id?: string;
          asset_id?: string;
          risk_level?: "low" | "medium" | "high";
          finding?: string;
          recommendation?: string;
          confidence_score?: number | null;
          created_at?: string;
          resolved_at?: string | null;
          work_order_id?: string | null;
          data_quality?: any | null;
          predictive_timeline?: any | null;
          degradation_analysis?: any | null;
          maintenance_windows?: any | null;
          performance_trends?: any | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          priority: string;
          status: string;
          created_at: string;
          updated_at: string;
          start_date: string | null;
          end_date: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          priority: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          start_date?: string | null;
          end_date?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          priority?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          start_date?: string | null;
          end_date?: string | null;
        };
        Relationships: [];
      };
      refactoring_rules: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      sensor_readings: {
        Row: {
          id: string;
          equipment_id: string;
          timestamp_utc: string;
          sensor_type: string;
          value: number;
          unit: string;
          created_at: string;
          source: string | null;
          reading_mode: string | null;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          timestamp_utc?: string;
          sensor_type: string;
          value: number;
          unit: string;
          created_at?: string;
          source?: string | null;
          reading_mode?: string | null;
        };
        Update: {
          id?: string;
          equipment_id?: string;
          timestamp_utc?: string;
          sensor_type?: string;
          value?: number;
          unit?: string;
          created_at?: string;
          source?: string | null;
          reading_mode?: string | null;
        };
        Relationships: [];
      };
      technicians: {
        Row: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          firstName: string;
          lastName: string;
          email: string;
          phone: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          firstName?: string;
          lastName?: string;
          email?: string;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vendors: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          service_categories: string[];
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          status: string;
          is_preferred: boolean;
          rating: number | null;
          notes: string | null;
          insurance_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          service_categories?: string[];
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          status?: string;
          is_preferred?: boolean;
          rating?: number | null;
          notes?: string | null;
          insurance_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          service_categories?: string[];
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          status?: string;
          is_preferred?: boolean;
          rating?: number | null;
          notes?: string | null;
          insurance_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      work_order_vendors: {
        Row: {
          id: string;
          work_order_id: string;
          vendor_id: string;
          status: string;
          assigned_at: string;
          quoted_amount: number | null;
          approved_amount: number | null;
          invoice_number: string | null;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          work_order_id: string;
          vendor_id: string;
          status?: string;
          assigned_at?: string;
          quoted_amount?: number | null;
          approved_amount?: number | null;
          invoice_number?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          work_order_id?: string;
          vendor_id?: string;
          status?: string;
          assigned_at?: string;
          quoted_amount?: number | null;
          approved_amount?: number | null;
          invoice_number?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      filter_changes_view: {
        Row: {
          id: string;
          equipment_id: string;
          created_at: string;
        };
      };
    };
    Functions: {
      get_sensor_analysis: {
        Args: {
          p_equipment_id: string;
          p_hours?: number;
        };
        Returns: {
          sensor_type: string;
          latest_value: number;
          avg_value: number;
          min_value: number;
          max_value: number;
          reading_count: number;
          trend_direction: string;
          unit: string;
        }[];
      };
      check_threshold_violations: {
        Args: {
          p_equipment_id: string;
        };
        Returns: {
          sensor_type: string;
          current_value: number;
          warning_threshold: number;
          critical_threshold: number;
          violation_level: string;
          unit: string;
        }[];
      };
    };
    Enums: {
      maintenance_check_status: "completed" | "pending" | "issue_found";
      risk_level: "low" | "medium" | "high";
      work_order_status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
}
