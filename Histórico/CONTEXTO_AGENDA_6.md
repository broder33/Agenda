# CONTEXTO DO PROJETO — Agenda Pessoal com IA

## REGRA CRÍTICA DE CONTEXTO
**Os contextos são SEMPRE acumulativos.** Todo o conteúdo do contexto anterior deve estar presente no contexto novo, com adições/atualizações da sessão corrente. Nunca omitir informação de sessões anteriores. Ao criar o próximo contexto (CONTEXTO_AGENDA_7.md), seguir essa mesma regra.

---

## STACK E INFRAESTRUTURA
- **Arquivo:** Single HTML + sw.js (Service Worker PWA)
- **Hospedagem:** GitHub Pages — `https://broder33.github.io/Agenda`
- **Auth/Sync:** Supabase — projeto `fxzikckzgvdwzvjysoao`; tabela `agenda_data`, RLS configurado
- **IA:** Anthropic API — `claude-sonnet-4-20250514`
- **SheetJS:** parsing XLSX/CSV para importação de faturas
- **Google OAuth Client ID:** `962292865944-ialv4nnv2gqpgek5mjreto6goa9jbhhu.apps.googleusercontent.com`

## VERSÃO ATUAL
- **App:** v0.4.23
- **Service Worker:** `agenda-v0423`
- **Arquivos de trabalho:** `/home/claude/index.html` e `/home/claude/sw.js`
- **Outputs:** `/mnt/user-data/outputs/index.html` e `/mnt/user-data/outputs/sw.js`

## CONVENÇÃO DE VERSÃO
Após v0.3.99 vem v0.4.00, depois v0.4.01, etc. Versão muda a cada alteração de código (não em alterações de dados). Aparece no header e aba Config. Sempre entregar index.html + sw.js juntos.

---

## HISTÓRICO COMPLETO DE VERSÕES

### Sessão 1 (v0.0.28 → v0.0.56)
Features base: tarefas, finanças, cartão, IA, config, auth Google/Supabase, PWA.

### Sessão 2 (v0.0.57 → v0.1.06)

**v0.0.57-60** — Select de ordenação corrigido; Status adicionado como opção de sort

**v0.0.61-62** — Select sem opções abre gerenciador direto; "⚙ Gerenciar opções" no rodapé do dropdown Select

**v0.0.63-64** — Sort dinâmico inclui colunas Select; `customFields` adicionado a USER_FIELDS (crítico!)

**v0.0.65** — Ordenação multinível: header clicável cicla asc→desc→remove; badges `1↑`, `2↓`

**v0.0.66** — Modal tarefa: campos Select dinâmicos; date picker customizado

**v0.0.67-86** — Múltiplas iterações para resolver título truncado; calendário no modal; word-wrap

**v0.0.87** — Número de ordem no sort; coluna Nome ordenável (`_name`)

**v0.0.88-89** — ⚙ Gerenciar opções embutido nos dropdowns Status e Prioridade; terminologia padronizada

**v0.0.90** — Prioridade: largura 90→100px para acomodar sort icon

**v0.0.91** — Filtros unificados em "⚡ Filtros" (dropdown com Status, Prioridade, Select cols, adicionar/remover); `_activeFilters`, `_visibleFilters`

**v0.0.92** — Propagação para subgrupos: ao alterar campo em tarefa com filhos, prompt Não/Sim Dinâmico/Sim Fixo; `_locked` em USER_FIELDS

**v0.0.93** — Status "Encerrada" (`role: 'closed'`); área "Encerradas" colapsável abaixo da lista

**v0.0.94** — Fix: "Encerrada" injetada automaticamente via `getStatuses()` para usuários existentes

**v0.0.95** — Desfazer: botão ↩ na toolbar de tarefas; Ctrl+Z; snapshot em saveState

**v0.0.96-98** — ↩ Desfazer e ↪ Refazer no header principal; Ctrl+Z/Ctrl+Y; redo só aparece após undo; pushUndo() chamado ANTES de cada mutação

