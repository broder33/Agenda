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
- **App:** v0.3.68
- **Service Worker:** `agenda-v0368`
- **Arquivos de trabalho:** `/home/claude/index.html` e `/home/claude/sw.js`
- **Outputs:** `/mnt/user-data/outputs/index.html` e `/mnt/user-data/outputs/sw.js`

## CONVENÇÃO DE VERSÃO
Após v0.0.99 vem v0.1.00. Versão muda a cada alteração de código (não em alterações de dados). Aparece no header e aba Config. Sempre entregar index.html + sw.js juntos.

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
  var saved = _savedOpenBids; _savedOpenBids = null;
  saved.forEach(/* restaura display:block e chevron */);
}
// Em renderCardBills:
var isOpen = _savedOpenBids !== null ? _savedOpenBids.includes(bid) : isHighlight;
```

**v0.2.52-54** — Mesclagem de pagamentos na tabela (`buildCardTxTable`):
```javascript
var combined = txs.map(...).concat(pays.map(...));
combined.sort(/* por dateNum * sortDir */);
// Linha de pagamento: fundo verde, handle ⠿ draggable, campos editáveis
```

**v0.2.55-60** — Drag & drop de transações e pagamentos:
- `wireCardDragDrop(container, cardId)` — tx rows e pay rows; mesmo dia apenas
- Handle ⠿ ativa `draggable=true` no mousedown; desativa no mouseup
- Drop reordena dentro do mesmo dia

**v0.2.61-65** — Painel "Parcelas em aberto":
- `buildInstallmentSummary(cardId)` — lista grupos ativos com progresso visual
- Clique expande lista de parcelas do grupo
- Status: pago / em aberto / futuro por parcela

**v0.2.66-70** — Análise de fatura `openCardAnalysis(cardId)`:
- Modal com donut chart SVG por categoria
- Lista por categoria com chevron expansível → despesas individuais
- Toggle "Por categoria" / "Por grupo"
- Navegação ‹ › entre meses disponíveis
- Padrão: mês atual se disponível

**v0.2.71-72** — Fixes finais Sessão 4:
- `applySeeds()` com version-gate — nunca sobrescreve dados do usuário
- Backup `agenda-backup-2026-06-06.json` com 149 txs Itaú, grupos MERCA separados

### Sessão 5 (v0.2.74 → v0.3.52)

**v0.2.74-v0.2.94** — Removido separador visual "Quitado/Em aberto" da tabela, mantida lógica `calcPaymentCoverage` no painel "Parcelas em aberto"

**v0.2.95-v0.3.05** — **Gerenciar Categorias**:
- Modal com lista editável inline (rename via blur, drag-to-reorder, delete com confirmAction)
- Acesso via `⚙ Gerenciar categorias` no seletor de categoria de qualquer transação
- Funções: `openCatManager`, `renderCatManager`, `addCategoria`, `deleteCategoria`, `renameCategoria`
- Categorias universais em `state.card.categorias`
- `buildCatOpts()` centraliza geração de options com `⚙ Gerenciar categorias` no rodapé

**v0.3.06-v0.3.12** — **Autocompletar descrição**:
- Ao selecionar nome no autocomplete, preenche Categoria e Detalhes automaticamente
- `acLoadMemory` constrói `state.card.memory` (desc→cat) e `state.card.notaMemory` (desc→nota) de todas as transações existentes, ordenadas por data desc
- Bug duplo clique no autocomplete resolvido: `acAttach` reescrito com `_picking` flag separando `mousedown` (cancela blur) e `click` (executa seleção)

**v0.3.13-v0.3.18** — **Autocompletar Detalhes**:
- Campo `tx-nota` adicionado ao modal `+ Despesa`
- `notaMemory` populado e herdado na importação via `getNotaFromMemory(desc)` (busca exata, case-insensitive, substring)
- `notaMemory` reconstruído do zero a cada `acLoadMemory` — evita entradas vazias
- `acLoadMemory()` chamado imediatamente antes de classificar na importação

**v0.3.19-v0.3.25** — **Regras de classificação**:
- `state.card.rules[]` com `{pattern, categoria, nota}`
- `matchRule(desc)` usa `includes` case-insensitive — padrão é substring (ex: "99" casa com "DL*99 RIDE")
- Botão `⚡ Regras` no toolbar de cada fatura abre modal com `⚡ Aplicar a este mês`
- Aplicação automática na importação (antes da memória/IA) e ao criar despesa sem categoria
- Modal de regras com placeholder explícando comportamento de substring

**v0.3.26-v0.3.34** — **Importação PDF Mercado Pago**:
- `parseMercadoPagoPDF(text, billY, billM)` via pdf.js (fake worker, warning inofensivo)
- Divide texto por blocos `DD/MM`, filtra linhas de resumo ("Consumos de DD/MM a DD/MM", "Total$", etc.)
- Ano deduzido: mês tx > mês fatura → ano anterior
- Sem deduplicação interna (filtros de linha eliminam o ruído; transações idênticas legítimas preservadas)
- Botão ⬆ Importar dentro de cada fatura aberta; também no estado vazio

**v0.3.35-v0.3.44** — **Importação PDF Nubank**:
- `parseNubankPDF(text, billY, billM)`
- Extrai seção entre `TRANSAÇÕES   DE` e `Em cumprimento`
- Abordagem de blocos: divide por `DD MMM` (com 2+ espaços), pega último R$ de cada bloco
- Trunca bloco em "Pagamentos e Financiamentos" para não capturar valores de encargos incorretos
- Ignora: `Saldo em atraso`, `Juros de dívida encerrada`, `Encerramento de dívida`, `Crédito de atraso`, negativos (−R$)
- Captura: `Juros de atraso`, `Multa de atraso`, `IOF de atraso` (encargos reais com último R$ como valor)
- Texto de detalhe entre descrição e valor vira `nota` da transação
- Regex usa `[^\w\n]*\d{4}` para capturar número do cartão com bullets Unicode `•` (U+2022)
- Roteado automaticamente quando banco = "Nubank"; opção "Nubank (CSV/PDF)"

**v0.3.45-v0.3.52** — **Tela de revisão de importação**:
- Coluna Detalhes editável adicionada (entre Valor e Categoria)
- Duplicatas detectadas por `findExistingInstallment` + critério data+desc+valor para transações à vista
- Marcadas com 🔄 na revisão
- `_cardFocusedBill` rastreia fatura aberta; ao clicar em "Análise", modal abre nesse mês
- Botão "Atual" no modal de Análise
- Autocomplete no campo Descrição do modal de pagamento (`acGetKey('pay-desc-'+cardId)`)
- Autocomplete no campo Detalhes do modal de pagamento (`acGetKey('pay-nota-'+cardId)`)
- Botão `⚙ Histórico` no modal de pagamento abre gerenciador de entradas de autocomplete
- Datas padrão: novas tarefas e subtarefas recebem data de hoje

### Sessão 6 (v0.3.53 → v0.3.68) — SESSÃO ATUAL

**v0.3.53** — **Categoria em Contas**:
- Coluna "Categoria" adicionada à tabela `buildFinTable` (entre Status e Observações)
- Seletor inline `<select>` usando `buildCatOpts('')` — categorias universais de `state.card.categorias`
- `saveFinField(y,m,id,'categoria',value)` salva inline
- Campo categoria no formulário `addFinBill`
- Botões "🏷 Grupos" e "⚙ Categorias" no header da aba Contas

**v0.3.53** — **Tab Dashboard**:
- `TAB_IDS = ['tasks', 'finance', 'card', 'dashboard', 'ai', 'settings']`
- `TAB_DEFAULTS` atualizado com `dashboard: 'Dashboard'`
- `renderDashboard()` chamado em `switchTab('dashboard')` e `renderAll()`
- Panel HTML: `id="panel-dashboard"` com `id="dashboardContent"` e `id="dashboardControls"`

**v0.3.54-v0.3.55** — **Dashboard visual**:
- Visual idêntico ao `openCardAnalysis`: donut chart SVG, lista por categoria/grupo com chevron expansível
- Variáveis: `_dashY`, `_dashM`, `_dashLabel` ('fechamento'|'vencimento'), `_dashSourceFilter`, `_dashViewMode`
- `getDashboardExpenses(y, m, label)`: agrega Cartão + Contas
  - Cartão: usa `state.card.bills` com toggle fechamento/vencimento (shift +1 mês se venc < fech)
  - Contas: `state.finance.bills[y][m]`, pago = status 'pago'/'debito'
  - Grupos: usa `g.name` (não `g.nome`) — dados têm `name`
- `DASH_COLORS[]` array de cores para categorias sem grupo
- Filtros por fonte: pills clicáveis (Todas / cada cartão / Contas)
- Toggle Por categoria / Por grupo
- Cards resumo: Total do mês, Pago, Em aberto
- Botões 🏷 Grupos e ⚙ Categorias no header do Dashboard

**v0.3.56** — **Total Pago corrigido**:
- Usa `state.card.payments` reais em vez de status binário da fatura
- `_billPayTotal` anexado a cada tx do bloco; `seenCardSources{}` evita dupla contagem
- `Math.min(payTotal, billTotal)` por cartão; Contas usa flag `pago`

**v0.3.57-v0.3.68** — **Bug: botão ⚙ Categorias na aba Contas não abre modal**:
- Diagnóstico extenso no Edge DevTools (arquivo aberto via `file://`)
- `openCatManager()` via console → abre ✓
- `.click()` programático → abre ✓
- `dispatchEvent(new MouseEvent('click', {bubbles:true}))` → abre ✓
- Clique manual do mouse → não abre ✗
- `elementFromPoint` retorna o próprio botão (sem sobreposição) ✓
- `getComputedStyle(panel-finance).transform` → `'none'` ✓
- Modal com `z-index:99999`, `display:none`, sem classe `show` após clique manual
- Tentativas falhas: `onclick` inline, `window.openCatManager&&...`, `data-action` + listener captura, DOMContentLoaded separado, `addEventListener` via `renderFinance()`
- Estado atual: botão usa `onclick="openCatManager()"` inline; todos modais estáticos com `z-index:99999`
- **Causa raiz NÃO identificada** — próxima sessão deve investigar

