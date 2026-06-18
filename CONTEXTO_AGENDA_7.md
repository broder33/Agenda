---
app_version: v0.4.82
service_worker: agenda-v0482
arquivos_trabalho:
  - /home/claude/index.html
  - /home/claude/sw.js
arquivos_output:
  - /mnt/user-data/outputs/index.html
  - /mnt/user-data/outputs/sw.js
backup_atual: agenda-backup-2026-06-06.json
seeds:
  task: v4
  finance: v2
proximas_etapas:
  - "Espaço entre 'Acumulado do ano' e 'Fechamento/Vencimento' (adiado a pedido do Richard)"
  - "Importador de débito — testar e refinar com outros bancos além do Mercado Pago"
  - "Integração Dashboard: verificar totalPago no modo não-acumulado com filtro de grupos"
---

# CONTEXTO — Agenda Pessoal com IA

## Como usar este documento

Este é um **primer de estado atual**, não um changelog. Ele descreve
onde o projeto **está agora** — o suficiente para uma nova sessão do
Claude ser produtiva sem reler o histórico inteiro.

- **Estado volátil** (versão, arquivos, backup, próximas etapas) vive no
  **frontmatter YAML** acima. É o único bloco que muda na maioria das sessões.
- **Histórico versão-a-versão NÃO fica aqui.** Vai para os commits do Git
  (ou um `CHANGELOG.md` separado). Não recriar changelog neste arquivo.
- **Fonte única da verdade:** cada fato é declarado uma vez, na seção de
  arquitetura correspondente. Convenções são invariantes, não reexplicação.
- Ao atualizar: edite o estado vigente no lugar e ajuste o frontmatter.
  Não acumule sessões antigas.
- Sempre entregar `index.html` + `sw.js` juntos.

---

## Stack e infraestrutura

- **App:** Single HTML + `sw.js` (Service Worker PWA).
- **Hospedagem:** GitHub Pages — `https://broder33.github.io/Agenda`.
- **Auth/Sync:** Supabase — projeto `fxzikckzgvdwzvjysoao`; tabela
  `agenda_data`; RLS configurado.
- **IA:** Anthropic API — `claude-sonnet-4-20250514` *(verificar se ainda é
  a string vigente)*.
- **SheetJS:** parsing XLSX/CSV para importação de faturas.
- **pdfjs-dist@3.11.174:** leitura de PDF para importação de extratos de débito.
- **Google OAuth Client ID:**
  `962292865944-ialv4nnv2gqpgek5mjreto6goa9jbhhu.apps.googleusercontent.com`

> ⚠ **Higiene:** este arquivo circula entre sessões. NUNCA adicionar aqui
> chaves anon/service, tokens ou qualquer segredo real.

## Convenção de versão

Sequência contínua (ex.: v0.4.82). A versão muda **a cada alteração de
código** — nunca em alterações apenas de dados. Aparece no header e na aba Config.

---

## Arquitetura

### Estado global (`state`)

- `state.card = { cards, bills, billStatus, categorias, memory, catGroups, payments, acMemory }`
- `state.finance.bills[y][m]` = array `{ id, nome, venc, valor, status, categoriaId, obs }`.
- `state.debit = { accounts, transactions, memory, acMemory, ignoreKeywords, recurringCategories }`
  - `accounts = [{ id, nome, cor }]`
  - `transactions[accountId] = [{ id, data, descricao, valor, categoriaId, ignorarDashboard, estorno, nota }]`
  - `acMemory = { descricaoLowercase: categoriaId }` — memória de classificação
  - `ignoreKeywords` — palavras-chave para ignorar na importação de extrato
  - `recurringCategories` — IDs de categorias marcadas como "já contabilizadas em Contas"
- `state.config.tabLabels` = rótulos editáveis das abas.
- `state.tasks.sortLevels[]` = ordenação multinível.

### Abas e navegação

`TAB_IDS = ['tasks','finance','card','debit','dashboard','ai','settings']`
`TAB_DEFAULTS = { tasks:'Tarefas', finance:'Contas', card:'Cartão', debit:'Débito', dashboard:'Dashboard', ai:'IA', settings:'Config' }`

### Aba Cartão

