-- Verificar valores existentes no enum
DO $$
BEGIN
    -- Adicionar novos valores ao enum user_page se não existirem
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'user_page'::regtype AND enumlabel = 'kpis') THEN
        ALTER TYPE user_page ADD VALUE 'kpis';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'user_page'::regtype AND enumlabel = 'charts') THEN
        ALTER TYPE user_page ADD VALUE 'charts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'user_page'::regtype AND enumlabel = 'tables') THEN
        ALTER TYPE user_page ADD VALUE 'tables';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'user_page'::regtype AND enumlabel = 'exports') THEN
        ALTER TYPE user_page ADD VALUE 'exports';
    END IF;
END
$$;

-- Inserir permissões granulares para todos os usuários existentes
INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT DISTINCT user_id, 'kpis'::user_page, can_access 
FROM user_page_permissions 
WHERE page = 'creatives'::user_page
ON CONFLICT (user_id, page) DO NOTHING;

INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT DISTINCT user_id, 'charts'::user_page, can_access 
FROM user_page_permissions 
WHERE page = 'creatives'::user_page
ON CONFLICT (user_id, page) DO NOTHING;

INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT DISTINCT user_id, 'tables'::user_page, can_access 
FROM user_page_permissions 
WHERE page = 'creatives'::user_page
ON CONFLICT (user_id, page) DO NOTHING;

INSERT INTO user_page_permissions (user_id, page, can_access)
SELECT DISTINCT user_id, 'exports'::user_page, can_access 
FROM user_page_permissions 
WHERE page = 'creatives'::user_page
ON CONFLICT (user_id, page) DO NOTHING;