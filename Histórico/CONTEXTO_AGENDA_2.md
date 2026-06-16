# CONTEXTO DO PROJETO — Agenda Pessoal com IA

## REGRAS DO CONTEXTO

1. **Acumulativo:** o documento nunca perde informações — cada nova versão acrescenta ao que já existe.
2. **Formatação consistente:** manter a mesma estrutura de seções, cabeçalhos e estilo entre versões.
3. **Histórico completo:** todas as versões de todas as sessões devem estar registradas.
4. **Versão atual:** sempre atualizar a seção "VERSÃO ATUAL" ao encerrar uma sessão.
5. **Nada pode faltar:** ao encerrar uma sessão, garantir que nenhuma seção, regra ou detalhe foi omitido.
6. **Regra de novo chat:** quando o chat ficar grande demais, atualizar este arquivo e iniciar novo chat com os 3 arquivos (index.html, sw.js, CONTEXTO_AGENDA_1.md).

---

## STACK E INFRAESTRUTURA

- **Arquivo:** Single HTML file (`index.html`) + `sw.js` (Service Worker PWA)
- **Hospedagem:** GitHub Pages — `https://broder33.github.io/Agenda` (repo: `Agenda`, usuário: `broder33`)
- **Auth/Sync:** Supabase — projeto `fxzikckzgvdwzvjysoao` (`https://fxzikckzgvdwzvjysoao.supabase.co`); tabela `agenda_data`, RLS configurado
- **IA:** Anthropic API — `claude-sonnet-4-20250514`
- **PWA:** Android (instalável via Chrome), Chrome Desktop, Edge
- **Google OAuth:** Client ID `962292865944-ialv4nnv2gqpgek5mjreto6goa9jbhhu.apps.googleusercontent.com` (projeto Google Cloud: Controle de Faturas, Web client 1)
- **Redirect URI Google Cloud:** `https://fxzikckzgvdwzvjysoao.supabase.co/auth/v1/callback`
- **GitHub Pages URL Config (Supabase):** Site URL = `https://broder33.github.io/Agenda`, Redirect = `https://broder33.github.io/Agenda/index.html`

---

## VERSÃO ATUAL

- **App:** v0.0.28
- **Service Worker:** `agenda-v028`
- **Status:** App funcional com Tarefas (layout tabular, hierarquia recursiva, status/prioridade/data editáveis) e Finanças completas
- **Sessão atual:** Sessão 2 — desenvolvimento das abas Tarefas e Finanças

> **CONVENÇÃO DE VERSÃO:** versão muda a cada alteração de código (funcionalidade, bug fix). Preenchimento de dados NÃO conta como mudança de versão. Após v0.0.99 vem v0.1.00. A versão aparece no header (ao lado do logo) e na aba Config.

---

## VISÃO GERAL DO APP

Hub pessoal de organização com múltiplos módulos (abas), integração com IA inline, PWA instalável no Android, login Google via Supabase e persistência na nuvem. Filosofia: todas as abas "conversam" entre si.

---

## ABAS DO APP (módulos)

| Aba | ID | Status |
|-----|----|--------|
| Tarefas | `tasks` | ✅ Funcional |
| Finanças | `finance` | ✅ Funcional |
| Cartão | `card` | ✅ Estrutura criada |
| IA | `ai` | ✅ Chat central funcional |
| Configurações | `settings` | ✅ Funcional |

---

## ABA TAREFAS — Especificação e Estado Atual

### Layout
- **Tabela com colunas configuráveis** — header fixo sincronizado com rows
- **Colunas padrão:** Status (140px), Prioridade (110px), Data (90px)
- **Colunas configuráveis:** criar, mostrar/ocultar, reordenar via drag-and-drop, deletar (exceto as 3 padrão)
- **Ordenação por coluna:** clique no header ordena crescente, segundo clique decrescente (↑/↓ visível)
- **Quick add:** linha "+ Nova tarefa..." sempre no final da lista

### Hierarquia recursiva (sem limite de profundidade)
- Tarefas principais: check circular
- Subtarefas: check quadrado menor, recuadas com linha vertical à esquerda
- Contador de filhos concluídos (ex: `2/5`) na tarefa pai
- Botão ▶/▼ para expandir/colapsar — clicar no nome também expande
- Botão `+` em cada row para adicionar subtarefa
- `children[]` recursivo, não `subtasks[]`

