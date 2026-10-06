// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================

/**
 * Formata um número como moeda em Real
 */
function formatarMoeda(valor) {
    if (typeof valor !== 'number') valor = parseFloat(valor) || 0;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

/**
 * Formata uma data no formato DD/MM/YYYY
 */
function formatarData(data) {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
}

/**
 * Formata uma data para o formato YYYY-MM-DD (para inputs)
 */
function formatarDataInput(data) {
    if (!data) return '';
    const d = new Date(data);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Obtém a data atual no formato YYYY-MM-DD
 */
function obterDataAtual() {
    const hoje = new Date();
    const year = hoje.getFullYear();
    const month = String(hoje.getMonth() + 1).padStart(2, '0');
    const day = String(hoje.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Abre um modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

/**
 * Fecha um modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    
    // Limpa o formulário se existir
    const form = modal?.querySelector('form');
    if (form) form.reset();
}

/**
 * Exibe uma mensagem de notificação
 */
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 animate-bounce ${
        tipo === 'sucesso' ? 'bg-green-500' :
        tipo === 'erro' ? 'bg-red-500' :
        tipo === 'aviso' ? 'bg-yellow-500' :
        'bg-blue-500'
    }`;
    notificacao.textContent = mensagem;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.remove();
    }, 4000);
}

/**
 * Mostra uma seção e esconde as outras
 */
function showSection(sectionId) {
    // Esconde todas as seções
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('fade-in');
    });
    
    // Mostra a seção selecionada
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        section.classList.add('fade-in');
    }
    
    // Fecha o sidebar em mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('sidebar-active')) {
        sidebar.classList.remove('sidebar-active');
        sidebar.classList.add('sidebar-inactive');
    }
    
    // Carrega dados da seção
    if (sectionId === 'dashboard') carregarDashboard();
    else if (sectionId === 'contas') carregarContas();
    else if (sectionId === 'despesas') carregarDespesas();
    else if (sectionId === 'pagamentos') carregarPagamentos();
    else if (sectionId === 'nf') carregarNotasFiscais();
}

/**
 * Toggle da visibilidade do sidebar em mobile
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('sidebar-inactive')) {
        sidebar.classList.remove('sidebar-inactive');
        sidebar.classList.add('sidebar-active');
    } else {
        sidebar.classList.add('sidebar-inactive');
        sidebar.classList.remove('sidebar-active');
    }
}

/**
 * Calcula a diferença em dias entre duas datas
 */
function diasEntre(data1, data2) {
    const d1 = new Date(data1);
    const d2 = new Date(data2);
    const diferenca = Math.abs(d2 - d1);
    return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
}

/**
 * Obtém a cor baseada no status
 */
function obterCorStatus(status) {
    const cores = {
        'Pendente': 'bg-yellow-100 text-yellow-800',
        'Pago': 'bg-green-100 text-green-800',
        'Agendado': 'bg-blue-100 text-blue-800',
        'Confirmado': 'bg-blue-100 text-blue-800',
        'Processando': 'bg-purple-100 text-purple-800',
        'Recebida': 'bg-gray-100 text-gray-800',
        'Aprovada': 'bg-green-100 text-green-800',
        'Paga': 'bg-green-100 text-green-800'
    };
    return cores[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Valida um email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Sanitiza string para evitar XSS
 */
function sanitizarTexto(texto) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return texto.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Cópia para clipboard
 */
function copiarParaClipboard(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        mostrarNotificacao('Copiado para clipboard!', 'sucesso');
    }).catch(() => {
        mostrarNotificacao('Erro ao copiar para clipboard', 'erro');
    });
}

/**
 * Gera um ID único
 */
function gerarIDUnico() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Calcula o total de um array de valores
 */
function calcularTotal(items, chave) {
    return items.reduce((sum, item) => sum + (parseFloat(item[chave]) || 0), 0);
}

/**
 * Agrupa um array por uma propriedade
 */
function agruparPor(array, chave) {
    return array.reduce((result, item) => {
        const grupo = item[chave];
        if (!result[grupo]) result[grupo] = [];
        result[grupo].push(item);
        return result;
    }, {});
}

/**
 * Ordena um array por uma propriedade
 */
function ordenarPor(array, chave, ordem = 'asc') {
    return [...array].sort((a, b) => {
        if (a[chave] < b[chave]) return ordem === 'asc' ? -1 : 1;
        if (a[chave] > b[chave]) return ordem === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Filtra um array por uma propriedade
 */
function filtrarPor(array, chave, valor) {
    return array.filter(item => item[chave] === valor);
}

/**
 * Busca em um array por múltiplas propriedades
 */
function buscar(array, termo, propriedades = []) {
    if (!termo) return array;
    const termoLower = termo.toLowerCase();
    return array.filter(item =>
        propriedades.some(prop => {
            const valor = item[prop];
            return valor && valor.toString().toLowerCase().includes(termoLower);
        })
    );
}

/**
 * Cria um delay (Promise)
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Converte um objeto em string JSON formatada
 */
function formatarJSON(obj) {
    return JSON.stringify(obj, null, 2);
}

/**
 * Obtém os parâmetros de URL
 */
function obterParametrosURL() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return params;
}

/**
 * Armazena dados no localStorage
 */
function armazenarLocal(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
    } catch (e) {
        console.error('Erro ao armazenar dados localmente:', e);
    }
}

/**
 * Recupera dados do localStorage
 */
function recuperarLocal(chave) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : null;
    } catch (e) {
        console.error('Erro ao recuperar dados localmente:', e);
        return null;
    }
}

/**
 * Remove dados do localStorage
 */
function removerLocal(chave) {
    try {
        localStorage.removeItem(chave);
    } catch (e) {
        console.error('Erro ao remover dados localmente:', e);
    }
}

/**
 * Extrai número de uma string formatada em moeda
 */
function extrairNumeroMoeda(moeda) {
    if (typeof moeda !== 'string') return parseFloat(moeda) || 0;
    return parseFloat(moeda.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
}

/**
 * Exporta dados para CSV
 */
function exportarParaCSV(dados, nomeArquivo = 'exportacao.csv') {
    if (!dados || dados.length === 0) {
        mostrarNotificacao('Nenhum dado para exportar', 'aviso');
        return;
    }
    
    const headers = Object.keys(dados[0]);
    const csv = [
        headers.join(','),
        ...dados.map(row => 
            headers.map(header => {
                const valor = row[header];
                if (typeof valor === 'string' && valor.includes(',')) {
                    return `"${valor}"`;
                }
                return valor;
            }).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    window.URL.revokeObjectURL(url);
    
    mostrarNotificacao('Dados exportados com sucesso!', 'sucesso');
}
