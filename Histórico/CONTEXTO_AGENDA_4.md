# CONTEXTO DO PROJETO — Agenda Pessoal com IA

## REGRA CRÍTICA DE CONTEXTO
**Os contextos são SEMPRE acumulativos.** Todo o conteúdo do contexto anterior deve estar presente no contexto novo, com adições/atualizações da sessão corrente. Nunca omitir informação de sessões anteriores. Ao criar o próximo contexto (CONTEXTO_AGENDA_5.md), seguir essa mesma regra.

---

## STACK E INFRAESTRUTURA
- **Arquivo:** Single HTML + sw.js (Service Worker PWA)
- **Hospedagem:** GitHub Pages — `https://broder33.github.io/Agenda`
- **Auth/Sync:** Supabase — projeto `fxzikckzgvdwzvjysoao`; tabela `agenda_data`, RLS configurado
- **IA:** Anthropic API — `claude-sonnet-4-20250514`
- **SheetJS:** parsing XLSX/CSV para importação de faturas
- **Google OAuth Client ID:** `962292865944-ialv4nnv2gqpgek5mjreto6goa9jbhhu.apps.googleusercontent.com`

## VERSÃO ATUAL
- **App:** v0.2.72
- **Service Worker:** `agenda-v0272`
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

### Sessão 4 (v0.2.40 → v0.2.72) — ESTA SESSÃO

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
txs = combined.filter(x => x.type==='tx').map(x => x.data); // sempre reatribuído
var rows = txs.map(...).join('');
var txRowList2 = rows.match(/<tr[\s\S]*?<\/tr>/g) || [];
allRows = combined.map(function(item) {
  if (item.type === 'tx') return txRowList2[txIdx2++] || '';
  return makePayRow(item.data);
}).join('');
```

**v0.2.55-65** — Edição inline completa:
- `inlineEditCardTx(cell)` — lê params de `data-*` attrs (nunca parâmetros inline)
- Ao editar valor: re-renderiza month-body via parsing do bid com `lastIndexOf('-')`
- `editCardTxNota` usa `getInstallmentNota` para pré-preencher
- `inlineEditPayment(cell)` — data, descrição, valor, nota
- Drag & drop de payment rows em `wireCardDragDrop`

**v0.2.66** — Rodapé da fatura:
- **TOTAL DA FATURA** = despesas - estornos (líquido, sem linha separada de estornos)
- **PAGO** = somatória dos pagamentos (verde, só aparece se houver)
- **EM ABERTO / ✓ Quitada** = arredondado a centavos (tolerância R$0,01); verde se ≤ 0, vermelho se > 0

**v0.2.67-68** — Fixes:
- Saldo zero em vermelho: `round(totalFatura - payTotal, 2) < 0.01` para detectar quitada
- Nota de parcela: `editCardTxNota` usa `getInstallmentNota` ao abrir; `propagateInstallmentField` ao salvar

**v0.2.69** — **BUG CRÍTICO CORRIGIDO: applySeeds sobrescrevia dados de Finance**
- `FINANCE_SEED_VERSION` mudando causava reset dos dados do usuário a cada deploy
- Fix: seeds só aplicados quando mês está completamente vazio:
  ```javascript
  // ANTES: if (!existing || existing.length === 0 || seedChanged)
  // DEPOIS: if (!existing || existing.length === 0) // nunca sobrescreve dados existentes
  ```

**v0.2.70-72** — Painel "Parcelas em aberto":
- `buildInstallmentSummary(cardId)` exclui meses com `getBillStatus === 'paid'`
- `getBillStatus` verifica pagamentos antes do toggle manual
- Coluna "Parcelas restantes": formato `N/Total` (ex: `9/12`) — não mais range `4-12/12`
- Totais por cartão e global excluem meses pagos

---

## PROBLEMAS PENDENTES

1. **Pagamentos parciais no painel de parcelas**: para faturas com pagamento parcial (não 100% quitadas), o painel mostra o valor total das parcelas sem desconto. Decisão de design pendente.

2. **Placeholder errado**: campo de nota/detalhes na tabela mostra `+ descrição` em vez de `+ detalhes`.

---

## ARQUITETURA ATUAL — PONTOS CRÍTICOS

### USER_FIELDS (applyTaskSeeds — CRÍTICO)
```javascript
var USER_FIELDS = ['status','priority','dueDate','description','notes','tags','expanded','comments','updatedAt','customFields','_locked'];
```

### Roles de Status
- `role: 'default'` → status padrão (Pendente)
- `role: 'done'` → conclusão (check, riscado, contadores)
- `role: 'closed'` → encerramento (sai da lista principal → área "Encerradas")

### Roles de Prioridade
- `role: 'none'` → "— Sem prioridade" (não deletável, não renomeável)

### Undo/Redo
- `pushUndo()` chamado ANTES de cada mutação
- `_skipUndo = true` durante init e ao restaurar snapshots
- Snapshot captura `{ tasks, finance }`
- `_redoSnapshot` limpo quando nova ação executada
- Ctrl+Z global verifica `contentEditable === 'true'` para não interceptar editor de comentários

### Propagação para filhos
- `promptPropagation(task, fieldKey, applyFn)` chamado após cada setter
- Modos: Não / Sim Dinâmico / Sim Fixo (`_locked[fieldKey] = true`)

### Tabs
- `TAB_IDS = ['tasks', 'finance', 'card', 'ai', 'settings']`
- `TAB_DEFAULTS = { tasks: 'Tarefas', finance: 'Contas', card: 'Cartão', ai: 'IA', settings: 'Config' }`
- Labels em `state.config.tabLabels`
- `switchTab()` NÃO re-renderiza tabs

### Filtros
- `_activeFilters` objeto global `{ status, priority, 'col-{id}' }`
- `_visibleFilters` array de keys visíveis no dropdown

### Ordenação Multinível (Tarefas)
- `state.tasks.sortLevels[]` array de `{colId, dir}`
- `_name` para coluna Nome
- Clique no header: sem→asc(N↑)→desc(N↓)→remove

### Editor de Comentários (contenteditable — WYSIWYG)
- `createEditor(text)` — cria div contenteditable via `parseCommentText(text)`
- `editorToText(editor)` — converte DOM→texto, detecta `prevWasOL` flag para UL após OL
- `buildFormatToolbar(editor)` — usa execCommand (bold, italic, insertOrderedList, insertUnorderedList, createLink)
- `mergeConsecutiveOLs(editor)` — mescla OLs separadas por ULs
- Formato armazenado: `1. item`, `  • bullet aninhado`, `• bullet`, `**negrito**`, `_itálico_`

### Janelas de Comentários
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

## ARQUITETURA DA ABA CARTÃO

### Estado principal
```javascript
state.card = {
  cards: [{ id, nome, cor, fechamento, vencimento }],
  bills: {},        // bills[cardId][y][m] = [tx, ...]
  billStatus: {},   // billStatus[cardId][y][m] = { paid, paidAt }
  payments: {},     // payments[cardId][y][m] = [{ id, data, valor, descricao, nota }]
  categorias: [],
  catGroups: [],    // [{ id, name, color, cats[] }]
  memory: [],       // [{ pattern, categoria }]
  acMemory: {}      // { 'ac_tx-desc': [...], 'ac_detalhes': [...] }
}
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

