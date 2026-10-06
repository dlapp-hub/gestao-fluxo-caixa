// ============================================================
// FUNÇÕES DE DESPESAS
// ============================================================

/**
 * Carrega e renderiza as despesas
 */
async function carregarDespesas() {
    try {
        const resultado = await obterDespesas();
        
        if (!resultado.sucesso) {
            mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
            return;
        }
        
        renderizarDespesas(resultado.dados);
        
    } catch (error) {
        console.error('Erro ao carregar despesas:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Renderiza tabela de despesas
 */
function renderizarDespesas(despesas) {
    const tbody = document.getElementById('despesasTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (despesas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-gray-500">Nenhuma despesa cadastrada</td></tr>';
        return;
    }
    
    despesas.forEach(despesa => {
        const corStatus = obterCorStatus(despesa.status);
        
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50';
        
        tr.innerHTML = `
            <td class="px-4 py-2">${formatarData(despesa.data)}</td>
            <td class="px-4 py-2 font-semibold">${sanitizarTexto(despesa.fornecedor)}</td>
            <td class="px-4 py-2 text-gray-600">${sanitizarTexto(despesa.descricao)}</td>
            <td class="px-4 py-2 text-right font-bold text-red-600">${formatarMoeda(despesa.valor)}</td>
            <td class="px-4 py-2">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${corStatus}">
                    ${despesa.status}
                </span>
            </td>
            <td class="px-4 py-2 text-center">
                <button onclick="editarDespesa('${despesa.id}')" class="text-blue-600 hover:text-blue-800 mr-3" title="Editar">
                    ✎
                </button>
                <button onclick="deletarDespesaConfirm('${despesa.id}')" class="text-red-600 hover:text-red-800" title="Deletar">
                    🗑
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Trata o envio do formulário de nova despesa
 */
document.addEventListener('DOMContentLoaded', function() {
    const formDespesa = document.getElementById('formDespesa');
    if (formDespesa) {
        formDespesa.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const despesa = {
                data: document.getElementById('despesaData').value,
                fornecedor: document.getElementById('despesaFornecedor').value,
                descricao: document.getElementById('despesaDescricao').value,
                valor: document.getElementById('despesaValor').value,
                conta_id: document.getElementById('despesaConta').value,
                status: document.getElementById('despesaStatus').value
            };
            
            if (!despesa.conta_id) {
                mostrarNotificacao('Selecione uma conta', 'aviso');
                return;
            }
            
            const resultado = await criarDespesa(despesa);
            
            if (resultado.sucesso) {
                mostrarNotificacao(MENSAGENS.SUCESSO_DESPESA_CRIADA, 'sucesso');
                closeModal('despesaModal');
                carregarDespesas();
            } else {
                mostrarNotificacao(resultado.erro || MENSAGENS.ERRO_CRIACAO, 'erro');
            }
        });
    }
});

/**
 * Edita uma despesa
 */
async function editarDespesa(despesaId) {
    try {
        // Busca despesa no banco (aqui você precisará criar essa função na api.js)
        const resultado = await obterDespesas();
        const despesa = resultado.dados.find(d => d.id === despesaId);
        
        if (!despesa) {
            mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
            return;
        }
        
        // Preenche modal
        document.getElementById('despesaData').value = despesa.data;
        document.getElementById('despesaFornecedor').value = despesa.fornecedor;
        document.getElementById('despesaDescricao').value = despesa.descricao;
        document.getElementById('despesaValor').value = despesa.valor;
        document.getElementById('despesaConta').value = despesa.conta_id;
        document.getElementById('despesaStatus').value = despesa.status;
        
        // Muda função do formulário
        const formDespesa = document.getElementById('formDespesa');
        formDespesa.onsubmit = async function(e) {
            e.preventDefault();
            
            const alteracoes = {
                data: document.getElementById('despesaData').value,
                fornecedor: document.getElementById('despesaFornecedor').value,
                descricao: document.getElementById('despesaDescricao').value,
                valor: parseFloat(document.getElementById('despesaValor').value),
                conta_id: document.getElementById('despesaConta').value,
                status: document.getElementById('despesaStatus').value
            };
            
            const resultUpdate = await atualizarDespesa(despesaId, alteracoes);
            
            if (resultUpdate.sucesso) {
                mostrarNotificacao('Despesa atualizada com sucesso!', 'sucesso');
                closeModal('despesaModal');
                carregarDespesas();
                formDespesa.onsubmit = null;
            } else {
                mostrarNotificacao(resultUpdate.erro || MENSAGENS.ERRO_ATUALIZACAO, 'erro');
            }
        };
        
        openModal('despesaModal');
        
    } catch (error) {
        console.error('Erro ao editar despesa:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Confirma e deleta uma despesa
 */
async function deletarDespesaConfirm(despesaId) {
    if (!confirm(MENSAGENS.CONFIRMACAO_DELECAO)) return;
    
    try {
        const resultado = await deletarDespesa(despesaId);
        
        if (resultado.sucesso) {
            mostrarNotificacao('Despesa deletada com sucesso!', 'sucesso');
            carregarDespesas();
        } else {
            mostrarNotificacao(resultado.erro || MENSAGENS.ERRO_DELECAO, 'erro');
        }
    } catch (error) {
        console.error('Erro ao deletar despesa:', error);
        mostrarNotificacao(MENSAGENS.ERRO_DELECAO, 'erro');
    }
}

/**
 * Filtra despesas por status
 */
async function filtrarDespesasPorStatus(status) {
    try {
        const resultado = await obterDespesas({ status: status });
        
        if (resultado.sucesso) {
            renderizarDespesas(resultado.dados);
        }
    } catch (error) {
        console.error('Erro ao filtrar despesas:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Busca despesa por fornecedor
 */
async function buscarDespesasPorFornecedor(termo) {
    try {
        const resultado = await obterDespesas({ fornecedor: termo });
        
        if (resultado.sucesso) {
            renderizarDespesas(resultado.dados);
        }
    } catch (error) {
        console.error('Erro ao buscar despesas:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}
