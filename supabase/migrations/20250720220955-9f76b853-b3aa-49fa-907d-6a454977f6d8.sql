-- Primeira etapa: Adicionar novos valores ao enum user_page
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