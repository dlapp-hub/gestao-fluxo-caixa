// ============================================================
// CONFIGURAÇÃO SUPABASE
// ============================================================
// IMPORTANTE: Substitua com suas chaves do Supabase
// Obtenha em: https://app.supabase.com/project/[seu-projeto]/settings/api

const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima-aqui';

// Criar cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// CONSTANTES E CONFIGURAÇÕES LOCAIS
// ============================================================

const CONFIG = {
    // Aplicação
    APP_NAME: 'FluxoCaixa Pro',
    VERSION: '1.0.0',
    
    // Paginação
    ITEMS_PER_PAGE: 10,
    
    // Timeouts
    TIMEOUT_SESSAO: 30 * 60 * 1000, // 30 minutos
    
    // Formatos
    FORMATO_MOEDA: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }),
    
    FORMATO_DATA: new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }),
    
    // Status
    STATUS_DESPESA: ['Pendente', 'Pago', 'Agendado'],
    STATUS_PAGAMENTO: ['Agendado', 'Confirmado', 'Processando', 'Pago'],
    STATUS_NF: ['Recebida', 'Processando', 'Aprovada', 'Paga'],
    TIPO_CONTA: ['Operacional', 'Aplicação', 'Reserva'],
    
    // Cores para gráficos
    CORES_GRAFICO: [
        '#3b82f6', // Blue
        '#10b981', // Green
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#8b5cf6', // Purple
        '#06b6d4', // Cyan
        '#ec4899', // Pink
        '#6366f1'  // Indigo
    ]
};

// ============================================================
// NOMES DE TABELAS SUPABASE
// ============================================================

const TABLES = {
    USERS: 'users',
    CONTAS: 'contas_bancarias',
    DESPESAS: 'despesas',
    PAGAMENTOS: 'pagamentos_agendados',
    NOTAS_FISCAIS: 'notas_fiscais',
    TRANSACOES: 'transacoes',
    RELATORIOS: 'relatorios'
};

// ============================================================
// ESTRUTURA DE DADOS (SCHEMAS)
// ============================================================

const SCHEMAS = {
    CONTA: {
        id: 'uuid',
        usuario_id: 'uuid',
        nome: 'text',
        banco: 'text',
        saldo: 'numeric',
        tipo: 'text',
        data_criacao: 'timestamp',
        ativa: 'boolean'
    },
    
    DESPESA: {
        id: 'uuid',
        usuario_id: 'uuid',
        data: 'date',
        fornecedor: 'text',
        descricao: 'text',
        valor: 'numeric',
        conta_id: 'uuid',
        status: 'text',
        nf_id: 'uuid',
        data_criacao: 'timestamp'
    },
    
    PAGAMENTO: {
        id: 'uuid',
        usuario_id: 'uuid',
        data_vencimento: 'date',
        descricao: 'text',
        fornecedor: 'text',
        valor: 'numeric',
        status: 'text',
        data_pagamento: 'date',
        data_criacao: 'timestamp'
    },
    
    NOTA_FISCAL: {
        id: 'uuid',
        usuario_id: 'uuid',
        numero: 'text',
        fornecedor: 'text',
        obra: 'text',
        valor: 'numeric',
        status: 'text',
        data_emissao: 'date',
        data_criacao: 'timestamp'
    }
};

// ============================================================
// MENSAGENS
// ============================================================

const MENSAGENS = {
    SUCESSO_CONTA_CRIADA: 'Conta bancária criada com sucesso!',
    SUCESSO_DESPESA_CRIADA: 'Despesa registrada com sucesso!',
    SUCESSO_PAGAMENTO_AGENDADO: 'Pagamento agendado com sucesso!',
    SUCESSO_NF_CRIADA: 'Nota Fiscal registrada com sucesso!',
    SUCESSO_LOGIN: 'Login realizado com sucesso!',
    SUCESSO_LOGOUT: 'Logout realizado com sucesso!',
    
    ERRO_AUTENTICACAO: 'Erro na autenticação. Verifique suas credenciais.',
    ERRO_CARREGAMENTO: 'Erro ao carregar dados. Tente novamente.',
    ERRO_CRIACAO: 'Erro ao criar registro. Tente novamente.',
    ERRO_ATUALIZACAO: 'Erro ao atualizar registro. Tente novamente.',
    ERRO_DELECAO: 'Erro ao deletar registro. Tente novamente.',
    ERRO_CONEXAO: 'Erro de conexão. Verifique sua internet.',
    
    CONFIRMACAO_DELECAO: 'Tem certeza que deseja deletar este registro?'
};
