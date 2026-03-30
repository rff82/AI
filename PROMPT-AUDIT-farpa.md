# PROMPT AUDIT — farpa.ai Auditoria, Limpeza e Superfície de Funcionalidades
> v1 · Head de Produto e Engenharia · Portfolio Digital Pessoa Física

---

## IDENTIDADE E CONTEXTO DO AUTOR

Você está assistindo **Rodrigo**, Head de Produto e Engenharia responsável por um portfólio
de produtos digitais de pessoa física. Este prompt governa **auditorias periódicas** do
repositório farpa.ai — descobrir funcionalidades ocultas, limpar arquivos desnecessários
e garantir que tudo que existe esteja visível e organizado em labs.html.

Regra de ouro: **nada se perde, nada fica escondido**. Toda funcionalidade funcional
merece um card. Todo arquivo sem dono merece ser avaliado. Todo lixo merece ser removido.

---

## DESIGN SYSTEM — farpa.ai

```
Repositório:   https://github.com/rff82/AI (todos os arquivos na raiz)
Deploy:        Cloudflare Pages ← GitHub (branch main)
Arquivos core: tokens.css · themes.css · theme-engine.js · mobile-fixes.css
Tipografia:    Space Grotesk (display) + DM Mono (código/dados) — imutáveis
Tema base:     Void dark — #0a0a0a background, acentos #00ff88 (green) e #00e5ff (cyan)
Sidebar:       Injetada globalmente via theme-engine.js — NÃO modificar
Arquivos:      Todos na raiz — compatibilidade GitHub Pages
```

---

## TEMPLATE DE AUDITORIA

```
Escopo da auditoria:
[x] Completa       — varrer todo o repositório (recomendado)
[ ] Parcial        — informar quais arquivos ou pastas auditar

Foco principal:
[ ] Funcionalidades ocultas   — páginas sem card em labs.html
[ ] Arquivos órfãos           — CSS/JS não referenciados
[ ] Duplicatas e versões antigas
[ ] Tudo acima

Ação para funcionalidades ocultas encontradas:
[ ] Propor cards para aprovação antes de criar
[ ] Criar cards automaticamente para as que já funcionam

Workers e D1 a verificar:
[ ] Sim — incluir na auditoria
[ ] Não — só arquivos locais
```

---

## INSTRUÇÕES DE EXECUÇÃO

### FASE 1 — Mapeamento completo do repositório

Listar todos os arquivos na raiz e classificar cada um:

```
INVENTÁRIO COMPLETO
───────────────────
Páginas HTML:
  ✅ [arquivo] — tem card em labs.html
  ⚠️  [arquivo] — SEM card em labs.html (funcionalidade oculta)
  ❓ [arquivo] — página auxiliar / não precisa de card

Arquivos CSS:
  ✅ [arquivo] — referenciado em [lista de HTMLs]
  🗑️  [arquivo] — órfão, não referenciado em nenhum HTML

Arquivos JS:
  ✅ [arquivo] — referenciado em [lista de HTMLs]
  🗑️  [arquivo] — órfão, não referenciado em nenhum HTML

Workers Cloudflare:
  ✅ [worker] — referenciado no front em [arquivo]
  ⚠️  [worker] — sem referência no front (funcionalidade oculta)

Outros arquivos:
  ✅ [arquivo] — necessário ([justificativa])
  🗑️  [arquivo] — lixo removível ([tipo: .DS_Store / duplicata / versão antiga])
```

---

### FASE 2 — Limpeza de lixo (execução direta, sem aprovação)

Remover imediatamente e sem confirmação:

| Tipo | Exemplos | Ação |
|---|---|---|
| Arquivos de sistema | `.DS_Store`, `Thumbs.db`, `.AppleDouble` | `rm` direto |
| Cache de editor | `.vscode/`, `.idea/`, `*.swp`, `*.swo` | `rm` direto |
| Logs e temporários | `*.log`, `*.tmp`, `debug.txt` | `rm` direto |
| Backups manuais | `index_backup.html`, `style_old.css`, `*_v1.html` | Listar → aguardar aprovação |
| Duplicatas óbvias | Mesmo nome com sufixo numérico `*_2.js`, `*_copy.css` | Listar → aguardar aprovação |

> **Backups e duplicatas** entram na lista de proposta — nunca apagar sem confirmação,
> pois podem conter código que ainda não foi migrado.

---

### FASE 3 — Arquivos órfãos (CSS/JS sem referência)

Para cada arquivo CSS ou JS identificado como órfão:

1. **Verificar se é realmente órfão** — buscar referências em todos os HTMLs, incluindo
   carregamentos dinâmicos via `theme-engine.js`
2. **Avaliar o conteúdo** — o arquivo tem código único ou é duplicata de algo já em uso?
3. **Classificar**:
   - Órfão sem conteúdo único → propor exclusão
   - Órfão com código único → propor migração para o arquivo correto antes de excluir
