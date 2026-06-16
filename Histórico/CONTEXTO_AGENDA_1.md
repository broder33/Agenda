# CONTEXTO DO PROJETO — Agenda Pessoal com IA

## REGRAS DO CONTEXTO

> Estas regras garantem que o documento seja sempre consistente entre sessões.

1. **Acumulativo:** o documento nunca perde informações — cada nova versão acrescenta ao que já existe.
2. **Formatação consistente:** manter a mesma estrutura de seções, cabeçalhos e estilo entre versões.
3. **Histórico completo:** todas as versões de todas as sessões devem estar registradas, agrupadas por tema quando fizer sentido.
4. **Versão atual:** sempre atualizar a seção "VERSÃO ATUAL" ao encerrar uma sessão.
5. **Nada pode faltar:** ao encerrar uma sessão, comparar com o documento anterior e garantir que nenhuma seção, regra ou detalhe foi omitido.
6. **Regra de novo chat:** quando o chat ficar grande demais, atualizar este arquivo e iniciar novo chat com os 3 arquivos (index.html, sw.js, CONTEXTO_AGENDA_X.md). Esta regra deve constar no contexto.

---

## STACK E INFRAESTRUTURA

- **Arquivo:** Single HTML file (`index.html`) + `sw.js` (Service Worker PWA)
- **Hospedagem:** GitHub Pages — `https://broder33.github.io/Agenda` (repo: `Agenda`, usuário: `broder33`)
- **Auth/Sync:** Supabase — projeto `fxzikckzgvdwzvjysoao` (`https://fxzikckzgvdwzvjysoao.supabase.co`); tabela `agenda_data`, RLS configurado
- **IA:** Anthropic API — `claude-sonnet-4-20250514` (mesma do app Treino)
- **PWA:** Android (instalável), Chrome Desktop, Edge
- **Referência de arquitetura:** App de Treino (`broder33.github.io/Treino-Beta/`)
- **Google OAuth:** Client ID `962292865944-ialv4nnv2gqpgek5mjreto6goa9jbhhu.apps.googleusercontent.com` (projeto Google Cloud: Controle de Faturas, Web client 1)
- **Redirect URI Google Cloud:** `https://fxzikckzgvdwzvjysoao.supabase.co/auth/v1/callback` (adicionado na Sessão 1)

---

## VERSÃO ATUAL

- **App:** v0.0.01
- **Service Worker:** `agenda-v001`
- **Status:** v0.0.01 publicada — infraestrutura configurada, app funcional aguardando GitHub Pages
- **Sessão atual:** Sessão 1 — setup completo de infraestrutura

> **CONVENÇÃO DE VERSÃO:** mesma do app Treino. Após v0.0.09 vem v0.0.10, após v0.0.99 vem v0.1.00. O último número sempre tem dois dígitos. Sempre atualizar versão do app E `CACHE_NAME` do sw.js a cada entrega. A versão aparece no header (ao lado do logo) e na aba Config.

---

## VISÃO GERAL DO APP

Um hub pessoal de organização e produtividade com múltiplos módulos (abas), integração com IA inline, PWA instalável no Android, login Google via Supabase e persistência na nuvem. Filosofia: todas as abas "conversam" entre si — uma tarefa pode referenciar uma conta financeira, uma fatura do cartão pode virar uma tarefa, etc.

---

## ABAS DO APP (módulos)

| Aba | ID | Descrição |
|-----|----|-----------|
| Tarefas | `tasks` | Agenda principal — criação rápida de tarefas, organização por data/prioridade/classe/grupo |
| Finanças | `finance` | Gestão de contas mensais (migrado do `faturas_9.html`) |
| Cartão | `card` | Import de faturas PDF/Excel, classificação de despesas individuais |
| IA | `ai` | Chat central com contexto integrado de tarefas + finanças |
| Configurações | `settings` | Chave API, perfil, export/import, versão |

> **Novas abas podem ser adicionadas em futuras sessões** sem quebrar a arquitetura.

---

## ABA TAREFAS — Especificação

### Funcionalidades core
- **Criação rápida:** campo "quick add" sempre visível no topo (Enter para salvar)
- **Campos de uma tarefa:**
  ```javascript
  {
    id: string,            // uuid
    title: string,         // obrigatório
    description: string,   // opcional
    dueDate: string,       // ISO date, opcional
    priority: 'alta'|'media'|'baixa'|null,
    class: string,         // categoria livre (ex: "Pessoal", "Trabalho", "Saúde")
    group: string,         // grupo/lista (ex: "Casa", "Projetos")
    status: 'pendente'|'concluida'|'arquivada',
    linkedItems: [],       // refs para outros eventos/tarefas/contas
    notes: string,         // notas adicionais
    createdAt: string,     // ISO datetime
    updatedAt: string,
    tags: []               // tags livres
  }
  ```
