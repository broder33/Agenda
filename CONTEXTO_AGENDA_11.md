# Contexto — Agenda PWA (para nova conversa)

## Projeto

**App:** Agenda Pessoal — PWA single-file (`index.html` + `sw.js`), hospedado em `broder33.github.io/Agenda`, Supabase para auth/sync, Anthropic API para IA.

**Versão atual:** v0.6.24 — cache `agenda-v0624`

**Workflow:** Richard faz upload do `index.html` → Claude edita via bash/Python → entrega `index.html` + `sw.js` juntos. `node --check` obrigatório antes de toda entrega. Bump de versão em toda mudança de código.

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
- **Não estragar o que já funciona ao corrigir outra coisa**
- **Verificar a versão do arquivo de trabalho antes de editar** — nunca construir sobre upload antigo
- Richard corrige afirmações imprecisas imediatamente e espera reconhecimento direto, não hedging
- Quando uma solução proposta não melhora o que ele já consegue fazer, dizer isso diretamente

---

## Convenções do código

- Nunca usar nested template literals ou aspas simples não escapadas em strings JS que geram HTML — usar `&#39;` ou atributos `data-*`
- `var` declarado no meio de função mas referenciado em closures definidas antes será `undefined` — sempre hoist para o topo
- `insertBefore` sempre com guard `after.parentNode === container`
- `AbortController` para drag listeners (evita acumulação)
- `dateStrToNum(d)` — helper global `DD/MM/AA` → `YYYYMMDD` para sort
- `dedupListItems()` — chamada em `saveState()`, `mergeState()`, init local e Supabase
- `useMousedown` com `.contains()` para fechar dropdowns
- **`click` e `mousedown` são eventos distintos** — `stopPropagation()` num não impede o outro
- **Nunca reconstruir a tabela dentro de handler de `blur`/save** — mata cliques em voo
- **Drag precisa de limiar de movimento (5px)**
- **`overflow:hidden` no container recorta filhos sticky/posicionados**
- **`<input type="date">` exibe no locale do navegador** — usar calendário próprio do app
- **Estado de visualização chaveado por entidade**, não em global simples
- **Todo seletor de categoria deve usar `buildCatOpts()`**
- **Modal aberto de dentro de outro modal** precisa ser reposicionado no fim do `body` com z-index maior
- **Seeds não alteram estado já existente** — rename só pela UI ou edição do JSON
- **`removeEventListener` precisa das MESMAS opções do `addEventListener`** — listener adicionado com `{capture:true}` e removido sem a flag **nunca sai** (3 ocorrências corrigidas na v0.6.23)
- **Handler de "clique fora" registrado dentro de função de render acumula** — guardar a referência em variável de módulo e substituir a anterior, em vez de empilhar
- **Item de CSS Grid tem `min-width:auto`** e se recusa a encolher abaixo do conteúdo — sem `min-width:0` o texto vaza por cima da coluna vizinha (causa do bug de layout da v0.6.24)
- **Controles com `opacity:0` que só aparecem no `:hover` ficam inalcançáveis no toque** — usar `@media (hover: none)`

---

## Arquitetura do estado

```
state = {
  tasks: { items: [], sortLevels: [], statuses: [{id,label,color,role}], ... },
  finance: {
    bills: { [ano]: { [mes]: [ {
        id, nome, venc, valor, status, categoriaId, obs,
        pagoEm,             // v0.6.10 — DD/MM/AA; vazio = pago no mês do bloco
        pagadorId,          // v0.6.10 — vazio = pagador padrão
        pagadorEstorno      // v0.6.10 — bool; rótulo "Fulano - estorno"
    } ] } },
    payers: [ { id, name, color, isDefault } ],   // v0.6.10 — exatamente um isDefault
    activeMonths, openMonths, currentYear
  },
  card:  { cards: [], bills: {}, payments: {}, categorias: [], catGroups: [] },
  debit: { accounts: [], transactions: { [accId]: [ {
        id, data,           // ISO AAAA-MM-DD (formato do Débito)
        descricao, valor,   // valor SEMPRE módulo
        estorno,            // v0.6.20 — true = entrada (reembolso/rendimento)
        categoriaId, nota, ignorarDashboard
  } ] }, acMemory, ... },
  lists: { lists: [...], sortLevels: {}, crono: {...} },
  config: { activeTab, theme, apiKey, tabLabels },
  dashboard: {
    hiddenSources: [], hiddenGroups: [],
    hiddenPayers: [],        // v0.6.10
    hiddenCats: [],          // v0.6.16
    scope: 'month'|'year'|'range'|'all',        // v0.6.18
    range: { fromY, fromM, toY, toM } | null    // v0.6.18
  },
  _updatedAt: 'ISO'
}
```

