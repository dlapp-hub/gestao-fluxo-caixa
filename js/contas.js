// ============================================================
// FUNÇÕES DE CONTAS BANCÁRIAS
// ============================================================

/**
 * Carrega e renderiza as contas
 */
async function carregarContas() {
    try {
        const resultado = await obterContas();
        
        if (!resultado.sucesso) {
            mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
            return;
        }
        
        renderizarContas(resultado.dados);
        atualizarSelectContas(resultado.dados);
        atualizarSelectFornecedores(resultado.dados);
        
    } catch (error) {
        console.error('Erro ao carregar contas:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Renderiza cards de contas
 */
function renderizarContas(contas) {
    const grid = document.getElementById('contasGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (contas.length === 0) {
        grid.innerHTML = '<p class="col-span-3 text-center text-gray-500 py-8">Nenhuma conta cadastrada</p>';
        return;
    }
    
    contas.forEach(conta => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition';
        
        const corTipo = {
            'Operacional': 'bg-blue-100 text-blue-800',
            'Aplicação': 'bg-green-100 text-green-800',
            'Reserva': 'bg-red-100 text-red-800'
        }[conta.tipo] || 'bg-gray-100 text-gray-800';
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">${sanitizarTexto(conta.nome)}</h3>
                    <p class="text-sm text-gray-500">${sanitizarTexto(conta.banco)}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${corTipo}">
                    ${conta.tipo}
                </span>
            </div>
            
            <div class="mb-6">
                <p class="text-gray-600 text-sm font-semibold mb-1">Saldo</p>
                <p class="text-3xl font-bold text-green-600">${formatarMoeda(conta.saldo)}</p>
            </div>
            
            <div class="flex gap-2">
                <button onclick="editarConta('${conta.id}')" class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold">
                    Editar
                </button>
                <button onclick="deletarContaConfirm('${conta.id}')" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold">
                    Deletar
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

/**
 * Atualiza select de contas nos modais
 */
function atualizarSelectContas(contas) {
    const selectConta = document.getElementById('despesaConta');
    if (selectConta) {
        selectConta.innerHTML = '<option value="">Selecione a Conta</option>';
        contas.forEach(conta => {
            const option = document.createElement('option');
            option.value = conta.id;
            option.textContent = `${conta.nome} (${formatarMoeda(conta.saldo)})`;
            selectConta.appendChild(option);
        });
    }
}

/**
 * Atualiza select de fornecedores (dinamicamente)
 */
function atualizarSelectFornecedores(dados) {
    // Pode ser adaptado para buscar fornecedores únicos do banco
}

/**
 * Trata o envio do formulário de nova conta
 */
document.addEventListener('DOMContentLoaded', function() {
    const formConta = document.getElementById('formConta');
    if (formConta) {
        formConta.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const conta = {
                nome: document.getElementById('contaNome').value,
                banco: document.getElementById('contaBanco').value,
                saldo: document.getElementById('contaSaldo').value,
                tipo: document.getElementById('contaTipo').value
            };
            
            const resultado = await criarConta(conta);
            
            if (resultado.sucesso) {
                mostrarNotificacao(MENSAGENS.SUCESSO_CONTA_CRIADA, 'sucesso');
                closeModal('contaModal');
                carregarContas();
            } else {
                mostrarNotificacao(resultado.erro || MENSAGENS.ERRO_CRIACAO, 'erro');
            }
        });
    }
});

/**
 * Edita uma conta (abre modal com dados preenchidos)
 */
async function editarConta(contaId) {
    try {
        const resultado = await obterConta(contaId);
        
        if (!resultado.sucesso) {
            mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
            return;
        }
        
        const conta = resultado.dados;
        
        // Preenche modal com dados
        document.getElementById('contaNome').value = conta.nome;
        document.getElementById('contaBanco').value = conta.banco;
        document.getElementById('contaSaldo').value = conta.saldo;
        document.getElementById('contaTipo').value = conta.tipo;
        
        // Muda função do formulário para atualizar
        const formConta = document.getElementById('formConta');
        formConta.onsubmit = async function(e) {
            e.preventDefault();
            
            const alteracoes = {
                nome: document.getElementById('contaNome').value,
                banco: document.getElementById('contaBanco').value,
                saldo: parseFloat(document.getElementById('contaSaldo').value),
                tipo: document.getElementById('contaTipo').value
            };
            
            const resultUpdate = await atualizarConta(contaId, alteracoes);
            
            if (resultUpdate.sucesso) {
                mostrarNotificacao('Conta atualizada com sucesso!', 'sucesso');
                closeModal('contaModal');
                carregarContas();
                
                // Restaura função original
                formConta.onsubmit = null;
            } else {
                mostrarNotificacao(resultUpdate.erro || MENSAGENS.ERRO_ATUALIZACAO, 'erro');
            }
        };
        
        openModal('contaModal');
        
    } catch (error) {
        console.error('Erro ao editar conta:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Confirma e deleta uma conta
 */
async function deletarContaConfirm(contaId) {
    if (!confirm(MENSAGENS.CONFIRMACAO_DELECAO)) return;
    
    try {
        const resultado = await deletarConta(contaId);
        
        if (resultado.sucesso) {
            mostrarNotificacao('Conta deletada com sucesso!', 'sucesso');
            carregarContas();
        } else {
            mostrarNotificacao(resultado.erro || MENSAGENS.ERRO_DELECAO, 'erro');
        }
    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        mostrarNotificacao(MENSAGENS.ERRO_DELECAO, 'erro');
    }
}
