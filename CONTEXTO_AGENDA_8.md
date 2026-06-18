---
app_version: v0.5.12
service_worker: agenda-v0512
arquivos_trabalho:
  - /home/claude/index.html
  - /home/claude/sw.js
arquivos_output:
  - /mnt/user-data/outputs/index.html
  - /mnt/user-data/outputs/sw.js
backup_atual: agenda-backup-2026-06-17.json
seeds:
  task: v4
  finance: v2
proximas_etapas:
  - "Espaço entre 'Acumulado do ano' e 'Fechamento/Vencimento' (adiado a pedido do Richard)"
  - "Importador de débito — testar e refinar com outros bancos além do Mercado Pago"
  - "Integração Dashboard: verificar totalPago no modo não-acumulado com filtro de grupos"
  - "Modal Histórico de Pagamentos (Cartão): verificar se rename persiste corretamente após v0.4.91+"
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

Sequência contínua (ex.: v0.5.12). A versão muda **a cada alteração de
código** — nunca em alterações apenas de dados. Aparece no header e na aba Config.

---

## Arquitetura

### Estado global (`state`)

- `state.card = { cards, bills, billStatus, categorias, memory, catGroups, payments, acMemory }`
- `state.finance.bills[y][m]` = array `{ id, nome, venc, valor, status, categoriaId, obs }`.
- `state.debit = { accounts, transactions, memory, acMemory, ignoreKeywords, recurringCategories, viewMode }`
  - `accounts = [{ id, nome, cor }]`
  - `transactions[accountId] = [{ id, data, descricao, valor, categoriaId, ignorarDashboard, estorno, nota }]`
  - `acMemory = { descricaoLowercase: categoriaId }` — memória de classificação
  - `ignoreKeywords` — palavras-chave para ignorar na importação de extrato
  - `recurringCategories` — IDs de categorias marcadas como "já contabilizadas em Contas"
  - `viewMode` — `'carousel'` | `'list'` — persiste entre sessões
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
`acLoadMemory`, `acSuggest`, `acGetKey(field)`.
- `acLoadMemory` popula `acGetKey('debit-desc-{accId}')` com descrições reais
  das transações (case preservado, ordem decrescente por data) e
  `acGetKey('debit-nota-{accId}')` com notas reais das transações.
- Chaves de débito usam `acGetKey()` — prefixo `ac_` obrigatório.

**Histórico de Pagamentos (`openPayHistoryManager`):**
- Lista gerada diretamente de `state.card.payments` (não de `acMemory`).
- Botão ✏ permite renomear descrição/nota inline; ao confirmar, atualiza
  todos os pagamentos com aquele valor via `renamePayField(cardId,oldVal,newVal,field)`.
- Renomear para valor idêntico a outro existente colapsa as entradas.

**Sort (drag & drop):** `sortCardTxs(txs)` usa índice original como tiebreaker
— itens do mesmo dia preservam ordem do array, permitindo reordenação por D&D.
- Lógica de drop: `after = e.clientY < rect.top + rect.height/2` (inserir antes
  quando mouse na metade superior).

### Aba Débito

Aba independente. Sem parcelas, fechamento/vencimento ou fatura.

**Overview:** `renderDebitOverview(root,accounts)` — grid de cards igual ao
Cartão: `border-top` colorida, nome, info (transações + total do mês), botão ✎.
Botão "+ Conta" no header. Ao entrar em conta: barra de tabs com "← Contas".

**Render:** `renderDebit()`, `renderDebitOverview(root,accounts)`,
`renderDebitAccount(root,acc)`.

**Estado global de visualização:**
- `_debitActiveAccount` — `null` = overview; string ID = conta ativa.
- `_debitViewMode` — `'carousel'` | `'list'`; persistido em `state.debit.viewMode`.
- `_debitActiveMonthIdx[accountId]` — índice do mês no carousel.
- `_debitSortLevels` — ordenação multinível (padrão: `[{col:'data',dir:'desc'}]`).
- `_debitOpenMonths[accId][ym]` — bool; memória de meses abertos/fechados na Lista.

