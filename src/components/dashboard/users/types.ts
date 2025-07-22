
import { ChartType } from '@/hooks/useChartPermissions';

export interface UserWithPermissions {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
  role: "admin" | "user" | "business_manager";
  permissions: {
    page: "creatives" | "sales" | "affiliates" | "revenue" | "users" | "business-managers" | "subscriptions" | "kpis" | "charts" | "tables" | "exports" | "ai-agents" | "performance";
    can_access: boolean;
  }[];
  user_page_permissions: {
    page: "creatives" | "sales" | "affiliates" | "revenue" | "users" | "business-managers" | "subscriptions" | "kpis" | "charts" | "tables" | "exports" | "ai-agents" | "performance";
    can_access: boolean;
  }[];
  user_chart_permissions: {
    chart_type: ChartType;
    can_access: boolean;
  }[];
}
