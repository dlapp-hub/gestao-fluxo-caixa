// ========================================
// CONFIGURAÇÃO DO SUPABASE - VERSÃO CORRIGIDA
// ========================================

// OPÇÃO 1: Se estiver usando arquivo .env.local (Recomendado)
// Carregue as variáveis do arquivo .env.local
const SUPABASE_URL = 'https://xnszuirlrvexehraxwny.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-gVd4d0x8-gsqDvRGmleow_iyptlzka';

// OPÇÃO 2: Se estiver usando variáveis do Vite
// Descomente as linhas abaixo se estiver usando Vite
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar se as credenciais estão configuradas
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ ERRO: Credenciais do Supabase não configuradas!');
  console.error('Certifique-se de que as constantes SUPABASE_URL e SUPABASE_ANON_KEY estão definidas em config-fix.js');
  throw new Error('Credenciais do Supabase não encontradas');
}

console.log('✅ Credenciais do Supabase carregadas com sucesso!');
console.log('URL:', SUPABASE_URL);

// Exportar para uso em outros arquivos
export { SUPABASE_URL, SUPABASE_ANON_KEY };
