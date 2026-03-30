# PROMPT DEPLOY — farpa.ai Checklist Pré-Apresentação
> v1 · Head de Produto e Engenharia · Portfolio Digital Pessoa Física

---

## OBJETIVO

Garantir que o portfólio farpa.ai está 100% pronto para ser apresentado à diretoria.
Nenhum link quebrado, nenhuma API offline, nenhum elemento visual quebrado no mobile.
Este prompt é executado **sempre antes de uma apresentação importante**.

---

## TEMPLATE

```
Tipo de apresentação:
[ ] Diretoria executiva     — foco em valor de negócio e design
[ ] Time técnico            — foco em arquitetura e qualidade de código
[ ] Misto                   — ambos

Páginas prioritárias para verificar:
[ ] Todas                   ← recomendado
[ ] Somente as listadas: [ex: labs.html, valuation.html]

Dispositivos a simular:
[x] Desktop
[x] Mobile (375px — iPhone SE como referência mínima)
[ ] Tablet

APIs externas em uso: [listar ou deixar o Claude identificar automaticamente]
```

---

## CHECKLIST DE EXECUÇÃO

### 1. Verificação de produção

- [ ] Confirmar que o último commit chegou ao Cloudflare Pages
- [ ] Acessar a URL de produção e verificar carregamento da `index.html`
- [ ] Verificar que o deploy não está em estado de erro no painel Cloudflare

### 2. Navegação e links

Verificar em todas as páginas:
- [ ] Todos os links internos resolvem corretamente (sem 404)
- [ ] Cards em `labs.html` com status `[ demo ]` abrem em nova aba (`target="_blank"`)
- [ ] Cards com status `[ ao vivo ]` navegam na mesma aba
- [ ] Sidebar aparece corretamente em todas as páginas
- [ ] Switcher de idioma (PT/EN/ZH/DE) funciona sem erros no console
- [ ] Ctrl+K abre o overlay de busca corretamente

### 3. Visual e design

- [ ] Tema Void dark carrega como padrão
- [ ] Nenhum elemento com contraste insuficiente (texto cinza sobre fundo escuro)
- [ ] Fontes Space Grotesk e DM Mono carregando (verificar no DevTools → Network)
- [ ] Nenhuma imagem quebrada ou placeholder visível
- [ ] Animações e micro-interações funcionando

### 4. Mobile (375px)

- [ ] Sidebar recolhe corretamente no mobile
- [ ] Nenhum elemento com overflow horizontal
- [ ] Textos legíveis sem zoom
- [ ] Botões e cards com área de toque adequada (mínimo 44px)
- [ ] Cards de labs.html renderizam em coluna única

### 5. APIs externas

Para cada API em uso identificada no repositório:

```
🔌 VERIFICAÇÃO DE API — [nome]
──────────────────────────────
Endpoint:   [URL]
Status:     [ ✅ respondendo / ⚠️ lenta / ❌ offline ]
Fallback:   [ ✅ ativou corretamente / ❌ não testado ]
Timestamp:  [ ✅ visível na interface / ❌ ausente ]
```

- [ ] CoinGecko (se em uso) — `https://api.coingecko.com/api/v3/ping`
- [ ] AwesomeAPI BRL (se em uso) — `https://economia.awesomeapi.com.br/json/last/USD-BRL`
- [ ] BCB (se em uso) — `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/1?formato=json`
- [ ] BRAPI (se em uso) — `https://brapi.dev/api/quote/PETR4`
- [ ] Workers ativos — testar endpoint com curl ou fetch manual

### 6. Workers e formulários

- [ ] Worker `api-leads` respondendo (teste com POST de lead fictício)
- [ ] Formulários de captura submetendo sem erro
- [ ] Mensagens de sucesso e erro aparecem corretamente para o usuário
- [ ] CORS configurado — sem erros de cross-origin no console

### 7. Console de erros

Abrir DevTools em cada página prioritária e verificar:
- [ ] Zero erros críticos (vermelho) no console
- [ ] Warnings aceitáveis documentados (não bloqueiam uso)
- [ ] Nenhuma requisição de rede falhando (aba Network → filtro "Failed")

### 8. Performance mínima

- [ ] `index.html` carrega em menos de 3s em conexão 4G simulada
- [ ] `labs.html` carrega em menos de 3s
- [ ] Nenhuma página acima de 5MB de recursos totais

---

## RELATÓRIO DE DEPLOY

```
✅ CHECKLIST PRÉ-APRESENTAÇÃO — farpa.ai
─────────────────────────────────────────
Data:              [data e hora]
Apresentação:      [tipo]
URL de produção:   [URL]

RESULTADO GERAL:  [ ✅ Aprovado / ⚠️ Aprovado com ressalvas / ❌ Bloqueado ]

Itens aprovados:   [N]/[total]
Itens com alerta:  [N] — [lista resumida]
Itens bloqueantes: [N] — [lista resumida]

APIs verificadas:
  [nome]: [ ✅ / ⚠️ / ❌ ]

Ações corretivas executadas:
  - [ação 1]
  - [ação 2]

Pendências para após a apresentação:
  - [item não crítico que pode esperar]

Status final: [ PRONTO PARA APRESENTAR ]
```

---

## RESTRIÇÕES

- NÃO modificar código durante o checklist — apenas verificar e corrigir bugs críticos
- Se encontrar bug bloqueante → aplicar fix mínimo usando PROMPT-EVOLUTION
- NÃO alterar `theme-engine.js`, `tokens.css` ou `themes.css`
- SEMPRE gerar o relatório ao final, mesmo se tudo estiver ok

---

*farpa.ai · Portfolio Digital · PROMPT DEPLOY v1 · 2026*
