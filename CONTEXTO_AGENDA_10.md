# Contexto — Agenda PWA (para nova conversa)

## Projeto

**App:** Agenda Pessoal — PWA single-file (`index.html` + `sw.js`), hospedado em `broder33.github.io/Agenda`, Supabase para auth/sync, Anthropic API para IA.

**Versão atual:** v0.5.95

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
- **Não estragar o que já funciona ao corrigir outra coisa** — se um botão/campo funcionava antes, ele não pode quebrar como efeito colateral
- **Verificar a versão do arquivo de trabalho antes de editar** — nunca construir sobre upload antigo

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
- **`click` e `mousedown` são eventos distintos** — `stopPropagation()` no `mousedown` NÃO impede o `click` de borbulhar
- **Nunca reconstruir a tabela dentro de handler de `blur`/save** — mata cliques em voo em outros elementos; preferir atualização in-place
- **Drag precisa de limiar de movimento (5px)** — sem isso, micro-movimentos durante cliques normais viram drag e cancelam o `click`
- **`overflow:hidden` no container recorta filhos sticky/posicionados** — cuidado ao posicionar barras dentro de tabelas
- **`<input type="date">` exibe no locale do navegador** — incontrolável pela página; usar calendário próprio do app
- **Seeds não alteram estado já existente** — mudar o texto do seed no código não renomeia lista já criada; só rename pela UI ou edição do JSON

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
      sections: [{ id, nome, items: [{
        id, nome, statusId, updatedAt,
        children: [ {id, nome, statusId, updatedAt} ],   // sub-itens (1 nível)
        collapsed: false                                  // estado do expand/collapse
      }] }]
    }],
    sortLevels: { [secId]: [{col, dir}] },   // sort persistido por seção
    crono: {                                  // Cronograma Roupas
      columns: [{ id, nome }],                // editáveis: add/rename/mover/remover
      statuses: [{ id, nome, cor }],
      trips: [{
        id, nome, statusId, collapsed,
        values: { [colId]: 'texto ou número' },
        days: [{ id, nome, statusId, values: {} }]
      }],
      scale: 100,        // 60–130 (%)
      autoFit: false     // toggle de ajuste automático à janela
    },
    _seedApplied: true,
    _travelSeedApplied: true
  },
  config: { activeTab, theme, ... }
}
```

**Transações de cartão antecipadas** ganham flags: `anticipated: true`, `anticipatedFromY`, `anticipatedFromM`.

---

## Alterações da sessão anterior (v0.5.33 → v0.5.60)

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

### v0.5.58–60 — Fix barra de seleção (era PENDENTE — resolvido em v0.5.66)
- Hoist de `var tbody, selBar, selCount` para o topo de `buildSectionBlock`
- `tbody` criado antes de `moveBtn.onclick`
- **Não resolveu** — causa real era outra (ver v0.5.66)

---

## Alterações desta sessão (v0.5.61 → v0.5.95)

### v0.5.61 — `tbody._onSelChange`
- `updateSelectionBar` é closure de `buildSectionBlock`; chamadas externas (`inlineEditItemName`, `addListItem`, `openStatusPicker`) passavam `onSelChange` undefined
- Referência guardada em `tbody._onSelChange` para uso por qualquer chamador
- Correção legítima, mas não era a causa do sintoma

### v0.5.62–65 — Diagnóstico com `console.log`
- Logs confirmaram: callback existia, `selBar` no DOM, `display:flex`, `offsetHeight=43`
- `getBoundingClientRect()` revelou `top: -87` → elemento fora da área visível

### v0.5.66 — **FIX barra de seleção (causa raiz)**
- `selBar` estava dentro do `table`, que tem `overflow:hidden` (por causa do `border-radius`)
- Ao rolar, o `selBar` ficava com `top` negativo e era **recortado**
- Solução: `selBar` movido para fora do `table`, direto no `block`, acima da tabela
- Tentativa intermediária de `position:sticky` (v0.5.64) falhou porque o scroll não é do `table`

### v0.5.67 — Sort das Listas persistido
- `sortLevels` era variável local de `buildSectionBlock`, descartada a cada render
- Agora lido/escrito em `state.lists.sortLevels[sec.id]`, salvo via `saveState()` a cada clique de coluna

### v0.5.68 — Resort automático ao mudar status/nome
- `rebuildRows` guardado em `tbody._rebuildRows`
- Mudança de status ou nome dispara resort completo usando o `sortLevels` já configurado
- A configuração de ordenação **não é alterada** por essas ações (era o requisito do Richard: persistência da escolha, não fixação de colunas)

### v0.5.69 — Badge de prioridade persistente
- `mkTh` só desenhava o badge dentro do `onclick`; ao reconstruir a tabela (troca de aba) o badge sumia
- Badge agora calculado já na criação do cabeçalho

### v0.5.70–73 — Investigação "Gatorade" (**não era bug**)
- Sintoma: item parecia fora de ordem alfabética dentro do status "Comprar"
- Logs mostraram `sortLevels = [status asc, nome desc]` e ordem S,Q,P,P,N,M,L,G — **correta** para desc
- Richard questionou a plausibilidade estatística; cálculo hipergeométrico: 14 de 34 itens começam com A–F; chance de nenhum dos 7 itens do grupo ser A–F = **1,4%**
- Confirmado como coincidência real, não bug. Logs removidos em v0.5.73

### v0.5.74 — **Antecipação de parcelas**
- Botão "↗ Antecipar parcelas" dentro do quadro "Parcelas em aberto" (aba Cartão)
- Modal: fatura de destino, seleção por parcela/compra/todas, campo de desconto total
- Solver por **busca binária** da taxa `r` em `Σ Vᵢ × (1 − (1+r)^−nᵢ) = desconto_total`
- Prévia em tempo real com taxa implícita e desconto por compra; soma fecha exatamente (ajuste de centavos na última parcela)
- Ao confirmar: parcelas movidas para a fatura de destino (valor nominal preservado, flags `anticipated*`) + **um estorno por compra** (valor negativo, mesma categoria, nota com as parcelas)
- Parcelas com vencimento ≤ mês de destino ficam desabilitadas (não são antecipáveis)

### v0.5.75–79 — Campo de data da antecipação (ciclo com erro)
- v0.5.75: campo `<input type="date">` adicionado (o widget nativo exibe no locale do navegador → MM/DD/AAAA no Edge em inglês)
- v0.5.76–78: tentativas de input texto + botão 📅 acionando picker nativo — **quebraram o botão** que funcionava
- v0.5.79: revertido ao input nativo puro
- **Lição:** não mexer no que funciona; o formato do widget nativo é incontrolável pela página

### v0.5.80 — **Calendário próprio do app**
- Campo texto DD/MM/AAAA com máscara + botão 📅 abrindo mini-calendário renderizado pelo app
- Navegação ‹ ›, grade de dias, hoje destacado, seleção marcada, fecha ao clicar fora
- Independente do locale do navegador; funciona igual em desktop e PWA mobile

### v0.5.81 — Fix `getBillStatus` (fatura "Em atraso" indevida)
- Condição invertida: usava `vencDia > fechDia` para jogar vencimento ao mês seguinte
- Convenção do resto do app (dashboard) é `vencDia < fechDia`
- Mercado Pago (fecha 26, vence 1): fatura de Julho vencia "01/07" em vez de 01/08 → marcada como atrasada desde o dia 2
- Validado nos dois cenários (fecha 26/vence 1 e fecha 1/vence 10)

### (sem versão) — Edição em bulk no JSON
- Backup `agenda-backup-2026-07-28.json`: 2 transações com nota "GamePass" movidas de Subscriptions (`cat-iachsi0ie7`) → Games (`cat-77wa3taxwj`)
- Critério foi o campo **nota**, não a descrição (descrições são textos bancários da Microsoft)
- "Microsoft 365" (Abril, R$449) **não** foi alterada

### v0.5.82 — Aba Config removida
- `'settings'` removido de `TAB_IDS` (o painel continua acessível pelo menu de 3 pontos → `switchTab('settings')`)
- `TAB_DEFAULTS`/`tabLabels` mantidos (lookup inofensivo)

### v0.5.83 — **Sub-itens nas Listas + seed Check-List**
- Itens podem ter `children[]` (1 nível): indentados com `└`, contador `⑂ N` no pai, botão `+` no hover para criar
- Sub-itens têm nome editável (dup check entre irmãos), status, data e remoção
- Ordenação de filhos dentro do pai usando os mesmos `sortLevels` da seção
- Drag & drop só para itens de topo; filhos acompanham o pai
- Seed `applyTravelListSeed()` (flag `_travelSeedApplied`): lista "Check-List", statuses PRONTO/NÃO VAI/NÃO SEPARADO, 19 itens de topo — Necessaire (13 sub), Mochila (16 sub), Shampoo (5 sub) + 16 avulsos

### v0.5.84 — Expand/collapse de sub-itens
- Seta ▾/▸ no pai, estado em `item.collapsed`, persistido
- Adicionar sub-item expande o pai automaticamente

### v0.5.85 — **Fix collapse (limiar de drag)**
- Sintoma: expand funcionava, collapse não
- Causa: `mousedown` iniciava drag imediatamente; num pai **expandido**, 1–2px de movimento faziam `insertBefore` mover a linha para depois dos próprios filhos → a linha fugia do cursor, `mouseup` caía em outro elemento e o navegador **cancelava o `click`**
- Com o pai recolhido não havia filhos no meio → `insertBefore` era no-op → o clique sobrevivia (daí a assimetria)
- Fix: drag só inicia após **5px** de movimento; `saveState`/re-render só quando houve drag real

### v0.5.86/87 — Card de lista
- Botão `⋯` era um caractere em `#555` quase invisível → ganhou contorno, fundo e destaque no hover
- Layout refeito com flex (barra de cor no topo, título + botão na mesma linha) — antes o `position:absolute` sobrepunha a barra de cor