### Variáveis de estado de UI (Cartão)
```javascript
var _cardSortLevels = [{ col: 'data', dir: 'desc' }];
var _cardViewMode = 'list';         // 'list' | 'month'
var _cardCollapsedYears = {};       // year -> bool (false=expandido)
var _cardMonthLabel = 'fechamento'; // 'fechamento' | 'vencimento'
var _savedOpenBids = null;
var _acMemory = {};
```

### Grupos de categorias
- "Richard": #6366f1 — cats: Bike, Subscriptions, Tech, Viagem
- "Paul": #46ecc2 — cats: AI, Paul, Vape

---

## CONVENÇÕES CRÍTICAS DE CÓDIGO

- **`createElement`** em vez de `innerHTML` para elementos com event handlers
- **`data-*` attributes** em vez de parâmetros inline no `onclick`
- **`renderCardPreserve()`** para operações que não devem fechar meses abertos
- **`_savedOpenBids`** para preservar estado entre renders (sempre setar mesmo se vazio)
- **`mousedown` + `contains()`** para fechar dropdowns
- **`pushUndo()`** ANTES de mutações destrutivas
- **`confirmAction()`** para ações destrutivas
- **`node --check`** antes de entregar JS

---

## FUNÇÕES PRINCIPAIS DA ABA CARTÃO

