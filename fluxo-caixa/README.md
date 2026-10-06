# 💰 Sistema de Gestão de Fluxo de Caixa

Um sistema moderno e responsivo para controle de contas bancárias, despesas, pagamentos programados e notas fiscais integrado com Supabase.

## 🚀 Características

✅ Dashboard com visão consolidada de saldos  
✅ Gestão de múltiplas contas bancárias  
✅ Controle de despesas e notas fiscais  
✅ Agenda de pagamentos futuros  
✅ Autenticação segura com Supabase  
✅ Responsivo (Mobile, Tablet, Desktop)  
✅ Row Level Security (RLS) para segurança  
✅ Interface moderna com Tailwind CSS  

## 📋 Pré-requisitos

- Node.js 14+ (para desenvolvimento)
- Conta Supabase (gratuita em https://supabase.com)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

## 🔧 Instalação e Configuração

### 1️⃣ Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub/Google ou crie conta
4. Clique em "New Project"
5. Preencha os dados:
   - **Name**: Nome do seu projeto (ex: "fluxo-caixa")
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha mais próximo de você
6. Aguarde a criação (2-3 minutos)

### 2️⃣ Obter as Credenciais

1. No dashboard do Supabase, clique em "Settings" → "API"
2. Copie:
   - **Project URL** (cole como `VITE_SUPABASE_URL`)
   - **anon public key** (cole como `VITE_SUPABASE_ANON_KEY`)

### 3️⃣ Configurar Variáveis de Ambiente

1. Na pasta raiz do projeto, renomeie `.env.example` para `.env.local`
2. Preencha com suas credenciais:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 4️⃣ Criar o Schema do Banco de Dados

1. No Supabase, vá em "SQL Editor"
2. Clique em "New Query"
3. Cole o conteúdo do arquivo `database-schema.sql`
4. Clique em "Run" (execute o script completo)
5. Aguarde a criação das tabelas

### 5️⃣ Criar o Primeiro Usuário

#### Opção A: Via Supabase Dashboard (Recomendado para teste)

1. No Supabase, vá em "Authentication" → "Users"
2. Clique em "Create User"
3. Preencha:
   - **Email**: seu-email@example.com
   - **Password**: Crie uma senha forte
4. Clique em "Create User"

#### Opção B: Registro automático (Após ativar no sistema)

- O sistema criará usuário automaticamente quando você clicar em "Registrar"

### 6️⃣ Estrutura de Pastas

```
projeto-fluxo-caixa/
├── index.html
├── .env.local              (suas credenciais)
├── .env.example            (template)
├── database-schema.sql     (script do banco)
├── README.md               (este arquivo)
├── SETUP.md               (guia detalhado)
├── css/
│   └── styles.css
└── js/
    ├── config.js
    ├── auth.js
    ├── api.js
    ├── dashboard.js
    ├── contas.js
    ├── despesas.js
    ├── pagamentos.js
    ├── nf.js
    ├── relatorios.js
    └── utils.js
```

## 🔐 Primeiro Acesso

1. Abra `index.html` em um navegador
2. Clique em "Registrar" ou use credenciais que criou
3. **Email**: seu-email@example.com
4. **Senha**: sua-senha-forte
5. Clique em "Entrar"
6. Dashboard será carregado automaticamente

## 📊 Primeiros Passos no Sistema

### 1. Adicionar Contas Bancárias
- Vá em "Contas"
- Clique em "Nova Conta"
- Preencha: Nome, Banco, Agência, Número, Tipo, Saldo Inicial
- Clique em "Salvar"

### 2. Registrar Despesas
- Vá em "Despesas"
- Clique em "Nova Despesa"
- Preencha: Fornecedor, Valor, Data, Status, Categoria
- Clique em "Salvar"

### 3. Agendar Pagamentos
- Vá em "Pagamentos"
- Clique em "Novo Pagamento"
- Defina data, valor e descrição
- Clique em "Salvar"

### 4. Registrar Notas Fiscais
- Vá em "Notas Fiscais"
- Clique em "Nova NF"
- Preencha dados e faça upload do comprovante
- Clique em "Salvar"

## 🔑 Usuários e Perfis

O sistema suporta 4 perfis:

| Perfil | Permissões |
|--------|-----------|
| **Admin** | Acesso total + gerenciar usuários |
| **Gerente** | Visualizar + editar + deletar |
| **Operador** | Visualizar + registrar dados |
| **Visualizador** | Apenas visualizar dados |

Para alterar perfil de um usuário, um Admin deve ir em "Configurações" → "Usuários".

## 🌐 Deploy no GitHub Pages

1. Crie repositório no GitHub (ex: `fluxo-caixa`)
2. Clone em sua máquina:
```bash
git clone https://github.com/seu-usuario/fluxo-caixa.git
cd fluxo-caixa
```

3. Copie todos os arquivos para a pasta do repositório

4. Configure as variáveis de ambiente:
```bash
git config core.safecrlf false
git add .
git commit -m "Initial commit: Sistema de Fluxo de Caixa"
git push origin main
```

5. No GitHub, vá em Settings → Pages:
   - **Source**: Deploy from a branch
   - **Branch**: main → /root
   - **Save**

6. Acesse: `https://seu-usuario.github.io/fluxo-caixa/`

⚠️ **IMPORTANTE**: As chaves do Supabase no `.env.local` são públicas (anon key). Use RLS para segurança!

## 🛡️ Segurança

- ✅ Row Level Security (RLS) habilitado
- ✅ Autenticação JWT do Supabase
- ✅ Validação de entrada no frontend
- ✅ Variáveis de ambiente para credenciais
- ✅ Tokens expiráveis
- ✅ Logout seguro

## 📱 Responsividade

- ✅ Mobile (320px - 640px)
- ✅ Tablet (641px - 1024px)
- ✅ Desktop (1025px+)
- ✅ Gráficos adaptáveis
- ✅ Menu hamburger em mobile

## 🐛 Troubleshooting

### "Erro: Chave do Supabase não configurada"
→ Verifique se `.env.local` existe com as credenciais corretas

### "Erro ao carregar dados"
→ Verifique se o schema SQL foi executado completamente no Supabase

### "Erro de autenticação"
→ Certifique-se que o usuário foi criado no Supabase Authentication

### "Dados não aparecem no Dashboard"
→ Adicione contas primeiro em "Contas", depois refresh a página

## 📚 Documentação Adicional

Veja `SETUP.md` para guia detalhado passo a passo com screenshots.

## 💡 Dicas

1. **Backup**: Exporte dados regularmente do Supabase
2. **Performance**: Use filtros para períodos específicos
3. **Relatórios**: Gere relatórios mensais para análise
4. **Mobile**: Use em qualquer dispositivo, sempre sincronizado
5. **Backup na Nuvem**: Supabase faz backup automático diário

## 🤝 Suporte

Para problemas com:
- **Supabase**: https://supabase.com/docs
- **Tailwind**: https://tailwindcss.com/docs
- **JavaScript**: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript

## 📄 Licença

Este projeto é de uso livre. Sinta-se livre para modificar e distribuir.

---

**Desenvolvido com ❤️ para gestão financeira eficiente**