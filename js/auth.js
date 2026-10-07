// ============================================================
// AUTH.JS - Autenticação com Supabase (SEM redirecionamento)
// ============================================================

import { supabase } from './config.js';

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const toggleRegisterBtn = document.getElementById('toggleRegisterBtn');
const toggleLoginBtn = document.getElementById('toggleLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');

// ============================================================
// INICIALIZAR
// ============================================================

export async function initAuth() {
  // Verificar se usuário já está logado
  const { data } = await supabase.auth.getSession();
  
  if (data.session) {
    // Usuário logado - mostrar dashboard
    showDashboard(data.session.user);
  } else {
    // Usuário não logado - mostrar login
    showLogin();
  }
}

// ============================================================
// MOSTRAR TELA DE LOGIN
// ============================================================

function showLogin() {
  loginSection.style.display = 'block';
  if (dashboardSection) {
    dashboardSection.style.display = 'none';
  }
  
  // Resetar formulários
  if (loginForm) {
    loginForm.reset();
  }
  if (registerForm) {
    registerForm.reset();
  }
}

// ============================================================
// MOSTRAR DASHBOARD
// ============================================================

function showDashboard(user) {
  loginSection.style.display = 'none';
  if (dashboardSection) {
    dashboardSection.style.display = 'block';
  }
  
  // Atualizar email do usuário na tela
  const userEmailElement = document.getElementById('userEmail');
  if (userEmailElement) {
    userEmailElement.textContent = user.email;
  }
  
  // Carregar dados do dashboard
  loadDashboardData();
}

// ============================================================
// LOGIN
// ============================================================

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        alert('❌ Erro ao fazer login: ' + error.message);
        return;
      }
      
      if (data.user) {
        // ✅ LOGIN SUCESSO - Mostrar dashboard (SEM redirecionar!)
        showDashboard(data.user);
      }
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  });
}

// ============================================================
// REGISTRO
// ============================================================

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validar senhas
    if (password !== confirmPassword) {
      alert('❌ As senhas não coincidem!');
      return;
    }
    
    if (password.length < 6) {
      alert('❌ A senha deve ter pelo menos 6 caracteres!');
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        alert('❌ Erro ao registrar: ' + error.message);
        return;
      }
      
      alert('✅ Registro bem-sucedido! Verifique seu email para confirmar.');
      
      // Limpar e voltar para login
      registerForm.reset();
      toggleLoginView();
      
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  });
}

// ============================================================
// LOGOUT
// ============================================================

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await supabase.auth.signOut();
      showLogin(); // ✅ Voltar para login (SEM redirecionar!)
    } catch (error) {
      alert('❌ Erro ao fazer logout: ' + error.message);
    }
  });
}

// ============================================================
// TOGGLE ENTRE LOGIN E REGISTRO
// ============================================================

function toggleLoginView() {
  const loginView = document.getElementById('loginView');
  const registerView = document.getElementById('registerView');
  
  if (loginView && registerView) {
    loginView.style.display = loginView.style.display === 'none' ? 'block' : 'none';
    registerView.style.display = registerView.style.display === 'none' ? 'block' : 'none';
  }
}

if (toggleRegisterBtn) {
  toggleRegisterBtn.addEventListener('click', toggleLoginView);
}

if (toggleLoginBtn) {
  toggleLoginBtn.addEventListener('click', toggleLoginView);
}

// ============================================================
// CARREGAR DADOS DO DASHBOARD
// ============================================================

async function loadDashboardData() {
  try {
    // Aqui você carrega os dados do dashboard
    // Por enquanto, apenas mostra uma mensagem
    const welcomeMsg = document.getElementById('welcomeMessage');
    if (welcomeMsg) {
      welcomeMsg.textContent = '✅ Dashboard carregado com sucesso!';
    }
    
    console.log('✅ Dashboard pronto!');
  } catch (error) {
    console.error('❌ Erro ao carregar dashboard:', error);
  }
}

// ============================================================
// OBSERVAR MUDANÇAS DE AUTENTICAÇÃO
// ============================================================

supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    showDashboard(session.user);
  } else {
    showLogin();
  }
});