**v0.0.99-v0.1.02** — Abas editáveis via double-click; "Finanças" → "Contas" por padrão; `state.config.tabLabels`; TAB_DEFAULTS; switchTab não re-renderiza tabs

**v0.1.03-04** — Janelas de comentários: drag pelo header + resize manual (mousedown no canto); textarea e lista expandem com a janela (flex: 1)

**v0.1.05** — Fix Enter na edição (não fecha mais); numeração automática (1.→2.→3., -→-)

**v0.1.06** — Fix word-wrap no editor de comentários

### Sessão 3 (v0.1.07 → v0.1.43)

**v0.1.07-09** — Resize manual via handle JS; edição inline na janela de comentários; fixes de overflow

**v0.1.10-22** — Múltiplas iterações para resize no mobile e desktop; touch support no handle e drag; janela limitada à viewport ao abrir; `comment-menu-btn` sempre visível em touch

**v0.1.23** — Cadeia flex completa para editor preencher espaço ao redimensionar

**v0.1.24** — Numeração automática com `setRangeText`

**v0.1.25** — Bullet usa `•` em vez de `-`; `parseCommentText` reconhece `•`, `*`, `-`

**v0.1.26-28** — Indentação de listas com `!important` para sobrepor reset CSS

**v0.1.29** — Backspace inteligente: apaga prefixo de lista inteiro de uma vez

**v0.1.30-32** — Ctrl+Z no editor via `execCommand('insertText')`

**v0.1.33** — `overflow: hidden` removido do `comment-item` e `comment-body`

**v0.1.34** — Editor reescrito com `contenteditable` (WYSIWYG). `buildFormatToolbar`, `createEditor(text)`, `editorToText(editor)`

**v0.1.35-43** — Bullets aninhados, `mergeConsecutiveOLs()`, `editorToText` reescrito, Ctrl+Z corrigido

### Sessão 3 continuação (v0.1.44 → v0.2.39) — Aba Cartão — Arquitetura inicial

**v0.1.44-v0.2.00** — Aba Cartão completamente reescrita do zero:
- Multi-card management (Itaú, Mercado Pago, Nubank) com cores e datas de fechamento/vencimento
- `state.card = { cards, bills, billStatus, categorias, memory, catGroups, payments, acMemory }`
- `bills[cardId][y][m]` = array de transações por mês
- Tela de lista de cartões → tela de faturas do cartão (navegação via `el.dataset.view`)

**v0.2.01-10** — Importação de faturas XLSX/CSV:
- Parser genérico com detecção automática de colunas e formatos de data
- Classificação via Claude API em batch
- Tela de revisão com 3 grupos: 📋 arquivo / 🧠 memória / ⚠ pendentes
- `PAGAMENTO EFETUADO` ignorado

**v0.2.11-16** — Tabela de transações:
- Colunas: Data | Descrição | Valor | Detalhes | Categoria | ✕
- Coluna "Detalhes" = nota editável (textarea ao clicar)
- Ordenação multinível por coluna com badges N↑/N↓
- `cardSortClick(col)` → salva open months → `renderCard()` → restaura
- `stopPropagation` no container da tabela via `addEventListener` (não `onclick` inline)
- `cardDateToNum(d)` para comparação correta de datas DD/MM/AA

**v0.2.17-23** — Autocomplete tipo Excel:
- `acAttach(input, field, onSelect)` — dropdown com ↑↓/Enter/Tab/Esc
- `acLoadMemory()` — pré-popula de transações existentes
- `acRemember(field, value)` — salva em `state.card.acMemory`
- Auto-preenche categoria ao selecionar descrição conhecida

**v0.2.24-39** — Sistema de parcelamento:
- Modal "+ Despesa": toggle 1x/Parcelado, valor parcela ↔ total bidireccional
- `installmentGroupId`, `installmentTotal`, `installmentCurrent`, `installmentStartY`, `installmentStartM`
- `createParcelTx(py, pm, pNum)` — atualiza número no nome (ex: `SAMSUNG03/18`)
- Parcelas retroativas (padrão: Não)
- `propagateInstallmentField(tx, field, value, cardId)` — propaga `descricao`, `categoria`, `nota`
- `getInstallmentNota(tx, cardId)` — lê nota do grupo se própria estiver vazia
- Anti-duplicação na importação: `findExistingInstallment()`, tela checklist única
  - ✓ = NÃO importa; desmarcado → Adicionar ou Substituir
