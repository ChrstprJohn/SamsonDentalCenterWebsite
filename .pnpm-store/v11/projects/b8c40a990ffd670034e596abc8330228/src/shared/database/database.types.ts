export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointment_treatments: {
        Row: {
          appointment_id: string
          comment: string | null
          created_at: string
          id: string
          service_id: string
        }
        Insert: {
          appointment_id: string
          comment?: string | null
          created_at?: string
          id?: string
          service_id: string
        }
        Update: {
          appointment_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_treatments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_treatments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_contacts: {
        Row: {
          id: string
          appointment_id: string
          first_name: string
          middle_name: string | null
          last_name: string
          suffix: string | null
          phone_number: string
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          first_name: string
          middle_name?: string | null
          last_name: string
          suffix?: string | null
          phone_number: string
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          first_name?: string
          middle_name?: string | null
          last_name?: string
          suffix?: string | null
          phone_number?: string
          email?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_contacts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          clinical_notes: string | null
          created_at: string
          date: string
          dependent_id: string | null
          doctor_id: string
          end_time: string
          id: string
          patient_id: string | null
          reschedule_count: number
          service_id: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          status_reason: string | null
          updated_at: string
          user_note: string | null
        }
        Insert: {
          clinical_notes?: string | null
          created_at?: string
          date: string
          dependent_id?: string | null
          doctor_id: string
          end_time: string
          id?: string
          patient_id?: string | null
          reschedule_count?: number
          service_id: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          status_reason?: string | null
          updated_at?: string
          user_note?: string | null
        }
        Update: {
          clinical_notes?: string | null
          created_at?: string
          date?: string
          dependent_id?: string | null
          doctor_id?: string
          end_time?: string
          id?: string
          patient_id?: string | null
          reschedule_count?: number
          service_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          status_reason?: string | null
          updated_at?: string
          user_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_dependent_id_fkey"
            columns: ["dependent_id"]
            isOneToOne: false
            referencedRelation: "dependents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          reason: string | null
          target_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          target_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_config: {
        Row: {
          address: string
          allow_same_day_booking: boolean
          calendar_render_days: number
          clinic_name: string
          email: string
          id: string
          is_booking_open: boolean
          is_singleton: boolean
          maintenance_message: string | null
          max_reschedules: number
          operating_hours: Json
          phone: string
          social_links: Json
          updated_at: string
        }
        Insert: {
          address: string
          allow_same_day_booking?: boolean
          calendar_render_days?: number
          clinic_name?: string
          email: string
          id?: string
          is_booking_open?: boolean
          is_singleton?: boolean
          maintenance_message?: string | null
          max_reschedules?: number
          operating_hours: Json
          phone: string
          social_links?: Json
          updated_at?: string
        }
        Update: {
          address?: string
          allow_same_day_booking?: boolean
          calendar_render_days?: number
          clinic_name?: string
          email?: string
          id?: string
          is_booking_open?: boolean
          is_singleton?: boolean
          maintenance_message?: string | null
          max_reschedules?: number
          operating_hours?: Json
          phone?: string
          social_links?: Json
          updated_at?: string
        }
        Relationships: []
      }
      dependents: {
        Row: {
          created_at: string
          date_of_birth: string
          first_name: string
          id: string
          last_name: string
          middle_name: string | null
          patient_id: string
          relationship: Database["public"]["Enums"]["dependent_relationship"]
          suffix: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          first_name: string
          id?: string
          last_name: string
          middle_name?: string | null
          patient_id: string
          relationship?: Database["public"]["Enums"]["dependent_relationship"]
          suffix?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          first_name?: string
          id?: string
          last_name?: string
          middle_name?: string | null
          patient_id?: string
          relationship?: Database["public"]["Enums"]["dependent_relationship"]
          suffix?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_schedules: {
        Row: {
          break_end_time: string | null
          break_start_time: string | null
          created_at: string
          day_of_week: number
          doctor_id: string
          end_time: string | null
          id: string
          is_custom: boolean
          is_open: boolean
          start_time: string | null
          updated_at: string
        }
        Insert: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string
          day_of_week: number
          doctor_id: string
          end_time?: string | null
          id?: string
          is_custom?: boolean
          is_open?: boolean
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string
          day_of_week?: number
          doctor_id?: string
          end_time?: string | null
          id?: string
          is_custom?: boolean
          is_open?: boolean
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_services: {
        Row: {
          doctor_id: string
          service_id: string
        }
        Insert: {
          doctor_id: string
          service_id: string
        }
        Update: {
          doctor_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_services_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          appointment_id: string
          created_at: string
          discount_applied: number
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id: string
          created_at?: string
          discount_applied?: number
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string
          created_at?: string
          discount_applied?: number
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price: number | null
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean
          name: string
          price?: number | null
          service_type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number | null
          service_type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Relationships: []
      }
      time_blocks: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          doctor_id: string | null
          end_time: string
          id: string
          reason: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          doctor_id?: string | null
          end_time: string
          id?: string
          reason: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          doctor_id?: string | null
          end_time?: string
          id?: string
          reason?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_blocks_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          cancel_count: number
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          middle_name: string | null
          no_show_count: number
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          suffix: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cancel_count?: number
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name: string
          id: string
          is_active?: boolean
          last_name: string
          middle_name?: string | null
          no_show_count?: number
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          suffix?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cancel_count?: number
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          middle_name?: string | null
          no_show_count?: number
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          suffix?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_status:
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "CANCELLED"
        | "RESCHEDULE_REQUESTED"
        | "DISPLACED"
        | "CHECKED_IN"
        | "TREATMENT_RENDERED"
        | "COMPLETED"
        | "NO_SHOW"
      dependent_relationship:
        | "CHILD"
        | "SPOUSE"
        | "PARENT"
        | "SIBLING"
        | "OTHER"
      invoice_status: "DRAFT" | "FINALIZED" | "PAID" | "VOID"
      payment_method: "CASH" | "CARD" | "HMO"
      service_type: "GENERAL" | "SPECIALIZED"
      user_role: "PATIENT" | "SECRETARY" | "DOCTOR" | "ADMIN"
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
      appointment_status: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
        "RESCHEDULE_REQUESTED",
        "DISPLACED",
        "CHECKED_IN",
        "TREATMENT_RENDERED",
        "COMPLETED",
        "NO_SHOW",
      ],
      dependent_relationship: ["CHILD", "SPOUSE", "PARENT", "SIBLING", "OTHER"],
      invoice_status: ["DRAFT", "FINALIZED", "PAID", "VOID"],
      payment_method: ["CASH", "CARD", "HMO"],
      service_type: ["GENERAL", "SPECIALIZED"],
      user_role: ["PATIENT", "SECRETARY", "DOCTOR", "ADMIN"],
    },
  },
} as const
