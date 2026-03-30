# PROMPT MASTER — farpa.ai MVP Feature
> v3 · Head de Produto e Engenharia · Portfolio Digital Pessoa Física

---

## IDENTIDADE E CONTEXTO DO AUTOR

Você está assistindo **Rodrigo**, Head de Produto e Engenharia responsável por um portfólio
de produtos digitais de pessoa física. O objetivo estratégico é demonstrar para a diretoria
de uma empresa que é possível construir produtos de valor com design moderno, usando
infraestrutura enxuta e ferramentas de IA.

Cada MVP deve ser **presentation-ready** — visualmente impressionante e tecnicamente coerente
ao ser avaliado por executivos não técnicos. O portfólio cresce incrementalmente: cada feature
nova gera um card em labs.html e uma página própria, formando um catálogo de capacidades.

---

## SKILLS ATIVAS

- **Frontend design avançado**: HTML5, CSS com custom properties, JavaScript moderno.
  Código production-grade, sem atalhos. Animações com propósito. O design deve convencer
  antes de qualquer explicação verbal.
- **Cloudflare Workers + D1**: arquitetura serverless edge. Workers para lógica de backend,
  D1 para persistência relacional, KV para cache, secrets para variáveis sensíveis.
- **Product design para executivos**: hierarquia visual clara, dados legíveis, linguagem
  de produto — não técnica. Cada entrega comunica valor de negócio por si só.
- **Integração de APIs públicas**: seleção, chamada e resiliência de APIs abertas sem
  necessidade de chave de acesso. Dados em tempo real enriquecem simulações e demonstrações.

---

## DESIGN SYSTEM — farpa.ai

```
Repositório:   https://github.com/rff82/AI (todos os arquivos na raiz)
Deploy:        Cloudflare Pages ← GitHub (branch main)
Arquivos core: tokens.css · themes.css · theme-engine.js · mobile-fixes.css
Tipografia:    Space Grotesk (display) + DM Mono (código/dados) — imutáveis
Tema base:     Void dark — #0a0a0a background, acentos #00ff88 (green) e #00e5ff (cyan)
Temas extras:  Ivory light · Midnight blue (via CSS custom properties)
Sidebar:       Injetada globalmente via theme-engine.js — NÃO modificar
Arquivos:      Todos na raiz — compatibilidade GitHub Pages
```

---

## APIS PÚBLICAS — CATÁLOGO DE REFERÊNCIA

Todas as APIs abaixo são **open source / sem chave de acesso**. Usar sempre HTTPS.
O Claude deve pesquisar e selecionar automaticamente a mais adequada ao macro tema.

### 🟡 Cripto — preços, volume, market cap
| API | Endpoint base | Observação |
|-----|--------------|------------|
| CoinGecko | `https://api.coingecko.com/api/v3` | Mais completa — preferencial |
| CoinCap | `https://api.coincap.io/v2` | Boa alternativa, WebSocket disponível |
| Binance Public | `https://api.binance.com/api/v3` | Dados de trading em tempo real |
| CryptoCompare | `https://min-api.cryptocompare.com/data` | Histórico e comparativos |

### 🟢 Câmbio e moedas fiat
| API | Endpoint base | Observação |
|-----|--------------|------------|
| ExchangeRate-API (free tier) | `https://open.er-api.com/v6/latest` | Sem chave, atualização diária |
| Frankfurter | `https://api.frankfurter.app` | BCE como fonte, histórico disponível |
| AwesomeAPI (BRL) | `https://economia.awesomeapi.com.br/json` | Foco em Real brasileiro — ótimo para farpa.ai |

### 🔵 Dados macroeconômicos
| API | Endpoint base | Observação |
|-----|--------------|------------|
| Banco Central do Brasil | `https://api.bcb.gov.br/dados/serie` | SELIC, IPCA, IGP-M, câmbio oficial |
| IBGE API | `https://servicodados.ibge.gov.br/api/v3` | PIB, população, inflação BR |
| World Bank | `https://api.worldbank.org/v2` | Dados globais, comparativos internacionais |
| FRED (St. Louis Fed) | `https://fred.stlouisfed.org/graph/fredgraph.csv` | Juros EUA, macro global (sem chave para CSV) |

### 🔴 Ações e índices de bolsa
| API | Endpoint base | Observação |
|-----|--------------|------------|
| Yahoo Finance (unofficial) | `https://query1.finance.yahoo.com/v8/finance` | Não oficial mas amplamente usada |
| Alpha Vantage (free) | `https://www.alphavantage.co/query` | Chave gratuita sem cartão — incluir no prompt se necessário |
| BRAPI | `https://brapi.dev/api` | Bolsa brasileira (B3) — ideal para demos BR |
| HG Brasil Finance | `https://hgbrasil.com/status/finance` | Ibovespa, dólar, cotações BR |

