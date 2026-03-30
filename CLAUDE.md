# CLAUDE.md — farpa.ai
> Arquivo de contexto automático do Claude Code · Lido em toda sessão iniciada neste repositório

---

## IDENTIDADE DO PROJETO

**farpa.ai** é uma plataforma brasileira de curadoria de notícias e inteligência de mercado,
construída por **Rodrigo** — Head de Produto e Engenharia, portfolio digital de pessoa física.

Objetivo estratégico: demonstrar para a diretoria de uma empresa que é possível construir
produtos de valor com design moderno usando infraestrutura enxuta e ferramentas de IA.

Cada entrega deve ser **presentation-ready** — convincente para executivos não técnicos,
sem necessidade de explicação verbal.

---

## ESTRUTURA DO REPOSITÓRIO

```
/                               ← raiz — TODOS os arquivos ficam aqui
├── index.html                  ← página principal
├── labs.html                   ← catálogo de MVPs e demos
├── pro.html                    ← página premium (tema ouro)
├── biblioteca.html             ← biblioteca educacional (8 módulos)
├── tokens.css                  ← variáveis globais do design system ⛔ não modificar
├── themes.css                  ← temas Void / Ivory / Midnight ⛔ não modificar
├── theme-engine.js             ← sidebar global + switcher de tema ⛔ não modificar
├── mobile-fixes.css            ← correções mobile globais
├── CLAUDE.md                   ← este arquivo
├── PROMPT-MASTER-farpa.md      ← criar novos MVPs e features
├── PROMPT-EVOLUTION-farpa.md   ← modificar artefatos existentes
├── PROMPT-AUDIT-farpa.md       ← auditar, limpar e surfaçar funcionalidades
├── PROMPT-DEPLOY-farpa.md      ← checklist pré-apresentação
├── PROMPT-CONTENT-farpa.md     ← textos e traduções PT/EN/ZH/DE
└── PROMPT-ANALYTICS-farpa.md   ← relatórios de dados do D1
```

---

## DESIGN SYSTEM

```
Tipografia:  Space Grotesk (display) + DM Mono (código/dados) — imutáveis
Tema base:   Void dark — #0a0a0a background
Acentos:     #00ff88 (neon green) · #00e5ff (cyan)
Temas extra: Ivory light · Midnight blue (via CSS custom properties)
Sidebar:     Injetada globalmente via theme-engine.js
Contraste:   Alto contraste obrigatório — Rodrigo tem baixa visão — WCAG AA mínimo
```

---

## INFRAESTRUTURA

```
Repositório:  https://github.com/rff82/AI
Deploy:       Cloudflare Pages ← GitHub (branch main)
              Push no main = deploy automático
Workers:      api-leads — captura de leads
              Endpoint: api-leads.rfelipefernandes.workers.dev
Banco:        D1 — leads-db
Secrets:      Sempre via wrangler secret put — nunca no código
```

---

## PROMPTS — QUANDO USAR CADA UM

### 🟢 PROMPT-MASTER-farpa.md
**Criar algo novo do zero**
→ Nova página HTML · Nova feature · Novo Worker + D1 · Novo card em labs.html
→ Inclui: pesquisa de mercado, APIs públicas, retry em cascata, versionamento

### 🟡 PROMPT-EVOLUTION-farpa.md
**Modificar o que já existe**
→ Bug fix · Evolução de feature · Redesign visual · Refatoração de código
→ Inclui: diagnóstico antes de agir, proposta para mudanças grandes, relatório de modificação

### 🔵 PROMPT-AUDIT-farpa.md
**Organizar e descobrir o que está oculto**
→ Funcionalidades sem card em labs · Arquivos órfãos · Limpeza de lixo · Workers sem front
→ Rodar periodicamente e sempre antes de ciclos de desenvolvimento

### 🟠 PROMPT-DEPLOY-farpa.md
**Garantir que tudo está pronto para apresentar**
→ Checklist completo: produção, links, visual, mobile, APIs, Workers, console de erros
→ Rodar sempre antes de apresentação para a diretoria

### 🟣 PROMPT-CONTENT-farpa.md
**Criar ou atualizar textos e traduções**
→ Novos textos · Traduções PT/EN/ZH/DE · Revisão de consistência entre idiomas
→ Tom de voz e glossário padronizado incluídos

### 🔴 PROMPT-ANALYTICS-farpa.md
**Transformar dados do D1 em narrativa executiva**
→ Relatório de leads · Análise de engajamento · Insights para apresentação
→ Queries SQL prontas + formato de relatório executivo

---

## REGRAS GLOBAIS — SEMPRE APLICAR

### Arquivos
- Todos os arquivos na raiz — nunca criar subpastas
- Nunca modificar `theme-engine.js`, `tokens.css` ou `themes.css`
- Nunca usar fontes externas além das já carregadas no design system

### Segurança
- Nunca publicar API keys ou secrets no código
- Sempre usar `wrangler secret put` para variáveis sensíveis
- Sempre configurar CORS restrito ao domínio farpa.ai em Workers novos

### APIs públicas
- Usar apenas APIs sem chave ou com tier gratuito sem cartão
- Sempre implementar retry em cascata: 3 tentativas por API, até 2 fallbacks
- Sempre exibir timestamp de última atualização quando dados vierem de API externa

### Versionamento
- Registrar versão no cabeçalho de todo arquivo modificado:
  `<!-- farpa.ai · [arquivo] · v[X.Y] · [data] -->`
- Commit com prefixo semântico e versão:
  `fix:` · `feat:` · `redesign:` · `refactor:` · `chore:` · `content:`
- Push para main ao final de cada sessão de trabalho concluída

### Qualidade
- Nunca regredir — qualquer modificação deve deixar o artefato melhor
- Nunca falhar silenciosamente — erros sempre visíveis para o usuário
- Mobile-first em toda nova página
- Alto contraste obrigatório — Rodrigo tem baixa visão

---

## COMANDOS ÚTEIS DA SESSÃO

| Comando | Quando usar |
|---|---|
| `/compact` | Sessão longa — comprimir histórico sem perder contexto |
| `/clear` | Trocar de tarefa — iniciar contexto limpo |
| `/cost` | Verificar consumo de tokens da sessão |
| `/memory` | Confirmar que este CLAUDE.md foi carregado |

---

## FLUXO PADRÃO DE TRABALHO

```
INÍCIO DE SESSÃO
  └─ Claude Code lê este CLAUDE.md automaticamente

IDENTIFICAR A TAREFA
  ├─ Criar feature nova?        → PROMPT-MASTER
  ├─ Corrigir / evoluir algo?   → PROMPT-EVOLUTION
  ├─ Organizar repositório?     → PROMPT-AUDIT
  ├─ Preparar apresentação?     → PROMPT-DEPLOY
  ├─ Criar ou revisar textos?   → PROMPT-CONTENT
  └─ Analisar dados do D1?      → PROMPT-ANALYTICS

EXECUTAR
  └─ Seguir as instruções do prompt correspondente

FINALIZAR
  ├─ Commit com prefixo semântico + versão
  ├─ Push para main → deploy automático Cloudflare Pages
  ├─ Confirmar produção
  └─ /clear antes da próxima tarefa não relacionada
```

---

*farpa.ai · CLAUDE.md · v2.0 · 2026*