---

## ARQUITETURA DE DADOS

```javascript
state.card = {
  cards: [{ id, nome, cor, fechamento, vencimento }],
  bills: {},        // bills[cardId][y][m] = [tx, ...]
  billStatus: {},   // billStatus[cardId][y][m] = { paid, paidAt }
  payments: {},     // payments[cardId][y][m] = [{ id, data, valor, descricao, nota }]
  categorias: [],   // universais — Cartão, Contas e Dashboard
  catGroups: [],    // [{ id, name, color, cats[] }] — universais; usar g.name (não g.nome)
  memory: [],       // [{ pattern, categoria }]
  notaMemory: {},   // { descricao: nota }
  acMemory: {},     // { 'ac_tx-desc': [...], 'ac_detalhes': [...] }
  rules: []         // [{ pattern, categoria, nota }]
}

state.finance.bills[y][m] = [{ id, nome, venc, valor, status, categoria, obs }]
// status values: 'nao-pago', 'pago', 'debito', 'aguardando'

state.tasks.items = [] // tarefas recursivas com children[]
```

### Transação parcelada
```javascript
{
  id, descricao, data, valor, tipo, categoria, nota, parcela,
  installmentGroupId: 'grp-xxx',
  installmentTotal: 12,
  installmentCurrent: 3,
  installmentStartY: 2025,
  installmentStartM: 10,
  source: 'import' | 'manual'
}
```