- `doImport()` / `doImportWithReplace()`

### Sessão 4 (v0.2.40 → v0.2.72)

**v0.2.40-41** — Visualização Lista/Mensal:
- Toggle **≡ Lista / ◫ Mensal** no header
- Lista: anos não-correntes colapsados por padrão; `toggleCardYear(y)`
- Mensal: `renderCardBillsMonth()` — um mês por vez, nav ‹ ›, dots indicator, swipe mobile
- `_cardViewMode`, `_cardCollapsedYears`

**v0.2.42-46** — Toggle Fechamento/Vencimento:
- `_cardMonthLabel`: `'fechamento'` | `'vencimento'`
- `cardDisplayMonth(y, m, card)`:
  - Fechamento: `fechaDia >= 28` → offset 0; senão offset 1
  - Vencimento: fechamento + 1 mês
  - Itaú (fech=31): Fechamento=mesmo mês, Vencimento=+1
  - Nubank (fech=3): Fechamento=+1, Vencimento=+2
- Todos os toggles usam `renderCardPreserve()` — não reabre meses fechados

**v0.2.47-50** — Sistema de pagamentos:
- `state.card.payments[cardId][y][m]` = `[{ id, data, valor, descricao, nota }]`
- `openAddPaymentModal(cardId, y, m)` — modal com título mostrando mês/ano da fatura; campos criados com `createElement`
- Pagamentos mesclados inline na tabela na posição cronológica (fundo verde `#1a3020`)
- `makePayRow(p)` — linha verde com handle ⠿, draggable, campos editáveis inline
- `inlineEditPayment(cell)` — edição de data, descrição, valor, nota
- Data usa `Object.defineProperty` no input (blur não dispara no calendário)
- Botões **+ Despesa** e **+ Pagamento** juntos no toolbar

**v0.2.51** — `renderCardPreserve()` refatorado:
```javascript
var _savedOpenBids = null;
function renderCardPreserve() {
  _savedOpenBids = []; // sempre seta mesmo vazio — suprime auto-abertura do mês destacado
  document.querySelectorAll('.month-body').forEach(...);
  renderCard();
}
```

**v0.2.52-57** — Análise de gastos por cartão (`openCardAnalysis`):
- Donut chart SVG + lista de categorias com barras de progresso
- `buildExpenseList(txs, catName, color)` — lista expansível de transações por categoria
- `calcPaymentCoverage(cardId, y, m)` — cobertura cronológica de pagamentos parciais
- Botão "Parcelas em aberto" — `buildInstallmentSummary(cardId)`

**v0.2.58-72** — Fixes e refinamentos na aba Cartão:
- Drag & drop reordering de transações (`wireCardDragDrop`)
- `openRulesManager` — regras de classificação automática
- `matchRule(desc)` — aplica regras na importação
- `getNotaFromMemory(desc)` — busca nota por substring
- `openPayHistoryManager` — histórico de pagamentos

### Sessão 5 (v0.2.73 → v0.3.68)

**v0.2.73-v0.3.00** — Aba Contas (finance) refatorada:
- `buildFinTable(y, m)` — tabela com colunas: Nome | Vencimento | Valor | Status | Categoria | Observações | ✕
- `finRowHTML(y, m, r)` — linha da tabela
- `openStatusDD(event, y, m, id)` / `closeStatusDD()` — dropdown de status inline
- `openFinDateDropdown` — date picker inline para vencimento
- `editFinCell(td)` — edição inline de células
- `saveFinField(y, m, id, field, value)` — salva campo

