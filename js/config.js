// ============================================
// CONFIGURAÇÃO DO SUPABASE - VERSÃO PRODUCTION
// ============================================

// 🔐 CREDENCIAIS DO SUPABASE (PUBLIC - seguro expor)
const SUPABASE_URL = 'https://xnszuirlvexhraxwny.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-gVd4d0x8-gsqDvRGmleow_iyptlzka';

// ============================================
// NÃO EDITE ABAIXO DAQUI
// ============================================

// Inicializar cliente Supabase
let supabase = null;

// Função para inicializar Supabase
async function initializeSupabase() {
    try {
        if (!window.supabase) {
            console.error('❌ Biblioteca Supabase não foi carregada!');
            return false;
        }
        
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase inicializado com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
        return false;
    }
}

// Exportar para uso global
window.initializeSupabase = initializeSupabase;
window.getSupabaseClient = () => supabase;

// Auto-inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();
});
