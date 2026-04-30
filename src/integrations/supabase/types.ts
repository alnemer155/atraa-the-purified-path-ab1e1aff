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
          juz_number: number
          khatma_id: string
          reader_name: string | null
          reader_token: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          juz_number: number
          khatma_id: string
          reader_name?: string | null
          reader_token: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
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
