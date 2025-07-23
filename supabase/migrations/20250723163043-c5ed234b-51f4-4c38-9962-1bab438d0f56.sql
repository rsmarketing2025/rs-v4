-- Recriar a função assign_default_chart_permissions que está faltando
CREATE OR REPLACE FUNCTION public.assign_default_chart_permissions(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO user_chart_permissions (user_id, chart_type, can_access)
    VALUES 
        (user_id_param, 'kpi_total_investido', true),
        (user_id_param, 'kpi_receita', true),
        (user_id_param, 'kpi_ticket_medio', true),
        (user_id_param, 'kpi_total_pedidos', true),
        (user_id_param, 'creative_performance_chart', true),
        (user_id_param, 'creative_sales_chart', true),
        (user_id_param, 'sales_summary_cards', true),
        (user_id_param, 'sales_chart', true),
        (user_id_param, 'country_sales_chart', true),
        (user_id_param, 'state_sales_chart', true),
        (user_id_param, 'affiliate_chart', true),
        (user_id_param, 'subscription_renewals_chart', true),
        (user_id_param, 'subscription_status_chart', true),
        (user_id_param, 'new_subscribers_chart', true)
    ON CONFLICT (user_id, chart_type) DO NOTHING;
END;
$function$;