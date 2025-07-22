-- Criar enum para tipos de gráficos/charts
CREATE TYPE chart_type AS ENUM (
    'kpi_total_investido',
    'kpi_receita', 
    'kpi_ticket_medio',
    'kpi_total_pedidos',
    'creative_performance_chart',
    'creative_sales_chart',
    'sales_summary_cards',
    'sales_chart',
    'country_sales_chart',
    'state_sales_chart',
    'affiliate_chart',
    'subscription_renewals_chart',
    'subscription_status_chart',
    'new_subscribers_chart'
);

-- Atualizar enum user_page para incluir ai-agents e performance
ALTER TYPE user_page ADD VALUE IF NOT EXISTS 'ai-agents';
ALTER TYPE user_page ADD VALUE IF NOT EXISTS 'performance';

-- Adicionar coluna is_active na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

-- Criar tabela de permissões de gráficos
CREATE TABLE IF NOT EXISTS user_chart_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chart_type chart_type NOT NULL,
    can_access BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
    UNIQUE(user_id, chart_type)
);

-- Habilitar RLS na tabela user_chart_permissions
ALTER TABLE user_chart_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_chart_permissions
CREATE POLICY "Users can view their own chart permissions" 
ON user_chart_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all chart permissions" 
ON user_chart_permissions 
FOR ALL 
USING (get_current_user_role() = 'admin'::app_role);

-- Função para atribuir permissões padrão de charts
CREATE OR REPLACE FUNCTION assign_default_chart_permissions(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_chart_permissions (user_id, chart_type, can_access)
    VALUES 
        (user_id_param, 'kpi_total_investido', false),
        (user_id_param, 'kpi_receita', false),
        (user_id_param, 'kpi_ticket_medio', false),
        (user_id_param, 'kpi_total_pedidos', false),
        (user_id_param, 'creative_performance_chart', false),
        (user_id_param, 'creative_sales_chart', false),
        (user_id_param, 'sales_summary_cards', false),
        (user_id_param, 'sales_chart', false),
        (user_id_param, 'country_sales_chart', false),
        (user_id_param, 'state_sales_chart', false),
        (user_id_param, 'affiliate_chart', false),
        (user_id_param, 'subscription_renewals_chart', false),
        (user_id_param, 'subscription_status_chart', false),
        (user_id_param, 'new_subscribers_chart', false)
    ON CONFLICT (user_id, chart_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar função handle_new_user para incluir novas páginas e permissões de gráficos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar perfil
    INSERT INTO public.profiles (id, full_name, email, username, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        false
    );
    
    -- Atribuir role padrão
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    -- Permissões padrão de páginas
    INSERT INTO public.user_page_permissions (user_id, page, can_access)
    VALUES 
        (NEW.id, 'creatives', false),
        (NEW.id, 'sales', false),
        (NEW.id, 'affiliates', false),
        (NEW.id, 'revenue', false),
        (NEW.id, 'users', false),
        (NEW.id, 'business-managers', false),
        (NEW.id, 'subscriptions', false),
        (NEW.id, 'kpis', true),
        (NEW.id, 'charts', true),
        (NEW.id, 'tables', false),
        (NEW.id, 'exports', false)
    ON CONFLICT (user_id, page) DO NOTHING;
    
    -- Atribuir permissões padrão de charts
    PERFORM assign_default_chart_permissions(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atribuir permissões de gráficos para usuários existentes
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM auth.users LOOP
        PERFORM assign_default_chart_permissions(user_record.id);
    END LOOP;
END $$;

-- Garantir que as novas páginas existam para usuários existentes
INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT ur.user_id, 'kpis'::user_page, true
FROM user_roles ur
WHERE NOT EXISTS (
    SELECT 1 FROM user_page_permissions upp 
    WHERE upp.user_id = ur.user_id AND upp.page = 'kpis'
);

INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT ur.user_id, 'charts'::user_page, true
FROM user_roles ur
WHERE NOT EXISTS (
    SELECT 1 FROM user_page_permissions upp 
    WHERE upp.user_id = ur.user_id AND upp.page = 'charts'
);