### Cartões padrão (seed)
```javascript
{ id: 'card-itau',   nome: 'Itaú',        cor: '#EC7000', fechamento: 31, vencimento: 7  }
{ id: 'card-mp',     nome: 'Mercado Pago', cor: '#00BCFF', fechamento: 26, vencimento: 5  }
{ id: 'card-nubank', nome: 'Nubank',       cor: '#820AD1', fechamento: 3,  vencimento: 13 }
```

### Grupos de categorias (dados reais)
- "Richard": #6366f1 — cats: Bike, Subscriptions, Tech, Viagem/Deslocamento, AI, Gifts, Alimentação, Casa
- "Paul": #46ecc2 — cats: Paul, Vape, AI Paul

### Variáveis de estado de UI (Cartão)
```javascript
var _cardSortLevels = [{ col: 'data', dir: 'desc' }];
var _cardViewMode = 'list';         // 'list' | 'month'
var _cardCollapsedYears = {};
var _cardMonthLabel = 'fechamento'; // 'fechamento' | 'vencimento'
var _savedOpenBids = null;
var _acMemory = {};
var _cardFocusedBill = null;        // { y, m } — fatura aberta na view de lista
```

---

## ARQUITETURA DE SISTEMA — ABA CARTÃO

### Render
- `renderCard()` / `renderCardPreserve()` / `renderCardBills(el, cardId)` / `renderCardBillsMonth(el, cardId, card, bills, years, highlightAbs)`
- `buildCardTxTable(cardId, y, m, txs)` → HTML da tabela com pagamentos mesclados
- `buildInstallmentSummary(cardId)` → painel parcelas em aberto
- `makePayRow(p)` → linha de pagamento verde

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
- `propagateInstallmentField(tx, field, value, cardId)` — `descricao`, `categoria`, `nota`
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

