# PROMPT CONTENT — farpa.ai Textos e Traduções
> v1 · Head de Produto e Engenharia · Portfolio Digital Pessoa Física

---

## OBJETIVO

Criar, atualizar ou traduzir textos do farpa.ai mantendo tom consistente,
linguagem de produto e coerência entre os 4 idiomas suportados: PT · EN · ZH · DE.
Todo texto deve comunicar valor de negócio — nunca linguagem técnica para o usuário final.

---

## TOM DE VOZ — farpa.ai

```
Persona:      Plataforma de inteligência de mercado — confiante, direta, sofisticada
Audiência:    Executivos, analistas, tomadores de decisão
Tom:          Profissional sem ser formal · Direto sem ser frio · Moderno sem ser informal
Evitar:       Jargão técnico · Frases longas · Superlativos vazios ("o melhor", "incrível")
Preferir:     Verbos de ação · Dados concretos · Benefício antes da feature
Idioma base:  Português brasileiro — as demais traduções partem daqui
```

---

## TEMPLATE

```
Operação:
[ ] Criar texto novo
[ ] Atualizar texto existente
[ ] Traduzir para outros idiomas
[ ] Revisar consistência entre idiomas

Página / componente alvo:
[ex: labs.html — descrição do card de valuation]
[ex: index.html — hero section]
[ex: pro.html — lista de benefícios]

Idiomas necessários:
[x] PT (português brasileiro) ← sempre obrigatório
[ ] EN (inglês)
[ ] ZH (mandarim simplificado)
[ ] DE (alemão)

Contexto do texto:
[descrever o que o texto precisa comunicar e onde aparece na página]

Restrições de tamanho:
[ex: "título máximo 5 palavras" · "descrição máximo 1 linha" · "sem limite"]
```

---

## INSTRUÇÕES DE EXECUÇÃO

### 1. Análise do contexto

Antes de escrever:
- Ler a página alvo completa para entender o contexto visual e narrativo
- Identificar o tom dos textos já existentes na mesma seção
- Verificar se há restrições de espaço (títulos, labels, botões têm limites rígidos)
- Identificar o público da página (técnico / executivo / misto)

### 2. Criação em PT

Escrever primeiro em português brasileiro seguindo o tom de voz:
- Títulos: diretos, substantivos ou verbos de ação, máximo 5–6 palavras
- Descrições: benefício primeiro, depois como funciona, máximo 2 linhas
- CTAs: verbo + resultado (ex: "Ver análise", "Simular agora", "Explorar dados")
- Labels e tags: substantivos curtos, lowercase quando possível

### 3. Tradução para EN · ZH · DE

Para cada idioma, **adaptar culturalmente** — não traduzir literalmente:

**EN (inglês)**
- Tom: ligeiramente mais direto que o PT
- Evitar "você" → usar construções impessoais ou "you" conforme contexto
- Datas e números: formato americano

**ZH (mandarim simplificado)**
- Títulos: 4–6 caracteres idealmente
- Tom: formal e conciso — mandarim de negócios é mais denso que PT
- Evitar gírias ou expressões idiomáticas brasileiras

**DE (alemão)**
- Substantivos compostos são naturais — não fragmentar desnecessariamente
- Tom: profissional e preciso — alemão de negócios valoriza especificidade
- Verificar gênero gramatical dos substantivos principais

### 4. Formato de entrega

Entregar sempre em bloco estruturado para fácil cópia:

```
📝 TEXTO — [identificação do componente]
────────────────────────────────────────
PT: [texto em português]
EN: [texto em inglês]
ZH: [texto em mandarim]
DE: [texto em alemão]

Notas de uso:
[ex: "usar em <h2> da hero section" · "máximo 1 linha no mobile"]
```

### 5. Verificação de consistência entre idiomas

Se operação = "Revisar consistência":

1. Extrair todos os textos existentes nos 4 idiomas da página alvo
2. Comparar estrutura e tom entre idiomas
3. Identificar inconsistências:
   - Informações presentes em PT mas ausentes em EN/ZH/DE
   - Tom divergente entre idiomas
   - Traduções literais que soam estranhas
4. Propor correções por item identificado

---

## GLOSSÁRIO DO PRODUTO — farpa.ai

Termos com tradução padronizada — sempre usar estas versões:

| PT | EN | ZH | DE |
|---|---|---|---|
| Curadoria de notícias | News curation | 新闻策划 | Nachrichtenkuratierung |
| Inteligência de mercado | Market intelligence | 市场情报 | Marktintelligenz |
| Análise em tempo real | Real-time analysis | 实时分析 | Echtzeit-Analyse |
| Tomadores de decisão | Decision makers | 决策者 | Entscheidungsträger |
| Portfólio digital | Digital portfolio | 数字作品集 | Digitales Portfolio |
| Simulação | Simulation | 模拟 | Simulation |
| Ao vivo | Live | 实时 | Live |
| Demo | Demo | 演示 | Demo |

---

## RESTRIÇÕES

- NUNCA usar linguagem técnica voltada ao usuário final
- NUNCA traduzir literalmente — sempre adaptar culturalmente
- SEMPRE manter o glossário padronizado
- SEMPRE entregar PT como base antes das traduções
- NÃO alterar estrutura HTML — entregar só o texto, não o código

---

## EXEMPLO DE USO PREENCHIDO

```
Operação: Criar texto novo

Página / componente alvo:
labs.html — card novo para o simulador de valuation

Idiomas necessários:
[x] PT · [x] EN · [ ] ZH · [ ] DE

Contexto:
Card na grade de labs.html. Precisa de título (máximo 4 palavras),
descrição de 1 linha e tag de macro tema.

Restrições de tamanho:
Título: máximo 4 palavras · Descrição: máximo 12 palavras
```

**Saída esperada:**

```
📝 TEXTO — labs.html · card · valuation-simulator
──────────────────────────────────────────────────
Título
PT: Simulador de Valuation
EN: Valuation Simulator

Descrição
PT: Calcule o valor de startups com dados reais de mercado.
EN: Estimate startup value using live market data.

Tag
PT/EN: #finanças · #tempo-real

Notas de uso:
Título em <h3> · Descrição em <p class="card-desc"> · Tags como spans
```

---

*farpa.ai · Portfolio Digital · PROMPT CONTENT v1 · 2026*