### Status
- **Dropdown ao clicar** no badge de status (não ciclo)
- **Gerenciar Status** (botão ⚙ Status): criar, editar nome, editar cor (color picker), deletar customizados
- Status padrão (builtin: true): Pendente, Ação Necessária, Aguardando, Pausado, Concluída
- Cor definida por `color` (hex) e `bg` (rgba) no objeto do status
- Salvo em `state.tasks.statuses[]`

### Prioridade
- **Dropdown ao clicar** no badge de prioridade
- Opções: — (sem), Urgente, Alta, Média, Baixa, Normal
- Com dot colorido e check na atual

### Data
- **Dropdown flutuante ao clicar** na célula (mesmo padrão de Status/Prioridade)
- Input date nativo dentro do dropdown
- Botões OK e Limpar
- Fecha via `mousedown` com `contains()` check (não fecha ao interagir com o input)
- Mostra dia/mês/ano (ex: `4/Jan/27`)

### Seeds (TASK_SEED_VERSION = 'v3')
Dados importados do ClickUp — 10 tarefas de nível raiz:
- Cancelar HBO Anuidade, Verificar fechamento CNPJ Londrina, Vencimento tag ViaFácil, Cancelar Apple TV
- **Credit Suisse** (pai com 4 filhos): Levantar recursos, SWIFT, Advogado, Transferir UK
- **Suíça Passaporte** (pai com 13 filhos, um deles com 3 netos — Etapas 1/2/3)
- Plano de Saude, Marcar consulta Moris, Locar Vaga Garagem Osório, Anunciar memória DDR4

**Importante:** `applyTaskSeeds()` sempre reconstrói `state.tasks.items` do seed + itens criados pelo usuário (IDs não presentes nos seeds). `mergeState()` reseta `tasks.items = []` antes do merge para evitar duplicatas do localStorage.

### State structure (tasks)
```javascript
state.tasks = {
  items: [],           // array recursivo com children[]
  groups: [],          // legado — não usado no layout atual
  statuses: [],        // array de { id, label, color, bg, builtin }
  columns: [],         // array de { id, label, type, visible, order, width }
  sortColId: null,     // coluna ativa de ordenação
  sortDir: 'asc',      // 'asc' | 'desc'
  viewMode: 'list',
  filterStatus: 'all',
  chatHistory: {}
}
```

### Filtros disponíveis
- Status (select): Todas, Pendentes, Concluídas, Ação Necessária, Aguardando, Pausado
- Prioridade (select): todas as prioridades
- Ordenação (select): Criação, Data, Prioridade, Nome

---

## ABA FINANÇAS — Especificação e Estado Atual

### Funcionalidades
- Anos: 2025 e 2026 com abas de seleção
- Meses colapsáveis com pills de status e total
- Tabela: Nome | Vencimento | Valor | Status | Observações | Ações
- Status inline: dropdown ao clicar (Pago, Não pago, Débito automático, Aguardando emissão)
- Edição inline de células (nome, vencimento, valor, obs)
- Adicionar/remover contas por mês
- Adicionar próximo mês (copia estrutura do anterior com valores zerados)
- Remover último mês
- Chat IA inline (botão ⚡ IA)
- Total anual no subtitle

### Seeds (FINANCE_SEED_VERSION = 'v2')
- **2025:** Janeiro a Dezembro completos (Aluguel, Condomínio, Internet, Celular + variações)
- **2026:** Janeiro a Maio completos com valores e status reais
  - Abril: todos pagos (Aluguel 1598.03, Condomínio 1435.80, Compagás 58.68, Internet 81.81, Celular 288.27, Unimed 844.01)
  - Maio: Aluguel pago (1818.63), Condomínio não pago (1531.17), Compagás não pago (46.13), Internet pago (91.31), Celular débito automático, Unimed pago (844.01)

### Lógica de seed
- Seeds aplicados quando mês está vazio OU quando `_seedVersion` mudou
- `applySeeds()` chamado no init e no `onLogin()`

---

## ABA CARTÃO — Especificação

