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
      agent_configurations: {
        Row: {
          agent_description: string | null
          agent_name: string
          created_at: string
          default_language: string
          id: string | null
          training_data_payload: Json | null
          updated_at: string
          user_id: string | null
          voice_tone: string
        }
        Insert: {
          agent_description?: string | null
          agent_name?: string
          created_at?: string
          default_language?: string
          id?: string | null
          training_data_payload?: Json | null
          updated_at?: string
          user_id?: string | null
          voice_tone?: string
        }
        Update: {
          agent_description?: string | null
          agent_name?: string
          created_at?: string
          default_language?: string
          id?: string | null
          training_data_payload?: Json | null
          updated_at?: string
          user_id?: string | null
          voice_tone?: string
        }
        Relationships: []
      }
      agent_conversations: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["agent_conversation_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["agent_conversation_status"]
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["agent_conversation_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["agent_message_role"]
          webhook_response: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["agent_message_role"]
          webhook_response?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["agent_message_role"]
          webhook_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_training_data: {
        Row: {
          created_at: string
          data_type: string
          description: string | null
          file_content: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          link_description: string | null
          link_title: string | null
          link_url: string | null
          manual_prompt: string | null
          metadata: Json | null
          status: string
          tab_name: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_type: string
          description?: string | null
          file_content?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          link_description?: string | null
          link_title?: string | null
          link_url?: string | null
          manual_prompt?: string | null
          metadata?: Json | null
          status?: string
          tab_name: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_type?: string
          description?: string | null
          file_content?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          link_description?: string | null
          link_title?: string | null
          link_url?: string | null
          manual_prompt?: string | null
          metadata?: Json | null
          status?: string
          tab_name?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          performed_at: string | null
          performed_by: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      business_manager_accounts: {
        Row: {
          access_token: string
          ad_account_id: string | null
          ad_account_name: string | null
          app_id: string | null
          app_secret: string | null
          bm_name: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          ad_account_id?: string | null
          ad_account_name?: string | null
          app_id?: string | null
          app_secret?: string | null
          bm_name: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          ad_account_id?: string | null
          ad_account_name?: string | null
          app_id?: string | null
          app_secret?: string | null
          bm_name?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creative_insights: {
        Row: {
          ad_id: string | null
          adset_name: string | null
          amount_spent: number | null
          body_rate: number | null
          campaign_id: string | null
          campaign_name: string | null
          clicks: number | null
          cost_per_click: number | null
          cost_per_mille: number | null
          created_at: string | null
          creative_name: string
          cta_rate: number | null
          ctr: number | null
          date_reported: string | null
          hook_rate: number | null
          id: string
          impressions: number | null
          ph_hook_rate: number | null
          status: string | null
          updated_at: string | null
          views_3s: number | null
          views_75_percent: number | null
          views_total: number | null
        }
        Insert: {
          ad_id?: string | null
          adset_name?: string | null
          amount_spent?: number | null
          body_rate?: number | null
          campaign_id?: string | null
          campaign_name?: string | null
          clicks?: number | null
          cost_per_click?: number | null
          cost_per_mille?: number | null
          created_at?: string | null
          creative_name: string
          cta_rate?: number | null
          ctr?: number | null
          date_reported?: string | null
          hook_rate?: number | null
          id?: string
          impressions?: number | null
          ph_hook_rate?: number | null
          status?: string | null
          updated_at?: string | null
          views_3s?: number | null
          views_75_percent?: number | null
          views_total?: number | null
        }
        Update: {
          ad_id?: string | null
          adset_name?: string | null
          amount_spent?: number | null
          body_rate?: number | null
          campaign_id?: string | null
          campaign_name?: string | null
          clicks?: number | null
          cost_per_click?: number | null
          cost_per_mille?: number | null
          created_at?: string | null
          creative_name?: string
          cta_rate?: number | null
          ctr?: number | null
          date_reported?: string | null
          hook_rate?: number | null
          id?: string
          impressions?: number | null
          ph_hook_rate?: number | null
          status?: string | null
          updated_at?: string | null
          views_3s?: number | null
          views_75_percent?: number | null
          views_total?: number | null
        }
        Relationships: []
      }
      creative_sales: {
        Row: {
          affiliate_commission: number | null
          affiliate_id: string | null
          affiliate_name: string | null
          comission_value_coprodutor: number | null
          commission_value_produtor: number | null
          country: string | null
          created_at: string | null
          creative_name: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_value: number | null
          gross_value: number | null
          id: string
          is_affiliate: boolean | null
          net_value: number | null
          order_id: string
          payment_method: string
          sale_date: string | null
          state: string | null
          status: string
          tags: string[] | null
          tax_value: number | null
          updated_at: string | null
        }
        Insert: {
          affiliate_commission?: number | null
          affiliate_id?: string | null
          affiliate_name?: string | null
          comission_value_coprodutor?: number | null
          commission_value_produtor?: number | null
          country?: string | null
          created_at?: string | null
          creative_name: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_value?: number | null
          gross_value?: number | null
          id?: string
          is_affiliate?: boolean | null
          net_value?: number | null
          order_id: string
          payment_method: string
          sale_date?: string | null
          state?: string | null
          status?: string
          tags?: string[] | null
          tax_value?: number | null
          updated_at?: string | null
        }
        Update: {
          affiliate_commission?: number | null
          affiliate_id?: string | null
          affiliate_name?: string | null
          comission_value_coprodutor?: number | null
          commission_value_produtor?: number | null
          country?: string | null
          created_at?: string | null
          creative_name?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_value?: number | null
          gross_value?: number | null
          id?: string
          is_affiliate?: boolean | null
          net_value?: number | null
          order_id?: string
          payment_method?: string
          sale_date?: string | null
          state?: string | null
          status?: string
          tags?: string[] | null
          tax_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      estrutura_invisivel: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          conteudo: string
          created_at: string | null
          embedding: string | null
          fonte: string | null
          id: string
          nicho: string | null
          nivel_persuasao: number | null
          publico_alvo: string | null
          tags: string[] | null
          taxa_conversao: number | null
          tipo_estrutura: string | null
          titulo: string
          tom: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          conteudo: string
          created_at?: string | null
          embedding?: string | null
          fonte?: string | null
          id?: string
          nicho?: string | null
          nivel_persuasao?: number | null
          publico_alvo?: string | null
          tags?: string[] | null
          taxa_conversao?: number | null
          tipo_estrutura?: string | null
          titulo: string
          tom?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          conteudo?: string
          created_at?: string | null
          embedding?: string | null
          fonte?: string | null
          id?: string
          nicho?: string | null
          nivel_persuasao?: number | null
          publico_alvo?: string | null
          tags?: string[] | null
          taxa_conversao?: number | null
          tipo_estrutura?: string | null
          titulo?: string
          tom?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_sales: {
        Row: {
          created_at: string
          id: string
          is_subscription: boolean | null
          order_id: string
          product_id: string
          product_name: string
          sale_date: string
          sale_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_subscription?: boolean | null
          order_id: string
          product_id: string
          product_name: string
          sale_date?: string
          sale_value?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_subscription?: boolean | null
          order_id?: string
          product_id?: string
          product_name?: string
          sale_date?: string
          sale_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          amount: number
          cartpanda_event_id: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_id: string
          customer_name: string | null
          event_date: string
          event_type: string
          frequency: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          plan: string
          subscription_id: string
          subscription_number: number | null
          updated_at: string
        }
        Insert: {
          amount?: number
          cartpanda_event_id?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_id: string
          customer_name?: string | null
          event_date?: string
          event_type: string
          frequency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan: string
          subscription_id: string
          subscription_number?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cartpanda_event_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_id?: string
          customer_name?: string | null
          event_date?: string
          event_type?: string
          frequency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan?: string
          subscription_id?: string
          subscription_number?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_renewals: {
        Row: {
          amount: number
          canceled_at: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          frequency: string | null
          id: string
          plan: string
          subscription_id: string | null
          subscription_number: number | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          canceled_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          frequency?: string | null
          id?: string
          plan: string
          subscription_id?: string | null
          subscription_number?: number | null
          subscription_status: string
          updated_at?: string
        }
        Update: {
          amount?: number
          canceled_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          frequency?: string | null
          id?: string
          plan?: string
          subscription_id?: string | null
          subscription_number?: number | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_status: {
        Row: {
          amount: number
          canceled_at: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          frequency: string | null
          id: string
          plan: string
          subscription_id: string | null
          subscription_number: number | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          canceled_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          frequency?: string | null
          id?: string
          plan: string
          subscription_id?: string | null
          subscription_number?: number | null
          subscription_status: string
          updated_at?: string
        }
        Update: {
          amount?: number
          canceled_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          frequency?: string | null
          id?: string
          plan?: string
          subscription_id?: string | null
          subscription_number?: number | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_chart_permissions: {
        Row: {
          can_access: boolean
          chart_type: Database["public"]["Enums"]["chart_type"]
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          can_access?: boolean
          chart_type: Database["public"]["Enums"]["chart_type"]
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          can_access?: boolean
          chart_type?: Database["public"]["Enums"]["chart_type"]
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_page_permissions: {
        Row: {
          can_access: boolean | null
          id: string
          page: Database["public"]["Enums"]["user_page"]
          user_id: string
        }
        Insert: {
          can_access?: boolean | null
          id?: string
          page: Database["public"]["Enums"]["user_page"]
          user_id: string
        }
        Update: {
          can_access?: boolean | null
          id?: string
          page?: Database["public"]["Enums"]["user_page"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_page_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_role: {
        Args: { user_email: string }
        Returns: undefined
      }
      assign_default_chart_permissions: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      can_access_sales_data: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      diagnose_invisible_structure_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          issue_type: string
          count_affected: number
          details: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_subscription_kpis: {
        Args: { start_date: string; end_date: string }
        Returns: {
          active_subs: number
          new_subs: number
          mrr: number
          churn_rate: number
          avg_ltv: number
          retention_30d: number
          delta_active: number
          delta_new: number
          delta_mrr: number
          delta_churn: number
          delta_ltv: number
          delta_retention: number
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      rpc_get_revenue: {
        Args: { start_ts: string; end_ts: string }
        Returns: number
      }
      rpc_top_creatives_by_revenue: {
        Args: { start_ts: string; end_ts: string }
        Returns: {
          creative: string
          revenue: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      user_has_page_access: {
        Args: { page_name: Database["public"]["Enums"]["user_page"] }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      agent_conversation_status: "active" | "archived"
      agent_message_role: "user" | "assistant"
      app_role: "admin" | "user" | "business_manager"
      chart_type:
        | "kpi_total_investido"
        | "kpi_receita"
        | "kpi_ticket_medio"
        | "kpi_total_pedidos"
        | "creative_performance_chart"
        | "creative_sales_chart"
        | "sales_summary_cards"
        | "sales_chart"
        | "country_sales_chart"
        | "state_sales_chart"
        | "affiliate_chart"
        | "subscription_renewals_chart"
        | "subscription_status_chart"
        | "new_subscribers_chart"
      subscription_event_type:
        | "subscription"
        | "cancellation"
        | "upgrade"
        | "downgrade"
      subscription_plan: "basic" | "premium" | "enterprise"
      training_data_status: "pending" | "processing" | "completed" | "failed"
      user_page:
        | "creatives"
        | "sales"
        | "affiliates"
        | "revenue"
        | "users"
        | "business-managers"
        | "subscriptions"
        | "kpis"
        | "charts"
        | "tables"
        | "exports"
        | "ai-agents"
        | "performance"
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
      agent_conversation_status: ["active", "archived"],
      agent_message_role: ["user", "assistant"],
      app_role: ["admin", "user", "business_manager"],
      chart_type: [
        "kpi_total_investido",
        "kpi_receita",
        "kpi_ticket_medio",
        "kpi_total_pedidos",
        "creative_performance_chart",
        "creative_sales_chart",
        "sales_summary_cards",
        "sales_chart",
        "country_sales_chart",
        "state_sales_chart",
        "affiliate_chart",
        "subscription_renewals_chart",
        "subscription_status_chart",
        "new_subscribers_chart",
      ],
      subscription_event_type: [
        "subscription",
        "cancellation",
        "upgrade",
        "downgrade",
      ],
      subscription_plan: ["basic", "premium", "enterprise"],
      training_data_status: ["pending", "processing", "completed", "failed"],
      user_page: [
        "creatives",
        "sales",
        "affiliates",
        "revenue",
        "users",
        "business-managers",
        "subscriptions",
        "kpis",
        "charts",
        "tables",
        "exports",
        "ai-agents",
        "performance",
      ],
    },
  },
} as const
