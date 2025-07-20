-- Adicionar novos tipos de permissões mais granulares
ALTER TYPE user_page ADD VALUE IF NOT EXISTS 'kpis';
ALTER TYPE user_page ADD VALUE IF NOT EXISTS 'charts';
ALTER TYPE user_page ADD VALUE IF NOT EXISTS 'tables';
ALTER TYPE user_page ADD VALUE IF NOT EXISTS 'exports';

-- Adicionar permissões específicas para gráficos e KPIs
-- Para cada usuário existente, dar as permissões granulares baseadas nas permissões de página existentes
INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT DISTINCT user_id, 'kpis', can_access FROM user_page_permissions WHERE page = 'creatives'
ON CONFLICT (user_id, page) DO NOTHING;

INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT DISTINCT user_id, 'charts', can_access FROM user_page_permissions WHERE page = 'creatives'
ON CONFLICT (user_id, page) DO NOTHING;

INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT DISTINCT user_id, 'tables', can_access FROM user_page_permissions WHERE page = 'creatives'
ON CONFLICT (user_id, page) DO NOTHING;

INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT DISTINCT user_id, 'exports', can_access FROM user_page_permissions WHERE page = 'creatives'
ON CONFLICT (user_id, page) DO NOTHING;