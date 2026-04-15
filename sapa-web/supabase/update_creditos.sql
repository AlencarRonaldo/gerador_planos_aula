-- =============================================================
-- SAPA SaaS — Atualização do Banco de Dados
-- Execute no SQL Editor do Supabase (painel → SQL Editor)
-- =============================================================

-- 1. Adicionar colunas de pagamento na tabela perfis
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS creditos integer DEFAULT 0;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS assinatura_ativa boolean DEFAULT false;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS asaas_customer_id text;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS asaas_subscription_id text;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS data_expiracao timestamptz;

-- 2. Criar função para descontar créditos
CREATE OR REPLACE FUNCTION public.descontar_creditos(p_user_id uuid, p_quantidade integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.perfis
  SET creditos = greatest(creditos - p_quantidade, 0)
  WHERE id = p_user_id;
END;
$$;

-- 3. Verificar se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'perfis' 
AND column_name IN ('creditos', 'assinatura_ativa', 'asaas_customer_id', 'asaas_subscription_id', 'data_expiracao');