**v0.3.01-20** — Sistema de categorias (biblioteca compartilhada Cartão+Contas):
- **Arquitetura de IDs:** `state.card.categorias = [{id, name}]` em vez de strings
- `genCatId()`, `getCatName(id)`, `getCatId(name)`
- `migrateCategorias()` — migração automática de strings para objetos; chamada em `mergeState()`
- Todas as transações (card + finance) usam `categoriaId` em vez de `categoria`
- `catGroups.cats[]` armazena IDs em vez de nomes
- `memory[]` e `rules[]` armazenam `categoriaId` em vez de `categoria`
- Renomear = muda só `cat.name`; deletar = remove da biblioteca; referências resolvem via `getCatName()`

**v0.3.21-40** — Dropdown customizado de categoria em Contas:
- `openCatDD(e, y, m, id)` / `closeCatDD()` — substituiu `<select>` nativo (que interceptava cliques no header)
- `refreshFinRow(y, m, id)` — atualiza linha após mudança de categoria

**v0.3.41-68** — Sistema de categorias avançado:
- `openCatManager(ctx)` — aceita contexto opcional `{y, m, id, source:'fin'}`
- `_catManagerContext` — variável global para contexto; limpa após uso
- `_finPropagateEnabled` — flag removida; propagação controlada diretamente pelos chamadores
- `addCategoria()` — cria `{id, name}`; se contexto fin, aplica imediatamente e dispara propagação
- `renameCategoria(idx, newName)` — muda só `cat.name`; chama `refreshFinBlock` para meses abertos
- `deleteCategoria(catId)` — remove da biblioteca; chama `refreshFinBlock` via setTimeout
- `openFinCatPropagateModal(nome, categoriaId, originY, originM, originId)` — submodal dentro do catManagerModal:
  - Escopo: Todos os meses / Intervalo (De mês/ano → Até mês/ano)
  - Modo: Somente sem categoria (padrão) / Todos (sobrescrever) / Somente esta linha
  - Confirmação antes de sobrescrever categorias existentes
  - `wasOpen` controla se catManager estava aberto antes
- `renderCatManager()` — lista com drag-to-reorder, input inline, botão ✕

### Sessão 6 (v0.3.69 → v0.4.23)

**v0.3.69-72** — Fix definitivo do botão ⚙ Categorias na aba Contas:
- Causa raiz: `<select class="cat-select">` nativo na tabela de Contas se expandia para cima e interceptava cliques no botão do header
- Fix: substituído por botão + dropdown customizado (`openCatDD`)
- `section-hd` recebeu `position: relative; z-index: 2`
- `renderFinance()` passou a construir o header via `createElement` (em vez de HTML estático)

**v0.3.73-76** — Fixes no sistema de categorias:
- `confirmModal` z-index elevado para `100000` (acima do `catManagerModal` que tem `99999`)
- `deleteCategoria` agora limpa `state.finance.bills` além de `state.card.bills`
- `deleteCategoria` chama `refreshFinBlock` via `setTimeout(0)` para atualizar DOM após confirmação
- Count de uso inclui `finance.bills` além de `card.bills`

**v0.3.77** — Fluxo contextual no catManager:
- `openCatManager(ctx)` aceita contexto; `addCategoria()` aplica categoria à linha de origem e dispara propagação
- `mgrBtn` no `openCatDD` define `_catManagerContext` antes de abrir o modal

**v0.3.78-89** — Modal de propagação de categoria (`openFinCatPropagateModal`):
- Disparado diretamente pelos chamadores (`openCatDD` e `addCategoria`), não por `saveFinField`
- `saveFinField` não tem mais efeitos colaterais de propagação
- Ciclo de vida do `_catManagerContext` corrigido: limpo em todos os caminhos de fechamento
- Após confirmar propagação: fecha todos os modais (não retorna ao catManager)

**v0.3.90** — Dashboard: campo Detalhes (nota) e parcela visíveis nas listas de despesas:
- `getDashboardExpenses` passa `nota` e `parcela` junto com cada despesa
- `renderDashboard` e `buildDashExpenseList` exibem nota entre nome e origem