4. **Nunca excluir** sem apresentar a lista completa para aprovação

---

### FASE 4 — Funcionalidades ocultas (sem card em labs.html)

Para cada página HTML ou Worker sem card em labs.html:

1. **Verificar se está funcional** — a página carrega? O Worker responde?
2. **Identificar o macro tema** — Finanças / IA / Educação / etc.
3. **Propor card** com este formato:

```
📋 PROPOSTA DE CARD — [nome do arquivo]
─────────────────────────────────────
Arquivo:     [nome.html ou worker]
Status:      [ funcional / com bugs / incompleto ]
Macro tema:  [tema identificado]

Card proposto:
  Título:    [nome direto, sem jargão técnico]
  Descrição: [1 linha — valor entregue, linguagem de produto]
  Tags:      #[macro-tema] · #[tag adicional se houver]
  Status:    [ ao vivo ] ou [ demo ]
  Link:      target="_blank" se demo · mesma aba se ao vivo

Criar este card? → Aguardando aprovação
```

4. **Aguardar aprovação** para cada card antes de modificar `labs.html`
5. **Ao aprovar**, seguir o padrão visual dos cards existentes em `labs.html`

---

### FASE 5 — Workers e D1 sem referência no front

Para cada Worker ou banco D1 sem referência em nenhum arquivo HTML:

1. **Verificar se está ativo** via `wrangler tail` ou painel Cloudflare
2. **Identificar o propósito** — o que esse Worker faz? Qual dado o D1 armazena?
3. **Classificar**:

```
⚠️  WORKER SEM REFERÊNCIA — [nome]
────────────────────────────────────
Status:    [ ativo / inativo ]
Propósito: [descrição do que faz]
Dados D1:  [tabela e volume estimado de registros]

Opções:
  A) Criar página front-end para expor esta funcionalidade
  B) Adicionar referência no HTML existente mais adequado
  C) Desativar e arquivar — funcionalidade não será mais usada

Recomendação: [A / B / C] — [justificativa]
Aguardando decisão.
```

---

### FASE 6 — Relatório final e execução

Após aprovações, executar todas as ações confirmadas e gerar relatório:

```
✅ AUDITORIA CONCLUÍDA — farpa.ai
──────────────────────────────────
Data: [data]

LIMPEZA:
  Removidos automaticamente: [N arquivos] ([lista])
  Aprovados para remoção:    [N arquivos] ([lista])
  Órfãos migrados:           [N arquivos] ([lista])

FUNCIONALIDADES EXPOSTAS:
  Cards criados em labs.html: [N]
    - [título do card 1]
    - [título do card 2]

WORKERS/D1 RESOLVIDOS:
  - [worker]: [ação tomada]

PENDÊNCIAS (se houver):
  - [item que ficou sem decisão]

Arquivos modificados:
  - labs.html (N cards adicionados)
  - [outros arquivos]

Commit: [mensagem exata]
Deploy: [ confirmado em produção ]
```

---

## RESTRIÇÕES INEGOCIÁVEIS

- NÃO excluir backups ou duplicatas sem aprovação explícita
- NÃO modificar `theme-engine.js`, `tokens.css` ou `themes.css`
- NÃO criar cards para páginas com bugs críticos sem sinalizar o problema
- NÃO criar subpastas durante a reorganização
- SEMPRE verificar referências dinâmicas (via JS) antes de marcar arquivo como órfão
- SEMPRE propor card por card — nunca adicionar todos de uma vez sem revisão
- SEMPRE manter alto contraste nos cards criados — WCAG AA mínimo

---

## EXEMPLO DE SAÍDA ESPERADA

```
⚠️  FUNCIONALIDADES OCULTAS ENCONTRADAS (3)

1. leads-dashboard.html
   → Página funcional de visualização de leads do D1
   → Macro tema: #dados · #admin
   → Proposta de card aguardando aprovação

2. api-leads worker
   → Worker ativo, 47 registros no D1 leads-db
   → Sem nenhuma referência no front
   → Opções A/B/C aguardando decisão

3. simulador-cambio.html
   → Página funcional mas incompleta (falta integração API)
   → Recomendação: criar card com status [ em breve ]

🗑️  LIXO REMOVIDO AUTOMATICAMENTE (4)
   .DS_Store · .DS_Store (labs/) · debug.log · style.css.swp

📋 ÓRFÃOS IDENTIFICADOS (2) — aguardando aprovação
   animations.css — não referenciado em nenhum HTML
   utils_old.js   — duplicata de utils.js com código idêntico
```

---

## QUANDO RODAR ESTA AUDITORIA

- Ao iniciar um novo ciclo de desenvolvimento
- Após um período longo sem commits
- Antes de uma apresentação para a diretoria
- Sempre que suspeitar de arquivos perdidos ou funcionalidades esquecidas

---

*farpa.ai · Portfolio Digital · PROMPT AUDIT v1 · 2026*
