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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_duas: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          sect: string
          source: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          sect: string
          source?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          sect?: string
          source?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_qasaid: {
        Row: {
          audio_path: string | null
          category: string
          cover_path: string | null
          created_at: string
          details: string | null
          duration_seconds: number | null
          id: string
          reciter: string
          share_code: string | null
          title: string
          updated_at: string
          video_path: string | null
          youtube_url: string | null
        }
        Insert: {
          audio_path?: string | null
          category?: string
          cover_path?: string | null
          created_at?: string
          details?: string | null
          duration_seconds?: number | null
          id?: string
          reciter: string
          share_code?: string | null
          title: string
          updated_at?: string
          video_path?: string | null
          youtube_url?: string | null
        }
        Update: {
          audio_path?: string | null
          category?: string
          cover_path?: string | null
          created_at?: string
          details?: string | null
          duration_seconds?: number | null
          id?: string
          reciter?: string
          share_code?: string | null
          title?: string
          updated_at?: string
          video_path?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      admin_wallpapers: {
        Row: {
          created_at: string
          id: string
          name: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          storage_path?: string
        }
        Relationships: []
      }
      athar_quotes: {
        Row: {
          created_at: string
          id: string
          interpretation: string | null
          sayer: string
          sayer_info: string | null
          sect: string
          source: string | null
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          interpretation?: string | null
          sayer: string
          sayer_info?: string | null
          sect?: string
          source?: string | null
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          interpretation?: string | null
          sayer?: string
          sayer_info?: string | null
          sect?: string
          source?: string | null
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          level: string
          message: string
          resolved: boolean
          stack: string | null
          url: string | null
          user_agent: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          level?: string
          message: string
          resolved?: boolean
          stack?: string | null
          url?: string | null
          user_agent?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          level?: string
          message?: string
          resolved?: boolean
          stack?: string | null
          url?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      hidden_sections: {
        Row: {
          hidden: boolean
          id: string
          label: string
          updated_at: string
        }
        Insert: {
          hidden?: boolean
          id: string
          label: string
          updated_at?: string
        }
        Update: {
          hidden?: boolean
          id?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          display_amount_sar: number | null
          environment: string
          id: string
          invoice_number: string
          metadata: Json | null
          paddle_customer_id: string | null
          paddle_transaction_id: string | null
          paid_at: string | null
          price_id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          display_amount_sar?: number | null
          environment?: string
          id?: string
          invoice_number: string
          metadata?: Json | null
          paddle_customer_id?: string | null
          paddle_transaction_id?: string | null
          paid_at?: string | null
          price_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          display_amount_sar?: number | null
          environment?: string
          id?: string
          invoice_number?: string
          metadata?: Json | null
          paddle_customer_id?: string | null
          paddle_transaction_id?: string | null
          paid_at?: string | null
          price_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      khatma_juz_claims: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          is_private: boolean
          juz_number: number
          khatma_id: string
          reader_name: string | null
          reader_token: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          is_private?: boolean
          juz_number: number
          khatma_id: string
          reader_name?: string | null
          reader_token: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          is_private?: boolean
          juz_number?: number
          khatma_id?: string
          reader_name?: string | null
          reader_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "khatma_juz_claims_khatma_id_fkey"
            columns: ["khatma_id"]
            isOneToOne: false
            referencedRelation: "khatmas"
            referencedColumns: ["id"]
          },
        ]
      }
      khatma_recitations: {
        Row: {
          created_at: string
          id: string
          is_private: boolean
          khatma_id: string
          reader_name: string | null
          reader_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_private?: boolean
          khatma_id: string
          reader_name?: string | null
          reader_token: string
        }
        Update: {
          created_at?: string
          id?: string
          is_private?: boolean
          khatma_id?: string
          reader_name?: string | null
          reader_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "khatma_recitations_khatma_id_fkey"
            columns: ["khatma_id"]
            isOneToOne: false
            referencedRelation: "khatmas"
            referencedColumns: ["id"]
          },
        ]
      }
      khatmas: {
        Row: {
          completed_juz_count: number
          created_at: string
          creator_token: string | null
          dedication: string | null
          expires_at: string | null
          id: string
          is_published: boolean
          mode: string
          recitations_count: number
          short_code: string | null
          slug: string
          surah_name: string | null
          surah_number: number | null
          title: string
          updated_at: string
          verified_at: string | null
          visibility: string
        }
        Insert: {
          completed_juz_count?: number
          created_at?: string
          creator_token?: string | null
          dedication?: string | null
          expires_at?: string | null
          id?: string
          is_published?: boolean
          mode?: string
          recitations_count?: number
          short_code?: string | null
          slug?: string
          surah_name?: string | null
          surah_number?: number | null
          title: string
          updated_at?: string
          verified_at?: string | null
          visibility?: string
        }
        Update: {
          completed_juz_count?: number
          created_at?: string
          creator_token?: string | null
          dedication?: string | null
          expires_at?: string | null
          id?: string
          is_published?: boolean
          mode?: string
          recitations_count?: number
          short_code?: string | null
          slug?: string
          surah_name?: string | null
          surah_number?: number | null
          title?: string
          updated_at?: string
          verified_at?: string | null
          visibility?: string
        }
        Relationships: []
      }
      qasida_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          qasida_id: string
          visitor_name: string
          visitor_token: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          qasida_id: string
          visitor_name: string
          visitor_token?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          qasida_id?: string
          visitor_name?: string
          visitor_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qasida_comments_qasida_id_fkey"
            columns: ["qasida_id"]
            isOneToOne: false
            referencedRelation: "admin_qasaid"
            referencedColumns: ["id"]
          },
        ]
      }
      qasida_likes: {
        Row: {
          created_at: string
          id: string
          qasida_id: string
          visitor_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          qasida_id: string
          visitor_token: string
        }
        Update: {
          created_at?: string
          id?: string
          qasida_id?: string
          visitor_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "qasida_likes_qasida_id_fkey"
            columns: ["qasida_id"]
            isOneToOne: false
            referencedRelation: "admin_qasaid"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          maintenance_active: boolean
          maintenance_message: string
          maintenance_until: string | null
          quran_pause_message: string
          quran_paused: boolean
          quran_resume_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          maintenance_active?: boolean
          maintenance_message?: string
          maintenance_until?: string | null
          quran_pause_message?: string
          quran_paused?: boolean
          quran_resume_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          maintenance_active?: boolean
          maintenance_message?: string
          maintenance_until?: string | null
          quran_pause_message?: string
          quran_paused?: boolean
          quran_resume_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_codes: {
        Row: {
          code: string
          created_at: string
          duration_days: number
          id: string
          note: string | null
          redeemed_at: string | null
          redeemed_by: string | null
          tier: string
        }
        Insert: {
          code: string
          created_at?: string
          duration_days?: number
          id?: string
          note?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          tier?: string
        }
        Update: {
          code?: string
          created_at?: string
          duration_days?: number
          id?: string
          note?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          tier?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
