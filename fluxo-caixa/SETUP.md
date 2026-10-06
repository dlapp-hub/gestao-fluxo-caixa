# 🔧 GUIA DE CONFIGURAÇÃO PASSO A PASSO

## 📍 PASSO 1: Criar Conta no Supabase

1. Acesse: https://supabase.com
2. Clique em "Sign In" ou "Start for free"
3. Escolha "Continuar com GitHub" ou "Continuar com Google"
4. Autorize o acesso
5. Você será redirecionado ao dashboard

## 📍 PASSO 2: Criar Novo Projeto

1. No dashboard, clique em "New Project" ou "Novo Projeto"
2. Escolha sua organização (padrão está ok)
3. Preencha os dados:

```
Name: fluxo-caixa (ou seu nome preferido)
Database Password: Crie uma senha FORTE (anote em lugar seguro!)
Region: Escolha a mais próxima (ex: São Paulo, Dallas, etc.)
```

4. Clique em "Create new project"
5. **Aguarde 2-3 minutos** enquanto o projeto é criado

## 📍 PASSO 3: Obter as Credenciais de Acesso

1. Após criado, você verá o dashboard do seu projeto
2. Clique em "Settings" no menu inferior esquerdo
3. Clique em "API" no submenu
4. Você verá:

**URL do projeto (copiar esta):**
```
https://seu-projeto-xxxx.supabase.co
```

**Chaves (copiar a "anon public" abaixo):**
```
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ Copie estas informações em um arquivo de texto temporário

## 📍 PASSO 4: Configurar Arquivo .env.local

1. Na pasta do seu projeto, abra o arquivo `.env.example`
2. Salve uma cópia com o nome `.env.local`
3. Preencha:

```
VITE_SUPABASE_URL=https://seu-projeto-xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Salve o arquivo

## 📍 PASSO 5: Criar o Schema do Banco de Dados

### Opção A: Via Interface SQL Editor (Recomendado)

1. No Supabase, clique em "SQL Editor" na barra lateral
2. Clique em "New Query"
3. Abra o arquivo `database-schema.sql` em um editor de texto
4. Copie TODO o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique no botão "Run" (ícone de play ▶️) no canto inferior direito
7. Aguarde a execução (verá "Success" em verde)

### ✅ Tabelas Criadas:
- `profiles` - Dados dos usuários
- `contas` - Contas bancárias
- `despesas` - Registro de despesas
- `notas_fiscais` - NF's
- `pagamentos_programados` - Pagamentos futuros
- `movimentacoes` - Histórico de movimento

## 📍 PASSO 6: Habilitar Email/Senha no Supabase Auth

1. Vá em "Authentication" → "Providers"
2. Procure por "Email" e certifique-se que está ativado ✅
3. Clique em "Email" se precisar configurar

## 📍 PASSO 7: Criar o Primeiro Usuário

### Opção A: Criar via Dashboard (para teste rápido)

1. Vá em "Authentication" → "Users"
2. Clique em "Add User" ou "Create User"
3. Preencha:
   - **Email**: seu-email@exemplo.com
   - **Password**: Digite uma senha (ex: Senha123!@#)
   - **Auto Confirm user**: MARQUE esta opção ✅
4. Clique em "Create User"
5. Você verá a mensagem "User created successfully"

### Opção B: Criar via Sistema (Opção Register)

1. Abra `index.html` em um navegador
2. Clique em "Registrar"
3. Preencha:
   - **Email**: seu-email@exemplo.com
   - **Senha**: Crie uma senha forte
   - **Confirmar Senha**: Digite novamente
4. Clique em "Registrar"
5. Você receberá email de confirmação (se configurado)

## 📍 PASSO 8: Testar o Primeiro Acesso

1. Abra `index.html` em um navegador
2. Na tela de login, preencha:
   - **Email**: seu-email@exemplo.com (mesmo que criou)
   - **Senha**: sua-senha
3. Clique em "Entrar"
4. **Se bem-sucedido**, você será redirecionado ao Dashboard
5. **Se der erro**, verifique:
   - Email e senha estão corretos?
   - As credenciais do Supabase estão no `.env.local`?
   - O schema SQL foi executado?

## 📍 PASSO 9: Adicionar Dados Iniciais (Contas)

1. No Dashboard, clique em "Contas"
2. Clique em "Nova Conta"
3. Preencha um exemplo:

```
Nome: Cora Mais
Banco: Cora
Agência: 0001
Número: 123456-7
Tipo: Operacional
Saldo Inicial: 10000,00
```

4. Clique em "Salvar"
5. A conta deverá aparecer na lista

## ✅ VERIFICAÇÃO FINAL

Se você chegou aqui com sucesso:

- ✅ Projeto Supabase criado
- ✅ Credenciais configuradas
- ✅ Banco de dados com tabelas criado
- ✅ Primeiro usuário criado
- ✅ Primeiro acesso funcionando
- ✅ Primeira conta criada

## 🚀 Próximas Etapas

1. **Adicionar mais contas** conforme necessário
2. **Registrar despesas** do seu fluxo
3. **Agendar pagamentos** futuros
4. **Consultar relatórios** mensais
5. **Fazer deploy** no GitHub (veja README.md)

## 🆘 Problemas Comuns

### ❌ "ERRO: Supabase URL não configurada"

**Solução:**
1. Verifique se `.env.local` existe na raiz do projeto
2. Confirme se copiei a URL completa
3. Não deixe espaços em branco
4. Reload da página (Ctrl+F5 no PC, Cmd+Shift+R no Mac)

### ❌ "ERRO ao fazer login"

**Solução:**
1. Verifique se email está correto (maiúsculas importam)
2. Confirme senha
3. Acesse Supabase → Authentication → Users
4. Verifique se o usuário está lá com status "Confirmed"
5. Se não tiver confirmado, envie email de confirmação

### ❌ "ERRO: Tabelas não encontradas"

**Solução:**
1. Vá em Supabase → SQL Editor
2. No menu, clique em "show schema information"
3. Procure pelas tabelas listadas
4. Se não encontrar, execute novamente o `database-schema.sql`

### ❌ "Dashboard branco / sem dados"

**Solução:**
1. Abra o Console do Navegador (F12)
2. Vá em "Console"
3. Procure por mensagens de erro (em vermelho)
4. Se ver erro de CORS, verifique se a URL do Supabase está correta

## 📞 Contato e Dúvidas

Se tiver problemas após seguir este guia:

1. Revise todas as credenciais no `.env.local`
2. Confirme que o schema SQL foi executado completamente
3. Verifique o console do navegador (F12) para erros
4. Teste em um navegador diferente

---

**Parabéns! Seu sistema está pronto para uso! 🎉**