**v0.3.91-v0.4.02** — Dashboard: filtro por status de pagamento:
- `_dashPayFilter = 'all' | 'paid' | 'open'`
- Caixas Total/Pago/Em aberto clicáveis com borda colorida quando ativas
- `getDashboardExpenses(y, m, label, payFilter)` — parâmetro adicional
- Filtro "Pago": usa `calcPaymentCoverage(cardId, y, m)` para cartão; `status === 'pago'/'debito'` para Contas
- Filtro "Em aberto": exclui transações cobertas
- Estornos incluídos no filtro "Pago" (excluídos apenas em "Em aberto")
- `calcPaymentCoverage` corrigido para tratar estornos: `effectivePayTotal = payTotal + estornos`; estornos sempre marcados como `coveredIds`; `isPartial` compara contra total líquido
- `totalMes` calculado como soma líquida (incluindo estornos negativos) via `allFiltered`
- `totalPago` sempre calculado sobre `allFiltered` (sem payFilter) — valores das caixas nunca mudam ao filtrar
- Centro do gráfico mostra `totalMes` para 'all', `totalPositive` para 'paid'/'open'

**v0.4.03-09** — Dashboard: toggles de fonte substituem rádio:
- `_dashActiveSources` = `Set` de IDs ativos (null = todos); substitui `_dashSourceFilter`
- Toggles estilo switch on/off com cor do cartão
- Cartões agrupados numa caixa com label "CARTÕES"; Contas separado ao lado
- Mínimo de 1 fonte sempre ativa
- Navegação de mês reseta `_dashActiveSources = null`

**v0.4.10-23** — Dashboard: toggle "Acumulado do ano" e ajustes de layout:
- `_dashAccum = false` — quando true, soma todos os 12 meses do ano `_dashY`
- Navegação ‹ › vira por ano quando acumulado ativo
- Label muda de "Maio 2026" para "2026" no modo acumulado
- Toggle Fechamento/Vencimento fica acessível mas apagado no modo acumulado
- `getDashboardExpenses` chamado 12x (um por mês) no modo acumulado
- `totalPago` no modo acumulado: soma pagamentos fatura a fatura por mês/cartão (não usa `_billPayTotal`)
- **Layout do header Dashboard:**
  - Linha do título: "DASHBOARD" à esquerda, `🏷 Grupos` e `⚙ Categorias` à direita (HTML estático)
  - `section-hd` do dashboard tem `margin-bottom: 4px` (override do 16px padrão)
  - Linha de controles (`dashboardControls`): nav `‹ label ›` · `Hoje` · toggle `Acumulado` · `Fechamento/Vencimento`
  - `accumWrap` tem borda e padding iguais ao `btn-sm`
  - `sourceBar` tem `padding: 0 0 8px 0` (sem padding superior)

---

## ARQUITETURA — ABA CONTAS (FINANCE)

### Funções principais
- `renderFinance()` — constrói header dinamicamente via `createElement`; renderiza meses ativos
- `buildMonthBlock(y, m)` — bloco de mês com header e tabela
- `buildFinTable(y, m)` — tabela de lançamentos
- `finRowHTML(y, m, r)` — linha da tabela (usa `categoriaId`)
- `refreshFinBlock(y, m)` — substitui bloco no DOM
- `refreshFinHeader(y, m)` — atualiza header do mês
- `saveFinField(y, m, id, field, value)` — salva campo (sem efeitos colaterais)
- `openCatDD(e, y, m, id)` / `closeCatDD()` — dropdown customizado de categoria
- `openFinCatPropagateModal(nome, categoriaId, originY, originM, originId)` — propagação

### Estado relevante
- `state.finance.bills[y][m]` = array de lançamentos `{id, nome, venc, valor, status, categoriaId, obs}`
- `state.finance.openMonths[m]` = true se mês expandido
- `state.finance.activeMonths[y]` = array de meses ativos

---

## ARQUITETURA — ABA DASHBOARD

### Funções principais
- `renderDashboard()` — renderiza inline em `#dashboardContent`; controles em `#dashboardControls`
- `getDashboardExpenses(y, m, label, payFilter)` — agrega Cartão + Contas com filtro de pagamento
- `buildDashExpenseList(expenses, catName, color)` — lista de despesas individuais
- `calcPaymentCoverage(cardId, y, m)` — cobertura cronológica de pagamentos parciais