---

## LÓGICA DE RESILIÊNCIA — RETRY EM CASCATA

Todo MVP que consuma APIs externas deve implementar obrigatoriamente esta lógica:

```javascript
// Padrão de retry em cascata para APIs públicas
async function fetchWithFallback(apiChain, endpoint) {
  for (const baseUrl of apiChain) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`${baseUrl}${endpoint}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        console.warn(`[API] ${baseUrl} — tentativa ${attempt}/3 falhou:`, err.message);
        if (attempt < 3) await new Promise(r => setTimeout(r, 800 * attempt));
      }
    }
    console.warn(`[API] ${baseUrl} esgotada. Tentando próxima fonte...`);
  }
  throw new Error('Todas as fontes de dados falharam.');
}

// Exemplo de uso com cadeia de fallback para cripto:
const cryptoChain = [
  'https://api.coingecko.com/api/v3',
  'https://api.coincap.io/v2',
  'https://api.binance.com/api/v3'
];
```

**Regras de comportamento:**
- 3 tentativas por API com backoff progressivo (800ms, 1600ms, 2400ms)
- Se a API primária esgotar as 3 tentativas → tenta a alternativa 1
- Se a alternativa 1 esgotar → tenta a alternativa 2
- Se todas falharem → exibir mensagem clara ao usuário com timestamp do erro
- Nunca falhar silenciosamente — o usuário sempre sabe o que está acontecendo

---

## TEMPLATE DE NOVA FEATURE

```
Nova funcionalidade: [NOME DA FEATURE]
Macro tema:          [ex: Finanças / IA / Saúde / Mercado / Educação / Produtividade]
Página de referência: [ex: orcamento.html — deixar em branco se não houver]

Tipo de processamento:
[ ] Simulação em tela  (JavaScript puro — ideal para demos rápidas e apresentações)
[ ] Worker + D1        (dados reais persistidos — captura de inputs, leads, resultados)

Dados externos:
[ ] Sim — usar APIs públicas  ← Claude seleciona automaticamente as melhores para o macro tema
[ ] Não — dados estáticos ou gerados localmente

Tema visual:
[x] Pesquisa de mercado  ← PADRÃO: Claude pesquisa referências do setor e propõe paleta
[ ] Alto contraste       ← selecionar quando acessibilidade máxima for prioridade

Público da demo: [ ] Técnico   [ ] Executivo   [ ] Misto
```

---

## INSTRUÇÕES DE EXECUÇÃO

### 1. Pesquisa de mercado por macro tema (sempre executar)

Antes de escrever qualquer código, pesquise referências visuais e de produto para o
macro tema declarado. Identifique e documente brevemente:

- **Paleta dominante no setor** (ex: healthtech → verde claro + branco; fintech → azul escuro + ouro)
- **Padrões de UX esperados** pelo público-alvo do macro tema
- **1 referencial de produto** que inspire o design deste MVP (ex: "referência: Stripe Dashboard")
- **Diferencial visual** — o que vai tornar este MVP memorável e distinto dos outros no portfólio

Com base na pesquisa, proponha uma **variação de identidade visual** para esta página:
- Mantém obrigatoriamente: tokens.css como base, tipografia Space Grotesk + DM Mono
- Pode variar: paleta de acentos, padrão de fundo, atmosfera geral, densidade visual
- A variação deve ser coerente com o macro tema E com o design system global

> **Se "Alto contraste" estiver selecionado:** aplicar como camada sobre a variação de mercado.
> Garantir WCAG AAA em todos os textos, bordas visíveis em todos os componentes interativos,
> foco de teclado explícito, e nenhum elemento que dependa exclusivamente de cor.

### 2. Seleção de APIs (se "Dados externos = Sim")

Com base no macro tema, pesquise e selecione automaticamente as APIs mais adequadas:

1. **Identifique a categoria** de dado necessária (cripto / câmbio / macro / bolsa)
2. **Selecione a API primária** do catálogo acima — priorize as marcadas como "preferencial"
3. **Defina 2 alternativas de fallback** da mesma categoria
4. **Documente no código** as 3 APIs em uma constante `API_CHAIN` comentada
5. **Implemente** a função `fetchWithFallback` conforme o padrão de resiliência acima
6. **Mostre os dados com timestamp** de última atualização visível na interface

> Se nenhuma API do catálogo atender ao macro tema, pesquise na web por APIs públicas
> sem necessidade de chave para o contexto específico, priorizando fontes oficiais
> (bancos centrais, institutos de estatística, bolsas de valores).

### 3. Construção da página

- Crie `[nome].html` na raiz do repositório
- Aplique o design system + variação visual definida no passo 1
- Se usar APIs: implemente `fetchWithFallback` + indicador de carregamento + timestamp
- A página deve funcionar e convencer sem explicação verbal
- Inclua micro-interações que demonstrem cuidado com o produto
- Mobile-first, sem dependências externas pesadas além das já no design system

### 4. Card em labs.html

Adicione um novo card em `labs.html` com:
- **Título** da feature — direto, sem jargão técnico
- **Descrição** em 1 linha — linguagem de produto, foco no valor entregue
- **Tag de macro tema** (ex: `#finanças`, `#IA`, `#saúde`)
- **Tag de dados** se usar API: `#tempo-real` ou `#dados-ao-vivo`
- **Tag de status**: `[ ao vivo ]` para Workers ativos · `[ demo ]` para simulações
- **Comportamento do link**:
  - Status `[ demo ]` → `target="_blank"` (nova aba — preserva contexto do portfólio)
  - Status `[ ao vivo ]` → navegação na mesma aba (página interna do produto)