Multi-cartão (Itaú, Mercado Pago, Nubank), cada um com cor e datas de
fechamento/vencimento. Toggle **Lista / Carousel** (antes chamado "Mensal").

**Render / navegação:** `renderCard()`, `renderCardPreserve()`,
`renderCardBillsMonth()`, `openCardBills(cardId)`, `backToCards()`,
`buildCardBillHTML(cardId,y,m)`, `buildCardTxTable(cardId,y,m)`,
`cardBillAction(btn,action)`, `wireCardDragDrop(container,cardId)`,
`toggleCardYear`, `toggleCardBill`, `cardSortClick(col)`.

- `renderCardPreserve()` sempre seta `_savedOpenBids = []` (mesmo vazio).

**Modais:** `openAddCardModal`, `openEditCardModal`, `openAddBillModal`,
`openImportBillModal`, `openAddTxModal`, `openAddPaymentModal`,
`openCardAnalysis`, `openCatGroupsModal`, `openCatManager`,
`openPayHistoryManager`, `openRulesManager`.

**Edição inline:** `inlineEditCardTx`, `editCardTxNota` (usa
`getInstallmentNota` ao abrir), `inlineEditPayment`, `cardTxCatChange`.

**Status e cálculo:**
- `getBillStatus`, `toggleBillPaid`, `cardDateToNum`, `cardDisplayMonth`.
- `calcPaymentCoverage(cardId,y,m)` → `{ coveredIds, isPartial }`.

**Importação:** `parseMercadoPagoPDF`, `parseNubankPDF`,
`classifyAndReview` (chama `acLoadMemory()` antes), `showImportReview`,
`getNotaFromMemory`, `matchRule`. `PAGAMENTO EFETUADO` é ignorado.

**Parcelamento:** `installmentGroupId`, `installmentTotal`,
`installmentCurrent`, `installmentStartY`, `installmentStartM`.
- `propagateInstallmentField(tx,field,value,cardId)` — propaga `descricao`,
  `categoriaId`, `nota`.
- `getInstallmentNota(tx,cardId)` — lê a nota do grupo se a própria estiver vazia.
  **Também usado no Dashboard** para resolver notas de parcelas.

**Autocomplete:** `acAttach(input,field,onSelect)`, `acRemember`,
`acLoadMemory` (também popula chaves `debit-desc-{accId}` para o débito),
`acSuggest`, `acGetKey(field)`.

### Aba Débito

Nova aba independente (não sub-área do Cartão). Similar ao Cartão mas
simplificada: sem parcelas, sem fechamento/vencimento, sem fatura. Débito é
sempre pago imediatamente.

**Render:** `renderDebit()`, `renderDebitOverview(root,accounts)`,
`renderDebitAccount(root,acc)`.

**Estado global de visualização:**
- `_debitActiveAccount` — `null` = overview de todas as contas; string ID = conta ativa.
- `_debitViewMode` — `'carousel'` | `'list'`.
- `_debitActiveMonthIdx[accountId]` — índice do mês no carousel.
- `_debitSortLevels` — ordenação multinível (padrão: `[{col:'data',dir:'desc'}]`).

**Tabela:** `buildDebitTxTable(accountId,ym,txs)` — colunas Data, Descrição,
Valor, Detalhes, Categoria; drag-and-drop no mesmo dia; sort clicável;
footer com total; botões + Transação, Importar, ⚡ Regras, Apagar mês.

**Funções de suporte:** `debitSortClick(col)`, `debitSortBadge(col)`,
`sortDebitTxs(txs)`, `wireDebitDragDrop(container,accountId,ym)`,
`inlineEditDebitTx(cell)`, `editDebitTxNota(el,accountId,ym,txid)` (usa
`<textarea>` com resize), `debitTxCatChange(sel)`, `removeDebitTx`,
`removeDebitMonth`.

**Regras:** `openDebitRules(accountId,ym)` — reutiliza `openRulesManager`
do Cartão com botão "Aplicar a este mês" configurado para o contexto de débito.

**Categorias:** compartilha `state.card.categorias` (biblioteca universal).
`getDebitCats()` = `state.card.categorias`. `getDebitCatName(id)` usa
`c.name||c.nome` (proteção contra variações de campo).