### Autocomplete
- `acAttach(input, field, onSelect)` / `acRemember` / `acLoadMemory` / `acSuggest` / `acGetKey`
- `acGetKey(field)` → `'ac_' + field`
- `_acMemory[acGetKey('pay-desc-'+cardId)]` e `_acMemory[acGetKey('pay-nota-'+cardId)]`

### Drag & drop e navegação
- `wireCardDragDrop(container, cardId)` — tx rows e pay rows; mesmo dia apenas
- `toggleCardYear(y)` / `toggleCardBill(bid)` / `backToCards()` / `openCardBills(cardId)`
- `cardSortClick(col)` → `renderCardPreserve()`

---

## ARQUITETURA — ABA DASHBOARD

### Funções principais
- `renderDashboard()` — renderiza inline em `#dashboardContent`
- `getDashboardExpenses(y, m, label)` — agrega Cartão + Contas
- `buildDashExpenseList(expenses, catName, color)` — lista de despesas individuais de uma categoria

### Lógica de dados
- Cartão: shift de mês se `label === 'vencimento'` e `venc < fech`
- `_billPayTotal` por transação → `seenCardSources{}` → `Math.min(payTotal, billTotal)` por cartão
- Contas: pago = `r.status === 'pago' || r.status === 'debito'`
- Grupos: `g.name` (não `g.nome`)

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
- Arquivo: `agenda-backup-2026-06-10.json`
- 3 cartões (Itaú, Mercado Pago, Nubank)
- Grupos MERCA 10x: `grp-migrated-mq0aioubdtwo` (10x R$73,56) e `grp-migrated-mq0aioubtmeu` (10x R$66,41) — **devem permanecer estritamente separados**
- Grupos de categorias: "Richard" (#6366f1) e "Paul" (#46ecc2)

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
- **JSON merges entre backups são de alto risco**
- Incrementar versão a cada mudança de código; nunca em mudanças de dados apenas
- Richard é altamente detalhista — captura erros lógicos, offsets incorretos, modificações não solicitadas. Prefere que Claude sinalize incerteza em vez de adivinhar. Não fazer alterações além do que foi solicitado

## MODAIS ESTÁTICOS (z-index:99999)
Todos os modais estáticos no HTML têm `style="z-index:99999"`:
- `#confirmModal`
- `#catManagerModal`
- `#rulesManagerModal`
- `#payHistoryModal`

## PRÓXIMAS ETAPAS PLANEJADAS

1. **Resolver bug do botão ⚙ Categorias na aba Contas** — causa raiz não identificada; clique manual não dispara handler mas `.click()` programático funciona
2. **Aba Débito** — nova tab independente (NÃO sub-área do Cartão), estrutura própria similar ao Cartão mas simplificada para despesas no débito, integrada ao Dashboard

## REGRA PARA NOVA SESSÃO
Enviar: `index.html`, `sw.js`, `CONTEXTO_AGENDA_6.md`
O próximo contexto deve ser `CONTEXTO_AGENDA_7.md` e deve ser ACUMULATIVO (incluir tudo deste contexto + novidades da próxima sessão).