### Funcionalidades implementadas
- Upload drag-and-drop de PDF/CSV/Excel
- Extração de transações via IA (Claude)
- Classificação por categoria
- Totais por fatura

### Categorias padrão
Alimentação, Transporte, Saúde, Educação, Lazer, Casa, Vestuário, Serviços, Outros

---

## INTEGRAÇÃO COM IA

- Modelo: `claude-sonnet-4-20250514`
- Chave API: inserida na aba Config, salva no Supabase
- Chat central (aba IA): contexto com tarefas pendentes + resumo financeiro
- Chat inline: disponível em Finanças (botão ⚡ IA)
- Histórico em memória por sessão

---

## AUTH E SYNC

### Fluxo
1. `init()`: carrega localStorage → `applySeeds()` → `applyTaskSeeds()` → `renderAll()`
2. Se Supabase configurado: `initAuth()` → `onLogin()` → `loadFromSupabase()` → `mergeState()` → `applySeeds()` → `applyTaskSeeds()` → `renderAll()`

### mergeState — regra importante
- `tasks.items` é **sempre** resetado para `[]` antes do merge
- `applyTaskSeeds()` sempre reconstrói do seed após qualquer `mergeState()`
- Finance e Card são merged normalmente

### Tabela Supabase
```sql
create table agenda_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users unique not null,
  data jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);
alter table agenda_data enable row level security;
create policy "own" on agenda_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## PWA

- `CACHE_NAME = 'agenda-v028'`
- Bypass: `api.anthropic.com`, `supabase.co`, CDNs, `accounts.google.com`
- `index.html` sempre da rede
- Auto-update: `reg.update()` + `skipWaiting` + `reload` (mesmo padrão do app Treino)
- Instalado via Chrome (Samsung Browser tem suporte parcial)

---

## DESIGN SYSTEM

- **Tema:** dark mode padrão, light mode via toggle
- **Accent:** `#6ee7b7` (verde-menta)
- **Tipografia:** Bebas Neue (display), DM Sans (UI), DM Mono (mono/badges)
- **Versão no header:** `<span>` DM Mono 9px ao lado do logo
- **Ícone PWA:** letra "A" geométrica em verde-menta sobre fundo preto

---

## CONVENÇÕES DE CÓDIGO

### Strings HTML em JS
- **NUNCA** usar template literals aninhados (backticks dentro de backticks)
- **NUNCA** usar aspas simples dentro de strings de concatenação para atributos onclick
- Usar `&#39;` para aspas simples em atributos HTML gerados por JS
- Passar `this` diretamente em onclick quando possível (`onclick="fn(this)"`)
- Usar `data-*` attributes para passar dados em vez de IDs codificados
- Para inline styles em strings JS: usar propriedades individuais (`el.style.color = ...`) em vez de `cssText`

### Dropdown pattern (padrão correto — usar sempre)
```javascript
function openXxxDropdown(anchorEl, id) {
  closeXxxDropdown();
  var rect = anchorEl.getBoundingClientRect();
  var dd = document.createElement('div');
  dd.id = 'xxx-dd';
  // ... set styles via dd.style.xxx = ...
  dd.addEventListener('click', function(ev){ ev.stopPropagation(); });
  // ... add items
  document.body.appendChild(dd);
  // Fechar via mousedown com contains() check
  function outsideClick(ev) {
    var el = document.getElementById('xxx-dd');
    if (el && el.contains(ev.target)) return;
    closeXxxDropdown();
    document.removeEventListener('mousedown', outsideClick);
  }
  setTimeout(function(){ document.addEventListener('mousedown', outsideClick); }, 150);
}
function closeXxxDropdown() { var el=document.getElementById('xxx-dd'); if(el)el.remove(); }
```

### Verificação de sintaxe
Sempre rodar `node --check` antes de entregar. Erros comuns:
- `font-family:'DM Mono'` dentro de string JS → usar propriedade individual
- `\n` literal em strings → usar `\\n`
- `—` (em dash) em objeto JS → usar `'\u2014'`

---

## PENDÊNCIAS E PRÓXIMOS PASSOS