**`mergeState` só copia módulos que conhece explicitamente** — ao criar módulo novo, adicionar lá.

**Filtros do Dashboard guardam os OCULTOS**, não os visíveis (item novo nasce visível).

---

## Alterações desta sessão (v0.6.08 → v0.6.24)

### v0.6.09 — Reordenação de Status por arrasto (Tarefas)
- `renderStatusManager()` ganhou alça `⠿` e drag & drop
- `draggable` só é ligado no `mousedown` da alça e desligado no `mouseup`/`dragend` — se a linha inteira fosse `draggable`, o input de label perderia seleção de texto com o mouse
- Status com `role` também reordenam (a restrição de `role` é para exclusão, não para ordem)

### v0.6.10 — Contas: "Pago em" e Pagador
- Coluna **Pago em** (calendário in-app, mesmo do Vencimento). Vazio = despesa cai no mês do bloco
- `getDashboardExpenses` passou a **varrer todos os meses** de `finance.bills` e reatribuir pelo `pagoEm` — antes lia só `bills[y][m]`, e uma conta de janeiro paga em março não apareceria em lugar nenhum
- Coluna **Pagador** com modelo de campo único: `— Padrão`, cada pagador, e cada pagador com `- estorno`
- `state.finance.payers` + modal "Gerenciar pagadores"; um pagador é padrão e recebe tudo sem pagador informado, **inclusive cartão e débito**
- Filtro "Pagadores" no dropdown Exibir (só aparece com mais de um pagador)
- Helpers: `getPayers`, `getDefaultPayerId`, `getPayerObj`, `finRowPayerId`, `finRowPayerLabel`, `finRowEffectiveYM`
- `addNextMonth` replica o pagador, **não** replica `pagoEm` nem estorno

### v0.6.11 — Formato canônico de data nas Contas
- Existiam 4 escritores produzindo formatos diferentes: `5/3/26` (input type=date), `05/03/26` (calendário), `05/3/26` (`addNextMonth`), e os literais dos seeds
- **Canônico: `DD/MM/AA`.** `finDateFromISO(iso)` para escrever, `finDateNorm(str)` para normalizar
- `migrateFinDates()` roda dentro do `mergeState` (ramo `saved.finance`), **idempotente e sem flag de versão** — funciona vindo do localStorage, da nuvem ou de backup importado
- **Não chama `saveState()`**: gravar ali carimbaria o timestamp antes do `_cloudLoaded` confirmar
- `finDateNorm` devolve a entrada **intacta** quando não consegue interpretar
- 78 literais de seed reescritos (só padding mudou)

### v0.6.12 — Cor das opções de dropdown no tema escuro
- `.status-opt` nunca definia `color`; quem definia eram os modificadores `.pago`, `.nao-pago` etc. Opções sem modificador caíam no `buttontext` do navegador (preto) — 1,16:1 de contraste sobre `#161616`
- `color: var(--text)` na regra base; modificadores continuam vencendo por especificidade

### v0.6.13 → v0.6.15 — Exportação do Dashboard (PDF e Excel)
- Botão "⬇ Exportar" ao lado do Exibir; `buildDashExportData()` monta o recorte UMA vez e os dois exportadores consomem a mesma estrutura
- **Excel:** aba *Resumo* (espelha a árvore + os três totais + %) e aba *Despesas* (uma linha por lançamento, autofiltro). Valor sai como célula numérica com `numFmt` `R$ #,##0.00`
- **SheetJS community NÃO suporta** estilo de célula (`s`) nem congelamento de painel (`!freeze`) — verificado no XML gerado. Hierarquia por colunas, não por indentação
- **PDF:** jsPDF carregado sob demanda (`loadJsPDF`), URLs pré-cacheadas no `sw.js` para funcionar offline
- **v0.6.15 removeu o `jspdf-autotable`** e passou a desenhar manualmente, espelhando a hierarquia da tela: cards de totais → grupo → subcategoria → despesas, com cor e percentual. Duas tabelas soltas não refletiam o Dashboard
- Linha de despesa no PDF traz **data, descrição, detalhe, fonte, valor** — igual à tela. Pagador só ganha coluna quando o recorte tem mais de um
- Cabeçalho de continuação (`Grupo › Subcategoria (continuação)`) na quebra de página

