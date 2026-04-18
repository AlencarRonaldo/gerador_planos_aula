-- Corrige o default do id nas tabelas de escopos
-- Execute no SQL Editor do Supabase

-- Habilita extensão de UUID (caso não esteja ativa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Corrige o id da tabela escopos
ALTER TABLE public.escopos
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Corrige o id da tabela escopo_aulas
ALTER TABLE public.escopo_aulas
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Garante que a coluna arquivo_original existe
ALTER TABLE public.escopos ADD COLUMN IF NOT EXISTS arquivo_original text;
