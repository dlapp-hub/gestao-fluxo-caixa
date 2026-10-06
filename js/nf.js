// ============================================================
// FUNÇÕES DE NOTAS FISCAIS
// ============================================================

/**
 * Carrega e renderiza as notas fiscais
 */
async function carregarNotasFiscais() {
    try {
        const resultado = await obterNotasFiscais();
        
        if (!resultado.sucesso) {
            mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
            return;
        }
        
        renderizarNotasFiscais(resultado.dados);
        
    } catch (error) {
        console.error('Erro ao carregar notas fiscais:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Renderiza tabela de notas fiscais
 */
function renderizarNotasFiscais(nfs) {
    const tbody = document.getElementById('nfTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (nfs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-gray-500">Nenhuma nota fiscal cadastrada</td></tr>';
        return;
    }
    
    nfs.forEach(nf => {
        const corStatus = obterCorStatus(nf.status);
        
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50';
        
        tr.innerHTML = `
            <td class="px-4 py-2 font-semibold text-blue-600">${sanitizarTexto(nf.numero)}</td>
            <td class="px-4 py-2">${sanitizarTexto(nf.fornecedor)}</td>
            <td class="px-4 py-2 text-gray-600">${sanitizarTexto(nf.obra)}</td>
            <td class="px-4 py-2 text-right font-bold text-blue-600">${formatarMoeda(nf.valor)}</td>
            <td class="px-4 py-2">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${corStatus}">
                    ${nf.status}
                </span>
            </td>
            <td class="px-4 py-2 text-center">
                <button onclick="editarNotaFiscal('${nf.id}')" class="text-blue-600 hover:text-blue-800 mr-3" title="Editar">
                    ✎
                </button>
                <button onclick="deletarNFConfirm('${nf.id}')" class="text-red-600 hover:text-red-800" title="Deletar">
                    🗑
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Trata o envio do formulário de nova NF
 */
document.addEventListener('DOMContentLoaded', function() {
    const formNF = document.getElementById('formNF');
    if (formNF) {
        formNF.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nf = {
                numero: document.getElementById('nfNumero').value,
                fornecedor: document.getElementById('nfFornecedor').value,
                obra: document.getElementById('nfObra').value,
                valor: document.getElementById('nfValor').value,
                status: document.getElementById('nfStatus').value
            };
            
            const resultado = await criarNotaFiscal(nf);
            
            if (resultado.sucesso) {
                mostrarNotificacao(MENSAGENS.SUCESSO_NF_CRIADA, 'sucesso');
                closeModal('nfModal');
                carregarNotasFiscais();
            } else {
                mostrarNotificacao(resultado.erro || MENSAGENS.ERRO_CRIACAO, 'erro');
            }
        });
    }
});

/**
 * Edita uma nota fiscal
 */
async function editarNotaFiscal(nfId) {
    try {
        const resultado = await obterNotasFiscais();
        const nf = resultado.dados.find(n => n.id === nfId);
        
        if (!nf) {
            mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
            return;
        }
        
        // Preenche modal
        document.getElementById('nfNumero').value = nf.numero;
        document.getElementById('nfFornecedor').value = nf.fornecedor;
        document.getElementById('nfObra').value = nf.obra;
        document.getElementById('nfValor').value = nf.valor;
        document.getElementById('nfStatus').value = nf.status;
        
        // Muda função do formulário
        const formNF = document.getElementById('formNF');
        formNF.onsubmit = async function(e) {
            e.preventDefault();
            
            const alteracoes = {
                numero: document.getElementById('nfNumero').value,
                fornecedor: document.getElementById('nfFornecedor').value,
                obra: document.getElementById('nfObra').value,
                valor: parseFloat(document.getElementById('nfValor').value),
                status: document.getElementById('nfStatus').value
            };
            
            const resultUpdate = await atualizarNotaFiscal(nfId, alteracoes);
            
            if (resultUpdate.sucesso) {
                mostrarNotificacao('Nota Fiscal atualizada com sucesso!', 'sucesso');
                closeModal('nfModal');
                carregarNotasFiscais();
                formNF.onsubmit = null;
            } else {
                mostrarNotificacao(resultUpdate.erro || MENSAGENS.ERRO_ATUALIZACAO, 'erro');
            }
        };
        
        openModal('nfModal');
        
    } catch (error) {
        console.error('Erro ao editar nota fiscal:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Confirma e deleta uma nota fiscal
 */
async function deletarNFConfirm(nfId) {
    if (!confirm(MENSAGENS.CONFIRMACAO_DELECAO)) return;
    
    try {
        const resultado = await deletarNotaFiscal(nfId);
        
        if (resultado.sucesso) {
            mostrarNotificacao('Nota Fiscal deletada com sucesso!', 'sucesso');
            carregarNotasFiscais();
        } else {
            mostrarNotificacao(resultado.erro || MENSAGENS.ERRO_DELECAO, 'erro');
        }
    } catch (error) {
        console.error('Erro ao deletar nota fiscal:', error);
        mostrarNotificacao(MENSAGENS.ERRO_DELECAO, 'erro');
    }
}

/**
 * Filtra NF por status
 */
async function filtrarNFPorStatus(status) {
    try {
        const resultado = await obterNotasFiscais({ status: status });
        
        if (resultado.sucesso) {
            renderizarNotasFiscais(resultado.dados);
        }
    } catch (error) {
        console.error('Erro ao filtrar NF:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Busca NF por fornecedor
 */
async function buscarNFPorFornecedor(termo) {
    try {
        const resultado = await obterNotasFiscais({ fornecedor: termo });
        
        if (resultado.sucesso) {
            renderizarNotasFiscais(resultado.dados);
        }
    } catch (error) {
        console.error('Erro ao buscar NF:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Busca NF por obra/projeto
 */
async function buscarNFPorObra(termo) {
    try {
        const resultado = await obterNotasFiscais({ obra: termo });
        
        if (resultado.sucesso) {
            renderizarNotasFiscais(resultado.dados);
        }
    } catch (error) {
        console.error('Erro ao buscar NF por obra:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}