### Estado global do Dashboard
```javascript
var _dashY = new Date().getFullYear();
var _dashM = new Date().getMonth();
var _dashLabel = 'fechamento';   // 'fechamento' | 'vencimento'
var _dashAccum = false;          // acumulado do ano
var _dashActiveSources = null;   // Set de IDs ativos; null = todos
var _dashViewMode = 'group';     // 'category' | 'group'
var _dashPayFilter = 'all';      // 'all' | 'paid' | 'open'
```

### Lógica de dados
- Cartão: shift de mês se `label === 'vencimento'` e `venc < fech`
- `_billPayTotal` por transação → `seenCardSources{}` → `Math.min(payTotal, billTotal)` por cartão (modo não-acumulado)
- Modo acumulado: `totalPago` calculado fatura a fatura via `state.card.payments`
- Contas: pago = `r.status === 'pago' || r.status === 'debito'`
- Estornos (valor < 0): incluídos em 'all' e 'paid'; excluídos em 'open'
- `totalMes` = soma líquida de `allFiltered` (inclui estornos negativos)
- `totalPago` = calculado sempre sobre `allFiltered` completo (independente de `_dashPayFilter`)
- Grupos: `g.name` (não `g.nome`); `g.cats[]` contém IDs de categoria → resolver com `getCatName()`

---

## SISTEMA DE CATEGORIAS

### Arquitetura
- `state.card.categorias = [{id: 'cat-xxx', name: 'Aluguel'}]` — biblioteca universal
- Todas as transações (card + finance) usam `categoriaId` (string ID)
- `catGroups.cats[]` contém IDs
- `memory[]` e `rules[]` usam `categoriaId`
- `migrateCategorias()` — migração automática de strings para IDs; chamada em `mergeState()`

### Funções centrais
- `genCatId()` — gera ID único `'cat-' + random`
- `getCatName(id)` — resolve ID → nome; retorna `''` se não encontrado
- `getCatId(name)` — resolve nome → ID
- `addCategoria()` — cria `{id, name}`; aplica ao contexto se `_catManagerContext` presente
- `renameCategoria(idx, newName)` — muda só `cat.name`; sem varrer transações
- `deleteCategoria(catId)` — remove da biblioteca; transações com esse ID resolvem para `''`

### Contexto do catManager
- `_catManagerContext = null | {y, m, id, source:'fin'}` — definido antes de `openCatManager()`
- Limpo imediatamente após ser consumido em `addCategoria()`
- `openCatManager()` sem argumento não sobrescreve contexto existente

---

## ARQUITETURA — ABA CARTÃO

### Funções principais
- `renderCard()` / `renderCardPreserve()` / `renderCardBillsMonth()`
- `openCardBills(cardId)` / `backToCards()`
- `buildCardBillHTML(cardId, y, m)` — HTML da fatura
- `buildCardTxTable(cardId, y, m)` — tabela de transações
- `cardBillAction(btn, action)` — ações no toolbar

### Modais
- `openAddCardModal()` / `openEditCardModal(cardId)`
- `openAddBillModal(cardId)` / `openImportBillModal(cardId)`
- `openAddTxModal(cardId, y, m)` — chamado "+ Despesa"
- `openAddPaymentModal(cardId, y, m)` — com autocomplete desc e nota
- `openCardAnalysis(cardId)` — abre no `_cardFocusedBill` se disponível; botão "Atual"
- `openCatGroupsModal()` / `openCatManager()` / `openPayHistoryManager(cardId)`
- `openRulesManager(cardId, y, m)`

### Edição inline
- `inlineEditCardTx(cell)` — data, descrição, valor
- `editCardTxNota(el, cardId, y, m, txId)` — usa `getInstallmentNota` ao abrir
- `inlineEditPayment(cell)` — data, descrição, valor, nota
- `cardTxCatChange(sel)` — categoria via select; propaga no grupo
- `saveFinField(y,m,id,field,value)` — salva campo de lançamento de Contas

