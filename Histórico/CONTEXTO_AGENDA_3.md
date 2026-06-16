# CONTEXTO DO PROJETO — Agenda Pessoal com IA

## REGRA CRÍTICA DE CONTEXTO
**Os contextos são SEMPRE acumulativos.** Todo o conteúdo do contexto anterior deve estar presente no contexto novo, com adições/atualizações da sessão corrente. Nunca omitir informação de sessões anteriores. Ao criar o próximo contexto (CONTEXTO_AGENDA_4.md), seguir essa mesma regra.

---

## STACK E INFRAESTRUTURA
- **Arquivo:** Single HTML + sw.js (Service Worker PWA)
- **Hospedagem:** GitHub Pages — `https://broder33.github.io/Agenda`
- **Auth/Sync:** Supabase — projeto `fxzikckzgvdwzvjysoao`; tabela `agenda_data`, RLS configurado
- **IA:** Anthropic API — `claude-sonnet-4-20250514`
- **Google OAuth Client ID:** `962292865944-ialv4nnv2gqpgek5mjreto6goa9jbhhu.apps.googleusercontent.com`

## VERSÃO ATUAL
- **App:** v0.1.43
- **Service Worker:** `agenda-v0143`
- **Arquivos de trabalho:** `/home/claude/index.html` e `/home/claude/sw.js`
- **Outputs:** `/mnt/user-data/outputs/index.html` e `/mnt/user-data/outputs/sw.js`

## CONVENÇÃO DE VERSÃO
Após v0.0.99 vem v0.1.00. Versão muda a cada alteração de código. Aparece no header e aba Config. Sempre entregar index.html + sw.js juntos.

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

**v0.1.07-09** — Resize manual via handle JS (removido `resize: both` CSS); edição inline na janela de comentários (sem janela flutuante separada); fixes de overflow

**v0.1.10-22** — Múltiplas iterações para resolver resize da janela de comentários no mobile e desktop; touch support adicionado ao handle de resize e ao drag; janela limitada à viewport ao abrir; `comment-menu-btn` sempre visível em touch (`@media hover:none`)

**v0.1.23** — Cadeia flex completa: `comment-dd` → `comment-dd-list` (flex column) → `comment-item` (flex:1) → `editWrap` (flex:1) → editor (flex:1). Editor preenche espaço disponível ao redimensionar.

**v0.1.24** — Numeração automática com `setRangeText` (resolve cursor position no browser)

**v0.1.25** — Bullet usa `•` em vez de `-`; `parseCommentText` reconhece `•`, `*`, `-`

**v0.1.26-28** — Indentação de listas com `!important` para sobrepor reset CSS `* { padding: 0 }`

**v0.1.29** — Backspace inteligente: apaga prefixo de lista inteiro (`1. `, `• `) de uma vez

**v0.1.30-32** — Ctrl+Z no editor: `execCommand('insertText')` após DOM insertion para popular histórico nativo

**v0.1.33** — `overflow: hidden` removido do `comment-item` e `comment-body`

**v0.1.34** — **GRANDE MUDANÇA:** Editor reescrito com `contenteditable` (WYSIWYG). `buildFormatToolbar` usa `execCommand`. `createEditor(text)` converte texto→HTML. `editorToText(editor)` converte DOM→texto. `submitComment` e `saveEditComment` atualizados.

**v0.1.35** — Bullets aninhados via indent após `insertUnorderedList` dentro de OL

**v0.1.36** — Botão "1." dentro de bullet aninhado faz `outdent` em vez de criar nova OL

**v0.1.37-38** — `mergeConsecutiveOLs()` para mesclar OLs consecutivas; tentativas de fix de numeração contínua

**v0.1.39-42** — `editorToText` reescrito múltiplas vezes para lidar com estrutura real do browser: `<ul><ul><li>...</li></ul></ul>` fora do `<ol>`. Fix final: detecta `prevWasOL` flag para aplicar indent quando UL vem após OL; UL processa filhos UL recursivamente com mesmo indent.

**v0.1.43** — Ctrl+Z corrigido (verifica `contentEditable === 'true'`); `mergeConsecutiveOLs` reescrito para mesclar OLs separadas por ULs (move UL para dentro do último LI da primeira OL antes de mesclar)

---

## PROBLEMAS PENDENTES (v0.1.43)

