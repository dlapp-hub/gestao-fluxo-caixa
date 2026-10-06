// ============================================================
// FUNÇÕES DE PAGAMENTOS AGENDADOS
// ============================================================

/**
 * Carrega e renderiza os pagamentos
 */
async function carregarPagamentos() {
    try {
        const resultado = await obterPagamentos();
        
        if (!resultado.sucesso) {
            mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
            return;
        }
        
        renderizarPagamentos(resultado.dados);
        
    } catch (error) {
        console.error('Erro ao carregar pagamentos:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Renderiza tabela de pagamentos agendados
 */
function renderizarPagamentos(pagamentos) {
    const tbody = document.getElementById('pagamentosTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (pagamentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-gray-500">Nenhum pagamento agendado</td></tr>';
        return;
    }
    
    pagamentos.forEach(pagamento => {
        const corStatus = obterCorStatus(pagamento.status);
        const hoje = new Date().toISOString().split('T')[0];
        const dataVencimento = pagamento.data_vencimento;
        
        // Calcula alerta de vencimento próximo
        const diasRestantes = diasEntre(dataVencimento, hoje);
        let alerta = '';
        if (diasRestantes <= 3 && diasRestantes >= 0) {
            alerta = ' ⚠️';
        } else if (diasRestantes < 0) {
            alerta = ' ❌';
        }
        
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50';
        
        tr.innerHTML = `
            <td class="px-4 py-2 font-semibold">${formatarData(dataVencimento)}${alerta}</td>
            <td class="px-4 py-2 text-gray-600">${sanitizarTexto(pagamento.descricao)}</td>
            <td class="px-4 py-2">${sanitizarTexto(pagamento.fornecedor)}</td>
            <td class="px-4 py-2 text-right font-bold text-red-600">${formatarMoeda(pagamento.valor)}</td>
            <td class="px-4 py-2">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${corStatus}">
                    ${pagamento.status}
                </span>
            </td>
            <td class="px-4 py-2 text-center">
                <button onclick="editarPagamento('${pagamento.id}')" class="text-blue-600 hover:text-blue-800 mr-3" title="Editar">
                    ✎
                </button>
                <button onclick="deletarPagamentoConfirm('${pagamento.id}')" class="text-red-600 hover:text-red-800" title="Deletar">
                    🗑
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Trata o envio do formulário de novo pagamento
 */
document.addEventListener('DOMContentLoaded', function() {
    const formPagamento = document.getElementById('formPagamento');
    if (formPagamento) {
        formPagamento.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const pagamento = {
                data_vencimento: document.getElementById('pagamentoData').value,
                descricao: document.getElementById('pagamentoDescricao').value,
                fornecedor: document.getElementById('pagamentoFornecedor').value,
                valor: document.getElementById('pagamentoValor').value,
                status: document.getElementById('pagamentoStatus').value
            };
            
            const resultado = await criarPagamento(pagamento);
            
            if (resultado.sucesso) {
                mostrarNotificacao(MENSAGENS.SUCESSO_PAGAMENTO_AGENDADO, 'sucesso');
                closeModal('pagamentoModal');
                carregarPagamentos();
            } else {
                mostrarNotificacao(resultado.erro || MENSAGENS.ERRO_CRIACAO, 'erro');
            }
        });
    }
});

/**
 * Edita um pagamento agendado
 */
async function editarPagamento(pagamentoId) {
    try {
        const resultado = await obterPagamentos();
        const pagamento = resultado.dados.find(p => p.id === pagamentoId);
        
        if (!pagamento) {
            mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
            return;
        }
        
        // Preenche modal
        document.getElementById('pagamentoData').value = pagamento.data_vencimento;
        document.getElementById('pagamentoDescricao').value = pagamento.descricao;
        document.getElementById('pagamentoFornecedor').value = pagamento.fornecedor;
        document.getElementById('pagamentoValor').value = pagamento.valor;
        document.getElementById('pagamentoStatus').value = pagamento.status;
        
        // Muda função do formulário
        const formPagamento = document.getElementById('formPagamento');
        formPagamento.onsubmit = async function(e) {
            e.preventDefault();
            
            const alteracoes = {
                data_vencimento: document.getElementById('pagamentoData').value,
                descricao: document.getElementById('pagamentoDescricao').value,
                fornecedor: document.getElementById('pagamentoFornecedor').value,
                valor: parseFloat(document.getElementById('pagamentoValor').value),
                status: document.getElementById('pagamentoStatus').value
            };
            
            const resultUpdate = await atualizarPagamento(pagamentoId, alteracoes);
            
            if (resultUpdate.sucesso) {
                mostrarNotificacao('Pagamento atualizado com sucesso!', 'sucesso');
                closeModal('pagamentoModal');
                carregarPagamentos();
                formPagamento.onsubmit = null;
            } else {
                mostrarNotificacao(resultUpdate.erro || MENSAGENS.ERRO_ATUALIZACAO, 'erro');
            }
        };
        
        openModal('pagamentoModal');
        
    } catch (error) {
        console.error('Erro ao editar pagamento:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Confirma e deleta um pagamento
 */
async function deletarPagamentoConfirm(pagamentoId) {
    if (!confirm(MENSAGENS.CONFIRMACAO_DELECAO)) return;
    
    try {
        const resultado = await deletarPagamento(pagamentoId);
        
        if (resultado.sucesso) {
            mostrarNotificacao('Pagamento deletado com sucesso!', 'sucesso');
            carregarPagamentos();
        } else {
            mostrarNotificacao(resultado.erro || MENSAGENS.ERRO_DELECAO, 'erro');
        }
    } catch (error) {
        console.error('Erro ao deletar pagamento:', error);
        mostrarNotificacao(MENSAGENS.ERRO_DELECAO, 'erro');
    }
}

/**
 * Filtra pagamentos por status
 */
async function filtrarPagamentosPorStatus(status) {
    try {
        const resultado = await obterPagamentos({ status: status });
        
        if (resultado.sucesso) {
            renderizarPagamentos(resultado.dados);
        }
    } catch (error) {
        console.error('Erro ao filtrar pagamentos:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Obtém pagamentos vencidos
 */
async function obterPagamentosVencidos() {
    try {
        const resultado = await obterPagamentos();
        const hoje = new Date().toISOString().split('T')[0];
        
        const vencidos = resultado.dados.filter(p => p.data_vencimento < hoje && p.status !== 'Pago');
        
        return { sucesso: true, dados: vencidos };
    } catch (error) {
        console.error('Erro ao obter pagamentos vencidos:', error);
        return { sucesso: false, erro: error.message, dados: [] };
    }
}

/**
 * Obtém pagamentos próximos (próximos 7 dias)
 */
async function obterPagamentosProximos() {
    try {
        const resultado = await obterPagamentos();
        const hoje = new Date();
        const proximos7Dias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const proximos = resultado.dados.filter(p => {
            const data = new Date(p.data_vencimento);
            return data >= hoje && data <= proximos7Dias && p.status !== 'Pago';
        });
        
        return { sucesso: true, dados: proximos };
    } catch (error) {
        console.error('Erro ao obter pagamentos próximos:', error);
        return { sucesso: false, erro: error.message, dados: [] };
    }
}
