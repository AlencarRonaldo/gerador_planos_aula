-- =============================================================
-- SAPA SaaS — Schema Completo do Banco de Dados
-- Execute no SQL Editor do Supabase (painel → SQL Editor)
-- Este script é idempotente: pode ser executado mais de uma vez.
-- =============================================================


-- -------------------------------------------------------------
-- 1. TABELA: perfis
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.perfis (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo   text,
  escola_padrao   text,
  materia_padrao  text,
  criado_em       timestamptz DEFAULT now(),
  atualizado_em   timestamptz DEFAULT now()
);

-- Adiciona colunas que podem estar faltando (caso a tabela já existia)
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS materia_padrao  text;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS atualizado_em   timestamptz DEFAULT now();
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS creditos        integer DEFAULT 0;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS assinatura_ativa boolean DEFAULT false;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS asaas_customer_id text;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS asaas_subscription_id text;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS data_expiracao   timestamptz;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS planos_usados_mes   integer DEFAULT 0;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS plano_inicial_usado boolean DEFAULT false;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS mes_verificado    integer DEFAULT 0;

-- Trigger: cria perfil automaticamente ao cadastrar novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "perfis: leitura própria"  ON public.perfis;
DROP POLICY IF EXISTS "perfis: edição própria"   ON public.perfis;

CREATE POLICY "perfis: leitura própria"
  ON public.perfis FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "perfis: edição própria"
  ON public.perfis FOR ALL
  USING (auth.uid() = id);


-- -------------------------------------------------------------
-- 1.1. Função: Descontar Créditos
-- -------------------------------------------------------------
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


-- -------------------------------------------------------------
-- 2. TABELA: planos_gerados
--    Recria com a estrutura correta se necessário.
-- -------------------------------------------------------------

-- Se já existia mas com colunas erradas, adiciona as que faltam
DO $$
BEGIN
  -- Cria a tabela do zero caso não exista
  CREATE TABLE IF NOT EXISTS public.planos_gerados (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    professor    text,
    escola       text,
    turma        text,
    componente   text,
    bimestre     integer,
    semana       integer,
    tema         text,
    arquivo_nome text,
    arquivo_url  text,
    criado_em    timestamptz DEFAULT now()
  );

  -- Garante colunas caso a tabela existisse com estrutura parcial
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'planos_gerados'
      AND column_name  = 'usuario_id'
  ) THEN
    ALTER TABLE public.planos_gerados ADD COLUMN usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'planos_gerados'
      AND column_name  = 'arquivo_url'
  ) THEN
    ALTER TABLE public.planos_gerados ADD COLUMN arquivo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'planos_gerados'
      AND column_name  = 'criado_em'
  ) THEN
    ALTER TABLE public.planos_gerados ADD COLUMN criado_em timestamptz DEFAULT now();
  END IF;
END $$;

-- Índice para busca rápida por usuário
CREATE INDEX IF NOT EXISTS planos_gerados_usuario_idx
  ON public.planos_gerados (usuario_id, criado_em DESC);

-- RLS
ALTER TABLE public.planos_gerados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "planos: leitura própria"  ON public.planos_gerados;
DROP POLICY IF EXISTS "planos: inserção própria" ON public.planos_gerados;
DROP POLICY IF EXISTS "planos: exclusão própria" ON public.planos_gerados;

CREATE POLICY "planos: leitura própria"
  ON public.planos_gerados FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "planos: inserção própria"
  ON public.planos_gerados FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "planos: exclusão própria"
  ON public.planos_gerados FOR DELETE
  USING (auth.uid() = usuario_id);


-- -------------------------------------------------------------
-- 3. STORAGE: bucket "planos"
-- -------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('planos', 'planos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "planos storage: upload próprio"  ON storage.objects;
DROP POLICY IF EXISTS "planos storage: leitura própria" ON storage.objects;
DROP POLICY IF EXISTS "planos storage: exclusão própria" ON storage.objects;

CREATE POLICY "planos storage: upload próprio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'planos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "planos storage: leitura própria"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'planos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "planos storage: exclusão própria"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'planos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- =============================================================
-- VERIFICAÇÃO: rode esta query para confirmar o resultado
-- =============================================================
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name IN ('perfis', 'planos_gerados')
-- ORDER BY table_name, ordinal_position;
