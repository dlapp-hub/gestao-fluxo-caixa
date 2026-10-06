-- =============================================
-- SCHEMA DO BANCO DE DADOS - FLUXO DE CAIXA
-- =============================================

-- 1. TABELA DE USUÁRIOS (Extensão do Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'visualizador', -- admin, gerente, operador, visualizador
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE CONTAS BANCÁRIAS
CREATE TABLE IF NOT EXISTS contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  banco TEXT NOT NULL,
  agencia TEXT,
  numero_conta TEXT,
  tipo TEXT, -- Operacional, Aplicação, Poupança, etc.
  saldo_inicial DECIMAL(15,2) DEFAULT 0,
  saldo_atual DECIMAL(15,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE DESPESAS
CREATE TABLE IF NOT EXISTS despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conta_id UUID NOT NULL REFERENCES contas(id) ON DELETE CASCADE,
  fornecedor TEXT NOT NULL,
  descricao TEXT,
  valor DECIMAL(15,2) NOT NULL,
  data_despesa DATE NOT NULL,
  data_vencimento DATE,
  status TEXT DEFAULT 'pendente', -- pendente, pago, cancelado
  categoria TEXT, -- Fornecedor, Aluguel, Folha, Obra, etc.
  nf_numero TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE NOTAS FISCAIS
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  numero_nf TEXT NOT NULL,
  fornecedor TEXT NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  data_emissao DATE NOT NULL,
  data_vencimento DATE,
  status TEXT DEFAULT 'recebida', -- recebida, aprovada, paga, cancelada
  obra_id TEXT, -- OC ou código da obra
  descricao TEXT,
  arquivo_url TEXT, -- URL do comprovante no Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE PAGAMENTOS PROGRAMADOS
CREATE TABLE IF NOT EXISTS pagamentos_programados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conta_id UUID NOT NULL REFERENCES contas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  data_programada DATE NOT NULL,
  tipo TEXT, -- Fornecedor, Aluguel, Folha, Obra, etc.
  status TEXT DEFAULT 'agendado', -- agendado, processado, cancelado
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA DE MOVIMENTAÇÕES
CREATE TABLE IF NOT EXISTS movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conta_id UUID NOT NULL REFERENCES contas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- entrada, saída
  descricao TEXT NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  referencia_id UUID, -- ID da despesa ou pagamento relacionado
  referencia_tipo TEXT, -- despesa, pagamento_programado, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS
-- =============================================

-- RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS na tabela contas
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contas"
  ON contas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contas"
  ON contas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contas"
  ON contas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contas"
  ON contas FOR DELETE
  USING (auth.uid() = user_id);

-- RLS na tabela despesas
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own despesas"
  ON despesas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own despesas"
  ON despesas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own despesas"
  ON despesas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own despesas"
  ON despesas FOR DELETE
  USING (auth.uid() = user_id);

-- RLS na tabela notas_fiscais
ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nf"
  ON notas_fiscais FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nf"
  ON notas_fiscais FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nf"
  ON notas_fiscais FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nf"
  ON notas_fiscais FOR DELETE
  USING (auth.uid() = user_id);

-- RLS na tabela pagamentos_programados
ALTER TABLE pagamentos_programados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pagamentos"
  ON pagamentos_programados FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pagamentos"
  ON pagamentos_programados FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pagamentos"
  ON pagamentos_programados FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pagamentos"
  ON pagamentos_programados FOR DELETE
  USING (auth.uid() = user_id);

-- RLS na tabela movimentacoes
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own movimentacoes"
  ON movimentacoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own movimentacoes"
  ON movimentacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_contas_user_id ON contas(user_id);
CREATE INDEX idx_despesas_user_id ON despesas(user_id);
CREATE INDEX idx_despesas_conta_id ON despesas(conta_id);
CREATE INDEX idx_nf_user_id ON notas_fiscais(user_id);
CREATE INDEX idx_pagamentos_user_id ON pagamentos_programados(user_id);
CREATE INDEX idx_movimentacoes_user_id ON movimentacoes(user_id);
CREATE INDEX idx_movimentacoes_conta_id ON movimentacoes(conta_id);