**Sem categoria:** o `<select>` de categoria tem `background:rgba(239,68,68,.15)`
quando vazio; some ao selecionar via `onchange`.

**Importador de extrato (Mercado Pago PDF):**
- `openDebitImportModal(accountId)` — seleciona arquivo PDF, mês/ano de
  referência, keywords a ignorar, categorias recorrentes.
- `parseDebitMercadoPagoPDF(items, ignoreKeywords, recurringCatIds)` — recebe
  array de tokens `{str,x,y}` do pdfjs (não texto concatenado). Parser por
  coordenadas X: Data x<80, Descrição x<190, ID x<290, Valor x<360.
  Agrupa tokens por Y (tolerância ±3px). Marca `estorno:true` para
  Reembolso/Estorno/Rendimentos. Usa `consumed{}` para evitar que linhas de
  descrição sejam capturadas por duas transações.
- `classifyAndReviewDebit(accountId,txs,overlay,selectedYM)` — aplica memória,
  chama IA se `state.config.apiKey` disponível.
- `showDebitImportReview(accountId,txs,overlay,selectedYM)` — tabela com
  checkbox por transação (select-all no header), duplicatas desmarcadas por
  padrão com opacidade reduzida, campos Detalhes e Categoria editáveis.
- **pagePromises** retorna itens com coordenadas `{str,x,y}` (Y convertido
  para top-down via `pageH - transform[5]`), não texto concatenado.
- Após confirmar: navega carousel para o mês selecionado.

**Estornos e rendimentos:** `tx.estorno = true` → valor negativo no Dashboard
(reduz total). Na lista principal, exibidos em verde.

### Aba Contas (finance)

`renderFinance()`, `buildMonthBlock(y,m)`, `buildFinTable(y,m)`,
`finRowHTML(y,m,r)`, `refreshFinBlock(y,m)`, `refreshFinHeader(y,m)`.

- `saveFinField(y,m,id,field,value)` — sem efeitos colaterais.
- `openCatDD` / `closeCatDD` — dropdown customizado de categoria.
- `openFinCatPropagateModal` — propagação de categoria.

### Aba Dashboard

`renderDashboard()`, `getDashboardExpenses(y,m,label,payFilter)`,
`buildDashExpenseList(expenses,catName,color)`.

**Fontes de dados em `getDashboardExpenses`:**
1. Cartão — `nota` resolvido via `getInstallmentNota(tx,card.id)` para parcelas.
   `sourceLabel: '💳 '+card.nome`.
2. Contas — `sourceLabel: 'Contas'`.
3. Débito — `sourceLabel: '🏦 '+acc.nome`. Datas convertidas para `DD/MM/YY`.
   Estornos entram com valor negativo. `ignorarDashboard:true` → excluído.
   `payFilter === 'open'` → débito sempre excluído (já pago).

**Estado global:**
- `_dashY`, `_dashM`, `_dashLabel`, `_dashAccum`, `_dashViewMode`, `_dashPayFilter`
- `_dashActiveSources` — `Set` de IDs ativos; `null` = todos; **persiste ao
  navegar entre meses** (não reseta mais na navegação).
- `_dashActiveGroups` — `Set` de nomes de grupos ativos; `null` = todos.

**Dropdown "Exibir":** botão compacto no header, ao lado do toggle
"Por categoria / Por grupo". Seções: Cartões, Contas, Débito (uma por conta).
Dot indicador quando há filtro ativo.

**`totalPago` no modo acumulado:** calculado sobre `allFiltered` (respeita
filtro de grupos). Por cartão: usa ratio `rawPayTotal/rawBillTotal` aplicado ao
total filtrado. Contas: soma só as pagas em `allFiltered`. Débito: soma direta
de `allFiltered` (já líquido com estornos negativos).

**`totalPago` no modo normal:** calculado sobre `allFiltered` por fonte:
- Contas: `e.pago`.
- Débito: `e.valor` (já líquido).
- Cartão: via `seenCardSources` com `_billPayTotal`.