### v0.5.88 — **Módulo Cronograma Roupas**
- Card próprio na grade de Listas (`_listsActiveList = '__crono__'`)
- Viagens (linhas-pai) com dias aninhados; colunas totalmente editáveis (add/rename/mover/remover) pré-populadas com as 12 da referência
- Células de texto livre, status próprio por linha, coluna Nome congelada (sticky) para scroll horizontal

### v0.5.89 — Largura, edição in-place, data automática, somas
- `.tab-panel` tem `max-width:900px` global → liberado para largura total ao entrar no Cronograma, restaurado ao sair
- **Fix "não conseguia adicionar dias":** o `blur` da célula em edição reconstruía a tabela e destruía o botão `+` no meio do clique → edições agora salvam **in-place**, sem rebuild
- Novo dia nasce com data seguinte à do último dia (virada de mês/ano correta) e nome do dia da semana
- Linha da viagem exibe **soma automática** dos valores numéricos dos dias (negrito); colunas textuais continuam editáveis manualmente

### v0.5.90 — Guard `done` para blur tardio
- Primeiro dia passa a herdar a data do próprio evento (quando preenchida)

### v0.5.91/92 — **Fix data apagada (causa raiz comprovada)**
- Sintoma: data inserida pelo calendário sumia ao adicionar o primeiro dia
- Cadeia real, medida com jsdom: o `click` do 📅 **borbulhava** até `cell.onclick` → `editCronoCell` executava **2× (medido)** → o segundo editor nascia vazio com `done=false` → ao perder foco, seu `save()` rodava com valor vazio e fazia `delete obj.values[colId]`
- Fix: bloquear também o `click` do 📅 + guard de reentrada em `editCronoCell` (`cell.dataset.editing`)
- **Armadilha metodológica:** o teste ponta-a-ponta em jsdom *não* reproduziu o bug porque **jsdom não dispara `blur` ao remover elemento focado** (verificado). Só isolando cada elo a cadeia ficou visível

