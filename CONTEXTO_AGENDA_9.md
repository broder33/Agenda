# Contexto — Agenda PWA (para nova conversa)

## Projeto

**App:** Agenda Pessoal — PWA single-file (`index.html` + `sw.js`), hospedado em `broder33.github.io/Agenda`, Supabase para auth/sync, Anthropic API para IA.

**Versão atual:** v0.5.60

**Workflow:** Richard faz upload do `index.html` → Claude edita via bash/Python str_replace → entrega `index.html` + `sw.js` juntos. `node --check` obrigatório antes de toda entrega. Bump de versão em toda mudança de código.

---

## Regras de trabalho (explicitadas pelo Richard)

- Entender antes de tocar no código — diagnosticar precisamente antes de propor qualquer mudança
- Sem scope creep — só o que foi pedido explicitamente
- Sinalizar incerteza — nunca inventar diagnósticos ou fabricar observações
- Não repetir abordagens que já falharam — reconsiderar do zero
- `node --check` obrigatório antes de entregar
- Versão: v0.5.99 → v0.6.00 (não v0.5.100)
- Entregar sempre `index.html` + `sw.js` juntos
- Todas as features desktop devem funcionar em mobile sem implementação separada

---

## Convenções do código

- Nunca usar nested template literals ou aspas simples não escapadas em strings JS que geram HTML — usar `&#39;` ou atributos `data-*`
- `var` declarado no meio de função mas referenciado em closures definidas antes será `undefined` — sempre hoist para o topo
- `insertBefore` sempre com guard `after.parentNode === container`
- `AbortController` para drag listeners (evita acumulação de listeners)
- `dateStrToNum(d)` — helper global que converte `DD/MM/AA` → `YYYYMMDD` para sort correto (substitui `localeCompare` em datas)
- `dedupListItems()` — chamada em `saveState()`, `mergeState()`, init local e Supabase
- Seed de listas: flag `_seedApplied` impede reaplicação
- Seed de cartões: removidos — estado inicial `cards: []`
- `useMousedown` com `.contains()` para fechar dropdowns

---

## Arquitetura do estado

```
state = {
  tasks: { items: [], sortLevels: [], ... },
  finance: { ... },
  card: {
    cards: [],        // sem hardcoded seeds
    bills: {},        // bills[cardId][year][month] = [txs]
    payments: {},
    ...
  },
  debit: { accounts: [], transactions: {}, ... },
  lists: {
    lists: [{
      id, nome, cor,
      statuses: [{ id, nome, cor }],
      sections: [{ id, nome, items: [{ id, nome, statusId, updatedAt }] }]
    }],
    _seedApplied: true
  },
  config: { activeTab, theme, ... }
}
```

---

## Alterações desta sessão (v0.5.33 → v0.5.60)

### v0.5.33 — Aba IA removida
- Removida de `TAB_IDS`, `TAB_DEFAULTS`, `tabLabels` e panel HTML

### v0.5.34 — Aba Listas criada
- Grid de listas → detalhe com seções → itens
- Seções e itens com drag & drop, edição inline, status configurável

### v0.5.35 — Fix filtro "Em aberto" no Dashboard
- Revertido depois; solução final em v0.5.43/44

### v0.5.36 — Cartões hardcoded removidos
- `card-itau`, `card-mp`, `card-nubank` removidos do seed e do fallback de `mergeState`

### v0.5.37 — (revertido)
- Auto-assign de fatura por data de fechamento — removido; solução correta é o botão ↗ Mover

### v0.5.38 — Botão ↗ Mover transação
- Abre modal para mover transação entre faturas (existentes ou nova)

### v0.5.39 — Carousel navega meses sem fatura
- Janela -3/+6 meses do atual sempre disponível

### v0.5.40 — Dashboard: colunas ordenáveis
- Despesas expandidas por categoria com sort por Data/Descrição/Nota/Fonte/Valor

### v0.5.41/42 — Dashboard: consistência de valores
- `totalPago` usa mesma base que donut (`getDashboardExpenses` com `payFilter='paid'`)
- Label central do donut mostra `totalPago`/`totalAberto` conforme filtro ativo

### v0.5.43/44 — Dashboard: fechamento da conta
- `totalAberto = totalMes - totalPago` garante que os três cartões sempre fechem
- Removida exclusão de faturas futuras do filtro `open`

### v0.5.45 — `dateStrToNum()` global
- Substitui todos os `localeCompare` e `<` em strings de data em todo o app
- Corrige ordenação por data em Dashboard, Débito, análise de cartão

