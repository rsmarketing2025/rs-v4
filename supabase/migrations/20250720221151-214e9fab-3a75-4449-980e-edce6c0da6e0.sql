-- Segunda etapa: Inserir permissões granulares para todos os usuários existentes
-- Baseado nas permissões existentes de 'creatives'

-- Inserir permissões de KPIs
INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT DISTINCT user_id, 'kpis'::user_page, can_access 
FROM user_page_permissions 
WHERE page = 'creatives'::user_page
ON CONFLICT (user_id, page) DO NOTHING;

-- Inserir permissões de gráficos
INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT DISTINCT user_id, 'charts'::user_page, can_access 
FROM user_page_permissions 
WHERE page = 'creatives'::user_page
ON CONFLICT (user_id, page) DO NOTHING;

-- Inserir permissões de tabelas
INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT DISTINCT user_id, 'tables'::user_page, can_access 
FROM user_page_permissions 
WHERE page = 'creatives'::user_page
ON CONFLICT (user_id, page) DO NOTHING;

-- Inserir permissões de exportação
INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT DISTINCT user_id, 'exports'::user_page, can_access 
FROM user_page_permissions 
WHERE page = 'creatives'::user_page
ON CONFLICT (user_id, page) DO NOTHING;