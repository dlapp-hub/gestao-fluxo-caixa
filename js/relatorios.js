// =============================================
// MÓDULO DE RELATÓRIOS
// =============================================

import { supabase } from './config.js';
import { formatarMoeda, formatarData } from './utils.js';

class Relatorios {
  
  // Gerar Relatório de Fluxo de Caixa Mensal
  static async gerarFluxoCaixaMensal(ano, mes) {
    try {
      const userID = (await supabase.auth.getSession()).data.session?.user?.id;
      if (!userID) throw new Error('Usuário não autenticado');

      // Buscar saldos das contas
      const { data: contas, error: erroContas } = await supabase
        .from('contas')
        .select('*')
        .eq('user_id', userID)
        .eq('ativo', true);

      if (erroContas) throw erroContas;

      // Buscar despesas do mês
      const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
      const dataFim = new Date(ano, mes, 0).toISOString().split('T')[0];

      const { data: despesas, error: erroDespesas } = await supabase
        .from('despesas')
        .select('*')
        .eq('user_id', userID)
        .gte('data_despesa', dataInicio)
        .lte('data_despesa', dataFim);

      if (erroDespesas) throw erroDespesas;

      // Calcular totais
      const totalEntrada = contas.reduce((sum, c) => sum + (c.saldo_atual || 0), 0);
      const totalSaida = despesas.reduce((sum, d) => sum + (d.status === 'pago' ? d.valor : 0), 0);
      const totalPendente = despesas.reduce((sum, d) => sum + (d.status === 'pendente' ? d.valor : 0), 0);

      return {
        periodo: `${mes}/${ano}`,
        contas: contas,
        despesas: despesas,
        resumo: {
          totalEntrada,
          totalSaida,
          totalPendente,
          saldoLiquido: totalEntrada - totalSaida,
          contagemDespesas: despesas.length
        }
      };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }

  // Gerar Relatório por Fornecedor
  static async gerarRelatorioPorFornecedor(dataInicio, dataFim) {
    try {
      const userID = (await supabase.auth.getSession()).data.session?.user?.id;
      if (!userID) throw new Error('Usuário não autenticado');

      const { data: despesas, error } = await supabase
        .from('despesas')
        .select('*')
        .eq('user_id', userID)
        .gte('data_despesa', dataInicio)
        .lte('data_despesa', dataFim)
        .order('fornecedor');

      if (error) throw error;

      // Agrupar por fornecedor
      const porFornecedor = {};
      despesas.forEach(despesa => {
        if (!porFornecedor[despesa.fornecedor]) {
          porFornecedor[despesa.fornecedor] = {
            total: 0,
            pago: 0,
            pendente: 0,
            cancelado: 0,
            despesas: []
          };
        }
        
        porFornecedor[despesa.fornecedor].total += despesa.valor;
        porFornecedor[despesa.fornecedor][despesa.status] += despesa.valor;
        porFornecedor[despesa.fornecedor].despesas.push(despesa);
      });

      return {
        periodo: `${dataInicio} a ${dataFim}`,
        porFornecedor,
        totalGeral: despesas.reduce((sum, d) => sum + d.valor, 0)
      };
    } catch (error) {
      console.error('Erro ao gerar relatório por fornecedor:', error);
      throw error;
    }
  }

  // Gerar Relatório por Obra
  static async gerarRelatorioPorObra(dataInicio, dataFim) {
    try {
      const userID = (await supabase.auth.getSession()).data.session?.user?.id;
      if (!userID) throw new Error('Usuário não autenticado');

      const { data: nfs, error } = await supabase
        .from('notas_fiscais')
        .select('*')
        .eq('user_id', userID)
        .gte('data_emissao', dataInicio)
        .lte('data_emissao', dataFim);

      if (error) throw error;

      // Agrupar por obra
      const porObra = {};
      nfs.forEach(nf => {
        const obra = nf.obra_id || 'Sem Obra';
        if (!porObra[obra]) {
          porObra[obra] = {
            total: 0,
            nfCount: 0,
            notas: []
          };
        }
        
        porObra[obra].total += nf.valor_total;
        porObra[obra].nfCount += 1;
        porObra[obra].notas.push(nf);
      });

      return {
        periodo: `${dataInicio} a ${dataFim}`,
        porObra,
        totalGeral: nfs.reduce((sum, n) => sum + n.valor_total, 0)
      };
    } catch (error) {
      console.error('Erro ao gerar relatório por obra:', error);
      throw error;
    }
  }

  // Exportar Relatório para CSV
  static exportarCSV(dados, nomeArquivo) {
    try {
      let csv = '';

      if (dados.porFornecedor) {
        // CSV de Fornecedores
        csv = 'Fornecedor,Total (R$),Pago (R$),Pendente (R$),Cancelado (R$)\n';
        Object.entries(dados.porFornecedor).forEach(([fornecedor, info]) => {
          csv += `"${fornecedor}",${info.total.toFixed(2)},${info.pago.toFixed(2)},${info.pendente.toFixed(2)},${info.cancelado.toFixed(2)}\n`;
        });
      } else if (dados.porObra) {
        // CSV de Obras
        csv = 'Obra,Total (R$),Quantidade de NF\n';
        Object.entries(dados.porObra).forEach(([obra, info]) => {
          csv += `"${obra}",${info.total.toFixed(2)},${info.nfCount}\n`;
        });
      } else {
        // CSV Fluxo de Caixa
        csv = 'Conta,Saldo (R$)\n';
        dados.contas?.forEach(conta => {
          csv += `"${conta.nome}",${conta.saldo_atual.toFixed(2)}\n`;
        });
      }

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nomeArquivo}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      throw error;
    }
  }

  // Exportar Relatório para PDF (usando impressão)
  static async exportarPDF(html, nomeArquivo) {
    try {
      const janela = window.open('', '', 'width=800,height=600');
      janela.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${nomeArquivo}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f0f0f0; font-weight: bold; }
              .total { font-weight: bold; background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>${nomeArquivo}</h1>
            ${html}
          </body>
        </html>
      `);
      janela.document.close();
      janela.print();
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  }

  // Gerar HTML da tabela de relatório
  static gerarHTMLTabela(dados, tipo) {
    let html = '';

    if (tipo === 'fornecedor') {
      html += '<table><tr><th>Fornecedor</th><th>Total</th><th>Pago</th><th>Pendente</th><th>Cancelado</th></tr>';
      Object.entries(dados.porFornecedor).forEach(([fornecedor, info]) => {
        html += `<tr>
          <td>${fornecedor}</td>
          <td>${formatarMoeda(info.total)}</td>
          <td>${formatarMoeda(info.pago)}</td>
          <td>${formatarMoeda(info.pendente)}</td>
          <td>${formatarMoeda(info.cancelado)}</td>
        </tr>`;
      });
      html += '</table>';
    } else if (tipo === 'obra') {
      html += '<table><tr><th>Obra</th><th>Total</th><th>Qtd. NF</th></tr>';
      Object.entries(dados.porObra).forEach(([obra, info]) => {
        html += `<tr>
          <td>${obra}</td>
          <td>${formatarMoeda(info.total)}</td>
          <td>${info.nfCount}</td>
        </tr>`;
      });
      html += '</table>';
    }

    return html;
  }
}

export default Relatorios;