### v0.5.46 — Seed Lista de Compras
- `applyListSeeds()` com Lista Principal (29 itens) e Lista Extra (34 itens)
- Flag `_seedApplied` impede reaplicação

### v0.5.47 — Sort de colunas nas Listas
- Nome / Status / Atualizado clicáveis, asc/desc

### v0.5.48/49 — Seleção múltipla nas Listas
- Checkboxes invisíveis por padrão, aparecem no hover
- Barra de ação com "↗ Mover para..." e "Desmarcar"
- Modal de destino: lista, seção, mover ou copiar

### v0.5.50 — Fix duplicação de seed + fix drag status
- Flag `_seedApplied` correta
- Listeners de drag do status removidos antes de rebuild

### v0.5.51–54 — `dedupListItems()`
- Função standalone chamada em `saveState()`, `mergeState()`, init local e Supabase
- Fix seletor ambíguo: `tbody` recebe classe `list-sec-tbody`
- `wireItemDragDrop` com `AbortController`

### v0.5.55/56 — Fix status picker + insertBefore
- Status picker com toggle (data-item-id) — fecha ao clicar no mesmo item
- `insertBefore` com guard `after.parentNode === container` em todos os 3 pontos

### v0.5.57 — Sort multi-nível nas Listas
- `sortLevels[]` por seção, badges `1↑/2↓`, clique adiciona/inverte/remove
- Igual ao padrão de Débito e Tarefas

### v0.5.58–60 — Fix barra de seleção (PENDENTE)
- Causa raiz identificada: `tbody`, `selBar`, `selCount` declarados com `var` no meio do código mas referenciados em closures definidas antes
- Fix aplicado: declarados no topo de `buildSectionBlock`, `tbody` criado antes de `moveBtn.onclick`
- **Problema:** barra de seleção ainda não aparece após clicar checkbox

---

## Problema pendente — barra de seleção (v0.5.60)

**Sintoma:** clicar no checkbox de um item não exibe a barra de ação.

**Fluxo esperado:**
1. Hover na linha → checkbox aparece (opacity 0→1)
2. Clique no checkbox → `chk.onclick` → `onSelChange()` → `updateSelectionBar()`
3. `updateSelectionBar` acessa `tbody` (closure) e `selBar` (closure) → `selBar.style.display='flex'`

**O que já foi tentado sem sucesso:**
- Hoist de `var tbody, selBar, selCount` para o topo de `buildSectionBlock`
- Mover criação do `tbody` para antes de `moveBtn.onclick`
- Remover definição duplicada de `updateSelectionBar`

**Próximo passo sugerido:** adicionar `console.log` temporário dentro de `updateSelectionBar` para confirmar se está sendo chamada e quais são os valores de `tbody` e `selBar` no momento do clique. Verificar também se `row.onmouseenter`/`onmouseleave` estão sobrescrevendo o handler de opacidade do checkbox antes do clique registrar.

---

## Funções chave — módulo Listas

- `renderLists()` → `renderListsGrid()` ou `renderListDetail()`
- `buildSectionBlock(list, sec, secIdx, sectionsWrap)` — constrói tabela com sort multi-nível, checkboxes, selBar
- `buildItemRow(list, sec, item, tbody, onSelChange)` — linha com checkbox, nome, status, data, ×
- `openStatusPicker(e, list, sec, item, tbody)` — dropdown de status com toggle behavior
- `openMoveItemsModal(itemIds, srcList, srcSec, onDone)` — modal mover/copiar itens
- `dedupListItems()` — remove duplicatas por nome dentro de cada seção
- `applyListSeeds()` — seed inicial Lista de Compras (só se `_seedApplied` falso)
- `dateStrToNum(d)` — converte DD/MM/AA → YYYYMMDD
- `wireItemDragDrop(tbody, list, sec)` — drag de itens com AbortController
- `wireSectionDragDrop(container, list)` — drag de seções

---

## Outros módulos — estado atual

- **Tarefas:** sort multi-nível (`state.tasks.sortLevels`)
- **Contas (finance):** categorias por ID com `migrateCategorias()`
- **Cartão:** carousel com janela de navegação, botão ↗ Mover por transação, sem seeds hardcoded
- **Débito:** parser PDF coordinate-based (Mercado Pago), sort multi-nível, detecção de duplicatas
- **Dashboard:** donut chart, filtros Pago/Em aberto/Todos, modo acumulado anual, sort por categoria expandida
- **Apps:** Logo Inverter (processamento de imagem com matriz linear 4×4)
- **Config:** temas, labels de abas, API key Anthropic
