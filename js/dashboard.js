// ============================================================
// FUNÇÕES DO DASHBOARD
// ============================================================

let chartContasInstance = null;
let chartFluxoInstance = null;

/**
 * Carrega e renderiza o dashboard
 */
async function carregarDashboard() {
    try {
        // Carrega dados
        const contas = await obterContas();
        const despesas = await obterDespesas();
        const pagamentos = await obterPagamentos();
        
        if (!contas.sucesso || !despesas.sucesso || !pagamentos.sucesso) {
            mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
            return;
        }
        
        // Calcula totais
        const totalCaixa = contas.dados.reduce((sum, conta) => sum + (parseFloat(conta.saldo) || 0), 0);
        const totalComprometido = despesas.dados
            .filter(d => d.status !== 'Pago')
            .reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
        const totalDisponivel = totalCaixa - totalComprometido;
        
        // Atualiza cards
        document.getElementById('totalCaixa').textContent = formatarMoeda(totalCaixa);
        document.getElementById('totalComprometido').textContent = formatarMoeda(totalComprometido);
        document.getElementById('totalDisponivel').textContent = formatarMoeda(totalDisponivel);
        document.getElementById('totalContas').textContent = contas.dados.length;
        
        // Renderiza gráficos
        renderizarGraficoContas(contas.dados);
        renderizarGraficoFluxo(despesas.dados, pagamentos.dados);
        
        // Renderiza tabela de transações
        renderizarTransacoes(despesas.dados, pagamentos.dados);
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        mostrarNotificacao(MENSAGENS.ERRO_CARREGAMENTO, 'erro');
    }
}

/**
 * Renderiza o gráfico de distribuição por conta
 */
function renderizarGraficoContas(contas) {
    const ctx = document.getElementById('chartContas');
    if (!ctx) return;
    
    const labels = contas.map(c => c.nome);
    const valores = contas.map(c => parseFloat(c.saldo) || 0);
    
    // Destroi gráfico anterior se existir
    if (chartContasInstance) {
        chartContasInstance.destroy();
    }
    
    chartContasInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: CONFIG.CORES_GRAFICO,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatarMoeda(context.parsed);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza o gráfico de fluxo de caixa
 */
function renderizarGraficoFluxo(despesas, pagamentos) {
    const ctx = document.getElementById('chartFluxo');
    if (!ctx) return;
    
    // Agrupa despesas por dia (últimos 7 dias)
    const fluxoDias = {};
    const hoje = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const dataStr = data.toISOString().split('T')[0];
        fluxoDias[dataStr] = { entrada: 0, saida: 0 };
    }
    
    // Processa despesas
    despesas.forEach(d => {
        if (d.status === 'Pago' && fluxoDias[d.data]) {
            fluxoDias[d.data].saida += parseFloat(d.valor) || 0;
        }
    });
    
    // Processa pagamentos agendados
    pagamentos.forEach(p => {
        if (p.status === 'Pago' && fluxoDias[p.data_pagamento]) {
            fluxoDias[p.data_pagamento].saida += parseFloat(p.valor) || 0;
        }
    });
    
    const labels = Object.keys(fluxoDias).map(d => formatarData(d));
    const entradas = Object.values(fluxoDias).map(v => v.entrada);
    const saidas = Object.values(fluxoDias).map(v => v.saida);
    
    // Destroi gráfico anterior se existir
    if (chartFluxoInstance) {
        chartFluxoInstance.destroy();
    }
    
    chartFluxoInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Entradas',
                    data: entradas,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 1
                },
                {
                    label: 'Saídas',
                    data: saidas,
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatarMoeda(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatarMoeda(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza tabela de últimas transações
 */
function renderizarTransacoes(despesas, pagamentos) {
    const tbody = document.getElementById('transacoesTable');
    if (!tbody) return;
    
    // Combina despesas e pagamentos
    const transacoes = [];
    
    despesas.slice(0, 10).forEach(d => {
        transacoes.push({
            data: d.data,
            descricao: d.descricao || d.fornecedor,
            conta: d.conta_id,
            valor: parseFloat(d.valor) || 0,
            status: d.status,
            tipo: 'despesa'
        });
    });
    
    pagamentos.slice(0, 10).forEach(p => {
        transacoes.push({
            data: p.data_vencimento,
            descricao: p.descricao || p.fornecedor,
            conta: 'Agendado',
            valor: parseFloat(p.valor) || 0,
            status: p.status,
            tipo: 'pagamento'
        });
    });
    
    // Ordena por data decrescente
    transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Limpa tabela
    tbody.innerHTML = '';
    
    // Renderiza linhas
    transacoes.slice(0, 5).forEach(t => {
        const tr = document.createElement('tr');
        const corStatus = obterCorStatus(t.status);
        
        tr.innerHTML = `
            <td class="px-4 py-2">${formatarData(t.data)}</td>
            <td class="px-4 py-2">${sanitizarTexto(t.descricao)}</td>
            <td class="px-4 py-2 text-sm text-gray-500">${t.conta}</td>
            <td class="px-4 py-2 text-right font-semibold text-red-600">-${formatarMoeda(t.valor)}</td>
            <td class="px-4 py-2">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${corStatus}">
                    ${t.status}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if (transacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-4 text-center text-gray-500">Nenhuma transação ainda</td></tr>';
    }
}

/**
 * Atualiza dashboard em tempo real (a cada 30 segundos)
 */
function iniciarAtualizacaoAutomatica() {
    carregarDashboard();
    
    setInterval(() => {
        const dashboard = document.getElementById('dashboard');
        if (dashboard && !dashboard.classList.contains('hidden')) {
            carregarDashboard();
        }
    }, 30000); // 30 segundos
}