- **Visualizações:** lista simples, agrupada por grupo
- **Ordenação:** por data, prioridade, nome, criação
- **Filtros:** por status, prioridade, grupo
- **Grupos:** criar, renomear, reordenar, remover (tarefas movidas para Geral ao remover)
- **Linking:** tarefa pode referenciar outra tarefa, conta financeira ou despesa de cartão
- **Chat inline IA:** botão ⚡ em cada tarefa abre chat com contexto da tarefa

### UX mobile-first
- Botão FAB para criação rápida no mobile
- Cards colapsáveis por grupo
- Modal completo para edição detalhada

---

## ABA FINANÇAS — Especificação

### Origem
Migrado integralmente do `faturas_9.html` (v9). O código existente é a base.

### Funcionalidades implementadas (v0.0.01)
- Organização por ano/mês com abas de ano
- Meses colapsáveis com pills de status (Pago, Não pago, Débito automático, Aguardando)
- Tabela: Nome | Vencimento | Valor | Status | Observações | Ações
- Status inline editável (dropdown)
- Dark mode / Light mode
- Modal de confirmação para remoção
- Botão "Próximo mês" para adicionar mês novo
- Botão de remoção do mês (apenas o último)
- Chat IA inline para análise do mês/ano

### Dados seed migrados
Contas reais de 2025 (Jan–Dez) e 2026 (Jan–Abr) do faturas_9.html.

### Novas funcionalidades (a implementar)
- Campo Categoria
- Linking com Tarefas
- Total anual acumulado no header

---

## ABA CARTÃO — Especificação

### Objetivo
Importar extrato do cartão de crédito (PDF, Excel, CSV) e classificar cada despesa individualmente.

### Fluxo implementado (v0.0.01)
1. Upload por clique ou drag-and-drop
2. IA extrai transações automaticamente via prompt Claude
3. Usuário classifica por categoria
4. Totais por fatura calculados automaticamente

### Campos de uma transação
```javascript
{
  id: string,
  faturaId: string,
  data: string,
  descricao: string,
  valor: number,
  parcela: string,
  categoria: string,
  status: 'classificada'|'pendente'|'ignorada'
}
```

### Categorias padrão
Alimentação, Transporte, Saúde, Educação, Lazer, Casa, Vestuário, Serviços, Outros

---

## INTEGRAÇÃO COM IA — Especificação

### Config
- Modelo: `claude-sonnet-4-20250514`
- Chave API: inserida pelo usuário na aba Config, salva no Supabase
- Sem proxy — chamada direta da API

### Chat inline
- Disponível em: card de tarefa (botão ⚡), aba Finanças (botão ⚡ IA), aba IA (chat central)
- Cada contexto envia system prompt com dados relevantes
- Histórico de chat por contexto em memória (sessão)

### Chat central (aba IA)
- System prompt inclui: total de tarefas pendentes + resumo financeiro do ano atual
- Histórico mantido durante a sessão

---

## AUTH E SYNC — Especificação

### Google OAuth via Supabase
- `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.href } })`
- Sessão persistida automaticamente pelo Supabase

### Tabela Supabase
```sql
create table agenda_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users unique not null,
  data jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);
alter table agenda_data enable row level security;
create policy "Usuário acessa apenas seus dados"
  on agenda_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### Estratégia de sync
- State completo serializado como JSON blob (mesmo padrão do app Treino)
- `saveState()` chamado após qualquer alteração
- `mergeState()` compara `_updatedAt` antes de sobrescrever
- Fallback para `localStorage` quando Supabase não configurado

---

## PWA — Especificação

### manifest.json
```json
{
  "name": "Agenda",
  "short_name": "Agenda",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#0f0f0f",
  "theme_color": "#0f0f0f"
}
```

### sw.js
- `CACHE_NAME = 'agenda-v001'`
- Bypass: `api.anthropic.com`, `supabase.co`, CDNs externos, `accounts.google.com`
- `index.html` sempre da rede (nunca cache)

---

## DESIGN SYSTEM

### Identidade visual
- **Tema base:** dark mode como padrão, light mode disponível via toggle
- **Paleta:**
  - `--bg: #0f0f0f`
  - `--surface: #161616`
  - `--surface2: #1e1e1e`
  - `--border: #2a2a2a`
  - `--accent: #6ee7b7` (verde-menta — diferente do amarelo do Treino)
  - `--accent2: #f97316` (laranja)
  - `--accent3: #60a5fa` (azul)
  - `--text: #f0f0f0`
  - `--muted: #555`
  - `--danger: #ef4444`