### v0.6.14 — Download em PWA
- `doc.save()` do jsPDF (e `XLSX.writeFile`) criam âncora **fora do DOM** e clicam dentro de `setTimeout(0)` — em janela PWA o navegador navega para o blob em vez de baixar: tela branca, sem arquivo
- `downloadBlob(blob, filename)`: âncora anexada ao `document.body`, clique **síncrono**, `revokeObjectURL` só 40s depois
- Loga `[export] download disparado: nome, N bytes`

### v0.6.16 / v0.6.17 — Filtro por categoria no Exibir
- Categorias listadas sob o grupo a que pertencem, com botão **"só"** (isola em 1 clique) e **"todas"** no cabeçalho da seção
- Filtro de categoria é **independente** do de grupo: a despesa aparece se ambos estiverem ativos
- **v0.6.17 corrigiu:** `_dashHiddenCats` (cache em memória) só era escrito por `dashHydrateFilters()`, que roda uma vez no boot. Ao desmarcar, o cache ficava velho e a hidratação do render seguinte **remarcava** a categoria — sintoma: "clicar não faz nada". `dashPersistFilters` passou a sincronizar os quatro caches
- Hidratação extraída para `hydrateDashCats(allCatNames)` para poder ser testada

### v0.6.18 — Escopo de período (multi-ano)
- `_dashAccum` (booleano) substituído por `_dashScope`: `'month'` | `'year'` | `'range'` | `'all'`
- `dashPeriodMonths()` devolve a lista de (ano, mês); **todos os pontos de agregação passam por ela** — mês, ano, intervalo e histórico usam um caminho só
- `dashCollectExpenses(payFilter)`, `dashDataYearSpan()`, `dashPeriodLabel()`, `dashPeriodFileBase()`
- Seletor de escopo ocupa o lugar do antigo toggle (nenhum controle novo). Setas ‹ › e "Hoje" somem em Intervalo/Histórico
- Intervalo: rótulo do período vira clicável e abre seletor De/Até; escopo e intervalo persistem
- Desempenho medido: 7 anos / 2520 lançamentos = 262ms de dados + 1,1s de PDF

### v0.6.19 — Cabeçalho dos arquivos exportados
- Pagadores e grupos **removidos** da legenda (dados internos que não devem aparecer em arquivo compartilhado). O recorte continua valendo, só não é anunciado
- Categorias continuam carimbadas quando há recorte de fato
- Nomes de grupo continuam como títulos no corpo do relatório; nome do pagador continua nas linhas do Excel

### v0.6.20 — Débito: lançar entrada (reembolso/estorno/rendimento)
- A flag `estorno` já existia e funcionava em todo o pipeline (verde com `+`, subtrai do total, chega ao Dashboard com valor negativo). **O modal gravava `estorno: false` fixo** — só a importação de extrato setava a flag, por palavra-chave
- Seletor **Saída / Entrada** no modal; valor negativo digitado também marca entrada
- Edição inline do valor aceita sinal: entradas abrem com `-`, trocar o sinal converte o tipo
- **Bug adjacente corrigido:** clicar no valor abria o campo **vazio** — a variável `orig` só era atribuída no ramo de edição da descrição e o ramo do valor a lia indefinida

### v0.6.21 — Grupos com saldo credor sumiam do Dashboard
- `if (total > 0)` descartava o grupo inteiro quando entradas superavam despesas → o grupo sumia da tela **e** as linhas sumiam do PDF/Excel. Trocado por `total !== 0`
- Denominador dos percentuais passou a ser a **soma dos itens positivos exibidos** (o total líquido encolhia com créditos e os percentuais estouravam 100%). Sem créditos é idêntico ao anterior
- Percentual de subcategoria: módulo sobre soma dos módulos (evita `-192,3%`)
- Convenção de crédito unificada nos três níveis (grupo, subcategoria, despesa): verde com `+`