### v0.5.93 — **Fix vazamento na coluna congelada**
- Sintoma: fragmentos da coluna Data apareciam à esquerda, colados no cabeçalho
- Causa: só a coluna Nome era sticky; a coluna do toggle (30px) e o `gap:8px` do grid continuavam rolando, deixando frestas
- Fix: toggle **fundido** na célula de Nome (uma única coluna congelada, 220px, `left:0`) e `gap` do grid substituído por `padding` interno das células → colunas contíguas, sem frestas

### v0.5.94 — Slider de escala
- Escala 60–130% aplicada por **variáveis CSS** no scroller (sem rebuild → ajuste instantâneo)
- Escala proporcional: larguras de coluna, fontes (cabeçalho, nome, células, badges) e espaçamentos
- Persistida em `state.lists.crono.scale`; `saveState()` só no `change` (não a cada pixel); botão ↺ restaura 100%; indicador em cor de destaque quando em 100%

### v0.5.95 — Toggle Auto-fit
- Botão "⤢ Auto-fit" calcula a maior escala (dentro de 60–130%) em que a tabela cabe na janela
- Recalcula em: resize da janela, add/remove de coluna, reabertura do Cronograma
- Slider esmaecido quando ativo, mas funcional — usá-lo (ou o ↺) desliga o auto-fit
- Passo do slider mudado de 5% → 1% (com passo 5, um valor calculado de 83% seria exibido como 85%)
- `CRONO_BASE` centraliza as larguras base (fonte única para escala e auto-fit)
- **Limite conhecido:** se nem a 60% couber, trava no piso e a rolagem horizontal permanece

---

## Funções chave — módulo Listas

