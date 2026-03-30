/**
 * farpa.ai — Cloudflare Worker · farpa-proxy v4.0
 * Rotas:
 *   POST /ai        → proxy Anthropic Claude API
 *   GET  /news      → busca notícias financeiras via RSS
 *   GET  /markets   → proxy para APIs públicas de mercado (B3, NYSE, Crypto)
 *   GET  /yahoo     → proxy Yahoo Finance API
 */

const ALLOWED_ORIGINS = ['https://farpa.ai','https://www.farpa.ai'];

const RSS_FEEDS = {
  br: [
    {url:'https://www.infomoney.com.br/feed/', label:'InfoMoney'},
    {url:'https://valor.globo.com/rss/home', label:'Valor Econômico'},
    {url:'https://exame.com/feed/', label:'Exame'},
  ],
  us: [
    {url:'https://feeds.reuters.com/reuters/businessNews', label:'Reuters'},
    {url:'https://feeds.marketwatch.com/marketwatch/topstories/', label:'MarketWatch'},
    {url:'https://rss.cnn.com/rss/money_news_international.rss', label:'CNN Business'},
  ],
  crypto: [
    {url:'https://cointelegraph.com/rss', label:'CoinTelegraph'},
    {url:'https://coindesk.com/arc/outboundfeeds/rss/', label:'CoinDesk'},
  ],
};

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ||
    /localhost|127\.0\.0\.1|\.pages\.dev$|\.vercel\.app$|\.workers\.dev$/.test(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {'Content-Type':'application/json', ...corsHeaders(origin)},
  });
}

/** Fetch with retry — up to 5 attempts with exponential backoff */
async function fetchWithRetry(url, options = {}, maxRetries = 5) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(options.timeout || 8000),
      });
      if (res.ok) return res;
      if (res.status >= 500 && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 500));
        continue;
      }
      return res;
    } catch (e) {
      lastError = e;
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 500));
      }
    }
  }
  throw lastError || new Error('Max retries exceeded');
}

function parseRSS(xmlText, label) {
  const items = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const title = (titleMatch?.[1] || '').trim().replace(/<[^>]+>/g, '').trim();
    const linkMatch = block.match(/<link[^>]*>([^<]+)<\/link>/i) || block.match(/<link[^>]+href="([^"]+)"/i);
    const link = (linkMatch?.[1] || '').trim();
    const dateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || block.match(/<published[^>]*>([\s\S]*?)<\/published>/i);
    const pubDate = (dateMatch?.[1] || '').trim();
    if (title && title.length > 10 && link) items.push({title, link, pubDate, source: label});
    if (items.length >= 4) break;
  }
  return items;
}

// POST /ai
async function handleAI(request, env, origin) {
  if (!env.ANTHROPIC_API_KEY) return json({error:'ANTHROPIC_API_KEY not configured.'}, 500, origin);
  let body;
  try { body = await request.json(); } catch { return json({error:'Invalid body.'}, 400, origin); }
  if (!body.messages || !Array.isArray(body.messages)) return json({error:'Missing messages.'}, 400, origin);

  try {
    const res = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {'Content-Type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},
      body: JSON.stringify({model:body.model||'claude-sonnet-4-20250514',max_tokens:body.max_tokens||600,messages:body.messages}),
      timeout: 30000,
    });
    const data = await res.json();
    return json(data, res.ok ? 200 : res.status, origin);
  } catch (e) {
    return json({error: 'AI service unavailable after retries.'}, 503, origin);
  }
}

// GET /news
async function handleNews(request, origin) {
  const url = new URL(request.url);
  const market = url.searchParams.get('market') || 'br';
  const feeds = RSS_FEEDS[market] || RSS_FEEDS.br;
  const allItems = [];

  await Promise.allSettled(feeds.map(async (feed) => {
    try {
      const res = await fetchWithRetry(feed.url, {
        headers: {'User-Agent':'farpa.ai/4.0 RSS Reader'},
        timeout: 5000,
      }, 3);
      if (!res.ok) return;
      const text = await res.text();
      allItems.push(...parseRSS(text, feed.label));
    } catch (e) { console.warn('RSS error:', feed.label, e.message); }
  }));

  const seen = new Set();
  const unique = allItems
    .filter(i => { if (seen.has(i.title)) return false; seen.add(i.title); return true; })
    .sort((a, b) => (b.pubDate ? new Date(b.pubDate).getTime() : 0) - (a.pubDate ? new Date(a.pubDate).getTime() : 0))
    .slice(0, 8);

  return json({items: unique, market, count: unique.length}, 200, origin);
}

