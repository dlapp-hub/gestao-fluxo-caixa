// ============================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================

// Credenciais do Supabase (hardcoded para funcionar online)
const SUPABASE_CONFIG = {
  URL: 'https://xnszuirlrvexehraxwny.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Será substituída
};

// Função para inicializar Supabase
let supabase = null;

function initSupabase() {
  if (supabase) return supabase; // Evita duplicação
  
  // Importar biblioteca Supabase (via CDN)
  if (typeof window.supabase === 'undefined') {
    console.error('Biblioteca Supabase não carregada!');
    return null;
  }
  
  supabase = window.supabase.createClient(
    SUPABASE_CONFIG.URL,
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhuc3p1aXJsdmV4aHJheHdueSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzIwNDU2NzI0LCJleHAiOjE4NzgyMjI3MjR9.--'
  );
  
  console.log('✅ Supabase inicializado com sucesso!');
  return supabase;
}

// Exportar para uso global
window.CONFIG = {
  initSupabase: initSupabase,
  getSupabase: () => supabase || initSupabase()
};
