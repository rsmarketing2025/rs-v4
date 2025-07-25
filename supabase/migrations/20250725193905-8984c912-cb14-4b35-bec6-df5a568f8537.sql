-- Insert some test data into estrutura_invisivel table for testing the webhook
INSERT INTO public.estrutura_invisivel (titulo, conteudo, categoria, tipo_estrutura, nicho, tom, publico_alvo, tags, fonte, ativo) VALUES
('Teste Estrutura 1', 'Este é um conteúdo de teste para estrutura invisível número 1', 'teste', 'exemplo', 'geral', 'formal', 'todos', ARRAY['teste', 'exemplo'], 'teste_automatico', true),
('Teste Estrutura 2', 'Este é um conteúdo de teste para estrutura invisível número 2', 'teste', 'exemplo', 'geral', 'casual', 'todos', ARRAY['teste', 'exemplo'], 'teste_automatico', true),
('Teste Estrutura 3', 'Este é um conteúdo de teste para estrutura invisível número 3', 'teste', 'exemplo', 'geral', 'profissional', 'todos', ARRAY['teste', 'exemplo'], 'teste_automatico', true);