// GET /markets — proxy public market APIs with 5 retries
async function handleMarkets(request, origin) {
  const url = new URL(request.url);
  const source = url.searchParams.get('source') || 'crypto';
  const symbols = url.searchParams.get('symbols') || '';

  try {
    if (source === 'crypto') {
      // CoinGecko API
      const res = await fetchWithRetry(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,polkadot&vs_currencies=usd,brl&include_24hr_change=true&include_market_cap=true',
        {headers: {'Accept':'application/json'}},
        5
      );
      const data = await res.json();
      return json({source:'coingecko', data, timestamp: new Date().toISOString()}, 200, origin);
    }

    if (source === 'b3' || source === 'nyse') {
      // Yahoo Finance API for B3/NYSE stocks
      const defaultSymbols = source === 'b3'
        ? 'PETR4.SA,VALE3.SA,ITUB4.SA,BBDC4.SA,ABEV3.SA,WEGE3.SA,RENT3.SA,BBAS3.SA'
        : 'AAPL,MSFT,GOOGL,AMZN,NVDA,META,TSLA,JPM';
      const syms = symbols || defaultSymbols;

      const res = await fetchWithRetry(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(syms)}&fields=symbol,shortName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,marketCap,currency`,
        {headers: {'User-Agent':'farpa.ai/4.0','Accept':'application/json'}},
        5
      );
      const data = await res.json();
      return json({source: source, data: data?.quoteResponse?.result || [], timestamp: new Date().toISOString()}, 200, origin);
    }

    if (source === 'indices') {
      // Major indices via Yahoo Finance
      const res = await fetchWithRetry(
        'https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5EBVSP,%5EGSPC,%5EIXIC,%5EDJI,USDBRL=X&fields=symbol,shortName,regularMarketPrice,regularMarketChange,regularMarketChangePercent',
        {headers: {'User-Agent':'farpa.ai/4.0','Accept':'application/json'}},
        5
      );
      const data = await res.json();
      return json({source:'indices', data: data?.quoteResponse?.result || [], timestamp: new Date().toISOString()}, 200, origin);
    }

    return json({error: 'Unknown source. Use: crypto, b3, nyse, indices'}, 400, origin);
  } catch (e) {
    return json({error: 'Market data unavailable after 5 retries.', detail: e.message}, 503, origin);
  }
}

// GET /yahoo — dedicated Yahoo Finance proxy
async function handleYahoo(request, origin) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol') || 'PETR4.SA';
  const range = url.searchParams.get('range') || '1d';
  const interval = url.searchParams.get('interval') || '5m';

  try {
    const res = await fetchWithRetry(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`,
      {headers: {'User-Agent':'farpa.ai/4.0','Accept':'application/json'}},
      5
    );
    const data = await res.json();
    return json({symbol, range, interval, data: data?.chart?.result?.[0] || null, timestamp: new Date().toISOString()}, 200, origin);
  } catch (e) {
    return json({error: 'Yahoo Finance unavailable.', detail: e.message}, 503, origin);
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const {pathname} = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:corsHeaders(origin)});
    if (pathname === '/ai' && request.method === 'POST') return handleAI(request, env, origin);
    if (pathname === '/news' && request.method === 'GET') return handleNews(request, origin);
    if (pathname === '/markets' && request.method === 'GET') return handleMarkets(request, origin);
    if (pathname === '/yahoo' && request.method === 'GET') return handleYahoo(request, origin);
    return json({error:'Route not found.',routes:['POST /ai','GET /news','GET /markets','GET /yahoo']}, 404, origin);
  },
};