- **Tipografia:** Bebas Neue (display/logo), DM Sans (UI), DM Mono (botões/badges/dados)
- **Versão no header:** `<span>` discreto ao lado do logo, DM Mono 9px, cor `--muted`

---

## ARQUITETURA DO STATE

```javascript
state = {
  _updatedAt: string,
  _supabaseLoadComplete: bool,

  tasks: {
    items: [],           // array de task objects
    groups: [],          // [{ id, name, order }]
    viewMode: 'list',
    sortBy: 'created',
    filterStatus: 'all',
    chatHistory: {}      // por taskId (em memória)
  },

  finance: {
    bills: {},           // { year: { month: [bill, ...] } }
    activeMonths: {},    // { year: [0,1,2,...] }
    openMonths: {},      // { month: bool }
    currentYear: number,
    chatHistory: {}      // por 'YYYY-M' (em memória)
  },

  card: {
    faturas: [],         // lista de faturas importadas
    transactions: {},    // { faturaId: [transaction, ...] }
    categorias: [],      // categorias personalizadas
    chatHistory: {}      // por faturaId (em memória)
  },

  config: {
    apiKey: string,      // chave Anthropic (salva no Supabase)
    theme: 'dark'|'light',
    activeTab: string,
    userName: string,
    userEmail: string
  }
}
```

---

## PENDÊNCIAS E PRÓXIMOS PASSOS

### Infraestrutura (a completar)
- [ ] Ativar GitHub Pages no repositório `Agenda`
- [ ] Atualizar Site URL no Supabase → `https://broder33.github.io/Agenda`
- [ ] Adicionar Redirect URL no Supabase → `https://broder33.github.io/Agenda/index.html`
- [ ] Criar ícones PWA (`icons/icon-192.png`, `icons/icon-512.png`)

### Funcionalidades futuras
- [ ] Campo Categoria na aba Finanças
- [ ] Linking cross-module entre tarefas e contas
- [ ] Total anual acumulado no header de Finanças
- [ ] Relatório de gastos por categoria no Cartão
- [ ] Sugestão automática de categoria pela IA no Cartão
- [ ] Histórico de chat persistido no Supabase (atualmente só em memória)

---

## HISTÓRICO DE VERSÕES

### Sessão 1 (2026-05-21) — Setup completo

#### v0.0.01 — Primeira versão funcional
- Estrutura base: 5 abas (Tarefas, Finanças, Cartão, IA, Config)
- Stack configurada: HTML único + sw.js, Supabase, Anthropic API, GitHub Pages
- Design system: dark-first, accent verde-menta `#6ee7b7`
- Versão exibida no header (ao lado do logo) e na aba Config
- **Aba Tarefas:** criação rápida (quick add + Enter), modal completo, filtros, grupos criáveis/renomeáveis/removíveis, chat IA inline por tarefa
- **Aba Finanças:** migração completa do `faturas_9.html` com dados seed 2025/2026, edição inline, dropdown de status, chat IA inline
- **Aba Cartão:** upload drag-and-drop, extração de transações via IA, classificação por categoria
- **Aba IA:** chat central com contexto integrado (tarefas + finanças)
- **Aba Config:** chave API, dados da conta, export/import JSON
- Auth Google via Supabase configurado
- Tabela `agenda_data` criada com RLS
- Supabase: `fxzikckzgvdwzvjysoao.supabase.co`
- GitHub repo `Agenda` criado (broder33)
- Google OAuth redirect URI adicionado para o novo Supabase
- Fallback localStorage para uso sem Supabase

---

## ARQUIVOS DE TRABALHO

- `index.html` — app v0.0.01
- `sw.js` — `agenda-v001`
- `manifest.json` — PWA manifest
- `CONTEXTO_AGENDA_1.md` — este arquivo

---

## REGRA PARA NOVA SESSÃO

Ao iniciar nova sessão, o usuário deve anexar:
1. `index.html` (versão mais recente)
2. `sw.js` (versão mais recente)
3. `CONTEXTO_AGENDA_1.md` (versão mais recente)

A IA deve:
1. Ler o contexto completo antes de qualquer ação
2. Manter todas as convenções definidas aqui
3. Atualizar o histórico de versões ao final da sessão
4. Nunca omitir seções ao atualizar o documento