**Categorias negativas (Rendimentos/Estornos):**
- `catMap` mantém entradas negativas (não deleta mais com `<=0`, só com `===0`).
- Exibidas no final da lista, em verde, com prefixo `+`.
- Sort: positivos decrescentes primeiro, negativos por último.

**`expInActiveGroup(e)`:** filtra por grupos ativos usando `_dashActiveGroups`.

### Sistema de Categorias

- `state.card.categorias = [{ id: 'cat-xxx', name }]` — biblioteca universal
  compartilhada por Cartão, Contas e Débito.
- `getCatName(id)`, `getCatId(name)`, `genCatId()`.
- `migrateCategorias()` — idempotente; chamada em `mergeState()`.
- `addCategoria()`, `renameCategoria()`, `deleteCategoria()`.
- `_catManagerContext` — contexto para `openCatManager()`.

### Sistema de Comentários

- `createEditor(text)`, `editorToText(editor)`, `buildFormatToolbar(editor)`,
  `mergeConsecutiveOLs(editor)`.
- **Gotcha CSS:** `display: list-item !important` e `padding-left: 28px !important`
  para listas sob o reset global `*{padding:0}`.

### Sistema de Tarefas

- Undo/Redo: snapshot captura `{ tasks, finance, card, debit }`.
- `TAB_IDS`, `TAB_DEFAULTS` — ver seção Abas.
- Filtros, ordenação multinível — inalterados.

### `.btn-sm` (estilo global)

```css
.btn-sm {
  font-family: 'DM Mono', monospace;
  font-size: 12px; padding: 6px 12px;
  border: 1px solid var(--border); border-radius: 6px;
  background: var(--surface2); color: var(--muted);
  cursor: pointer; transition: all .15s; white-space: nowrap;
}
```
Aplicado a todos os botões do app para consistência visual.

---

## Invariantes e convenções críticas

- `createElement` em vez de `innerHTML` para elementos com event handlers.
- `data-*` em vez de parâmetros inline no `onclick` quando possível.
- `renderCardPreserve()` (não `renderCard()`) para operações que não fecham meses.
- `_savedOpenBids` sempre setado, mesmo se vazio.
- `mousedown` + `contains()` para fechar dropdowns.
- `pushUndo()` **antes** de mutações destrutivas; `confirmAction()` para ações destrutivas.
- `acLoadMemory()` chamado antes de `classifyAndReview`.
- `g.name` (não `g.nome`) para catGroups; `c.name||c.nome` para categorias (proteção).
- `saveFinField` não tem efeitos colaterais.
- `migrateCategorias()` é idempotente.
- `applySeeds()` nunca sobrescreve dados do usuário (version-gate).
- **Grupos de parcelas devem permanecer estritamente separados.**
- `node --check` antes de entregar JS (HTML não é suportado — usar `new Function()`).
- Incrementar versão a cada mudança de código; nunca em mudança só de dados.
- `getDebitCatName(id)` usa `c.name||c.nome` — não apenas `c.nome`.
- Débito é sempre pago imediatamente — nunca aparece em "Em aberto" no Dashboard.
- Estornos/Rendimentos no débito: `tx.estorno=true`, valor positivo armazenado,
  valor negativo no Dashboard (reduz total).

---

## Dados atuais (backup)

- Backup: `agenda-backup-2026-06-06.json` (formato com `categoriaId`).
- 3 cartões: Itaú, Mercado Pago, Nubank.
- 4 contas de débito: Mercado Pago + 3 outras (a cadastrar).
- Grupos MERCA 10x — **manter estritamente separados**:
  - `grp-migrated-mq0aioubdtwo` (10x R$73,56)
  - `grp-migrated-mq0aioubtmeu` (10x R$66,41)
- Grupos de categorias: "Richard" (`#6366f1`) e "Paul" (`#46ecc2`).

## Modais estáticos (z-index)

- `#confirmModal` — `100000`.
- `#catManagerModal` — `99999`.
- `#rulesManagerModal` — `99999`.
- `#payHistoryModal` — `99999`.

## Colaborador

Richard é altamente detalhista — captura erros lógicos, offsets incorretos e
modificações não solicitadas. Prefere que o Claude **sinalize incerteza em vez
de adivinhar** e **não faça alterações além do que foi pedido**.