Nenhum. Todos os problemas da v0.1.43 foram confirmados resolvidos pelo usuário.

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
- `renderTabs()` cria botões com click→switchTab e dblclick→startTabEdit
- `switchTab()` NÃO re-renderiza tabs (só atualiza classe active)

### Filtros
- `_activeFilters` objeto global `{ status, priority, 'col-{id}' }`
- `_visibleFilters` array de keys visíveis no dropdown
- Botão "⚡ Filtros" com dot verde quando ativo

### Ordenação Multinível
- `state.tasks.sortLevels[]` array de `{colId, dir}`
- `_name` para coluna Nome
- Clique no header: sem→asc(N↑)→desc(N↓)→remove

### Editor de Comentários (contenteditable — WYSIWYG)
- `createEditor(text)` — cria div contenteditable com HTML formatado via `parseCommentText(text)`
- `editorToText(editor)` — converte DOM para texto plano percorrendo DOM recursivamente com `processNode(node, indent)`; detecta `prevWasOL` flag para UL após OL receber indent `'  '`
- `buildFormatToolbar(editor)` — usa execCommand (bold, italic, insertOrderedList, insertUnorderedList, createLink)
- `mergeConsecutiveOLs(editor)` — mescla OLs separadas por ULs (move UL para dentro do último LI)
- `submitComment(taskId)` — lê de editor via `editorToText`
- `startEditComment` — usa `createEditor(c.text)` para inicializar com conteúdo formatado
- `saveEditComment` — lê via `editorToText`
- Formato armazenado: `1. item`, `  • bullet aninhado`, `• bullet`, `**negrito**`, `_itálico_`
- `parseCommentText` reconhece `  • ` (dois espaços) como bullet aninhado → renderiza com `padding-left` maior

### Estrutura HTML real gerada pelo browser no editor
- Lista numerada: `<ol><li>item</li></ol>`
- Bullets aninhados: `<ul><ul><li>bullet</li></ul></ul>` (fora do OL — browser quirk)
- Retorno à numeração: nova `<ol>` separada (problema pendente de continuidade)

### Janelas de Comentários
- `makeDraggable(el, headerEl)` — drag pelo header (mouse + touch) + handle de resize manual (mouse + touch)
- Handle de resize: 32×32px, `touch-action: none`, `z-index: 10`
- `comment-dd`: abre com tamanho limitado à viewport (máx 380×480px, margem 8px)
- `comment-dd-list`: `display:flex; flex-direction:column; flex:1; height:0; min-height:0`
- `comment-item` em modo edição: `display:flex; flex-direction:column; flex:1`
- `outsideClick` usa mousedown para fechar janela ao clicar fora
- `comment-menu-btn`: `opacity:0` por padrão, `opacity:1` no hover; sempre visível em touch via `@media (hover:none)`

### CSS crítico para listas
```css
* { box-sizing: border-box; margin: 0; padding: 0; } /* reset global — sobrepõe padding de listas */
.comment-body ul, .comment-body ol { padding-left: 28px !important; list-style-position: outside; }
.comment-body ul { list-style-type: disc; }
.comment-body ol { list-style-type: decimal; }
.comment-body li { display: list-item !important; }
.comment-editor ul, .comment-editor ol { padding-left: 28px !important; }
.comment-editor li { display: list-item !important; }
```

### mergeState — Injeções automáticas
- Roles de status builtin re-aplicados
- Status "encerrada" injetado se ausente
- `tabLabels` inicializado se ausente
- `customFields` em USER_FIELDS
- Larguras de colunas builtin resetadas: status=120, priority=100, dueDate=80

### Ctrl+Z global
```javascript
var tag = document.activeElement && document.activeElement.tagName;
var isContentEditable = document.activeElement && document.activeElement.contentEditable === 'true';
if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || isContentEditable) return;
```

---

## SEEDS
- **TASK_SEED_VERSION:** v4
- **FINANCE_SEED_VERSION:** v2

## REGRA PARA NOVA SESSÃO
Enviar: `index.html`, `sw.js`, `CONTEXTO_AGENDA_3.md`
O próximo contexto deve ser `CONTEXTO_AGENDA_4.md` e deve ser ACUMULATIVO (incluir tudo deste contexto + novidades da próxima sessão).
