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
      business_managers: {
        Row: {
          access_token: string
          ad_account_id: string
          ad_account_name: string
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
          ad_account_id: string
          ad_account_name: string
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
          ad_account_id?: string
          ad_account_name?: string
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
      campaigns: {
        Row: {
          ad_id: string
          ad_name: string
          adset_id: string
          adset_name: string
          amount_spent: number
          bm: string
          body_rate: number | null
          campaign_id: string
          campaign_name: string
          clicks: number | null
          cost_per_click: number | null
          cost_per_mille: number | null
          created_at: string
          creative_name: string | null
          cta_rate: number | null
          ctr: number | null
          date_reported: string
          frequency: number | null
          hook_rate: number | null
          id: string
          impressions: number | null
          link_clicks: number | null
          ph_hook_rate: number | null
          reach: number | null
          updated_at: string
          views_3s: number | null
          views_75_percent: number | null
          views_total: number | null
        }
        Insert: {
          ad_id: string
          ad_name: string
          adset_id: string
          adset_name: string
          amount_spent?: number
          bm: string
          body_rate?: number | null
          campaign_id: string
          campaign_name: string
          clicks?: number | null
          cost_per_click?: number | null
          cost_per_mille?: number | null
          created_at?: string
          creative_name?: string | null
          cta_rate?: number | null
          ctr?: number | null
          date_reported: string
          frequency?: number | null
          hook_rate?: number | null
          id?: string
          impressions?: number | null
          link_clicks?: number | null
          ph_hook_rate?: number | null
          reach?: number | null
          updated_at?: string
          views_3s?: number | null
          views_75_percent?: number | null
          views_total?: number | null
        }
        Update: {
          ad_id?: string
          ad_name?: string
          adset_id?: string
          adset_name?: string
          amount_spent?: number
          bm?: string
          body_rate?: number | null
          campaign_id?: string
          campaign_name?: string
          clicks?: number | null
          cost_per_click?: number | null
          cost_per_mille?: number | null
          created_at?: string
          creative_name?: string | null
          cta_rate?: number | null
          ctr?: number | null
          date_reported?: string
          frequency?: number | null
          hook_rate?: number | null
          id?: string
          impressions?: number | null
          link_clicks?: number | null
          ph_hook_rate?: number | null
          reach?: number | null
          updated_at?: string
          views_3s?: number | null
          views_75_percent?: number | null
          views_total?: number | null
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
          commission_value: number | null
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
          produto: string | null
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
          commission_value?: number | null
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
          produto?: string | null
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
          commission_value?: number | null
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
          produto?: string | null
          sale_date?: string | null
          state?: string | null
          status?: string
          tags?: string[] | null
          tax_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          status: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          status?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          ad_id: string
          ad_name: string
          affiliate_commission: number | null
          cart_discount: number | null
          commission_cartpanda: number | null
          conversion_value: number | null
          country: string | null
          created_at: string
          creative_name: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          discount_percentage: number | null
          gross_value: number | null
          id: string
          net_value_with_discounts: number | null
          order_id: string
          payment_method: string
          profit_margin: number | null
          sale_date: string
          state: string | null
          status: string
          tax_value: number | null
          total_value_with_taxes: number | null
          updated_at: string
          value: number
        }
        Insert: {
          ad_id: string
          ad_name: string
          affiliate_commission?: number | null
          cart_discount?: number | null
          commission_cartpanda?: number | null
          conversion_value?: number | null
          country?: string | null
          created_at?: string
          creative_name?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          discount_percentage?: number | null
          gross_value?: number | null
          id?: string
          net_value_with_discounts?: number | null
          order_id: string
          payment_method: string
          profit_margin?: number | null
          sale_date: string
          state?: string | null
          status: string
          tax_value?: number | null
          total_value_with_taxes?: number | null
          updated_at?: string
          value: number
        }
        Update: {
          ad_id?: string
          ad_name?: string
          affiliate_commission?: number | null
          cart_discount?: number | null
          commission_cartpanda?: number | null
          conversion_value?: number | null
          country?: string | null
          created_at?: string
          creative_name?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount_percentage?: number | null
          gross_value?: number | null
          id?: string
          net_value_with_discounts?: number | null
          order_id?: string
          payment_method?: string
          profit_margin?: number | null
          sale_date?: string
          state?: string | null
          status?: string
          tax_value?: number | null
          total_value_with_taxes?: number | null
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          ad_id: string | null
          billing_cycle: number | null
          campaign_name: string | null
          country: string | null
          created_at: string
          creative_name: string | null
          customer_email: string | null
          customer_id: string
          customer_name: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["subscription_event_type"]
          id: string
          metadata: Json | null
          payment_method: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          state: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          value: number
        }
        Insert: {
          ad_id?: string | null
          billing_cycle?: number | null
          campaign_name?: string | null
          country?: string | null
          created_at?: string
          creative_name?: string | null
          customer_email?: string | null
          customer_id: string
          customer_name?: string | null
          event_date?: string
          event_type: Database["public"]["Enums"]["subscription_event_type"]
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          state?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          value?: number
        }
        Update: {
          ad_id?: string | null
          billing_cycle?: number | null
          campaign_name?: string | null
          country?: string | null
          created_at?: string
          creative_name?: string | null
          customer_email?: string | null
          customer_id?: string
          customer_name?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["subscription_event_type"]
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          state?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          value?: number
        }
        Relationships: []
      }
      user_chart_permissions: {
        Row: {
          can_view: boolean | null
          chart_type: Database["public"]["Enums"]["chart_type"]
          created_at: string | null
          id: string
          page: Database["public"]["Enums"]["user_page"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_view?: boolean | null
          chart_type?: Database["public"]["Enums"]["chart_type"]
          created_at?: string | null
          id?: string
          page?: Database["public"]["Enums"]["user_page"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_view?: boolean | null
          chart_type?: Database["public"]["Enums"]["chart_type"]
          created_at?: string | null
          id?: string
          page?: Database["public"]["Enums"]["user_page"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_chart_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_page_permissions: {
        Row: {
          can_access: boolean | null
          created_at: string | null
          id: string
          page: Database["public"]["Enums"]["user_page"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          page?: Database["public"]["Enums"]["user_page"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          page?: Database["public"]["Enums"]["user_page"]
          updated_at?: string | null
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
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      creative_performance_analysis: {
        Row: {
          ad_id: string | null
          adset_name: string | null
          avg_body_rate: number | null
          avg_cta_rate: number | null
          avg_ctr: number | null
          avg_hook_rate: number | null
          avg_order_value: number | null
          avg_ph_hook_rate: number | null
          bm: string | null
          campaign_name: string | null
          chargeback_orders: number | null
          chargeback_rate: number | null
          click_through_rate: number | null
          completed_orders: number | null
          conversion_rate: number | null
          cpa: number | null
          creative_name: string | null
          date_reported: string | null
          profit: number | null
          refunded_orders: number | null
          roas: number | null
          roi_percentage: number | null
          total_cartpanda_commission: number | null
          total_clicks: number | null
          total_commissions: number | null
          total_discounts: number | null
          total_impressions: number | null
          total_orders: number | null
          total_revenue: number | null
          total_spent: number | null
          total_views_3s: number | null
          total_views_75_percent: number | null
          total_views_total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_manage_users: {
        Args: { _target_user_id?: string }
        Returns: boolean
      }
      format_date_br: {
        Args: { input_date: string }
        Returns: string
      }
      format_timestamp_br: {
        Args: { input_timestamp: string }
        Returns: string
      }
      get_creative_performance_by_period: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          ad_id: string
          creative_name: string
          campaign_name: string
          adset_name: string
          bm: string
          date_reported: string
          total_spent: number
          total_views_3s: number
          total_views_75_percent: number
          total_views_total: number
          total_impressions: number
          total_clicks: number
          avg_ph_hook_rate: number
          avg_hook_rate: number
          avg_body_rate: number
          avg_cta_rate: number
          avg_ctr: number
          total_orders: number
          completed_orders: number
          chargeback_orders: number
          refunded_orders: number
          total_revenue: number
          total_commissions: number
          total_discounts: number
          total_cartpanda_commission: number
          avg_order_value: number
          cpa: number
          profit: number
          roi_percentage: number
          roas: number
          conversion_rate: number
          chargeback_rate: number
          click_through_rate: number
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      to_brazil_timezone: {
        Args: { input_timestamp: string }
        Returns: string
      }
    }
    Enums: {
      chart_permission:
        | "creative_timeline"
        | "creative_performance_chart"
        | "creative_summary_cards"
        | "creative_table"
        | "creative_top_5_revenue"
        | "creative_top_5_roi"
        | "creative_pie_chart"
        | "creative_bar_chart"
        | "sales_timeline"
        | "sales_investment_vs_revenue"
        | "sales_summary_cards"
        | "sales_table"
        | "sales_top_5_revenue"
        | "sales_top_5_roi"
        | "sales_pie_chart"
        | "sales_bar_chart"
        | "affiliate_timeline"
        | "affiliate_performance_chart"
        | "affiliate_summary_cards"
        | "affiliate_table"
        | "affiliate_top_5_revenue"
        | "affiliate_top_5_roi"
        | "affiliate_pie_chart"
        | "affiliate_bar_chart"
        | "revenue_timeline"
        | "revenue_investment_vs_revenue"
        | "revenue_summary_cards"
        | "revenue_table"
        | "revenue_top_5_revenue"
        | "revenue_top_5_roi"
        | "revenue_pie_chart"
        | "revenue_bar_chart"
      chart_type:
        | "performance_overview"
        | "time_series"
        | "top_creatives"
        | "metrics_comparison"
        | "conversion_funnel"
        | "roi_analysis"
        | "sales_summary"
        | "affiliate_performance"
        | "revenue_breakdown"
        | "summary_cards"
        | "metrics_overview"
        | "sales_chart"
        | "creatives_sales_chart"
        | "state_sales_chart"
        | "affiliate_chart"
      subscription_event_type: "subscription" | "cancellation"
      subscription_plan: "basic" | "premium" | "enterprise"
      subscription_status: "active" | "cancelled" | "expired"
      user_page:
        | "creatives"
        | "sales"
        | "affiliates"
        | "revenue"
        | "users"
        | "subscriptions"
      user_role: "admin" | "user" | "gestor"
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
      chart_permission: [
        "creative_timeline",
        "creative_performance_chart",
        "creative_summary_cards",
        "creative_table",
        "creative_top_5_revenue",
        "creative_top_5_roi",
        "creative_pie_chart",
        "creative_bar_chart",
        "sales_timeline",
        "sales_investment_vs_revenue",
        "sales_summary_cards",
        "sales_table",
        "sales_top_5_revenue",
        "sales_top_5_roi",
        "sales_pie_chart",
        "sales_bar_chart",
        "affiliate_timeline",
        "affiliate_performance_chart",
        "affiliate_summary_cards",
        "affiliate_table",
        "affiliate_top_5_revenue",
        "affiliate_top_5_roi",
        "affiliate_pie_chart",
        "affiliate_bar_chart",
        "revenue_timeline",
        "revenue_investment_vs_revenue",
        "revenue_summary_cards",
        "revenue_table",
        "revenue_top_5_revenue",
        "revenue_top_5_roi",
        "revenue_pie_chart",
        "revenue_bar_chart",
      ],
      chart_type: [
        "performance_overview",
        "time_series",
        "top_creatives",
        "metrics_comparison",
        "conversion_funnel",
        "roi_analysis",
        "sales_summary",
        "affiliate_performance",
        "revenue_breakdown",
        "summary_cards",
        "metrics_overview",
        "sales_chart",
        "creatives_sales_chart",
        "state_sales_chart",
        "affiliate_chart",
      ],
      subscription_event_type: ["subscription", "cancellation"],
      subscription_plan: ["basic", "premium", "enterprise"],
      subscription_status: ["active", "cancelled", "expired"],
      user_page: [
        "creatives",
        "sales",
        "affiliates",
        "revenue",
        "users",
        "subscriptions",
      ],
      user_role: ["admin", "user", "gestor"],
    },
  },
} as const
