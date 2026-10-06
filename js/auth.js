// ============================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================================

/**
 * Faz login do usuário
 */
async function fazerLogin(email, senha) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });
        
        if (error) throw error;
        
        if (data.user) {
            // Armazena dados do usuário localmente
            armazenarLocal('usuario_autenticado', {
                id: data.user.id,
                email: data.user.email,
                nome: data.user.user_metadata?.nome || data.user.email
            });
            
            armazenarLocal('token_sessao', data.session.access_token);
            
            mostrarNotificacao(MENSAGENS.SUCESSO_LOGIN, 'sucesso');
            return { sucesso: true, usuario: data.user };
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        mostrarNotificacao(MENSAGENS.ERRO_AUTENTICACAO, 'erro');
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Faz logout do usuário
 */
async function fazerLogout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        
        if (error) throw error;
        
        // Limpa dados locais
        removerLocal('usuario_autenticado');
        removerLocal('token_sessao');
        removerLocal('contas_cache');
        removerLocal('despesas_cache');
        
        mostrarNotificacao(MENSAGENS.SUCESSO_LOGOUT, 'sucesso');
        
        // Volta para login
        setTimeout(() => {
            document.getElementById('loginSection').classList.remove('hidden');
            const sections = document.querySelectorAll('main > section:not(#loginSection)');
            sections.forEach(s => s.classList.add('hidden'));
        }, 500);
        
        return { sucesso: true };
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        mostrarNotificacao(MENSAGENS.ERRO_AUTENTICACAO, 'erro');
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Verifica se o usuário está autenticado
 */
async function verificarAutenticacao() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
            // Usuário autenticado
            exibirDashboard(user);
            return { autenticado: true, usuario: user };
        } else {
            // Usuário não autenticado
            exibirLogin();
            return { autenticado: false };
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        exibirLogin();
        return { autenticado: false, erro: error.message };
    }
}

/**
 * Recupera a senha do usuário
 */
async function recuperarSenha(email) {
    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        
        if (error) throw error;
        
        mostrarNotificacao('Email de recuperação de senha enviado!', 'sucesso');
        return { sucesso: true };
    } catch (error) {
        console.error('Erro ao recuperar senha:', error);
        mostrarNotificacao('Erro ao recuperar senha', 'erro');
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Atualiza a senha do usuário
 */
async function atualizarSenha(novaSenha) {
    try {
        const { error } = await supabaseClient.auth.updateUser({
            password: novaSenha
        });
        
        if (error) throw error;
        
        mostrarNotificacao('Senha atualizada com sucesso!', 'sucesso');
        return { sucesso: true };
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        mostrarNotificacao('Erro ao atualizar senha', 'erro');
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Cria uma nova conta de usuário
 */
async function criarContaUsuario(email, senha, nome) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: {
                    nome: nome
                }
            }
        });
        
        if (error) throw error;
        
        mostrarNotificacao('Conta criada com sucesso! Verifique seu email.', 'sucesso');
        return { sucesso: true, usuario: data.user };
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        mostrarNotificacao('Erro ao criar conta', 'erro');
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Atualiza perfil do usuário
 */
async function atualizarPerfil(dados) {
    try {
        const { error } = await supabaseClient.auth.updateUser({
            data: dados
        });
        
        if (error) throw error;
        
        // Atualiza localStorage
        const usuario = recuperarLocal('usuario_autenticado');
        if (usuario) {
            usuario.nome = dados.nome || usuario.nome;
            armazenarLocal('usuario_autenticado', usuario);
        }
        
        mostrarNotificacao('Perfil atualizado com sucesso!', 'sucesso');
        return { sucesso: true };
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        mostrarNotificacao('Erro ao atualizar perfil', 'erro');
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Obtém o usuário autenticado atualmente
 */
async function obterUsuarioAtual() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    } catch (error) {
        console.error('Erro ao obter usuário atual:', error);
        return null;
    }
}

/**
 * Exibe a seção de login
 */
function exibirLogin() {
    const loginSection = document.getElementById('loginSection');
    const sections = document.querySelectorAll('main > section:not(#loginSection)');
    
    loginSection.classList.remove('hidden');
    loginSection.classList.add('flex');
    sections.forEach(s => s.classList.add('hidden'));
}

/**
 * Exibe o dashboard após login
 */
function exibirDashboard(usuario) {
    const loginSection = document.getElementById('loginSection');
    
    loginSection.classList.add('hidden');
    loginSection.classList.remove('flex');
    
    // Atualiza nome do usuário na navbar
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        const nome = usuario.user_metadata?.nome || usuario.email?.split('@')[0] || 'Usuário';
        userNameElement.textContent = `Olá, ${nome}!`;
    }
    
    // Mostra dashboard
    showSection('dashboard');
}

/**
 * Monitora mudanças de autenticação
 */
function monitorarAutenticacao() {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
            const usuario = session?.user;
            if (usuario) {
                exibirDashboard(usuario);
            }
        } else if (event === 'SIGNED_OUT') {
            exibirLogin();
        }
    });
}