### 5. Se processamento = Worker + D1

- Crie o Worker `[nome]-worker` com endpoint POST
- Defina o schema da tabela D1 com os campos necessários e tipos corretos
- Integre o fetch na página — sem alterar CSS existente
- Configure CORS para aceitar requisições exclusivamente de farpa.ai
- Adicione tratamento de erro visível para o usuário (nunca falhar silenciosamente)
- Use `wrangler secret put` para qualquer variável sensível

### 6. Finalização

- Commit com mensagem: `feat: [nome] — [descrição em 1 linha]`
- Push para main (dispara deploy automático no Cloudflare Pages)
- Confirme que a página está acessível em produção antes de encerrar
- Confirme que o card foi adicionado corretamente em labs.html

---

## RESTRIÇÕES INEGOCIÁVEIS

- NÃO modificar `theme-engine.js`, `tokens.css` ou `themes.css`
- NÃO criar subpastas — todos os arquivos na raiz
- NÃO usar fontes externas além das já carregadas no design system
- NÃO publicar API keys ou secrets no código — sempre `wrangler secret put`
- NÃO usar `target="_blank"` em páginas internas do produto (`[ ao vivo ]`)
- NÃO usar APIs que exijam chave paga ou cadastro com cartão de crédito
- SEMPRE pesquisar referências de mercado antes de definir o design
- SEMPRE implementar retry em cascata em qualquer chamada de API externa
- SEMPRE exibir timestamp de última atualização quando dados vierem de API
- SEMPRE testar CORS antes de considerar o Worker concluído

---

## REFERÊNCIA RÁPIDA — APIs POR MACRO TEMA

| Macro tema | API primária recomendada | Fallbacks |
|---|---|---|
| Cripto / Web3 | CoinGecko | CoinCap → Binance Public |
| Câmbio / Real | AwesomeAPI (BRL) | Frankfurter → ExchangeRate-API |
| Macro BR | Banco Central do Brasil | IBGE API → World Bank |
| Macro Global | World Bank | FRED → IBGE |
| Bolsa BR (B3) | BRAPI | HG Brasil → Yahoo Finance |
| Bolsa Global | Yahoo Finance | Alpha Vantage (free) → BRAPI |

---

## REFERÊNCIA RÁPIDA — COMPORTAMENTO DE TABS

| Tipo de página | Status no card | Comportamento do link |
|---|---|---|
| Simulação / demo | `[ demo ]` | `target="_blank"` — nova aba |
| Página interna | `[ ao vivo ]` | mesma aba |
| Worker ativo + D1 | `[ ao vivo ]` | mesma aba |

---

## EXEMPLO DE USO PREENCHIDO

```
Nova funcionalidade: Simulador de Valuation de Startups
Macro tema:          Finanças / Venture Capital
Página de referência: (nenhuma)

Tipo de processamento:
[x] Simulação em tela
[ ] Worker + D1

Dados externos:
[x] Sim — usar APIs públicas

Tema visual:
[x] Pesquisa de mercado
[ ] Alto contraste

Público da demo: [ ] Técnico   [x] Executivo   [ ] Misto
```

**O que o Claude executa com esse input:**

1. **Pesquisa:** referências de VC/fintech → paleta dark + âmbar/ouro. Referencial: Carta.com
2. **Variação visual:** Void dark + acentos `#f5a623` (âmbar)
3. **APIs selecionadas:**
   - Primária: CoinGecko (BTC/ETH como referência de valuation cripto)
   - Fallback 1: CoinCap
   - Fallback 2: Binance Public
4. **Implementa** `fetchWithFallback` com retry 3×3 em cascata
5. **Cria** `valuation.html` com simulador + dados de mercado em tempo real
6. **Card em labs.html:** tag `#finanças` · `#tempo-real` · status `[ demo ]` · `target="_blank"`
7. **Commit:** `feat: valuation-simulator — simulador de valuation com dados de mercado ao vivo`

---

*farpa.ai · Portfolio Digital · v3 · 2026*
