# farpa.ai — Curadoria de Notícias com IA Generativa v4.1

## Stack
- **Frontend**: HTML/CSS/JS vanilla, 4 temas CSS, sidebar/topnav dinâmicos
- **Deploy**: Cloudflare Pages (GitHub Actions CI)
- **Workers**: Cloudflare Workers TypeScript (farpa-proxy + api-leads)
- **Database**: Cloudflare D1 (SQLite)
- **AI**: Anthropic Claude API (proxy com 5 retries)
- **Market Data**: Yahoo Finance + CoinGecko (APIs públicas, sem auth)

## Workers API

### farpa-proxy (5 retries + exponential backoff)
- `POST /ai` → Proxy Anthropic Claude
- `GET /news?market=br|us|crypto` → RSS feeds financeiros
- `GET /markets?source=crypto|b3|nyse|indices` → Cotações ao vivo
- `GET /yahoo?symbol=PETR4.SA&range=1d` → Yahoo Finance charts
- `GET /health` → Health check

### api-leads (D1)
- `POST /api/leads` → Criar lead
- `GET /api/leads` → Listar leads
- `DELETE /api/leads/:id` → Remover lead

## Deploy
```bash
git push origin main  # CI deploya Pages automaticamente
cd workers/farpa-proxy && npx wrangler deploy
cd workers/api-leads && npx wrangler deploy
```

## SEO Keywords
IA generativa Brasil, notícias mercado financeiro IA, consultoria IA empresas, curso IA generativa gratuito

© farpa.ai 2024-2026