### Features a implementar
- [ ] Modal de edição completo de tarefa (título, descrição, links)
- [ ] Campo de descrição/notas inline na tarefa
- [ ] Linking cross-module entre tarefas e contas financeiras
- [ ] Chat IA inline em tarefas individuais
- [ ] Persistência do estado expanded das tarefas no Supabase
- [ ] Histórico de chat persistido no Supabase
- [ ] Campo Categoria na aba Finanças
- [ ] Relatório de gastos por categoria no Cartão
- [ ] Sugestão automática de categoria pela IA no Cartão
- [ ] Exportar dados (funciona no browser, não no Claude.ai iframe)

### Bugs conhecidos
- Exportar JSON não funciona no Claude.ai (iframe bloqueia download) — funciona no GitHub Pages
- Service Worker não registra no Claude.ai (esperado — só funciona no GitHub Pages)

---

## HISTÓRICO DE VERSÕES

### Sessão 1 (2026-05-21) — Setup
- v0.0.01: Estrutura base, 5 abas, seeds finanças, auth Google, Supabase
- v0.0.02: App abre sem login (modo offline), auto-update PWA via skipWaiting
- v0.0.03: Dados financeiros corrigidos (Abril) e Maio adicionado
- v0.0.04: Service Worker auto-update igual ao app Treino
- v0.0.05: FINANCE_SEED_VERSION v2, seed reaplicado via versão

### Sessão 2 (2026-05-26) — Tarefas e UX
- v0.0.06: Subtarefas, seeds do ClickUp, novos status (Ação Necessária, Pausado, etc)
- v0.0.07: Fix — applyTaskSeeds não era chamado no init
- v0.0.08: Estrutura recursiva (children[] sem limite de profundidade), renderização recursiva
- v0.0.09: Fix sintaxe — template literals aninhados quebrados
- v0.0.10: App mostra conteúdo por padrão (sem tela de login bloqueando)
- v0.0.11: Fix sintaxe — aspas em onclick usando &#39;
- v0.0.12: Módulos Finance e Card restaurados (foram apagados acidentalmente)
- v0.0.13: Layout tabular com colunas configuráveis, hierarquia visual (quadrado vs círculo)
- v0.0.14: Alinhamento de colunas com larguras fixas, ordenação por header, expand ao clicar no nome
- v0.0.15: TASK_SEED_VERSION v3 para forçar reset de duplicatas
- v0.0.16: applyTaskSeeds usa localStorage key separada para versão
- v0.0.17: applyTaskSeeds reconstrói sempre do seed (remove duplicatas definitivamente)
- v0.0.18: mergeState reseta tasks.items=[] antes do merge; applyTaskSeeds chamado no onLogin
- v0.0.19: Status dropdown (clicar → menu), Gerenciar Status (criar/editar/deletar/cor)
- v0.0.20: Prioridade dropdown, Date picker flutuante
- v0.0.21: Data com ano (dia/mês/ano)
- v0.0.22: Fix date picker — stopPropagation interno
- v0.0.23: Date editing inline na célula
- v0.0.24: Fix sintaxe — cssText com font-family quebrado
- v0.0.25: Date onclick usa this + data-taskid
- v0.0.26: Date dropdown via createElement (mesmo padrão Status/Prioridade)
- v0.0.27: Fix — onclick da célula de data havia sumido
- v0.0.28: Fix — dropdown fecha via mousedown+contains() em vez de click; data funciona

---

## ARQUIVOS DE TRABALHO

- `index.html` — app v0.0.28
- `sw.js` — `agenda-v028`
- `manifest.json` — PWA manifest
- `icons/icon-192.png` e `icons/icon-512.png` — ícone "A" verde-menta
- `CONTEXTO_AGENDA_1.md` — este arquivo

---

## REGRA PARA NOVA SESSÃO

Ao iniciar nova sessão, enviar:
1. `index.html` (versão mais recente)
2. `sw.js` (versão mais recente)
3. `CONTEXTO_AGENDA_1.md` (este arquivo)

A IA deve:
1. Ler o contexto completo antes de qualquer ação
2. Verificar sintaxe JS com `node --check` antes de entregar
3. Atualizar versão a cada mudança de código
4. Atualizar este documento ao final da sessão
5. Nunca omitir seções ao atualizar