- `renderLists()` → `renderCronoView()` | `renderListsGrid()` | `renderListDetail()`
- `buildSectionBlock(list, sec, secIdx, sectionsWrap)` — tabela com sort multi-nível, checkboxes, selBar
- `buildItemRow(list, sec, item, tbody, onSelChange, parent)` — `parent` presente = sub-item
- `sortListItems(items, list, sortLevels)` — helper global (usado para ordenar `children`)
- `addListSubItem(list, sec, parentItem, tbody)` — cria sub-item e expande o pai
- `deleteListItem(list, sec, itemId, tbody, parent)` — remove item ou sub-item (avisa sobre filhos)
- `inlineEditItemName(cell, list, sec, item, tbody, parent)` — dup check no nível correto
- `openStatusPicker(e, list, sec, item, tbody)` — dropdown com toggle
- `openMoveItemsModal(itemIds, srcList, srcSec, onDone)`
- `dedupListItems()`, `applyListSeeds()`, `applyTravelListSeed()`
- `wireItemDragDrop(tbody, list, sec)` — limiar de 5px, ignora linhas filhas
- `tbody._onSelChange` / `tbody._rebuildRows` — referências para chamadores fora da closure

## Funções chave — Cronograma

- `initCronoState()` — seed de colunas/statuses + migrações (`scale`, `autoFit`)
- `renderCronoView(root)` — cabeçalho, barra de escala, scroller, listener de resize
- `cronoRebuildTable(scroller)` / `buildCronoRow(obj, parentTrip)`
- `cronoGridTemplate()` — template com `var(--crn-*)`
- `cronoApplyScale(el)` / `cronoApplyAutoFit()` / `cronoComputeAutoFitScale()` / `cronoSyncScaleUI()`
- `cronoTripSumInfo(trip, col)` — soma automática dos dias
- `cronoRefreshTripSums(trip)` — atualização in-place das somas (sem rebuild)
- `editCronoCell(cell, obj, col, parentTrip)` — guard de reentrada + `done` contra blur tardio
- `editCronoName(cell, nameTxt, obj, isDay)`
- `addCronoTrip()` / `addCronoDay(trip)` / `addCronoColumn()`
- `openCronoCalendar(anchor, curStr, onPick, onClose)` — calendário próprio DD/MM/AA
- `openCronoColMenu(e, col, th)` — renomear / mover ← → / remover
- `cronoParseDate()` / `cronoFmtDate()` / `cronoIsNumeric()` / `cronoNaturalWidth()`

## Funções chave — Antecipação de parcelas

- `collectFutureParcels(cardId)` — agrupa parcelas futuras não pagas por `installmentGroupId`
- `solveAnticipationRate(parcels, discountTotal)` — busca binária da taxa implícita
- `openAnticipationModal(cardId)` — modal completo com prévia
- `parseBRLInput(str)` — aceita `667,11` e `24.557,48`

---

## Ferramentas de verificação

- **jsdom instalado** (`npm install jsdom` em `/home/claude`) — usado para validar comportamento de DOM/eventos antes de entregar
  - **Limitação conhecida:** não dispara `blur` ao remover elemento focado do DOM
  - Estratégia eficaz: isolar cada elo da cadeia (contar entradas em função, forçar blur manualmente) em vez de confiar num único teste ponta-a-ponta
- **Node puro** para validar lógica de negócio (solver de taxa, sequência de datas, somas, seeds) extraindo funções do HTML com `indexOf`/`slice` + `eval`
- **Python** para auditoria de bytes/regex no arquivo e edição de backups JSON
- `node --check` sobre o JS extraído dos `<script>` inline (obrigatório antes de entregar)

---

## Outros módulos — estado atual

- **Tarefas:** sort multi-nível (`state.tasks.sortLevels`)
- **Contas (finance):** categorias por ID com `migrateCategorias()`
- **Cartão:** carousel com janela de navegação, botão ↗ Mover por transação, sem seeds hardcoded, **antecipação de parcelas**, `getBillStatus` corrigido
- **Débito:** parser PDF coordinate-based (Mercado Pago), sort multi-nível, detecção de duplicatas
- **Dashboard:** donut chart, filtros Pago/Em aberto/Todos, modo acumulado anual, sort por categoria expandida; abate estornos negativos automaticamente
- **Listas:** grid + detalhe, sub-itens, sort persistido, seleção múltipla, seeds (Compras e Check-List), **Cronograma Roupas**
- **Apps:** Logo Inverter (processamento de imagem com matriz linear 4×4)
- **Config:** temas, labels de abas, API key Anthropic — aba removida da barra, acessível pelo menu de 3 pontos

---

## Possíveis próximos passos

- Renomear "Check-List" → "Check-List Viagem" (pela UI: card → `⋯` → ✎ Renomear; o seed no código não altera lista já criada)
- Popular o Cronograma com a próxima viagem (viagens/dias não foram pré-populados, só as colunas)
- Sub-itens não são selecionáveis para "Mover" — mover o pai leva os filhos junto
- Auto-fit trava no piso de 60% em janelas muito estreitas (rolagem horizontal permanece)