**Lista:** meses fechados por padrão. Header com chevron `›` (rota 90° quando
aberto), label do mês, contador de transações, total. Click abre/fecha com
memória em `_debitOpenMonths`.

**Carousel:** dots renderizados do índice maior para menor (direita = mais
recente), corrigindo alinhamento visual com navegação ‹/›.

**Tabela:** `buildDebitTxTable(accountId,ym,txs)` — colunas Data, Descrição,
Valor, Detalhes, Categoria; drag-and-drop no mesmo dia; sort clicável;
footer com total.

**Sort (drag & drop):** `sortDebitTxs(txs)` usa índice original como tiebreaker.
- Lógica de drop: `after = e.clientY < rect.top + rect.height/2`.

**Funções de suporte:** `debitSortClick(col)`, `debitSortBadge(col)`,
`sortDebitTxs(txs)`, `wireDebitDragDrop(container,accountId,ym)`,
`inlineEditDebitTx(cell)`, `editDebitTxNota(el,accountId,ym,txid)`,
`debitTxCatChange(sel)`, `removeDebitTx`, `removeDebitMonth`.

**Edição inline (`inlineEditDebitTx`):**
- `pushUndo()` chamado no início.
- Campo `data`: picker customizado com ‹/›; abre no mês da data existente
  (`isoP[1] ? parseInt(isoP[1])-1 : new Date().getMonth()` — evita bug de Janeiro=0 falsy).

**Modal "+ Transação" (`openAddDebitTxModal`):**
- Usa `modal-box` + `modal-overlay` + `showModal()`.
- Data default: data mais recente das transações do mês; se mês vazio → dia 1.
- Picker de data customizado com ‹/›.
- Autocomplete: Descrição (`debit-desc-{accId}`), ao selecionar pré-preenche
  Detalhes com nota mais recente da mesma descrição. Detalhes (`debit-nota-{accId}`).
- Ao salvar: nota registrada via `acRemember('detalhes', nota)`.

**Classificação automática (`classifyAndReviewDebit`):**
- `debitDescMatch(a,b)`: match parcial inteligente — requer palavra significativa
  em comum além de stopwords ("pagamento", "qr", "pix", "ltda", etc.).
- `getDebitNotaFromHistory(accountId,desc,valor)`: busca nota no histórico;
  se notas distintas → desambigua por valor; fallback por nota majoritária
  (>50% das ocorrências).

**Regras:** `openDebitRules(accountId,ym)` — reutiliza `openRulesManager`.

**Categorias:** compartilha `state.card.categorias`.
`getDebitCats()` = `state.card.categorias`. `getDebitCatName(id)` usa
`c.name||c.nome`.

**Importador de extrato (Mercado Pago PDF):**
- `openDebitImportModal(accountId)`.
- `parseDebitMercadoPagoPDF(items, ignoreKeywords, recurringCatIds)`.
- `classifyAndReviewDebit(accountId,txs,overlay,selectedYM)`.
- `showDebitImportReview(accountId,txs,overlay,selectedYM)`.

**Estornos e rendimentos:** `tx.estorno = true` → valor negativo no Dashboard.
Na lista principal, exibidos em verde.

### Aba Contas (finance)

`renderFinance()`, `buildMonthBlock(y,m)`, `buildFinTable(y,m)`,
`finRowHTML(y,m,r)`, `refreshFinBlock(y,m)`, `refreshFinHeader(y,m)`.

- `saveFinField(y,m,id,field,value)` — sem efeitos colaterais.
- `openCatDD` / `closeCatDD` — dropdown customizado de categoria.
- `openFinCatPropagateModal` — propagação de categoria.
- Ao criar novo mês: herda `categoriaId` do mês anterior (corrigido).

### Aba Dashboard

`renderDashboard()`, `getDashboardExpenses(y,m,label,payFilter)`,
`buildDashExpenseList(expenses,catName,color)`.