### Render
- `renderCard()` / `renderCardPreserve()` / `renderCardBills(el, cardId)` / `renderCardBillsMonth(el, cardId, card, bills, years, highlightAbs)`
- `buildCardTxTable(cardId, y, m, txs)` → HTML da tabela com pagamentos mesclados
- `buildInstallmentSummary(cardId)` → painel parcelas em aberto
- `makePayRow(p)` → linha de pagamento verde

### Modais
- `openAddCardModal()` / `openEditCardModal(cardId)`
- `openAddBillModal(cardId)` / `openImportBillModal(cardId)`
- `openAddTxModal(cardId, y, m)` — agora chamado "+ Despesa"
- `openAddPaymentModal(cardId, y, m)`
- `openCardAnalysis(cardId)` — padrão: mês atual se disponível
- `openCatGroupsModal()`

### Edição inline
- `inlineEditCardTx(cell)` — data, descrição, valor (lê `data-*` attrs)
- `editCardTxNota(el, cardId, y, m, txId)` — usa `getInstallmentNota` ao abrir
- `inlineEditPayment(cell)` — data, descrição, valor, nota
- `cardTxCatChange(sel)` — categoria via select; propaga no grupo

### Parcelamento e coerência
- `propagateInstallmentField(tx, field, value, cardId)` — `descricao`, `categoria`, `nota`
- `getInstallmentNota(tx, cardId)` — lê do grupo se própria vazia
- `findExistingInstallment(cardId, y, m, tx)` — match por groupId ou desc+parcela
- `createParcelTx(py, pm, pNum)` — atualiza número no nome

### Importação
- `processImport` / `classifyAndReview` / `showImportReview` / `confirmImport`
- `showInstallmentDuplicateReview` / `doImport` / `doImportWithReplace`

### Status e cálculo
- `getBillStatus(cardId, y, m, card)` → tolerância R$0,01; verifica pagamentos antes do toggle
- `toggleBillPaid(cardId, y, m)`
- `cardDisplayMonth(y, m, card)` → offset fechamento/vencimento
- `cardDateToNum(d)` → número para comparação

### Autocomplete
- `acAttach(input, field, onSelect)` / `acRemember` / `acLoadMemory` / `acSuggest` / `acGetKey`

### Drag & drop e navegação
- `wireCardDragDrop(container, cardId)` — tx rows e pay rows; mesmo dia apenas
- `toggleCardYear(y)` / `toggleCardBill(bid)` / `backToCards()` / `openCardBills(cardId)`
- `cardSortClick(col)` → `renderCardPreserve()`

---

## SEEDS
- **TASK_SEED_VERSION:** v4
- **FINANCE_SEED_VERSION:** v2

## BACKUP ATUAL
- Arquivo: `agenda-backup-2026-06-06.json`
- 14 tarefas, 3 cartões (Itaú, Mercado Pago, Nubank)
- 149 txs no Itaú (Maio/2026 original + parcelas projetadas até 2027)
- Grupos MERCA 10x: `grp-migrated-mq0aioubdtwo` (10x R$73,56, data 03/05/26) e `grp-migrated-mq0aioubtmeu` (10x R$66,41, data 07/05/26)
- Pagamentos Itaú m=4 (Maio): antecipação R$12.867,69 em 29/05/26
- Finance: dados corretos Jan-Jun 2026

## REGRA PARA NOVA SESSÃO
Enviar: `index.html`, `sw.js`, `CONTEXTO_AGENDA_4.md`
O próximo contexto deve ser `CONTEXTO_AGENDA_5.md` e deve ser ACUMULATIVO (incluir tudo deste contexto + novidades da próxima sessão).
