// ============================================================
// FUNÇÕES DE ACESSO ÀS APIS DO SUPABASE
// ============================================================

/**
 * Cria uma nova conta bancária
 */
async function criarConta(conta) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        const { data, error } = await supabaseClient
            .from(TABLES.CONTAS)
            .insert([{
                usuario_id: user.id,
                nome: conta.nome,
                banco: conta.banco,
                saldo: parseFloat(conta.saldo),
                tipo: conta.tipo,
                ativa: true,
                data_criacao: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        return { sucesso: true, dados: data };
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Obtém todas as contas do usuário
 */
async function obterContas() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        const { data, error } = await supabaseClient
            .from(TABLES.CONTAS)
            .select('*')
            .eq('usuario_id', user.id)
            .eq('ativa', true)
            .order('data_criacao', { ascending: false });
        
        if (error) throw error;
        return { sucesso: true, dados: data || [] };
    } catch (error) {
        console.error('Erro ao obter contas:', error);
        return { sucesso: false, erro: error.message, dados: [] };
    }
}

/**
 * Obtém uma conta específica
 */
async function obterConta(id) {
    try {
        const { data, error } = await supabaseClient
            .from(TABLES.CONTAS)
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return { sucesso: true, dados: data };
    } catch (error) {
        console.error('Erro ao obter conta:', error);
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Atualiza uma conta
 */
async function atualizarConta(id, alteracoes) {
    try {
        const { data, error } = await supabaseClient
            .from(TABLES.CONTAS)
            .update(alteracoes)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return { sucesso: true, dados: data };
    } catch (error) {
        console.error('Erro ao atualizar conta:', error);
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Deleta uma conta (soft delete)
 */
async function deletarConta(id) {
    try {
        const { data, error } = await supabaseClient
            .from(TABLES.CONTAS)
            .update({ ativa: false })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return { sucesso: true, dados: data };
    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        return { sucesso: false, erro: error.message };
    }
}

// ============================================================
// DESPESAS
// ============================================================

/**
 * Cria uma nova despesa
 */
async function criarDespesa(despesa) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        const { data, error } = await supabaseClient
            .from(TABLES.DESPESAS)
            .insert([{
                usuario_id: user.id,
                data: despesa.data,
                fornecedor: despesa.fornecedor,
                descricao: despesa.descricao,
                valor: parseFloat(despesa.valor),
                conta_id: despesa.conta_id,
                status: despesa.status,
                nf_id: despesa.nf_id || null,
                data_criacao: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        return { sucesso: true, dados: data };
    } catch (error) {
        console.error('Erro ao criar despesa:', error);
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Obtém todas as despesas do usuário
 */
async function obterDespesas(filtros = {}) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        let query = supabaseClient
            .from(TABLES.DESPESAS)
            .select('*')
            .eq('usuario_id', user.id);
        
        if (filtros.status) query = query.eq('status', filtros.status);
        if (filtros.conta_id) query = query.eq('conta_id', filtros.conta_id);
        if (filtros.fornecedor) query = query.ilike('fornecedor', `%${filtros.fornecedor}%`);
        
        const { data, error } = await query.order('data', { ascending: false });
        
        if (error) throw error;
        return { sucesso: true, dados: data || [] };
    } catch (error) {
        console.error('Erro ao obter despesas:', error);
        return { sucesso: false, erro: error.message, dados: [] };
    }
}

/**
 * Atualiza uma despesa
 */
async function atualizarDespesa(id, alteracoes) {
    try {
        const { data, error } = await supabaseClient
            .from(TABLES.DESPESAS)
            .update(alteracoes)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return { sucesso: true, dados: data };
    } catch (error) {
        console.error('Erro ao atualizar despesa:', error);
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Deleta uma despesa
 */
async function deletarDespesa(id) {
    try {
        const { data, error } = await supabaseClient
            .from(TABLES.DESPESAS)
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return { sucesso: true };
    } catch (error) {
        console.error('Erro ao deletar despesa:', error);
        return { sucesso: false, erro: error.message };
    }
}

// ============================================================
// PAGAMENTOS
// ============================================================

/**
 * Cria um pagamento agendado
 */
async function criarPagamento(pagamento) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        const { data, error } = await supabaseClient
            .from(TABLES.PAGAMENTOS)
            .insert([{
                usuario_id: user.id,
                data_vencimento: pagamento.data_vencimento,
                descricao: pagamento.descricao,
                fornecedor: pagamento.fornecedor,
                valor: parseFloat(pagamento.valor),
                status: pagamento.status,
                data_criacao: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        return { sucesso: true, dados: data };
    } catch (error) {
        console.error('Erro ao criar pagamento:', error);
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Obtém pagamentos agendados do usuário
 */
async function obterPagamentos(filtros = {}) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        let query = supabaseClient
            .from(TABLES.PAGAMENTOS)
            .select('*')
            .eq('usuario_id', user.id);
        
        if (filtros.status) query = query.eq('status', filtros.status);
        if (filtros.mes) {
            const dataInicio = `${filtros.mes}-01`;
            const dataFim = new Date(filtros.mes + '-01');
            dataFim.setMonth(dataFim.getMonth() + 1);
            query = query.gte('data_vencimento', dataInicio)
                        .lt('data_vencimento', dataFim.toISOString().split('T')[0]);
        }
        
        const { data, error } = await query.order('data_vencimento', { ascending: true });
        
        if (error) throw error;
        return { sucesso: true, dados: data || [] };
    } catch (error) {
        console.error('Erro ao obter pagamentos:', error);
        return { sucesso: false, erro: error.message, dados: [] };
    }
}

/**
 * Atualiza um pagamento
 */
async function atualizarPagamento(id, alteracoes) {
    try {
        const { data, error } = await supabaseClient
            .from(TABLES.PAGAMENTOS)
            .update(alteracoes)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return { sucesso: true, dados: data };
    } catch (error) {
        console.error('Erro ao atualizar pagamento:', error);
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Deleta um pagamento
 */
async function deletarPagamento(id) {
    try {
        const { data, error } = await supabaseClient
            .from(TABLES.PAGAMENTOS)
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return { sucesso: true };
    } catch (error) {
        console.error('Erro ao deletar pagamento:', error);
        return { sucesso: false, erro: error.message };
    }
}

// ============================================================
// NOTAS FISCAIS
// ============================================================

/**
 * Cria uma nota fiscal
 */
async function criarNotaFiscal(nf) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        const { data, error } = await supabaseClient
            .from(TABLES.NOTAS_FISCAIS)
            .insert([{
                usuario_id: user.id,
                numero: nf.numero,
                fornecedor: nf.fornecedor,
                obra: nf.obra,
                valor: parseFloat(nf.valor),
                status: nf.status,
                data_emissao: new Date().toISOString().split('T')[0],
                data_criacao: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        return { sucesso: true, dados: data };
    } catch (error) {
        console.error('Erro ao criar nota fiscal:', error);
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Obtém notas fiscais do usuário
 */
async function obterNotasFiscais(filtros = {}) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        let query = supabaseClient
            .from(TABLES.NOTAS_FISCAIS)
            .select('*')
            .eq('usuario_id', user.id);
        
        if (filtros.fornecedor) query = query.ilike('fornecedor', `%${filtros.fornecedor}%`);
        if (filtros.status) query = query.eq('status', filtros.status);
        if (filtros.obra) query = query.ilike('obra', `%${filtros.obra}%`);
        
        const { data, error } = await query.order('data_emissao', { ascending: false });
        
        if (error) throw error;
        return { sucesso: true, dados: data || [] };
    } catch (error) {
        console.error('Erro ao obter notas fiscais:', error);
        return { sucesso: false, erro: error.message, dados: [] };
    }
}

/**
 * Atualiza uma nota fiscal
 */
async function atualizarNotaFiscal(id, alteracoes) {
    try {
        const { data, error } = await supabaseClient
            .from(TABLES.NOTAS_FISCAIS)
            .update(alteracoes)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return { sucesso: true, dados: data };
    } catch (error) {
        console.error('Erro ao atualizar nota fiscal:', error);
        return { sucesso: false, erro: error.message };
    }
}

/**
 * Deleta uma nota fiscal
 */
async function deletarNotaFiscal(id) {
    try {
        const { data, error } = await supabaseClient
            .from(TABLES.NOTAS_FISCAIS)
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return { sucesso: true };
    } catch (error) {
        console.error('Erro ao deletar nota fiscal:', error);
        return { sucesso: false, erro: error.message };
    }
}