**Fontes de dados em `getDashboardExpenses`:**
1. Cartão — `nota` resolvido via `getInstallmentNota(tx,card.id)` para parcelas.
2. Contas — `sourceLabel: 'Contas'`.
3. Débito — estornos com valor negativo. `ignorarDashboard:true` → excluído.
   `payFilter === 'open'` → débito sempre excluído.

**Estado global:**
- `_dashY`, `_dashM`, `_dashLabel`, `_dashAccum`, `_dashViewMode`, `_dashPayFilter`
- `_dashActiveSources` — `Set`; persiste ao navegar entre meses.
- `_dashActiveGroups` — `Set` de nomes de grupos ativos; `null` = todos.

**Gráfico donut:**
- `totalPositive` = soma apenas de valores positivos do `catMap`.
- Loop do donut pula categorias com `val <= 0` (estornos não entram no gráfico).
- `pct = cat.val / (totalPositive||1)` — sempre divide por positivo.
- Label "Total do mês" / "Total do ano" conforme `_dashAccum`.

**Categorias negativas (Rendimentos/Estornos):**
- Exibidas no final da lista, em verde, com prefixo `+`.

### Sistema de Categorias

- `state.card.categorias = [{ id: 'cat-xxx', name }]` — biblioteca universal.
- `getCatName(id)`, `getCatId(name)`, `genCatId()`.
- `migrateCategorias()` — idempotente; chamada em `mergeState()`.

### Undo/Redo

- Snapshot: `{ tasks, finance, card, debit }`.
- `undo()` e `redo()` restauram `state.debit` além de `state.tasks`,
  `state.finance`, `state.card`.
- `pushUndo()` chamado em `inlineEditDebitTx` e outras mutações destrutivas.

### Sistema de Comentários

- `createEditor(text)`, `editorToText(editor)`, `buildFormatToolbar(editor)`,
  `mergeConsecutiveOLs(editor)`.
- **Gotcha CSS:** `display: list-item !important` e `padding-left: 28px !important`.

### Sistema de Tarefas

- Undo/Redo: snapshot captura `{ tasks, finance, card, debit }`.
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

---

## Invariantes e convenções críticas

- `createElement` em vez de `innerHTML` para elementos com event handlers.
- `data-*` em vez de parâmetros inline no `onclick` quando possível.
- `renderCardPreserve()` (não `renderCard()`) para operações que não fecham meses.
- `_savedOpenBids` sempre setado, mesmo se vazio.
- `mousedown` + `contains()` para fechar dropdowns.
- `pushUndo()` **antes** de mutações destrutivas; `confirmAction()` para ações destrutivas.
- `acLoadMemory()` chamado antes de `classifyAndReview`.
- Chaves de autocomplete de débito usam `acGetKey()` — ex: `acGetKey('debit-desc-'+acc.id)`.
- `g.name` (não `g.nome`) para catGroups; `c.name||c.nome` para categorias.
- `saveFinField` não tem efeitos colaterais.
- `migrateCategorias()` é idempotente.
- `applySeeds()` nunca sobrescreve dados do usuário (version-gate).
- **Grupos de parcelas devem permanecer estritamente separados.**
- `node --check` antes de entregar JS (HTML não é suportado — usar `new Function()`).
- Incrementar versão a cada mudança de código; nunca em mudança só de dados.
- `getDebitCatName(id)` usa `c.name||c.nome`.
- Débito é sempre pago imediatamente — nunca aparece em "Em aberto" no Dashboard.
- Estornos/Rendimentos no débito: `tx.estorno=true`, valor positivo armazenado,
  valor negativo no Dashboard.
- Pickers de data customizados: inicializar mês com
  `isoP[1] ? parseInt(isoP[1])-1 : new Date().getMonth()` (não `||` — Janeiro=0 é falsy).
- Drag & drop: `after = e.clientY < rect.top + rect.height/2` (inserir antes
  quando mouse na metade superior). Ambos Cartão e Débito usam esta lógica.
- Modais novos devem usar `modal-box` + `modal-overlay` + `showModal()`.

---

## Dados atuais (backup)

- Backup: `agenda-backup-2026-06-17.json` (formato com `categoriaId`).
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
