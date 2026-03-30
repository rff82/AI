# PROMPT ANALYTICS — farpa.ai Relatório de Dados e Inteligência do D1
> v1 · Head de Produto e Engenharia · Portfolio Digital Pessoa Física

---

## OBJETIVO

Transformar dados brutos do banco D1 em narrativa de valor para apresentação executiva.
Responder a pergunta que a diretoria sempre faz: **"Qual o resultado concreto disso tudo?"**
Cada relatório deve ser claro, visual quando possível e orientado a decisão.

---

## TEMPLATE

```
Escopo do relatório:
[ ] Completo       — todos os dados disponíveis no D1
[ ] Leads          — foco em captura e conversão
[ ] Engajamento    — foco em uso das funcionalidades
[ ] Personalizado  — descrever: [o que analisar]

Período:
[ ] Últimos 7 dias
[ ] Últimos 30 dias
[ ] Desde o início
[ ] Personalizado: [data início] até [data fim]

Formato de saída:
[ ] Relatório executivo    — narrativa + números-chave (para apresentação)
[ ] Tabela de dados        — dados estruturados para análise
[ ] Ambos

Público:
[ ] Diretoria executiva    — foco em resultado e potencial de negócio
[ ] Técnico                — foco em volume, performance e integridade dos dados
```

---

## INSTRUÇÕES DE EXECUÇÃO

### 1. Extração de dados do D1

Executar as queries necessárias via `wrangler d1 execute`:

#### Leads — queries padrão
```sql
-- Volume total
SELECT COUNT(*) as total_leads FROM leads;

-- Por período
SELECT DATE(created_at) as dia, COUNT(*) as leads
FROM leads
GROUP BY DATE(created_at)
ORDER BY dia DESC
LIMIT 30;

-- Por origem (se campo disponível)
SELECT origem, COUNT(*) as total
FROM leads
GROUP BY origem
ORDER BY total DESC;

-- Últimos registros
SELECT * FROM leads
ORDER BY created_at DESC
LIMIT 10;
```

#### Adaptar queries ao schema real encontrado no D1
Se o schema for diferente do padrão acima, ajustar as queries conforme
os campos existentes na tabela. Documentar o schema real no relatório.

### 2. Análise e interpretação

Para cada conjunto de dados extraído:

1. **Calcular métricas-chave**:
   - Volume total e crescimento percentual no período
   - Média diária / semanal
   - Pico de atividade (dia/hora com mais registros)
   - Tendência: crescendo / estável / caindo

2. **Identificar insights**:
   - O que os dados revelam sobre uso do produto?
   - Há correlação entre lançamento de features e crescimento?
   - Qual funcionalidade gera mais engajamento?

3. **Formular narrativa executiva**:
   - Transformar números em história de tração
   - Contextualizar com o objetivo do portfólio (demonstrar capacidade de produto)
   - Destacar o que impressiona um executivo não técnico

### 3. Formato do relatório executivo

```
📊 RELATÓRIO farpa.ai — [período]
════════════════════════════════════

HEADLINE
"[1 frase que resume o resultado mais relevante do período]"

NÚMEROS-CHAVE
┌─────────────────────────────────┐
│  [N]        Total de leads      │
│  [N]/dia    Média diária        │
│  [+N%]      Crescimento         │
│  [data]     Pico de atividade   │
└─────────────────────────────────┘

TENDÊNCIA
[Gráfico ASCII simples de evolução diária — últimos 14 dias]
Ex:
  Seg  ██████ 12
  Ter  ████   8
  Qua  ███████████ 22
  ...

INSIGHTS
1. [insight mais relevante em 1–2 linhas]
2. [segundo insight]
3. [terceiro insight se houver]

CONTEXTO DE PRODUTO
[Parágrafo curto conectando os dados ao objetivo: demonstrar capacidade
de construir produto com tração real para a diretoria]

RECOMENDAÇÃO
[1 ação concreta sugerida com base nos dados]
Ex: "A página labs.html concentra 70% do engajamento — priorizar novos
cards nas próximas 2 semanas para ampliar o catálogo antes da apresentação."
```

### 4. Formato da tabela de dados (se solicitado)

```
DADOS BRUTOS — [tabela] · [período]
────────────────────────────────────
[tabela formatada em markdown com os campos relevantes]

Schema identificado:
[lista de campos e tipos da tabela]

Total de registros: [N]
Integridade: [ ✅ sem nulos críticos / ⚠️ campos vazios em [N]% dos registros ]
```

---

## QUERIES ÚTEIS POR CASO DE USO

### Verificar saúde do banco
```sql
-- Verificar tabelas existentes
SELECT name FROM sqlite_master WHERE type='table';

-- Verificar schema de uma tabela
PRAGMA table_info(leads);

-- Verificar últimos registros com todos os campos
SELECT * FROM leads ORDER BY rowid DESC LIMIT 5;
```

### Análise de crescimento
```sql
-- Crescimento semana a semana
SELECT
  strftime('%W', created_at) as semana,
  COUNT(*) as total
FROM leads
GROUP BY semana
ORDER BY semana DESC;
```

### Qualidade dos dados
```sql
-- Verificar campos vazios ou nulos
SELECT
  COUNT(*) as total,
  COUNT(email) as com_email,
  COUNT(nome) as com_nome
FROM leads;
```

---

## RESTRIÇÕES

- NUNCA expor dados pessoais de leads no relatório — usar totais e agregações
- NUNCA modificar dados do D1 durante a análise — apenas SELECT
- SEMPRE contextualizar números com o objetivo do portfólio
- SEMPRE recomendar uma ação concreta ao final
- Se o D1 estiver vazio → gerar relatório com dados zerados + recomendação de como
  acelerar a captação antes da próxima apresentação

---

## EXEMPLO DE SAÍDA ESPERADA

```
📊 RELATÓRIO farpa.ai — Últimos 30 dias
════════════════════════════════════════

HEADLINE
"47 leads capturados em 30 dias com infraestrutura 100% serverless e custo zero."

NÚMEROS-CHAVE
┌─────────────────────────────────┐
│  47         Total de leads      │
│  1.6/dia    Média diária        │
│  +180%      vs. mês anterior    │
│  12/Mar     Pico (8 leads)      │
└─────────────────────────────────┘

TENDÊNCIA (últimos 14 dias)
  15/Mar  ██ 2
  16/Mar  ████ 4
  17/Mar  ███████ 7
  18/Mar  ████ 4
  19/Mar  ██████████ 10
  ...

INSIGHTS
1. O pico de 12/Mar coincide com o lançamento do card de valuation em labs.html
2. 80% dos leads vieram via formulário da index.html — labs.html ainda não tem CTA direto
3. Crescimento acelerou nas últimas 2 semanas após redesign da hero section

CONTEXTO DE PRODUTO
Em 30 dias, o farpa.ai demonstrou capacidade de capturar interesse real de mercado
sem investimento em mídia paga, usando apenas produto e design como canais de aquisição.

RECOMENDAÇÃO
Adicionar CTA de captura de lead diretamente em labs.html para converter o engajamento
das demos em registros — estimativa: +30% de leads no próximo ciclo.
```

---

*farpa.ai · Portfolio Digital · PROMPT ANALYTICS v1 · 2026*