### v0.6.22 — Mover transação de Débito para outro mês
- No Cartão mover é tirar de um balde `bills[cartão][ano][mês]`; **no Débito o mês é derivado de `tx.data`**, então mover = trocar o ano-mês
- `debitMoveISO(iso, destY, destM)` preserva o dia, limitado ao último dia do mês destino (31/01 → 28/02, com bissexto). 144 combinações testadas sem data inválida
- Modal mostra a data resultante e avisa quando o dia vai mudar
- Mover a última transação de um mês faz o mês desaparecer da lista (o mês é derivado do dado)

### v0.6.23 — Vazamento de listeners + falso alarme do drag & drop
- Ver seção "Episódio do drag & drop" abaixo
- Três dropdowns registravam handler com `{capture:true}` e removiam sem a flag → nunca saíam
- Os três dropdowns do Dashboard registravam handler novo em `document` a cada `renderDashboard()`. Medido: **78 listeners de `mousedown` após 25 renders → agora 3, constantes**
- Referências guardadas em `_dashScopeOutside`, `_dashExpOutside`, `_dashExibirOutside`

### v0.6.24 — Layout mobile das Listas
- Nome do item vazava por cima do badge de status ("Macarrão Integ**COMPRAR**"): item de grid tem `min-width:auto` e o `nameTxt` ainda tinha `flex-shrink:0`
- `min-width:0` + truncamento por reticências (vale em qualquer largura)
- `grid-template-columns` saiu do inline para a classe `.list-grid-row`, permitindo media query
- Abaixo de 600px: coluna "Atualizado" some, status se ajusta ao conteúdo, nome passa de ~80px para ~250px
- `@media (hover: none)`: excluir, checkbox e "+" de sub-item eram invisíveis e inalcançáveis no toque
- Cabeçalhos "NOME"/"STATUS" não quebram mais em duas linhas
- **Só a aba Listas recebeu tratamento.** Contas, Cartão e Débito continuam com scroll horizontal no mobile

---

## Episódio do drag & drop (v0.6.22 → v0.6.23) — leitura obrigatória

Richard reportou que o arrasto parou de funcionar em todas as abas após a v0.6.22, e insistiu que a mudança daquela versão era a causa.

**Não era.** O CONTROLE (v0.6.22 byte a byte, apenas renomeada) funcionou. A variável era o ambiente — arquivo servido do cache do service worker ou aberto no painel de visualização.

**O que custou caro:** muitas rodadas investigando uma premissa falsa. O teste com controle deveria ter sido proposto assim que os testes começaram a contradizer o sintoma, não depois de exaurir a análise estática.

**Lição a aplicar:** quando o código medido contradiz o sintoma relatado, **rodar um controle imediatamente** — mesmo binário, condição de teste idêntica. Isso já constava das lições de sessões anteriores ("quando um bug não pode ser reproduzido, rode um teste de controle primeiro para descartar cache") e foi aplicado tarde demais de novo.

**Comportamentos do arrasto que são por design** (verificados, não são bugs):
- Cartão e Débito: arrasto só é ligado quando a ordenação é **exatamente** um nível por `data`. Outra coluna ou dois critérios → `draggable="false"` e a alça `⠿` some. O estado não é persistido, então recarregar restaura
- Cartão: só reordena **dentro do mesmo dia** (`row.dataset.date !== dragSrc.dataset.date` recusa o drop, sem feedback)
- Débito: o wiring roda duas vezes sobre as mesmas linhas (4 handlers para 2 linhas) — pré-existente, comportamento final correto
- HTML5 drag **não funciona em toque** em nenhuma aba. Correção robusta seria trocar por `pointerdown`/`pointermove`, o que resolveria mobile e iframe. **Oferecido e não decidido** — são 5 implementações de arrasto no app

---

## Ferramentas de verificação

- **jsdom** — validar DOM/eventos antes de entregar
  - Não dispara `blur` ao remover elemento focado
  - **Mantém o event loop vivo:** um teste que levava 43s na verdade fazia 600ms de trabalho. **Sempre chamar `dom.window.close()` ao fim**, ou a medição de desempenho fica sem sentido
  - Normaliza CSS ao reserializar (`#6366f1` → `rgb(99, 102, 241)`, `flex:1` → `flex: 1 1 0%`) — asserções por regex sobre `innerHTML` precisam considerar isso