### Parcelamento e coerência
- `propagateInstallmentField(tx, field, value, cardId)` — `descricao`, `categoriaId`, `nota`
- `getInstallmentNota(tx, cardId)` — lê do grupo se própria vazia
- `findExistingInstallment(cardId, y, m, tx)` — match por groupId, desc+parcela, ou data+desc+valor
- `createParcelTx(py, pm, pNum)` — atualiza número no nome

### Importação
- `parseMercadoPagoPDF(text, billY, billM)` / `parseNubankPDF(text, billY, billM)`
- `classifyAndReview(cardId, y, m, txs, overlay)` — chama `acLoadMemory()` primeiro
- `showImportReview(cardId, y, m, txs, overlay)` — tela com colunas: Data, Descrição, Valor, Detalhes, Categoria
- `confirmImport` / `findExistingInstallment` / `doImport` / `doImportWithReplace`
- `getNotaFromMemory(desc)` — busca exata → case-insensitive → substring

### Status e cálculo
- `getBillStatus(cardId, y, m, card)` → tolerância R$0,01; verifica pagamentos
- `toggleBillPaid(cardId, y, m)`
- `cardDisplayMonth(y, m, card)` → offset fechamento/vencimento
- `cardDateToNum(d)` → número para comparação
- `calcPaymentCoverage(cardId, y, m)` → `{coveredIds, isPartial}` — cobertura cronológica com suporte a estornos

### Autocomplete
- `acAttach(input, field, onSelect)` / `acRemember` / `acLoadMemory` / `acSuggest` / `acGetKey`
- `acGetKey(field)` → `'ac_' + field`
- `_acMemory[acGetKey('pay-desc-'+cardId)]` e `_acMemory[acGetKey('pay-nota-'+cardId)]`

### Drag & drop e navegação
- `wireCardDragDrop(container, cardId)` — tx rows e pay rows; mesmo dia apenas
- `toggleCardYear(y)` / `toggleCardBill(bid)` / `backToCards()` / `openCardBills(cardId)`
- `cardSortClick(col)` → `renderCardPreserve()`

---

## SISTEMA DE COMENTÁRIOS

### Editor (contenteditable — WYSIWYG)
- `createEditor(text)` — cria div contenteditable via `parseCommentText(text)`
- `editorToText(editor)` — converte DOM→texto, detecta `prevWasOL` flag para UL após OL
- `buildFormatToolbar(editor)` — usa execCommand (bold, italic, insertOrderedList, insertUnorderedList, createLink)
- `mergeConsecutiveOLs(editor)` — mescla OLs separadas por ULs
- Formato armazenado: `1. item`, `  • bullet aninhado`, `• bullet`, `**negrito**`, `_itálico_`

### Janelas
- `makeDraggable(el, headerEl)` — drag (mouse + touch) + handle resize (mouse + touch)
- Handle: 32×32px, `touch-action: none`, `z-index: 10`
- `comment-dd`: limitado à viewport (máx 380×480px, margem 8px)
- `outsideClick` usa `mousedown` para fechar ao clicar fora

### CSS crítico para listas
```css
* { box-sizing: border-box; margin: 0; padding: 0; }
.comment-body ul, .comment-body ol { padding-left: 28px !important; list-style-position: outside; }
.comment-body ul { list-style-type: disc; }
.comment-body ol { list-style-type: decimal; }
.comment-body li { display: list-item !important; }
.comment-editor ul, .comment-editor ol { padding-left: 28px !important; }
.comment-editor li { display: list-item !important; }
```

---

## SISTEMA DE TAREFAS

### Undo/Redo
- `_skipUndo = true` durante init e ao restaurar snapshots
- Snapshot captura `{ tasks, finance }`
- `_redoSnapshot` limpo quando nova ação executada
- Ctrl+Z global verifica `contentEditable === 'true'` para não interceptar editor de comentários

### Propagação para filhos
- `promptPropagation(task, fieldKey, applyFn)` chamado após cada setter
- Modos: Não / Sim Dinâmico / Sim Fixo (`_locked[fieldKey] = true`)