- **App inteiro carregado em jsdom** com `runScripts:'dangerously'` (removendo os `<script src=cdn>`): permite chamar `switchTab`, `renderDebit`, `renderCard` e espiar `addEventListener` para contar handlers. `state` é `let` no escopo do script — acessar via `w.eval(...)`, não `w.state`
- **Node puro** para lógica de negócio, extraindo funções do HTML com `indexOf`/`slice` + `eval`
- **Python** para modelar e validar algoritmos antes de escrever o JS (normalizador de datas, clamp de dia do mês) — pega erro de lógica sem custo de harness
- **pdftoppm + view** para inspecionar visualmente o PDF gerado. **Indispensável:** validar que o arquivo é válido não diz nada sobre a aparência. Dois defeitos reais (colisão de coluna e "TOTAL DO MÊS" num intervalo de 2 anos) só apareceram olhando o raster
- **`unzip -p arquivo.xlsx xl/styles.xml`** para provar o que o Excel vai ler de fato
- `node --check` sobre o JS extraído dos `<script>` inline (obrigatório antes de entregar)

**Armadilha de método:** ao testar, nunca substituir a linha exatamente sob suspeita. O bug da v0.6.14 (`doc.save()` em PWA) passou porque o teste trocava `doc.save()` por uma captura do buffer — testou tudo menos a única linha que podia falhar.

---

## Outros módulos — estado atual

- **Tarefas:** sort multi-nível; status com reordenação por arrasto
- **Contas:** categorias por ID, formato de data canônico, "Pago em" e Pagador
- **Cartão:** carousel, botão ↗ Mover, antecipação de parcelas, mês ativo e anos recolhidos por cartão
- **Débito:** parser PDF coordinate-based, sort multi-nível, entrada/saída manual, botão ↗ Mover
- **Dashboard:** donut, filtros Pago/Em aberto/Todos, escopo de período multi-ano, filtros de fonte/grupo/categoria/pagador persistidos, exportação PDF e Excel
- **Listas:** grid + detalhe, sub-itens, sort persistido, seleção múltipla, Cronograma Roupas, layout mobile
- **Apps:** Logo Inverter
- **Sincronização:** carimbo de data no cabeçalho, banner de estado degradado, CDN em cache no `sw.js`

---

## Pendências e possíveis próximos passos

**Levantado nesta sessão, não implementado:**
- **Arrasto por `pointer`** em vez de HTML5 — resolveria mobile (hoje não funciona em aba nenhuma) e iframe. São 5 implementações; oferecido como piloto no Cartão ou tudo de uma vez
- **Layout mobile de Contas, Cartão e Débito** — só Listas foi tratada
- **Aba Débito formata data ISO para exibição em 6 lugares duplicados**, e um deles diverge: uma renderiza `DD/MM/AAAA` e outra `DD/MM/AA` para a mesma transação. Armazenamento é consistente (ISO), o problema é só de exibição
- **Importação de extrato do Débito** detecta entradas só por palavra-chave (`reembolso`, `estorno`, `devolução`, `rendimentos`) e não permite corrigir na tela de revisão
- **Opções "— Padrão" e "⚙ Gerenciar pagadores"** usam `var(--muted)`: 2,43:1 de contraste no tema escuro (abaixo dos 3:1 mínimos). Seguiu o padrão do `openCatDD`, mas "— Padrão" é opção selecionável, não decoração
- **Inline `color:var(--text)` redundantes no `openCatDD`** — contornavam o buraco corrigido na v0.6.12; removê-los é risco sem ganho

**De sessões anteriores:**
- Status inconsistente na visão Mês do Cartão: falta o caso `partial` na cadeia
- Indicador de filtro do Dashboard: bolinha de 5px; `_nHidden` já calculado
- Renomear "Check-List" → "Check-List Viagem" (pela UI)
- Popular o Cronograma com a próxima viagem
- Sub-itens não são selecionáveis para "Mover"
- Auto-fit trava no piso de 60% em janelas estreitas

---

## Nota sobre continuidade

O container de trabalho **foi reiniciado durante esta sessão** e a suíte de testes acumulada foi perdida. O `index.html` foi restaurado a partir do último entregue em `/mnt/user-data/outputs` e a linhagem está íntegra, mas os testes das versões v0.6.09–v0.6.20 não existem mais como arquivos. Se forem necessários, precisam ser reconstruídos.