### Tabs
- `TAB_IDS = ['tasks', 'finance', 'card', 'dashboard', 'ai', 'settings']`
- `TAB_DEFAULTS = { tasks: 'Tarefas', finance: 'Contas', card: 'Cartão', dashboard: 'Dashboard', ai: 'IA', settings: 'Config' }`
- Labels em `state.config.tabLabels`
- `switchTab()` NÃO re-renderiza tabs; chama `renderDashboard()` se tab = 'dashboard'

### Filtros
- `_activeFilters` objeto global `{ status, priority, 'col-{id}' }`
- `_visibleFilters` array de keys visíveis no dropdown

### Ordenação Multinível (Tarefas)
- `state.tasks.sortLevels[]` array de `{colId, dir}`
- `_name` para coluna Nome
- Clique no header: sem→asc(N↑)→desc(N↓)→remove

---

## SEEDS
- **TASK_SEED_VERSION:** v4
- **FINANCE_SEED_VERSION:** v2

## BACKUP ATUAL
- Arquivo: `agenda-backup-2026-06-10.json` (formato novo com `categoriaId`)
- 3 cartões (Itaú, Mercado Pago, Nubank)
- Grupos MERCA 10x: `grp-migrated-mq0aioubdtwo` (10x R$73,56) e `grp-migrated-mq0aioubtmeu` (10x R$66,41) — **devem permanecer estritamente separados**
- Grupos de categorias: "Richard" (#6366f1) e "Paul" (#46ecc2)

---

## MODAIS ESTÁTICOS (z-index)
- `#confirmModal` — `z-index: 100000` (acima de todos os outros)
- `#catManagerModal` — `z-index: 99999`
- `#rulesManagerModal` — `z-index: 99999`
- `#payHistoryModal` — `z-index: 99999`

---

## CONVENÇÕES CRÍTICAS DE CÓDIGO

- **`createElement`** em vez de `innerHTML` para elementos com event handlers
- **`data-*` attributes** em vez de parâmetros inline no `onclick` quando possível
- **`renderCardPreserve()`** para operações que não devem fechar meses abertos
- **`_savedOpenBids`** para preservar estado entre renders (sempre setar mesmo se vazio)
- **`mousedown` + `contains()`** para fechar dropdowns
- **`pushUndo()`** ANTES de mutações destrutivas
- **`confirmAction()`** para ações destrutivas
- **`node --check`** antes de entregar JS
- **`g.name`** (não `g.nome`) para catGroups
- **`acLoadMemory()`** chamado antes de `classifyAndReview`
- **`renderCardPreserve()`** em vez de `renderCard()` em cat manager
- **Installment groups devem permanecer estritamente separados**
- **`applySeeds()` nunca sobrescreve dados do usuário** (version-gate)
- **`migrateCategorias()` é idempotente** — detecta por `typeof cats[0]` e só roda uma vez
- **`saveFinField` não tem efeitos colaterais** — propagação disparada explicitamente pelos chamadores
- **JSON merges entre backups são de alto risco**
- Incrementar versão a cada mudança de código; nunca em mudanças de dados apenas
- Richard é altamente detalhista — captura erros lógicos, offsets incorretos, modificações não solicitadas. Prefere que Claude sinalize incerteza em vez de adivinhar. Não fazer alterações além do que foi solicitado

---

## PRÓXIMAS ETAPAS PLANEJADAS

1. **Aba Débito** — nova tab independente (NÃO sub-área do Cartão), estrutura própria similar ao Cartão mas simplificada para despesas no débito, integrada ao Dashboard (incluindo toggles de fonte no Dashboard, já preparados para receber "Débito")
2. **Espaço entre "Acumulado do ano" e "Fechamento/Vencimento"** — Richard quer ajustar mas pediu para deixar para próxima sessão

## REGRA PARA NOVA SESSÃO
Enviar: `index.html`, `sw.js`, `CONTEXTO_AGENDA_6.md`
O próximo contexto deve ser `CONTEXTO_AGENDA_7.md` e deve ser ACUMULATIVO (incluir tudo deste contexto + novidades da próxima sessão).
