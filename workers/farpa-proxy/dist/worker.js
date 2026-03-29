/**
 * farpa.ai — Cloudflare Worker · farpa-proxy v4.2
 *
 * Routes:
 *   POST /ai        → Proxy Anthropic Claude API (5 retries + exponential backoff)
 *   GET  /news      → Financial news via RSS feeds (BR/US/Crypto)
 *   GET  /markets   → Public market APIs proxy (B3, NYSE, Crypto, Indices)
 *   GET  /yahoo     → Yahoo Finance raw chart/quote proxy
 *   GET  /chart     → Normalized historical prices (?symbol=&days=)
 *   GET  /health    → Health check
 */

const ALLOWED_ORIGINS = ['https://farpa.ai', 'https://www.farpa.ai'];
const MAX_RETRIES = 5;
const BASE_TIMEOUT = 8000;
const AI_TIMEOUT = 30000;

const RSS_FEEDS = {
  br: [
    { url: 'https://www.infomoney.com.br/feed/', label: 'InfoMoney' },
    { url: 'https://valor.globo.com/rss/home', label: 'Valor Econômico' },
    { url: 'https://exame.com/feed/', label: 'Exame' },
  ],
  us: [
    { url: 'https://feeds.reuters.com/reuters/businessNews', label: 'Reuters' },
    { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', label: 'MarketWatch' },
    { url: 'https://rss.cnn.com/rss/money_news_international.rss', label: 'CNN Business' },
  ],
  crypto: [
    { url: 'https://cointelegraph.com/rss', label: 'CoinTelegraph' },
    { url: 'https://coindesk.com/arc/outboundfeeds/rss/', label: 'CoinDesk' },
  ],
};

const DEFAULT_SYMBOLS = {
  b3: 'PETR4.SA,VALE3.SA,ITUB4.SA,BBDC4.SA,ABEV3.SA,WEGE3.SA,RENT3.SA,BBAS3.SA',
  nyse: 'AAPL,MSFT,GOOGL,AMZN,NVDA,META,TSLA,JPM',
  indices: '^BVSP,^GSPC,^IXIC,^DJI,USDBRL=X',
};

// ── CORS helpers ──

function corsHeaders(origin) {
  const allowed =
    ALLOWED_ORIGINS.includes(origin) ||
    /localhost|127\.0\.0\.1|\.pages\.dev$|\.vercel\.app$|\.workers\.dev$/.test(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

// ── fetchWithRetry ──

async function fetchWithRetry(url, options = {}, maxRetries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutMs = options.timeout || BASE_TIMEOUT;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const { timeout, ...fetchOpts } = options;
      const res = await fetch(url, { ...fetchOpts, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return res;
      if (res.status >= 500 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError || new Error(`Max retries (${maxRetries}) exceeded for ${url}`);
}

// ── POST /ai ──

async function handleAI(request, env, origin) {
  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse({ error: 'ANTHROPIC_API_KEY not configured.' }, 500, origin);
  }
  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON body.' }, 400, origin); }
  if (!body.messages || !Array.isArray(body.messages)) {
    return jsonResponse({ error: 'Missing messages array.' }, 400, origin);
  }
  try {
    const res = await fetchWithRetry(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: body.model || 'claude-sonnet-4-20250514',
          max_tokens: body.max_tokens || 600,
          messages: body.messages,
          ...(body.system ? { system: body.system } : {}),
        }),
        timeout: AI_TIMEOUT,
      },
      MAX_RETRIES
    );
    const data = await res.json();
    return jsonResponse(data, res.ok ? 200 : res.status, origin);
  } catch (e) {
    return jsonResponse({ error: 'AI service unavailable after retries.', detail: e.message }, 503, origin);
  }
}

// ── GET /news ──

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
    if (title && title.length > 10 && link) items.push({ title, link, pubDate, source: label });
    if (items.length >= 4) break;
  }
  return items;
}

async function handleNews(request, origin) {
  const url = new URL(request.url);
  const market = url.searchParams.get('market') || 'br';
  const feeds = RSS_FEEDS[market] || RSS_FEEDS.br;
  const allItems = [];
  await Promise.allSettled(
    feeds.map(async (feed) => {
      try {
        const res = await fetchWithRetry(feed.url, { headers: { 'User-Agent': 'farpa.ai/4.2 RSS Reader' }, timeout: 5000 }, 3);
        if (!res.ok) return;
        const text = await res.text();
        allItems.push(...parseRSS(text, feed.label));
      } catch (e) { console.warn(`RSS error [${feed.label}]:`, e.message); }
    })
  );
  const seen = new Set();
  const unique = allItems
    .filter(i => { if (seen.has(i.title)) return false; seen.add(i.title); return true; })
    .sort((a, b) => (b.pubDate ? new Date(b.pubDate).getTime() : 0) - (a.pubDate ? new Date(a.pubDate).getTime() : 0))
    .slice(0, 8);
  return jsonResponse({ items: unique, market, count: unique.length }, 200, origin);
}

// ── GET /markets ──

async function handleMarkets(request, origin) {
  const url = new URL(request.url);
  const source = url.searchParams.get('source') || 'crypto';
  const symbols = url.searchParams.get('symbols') || '';
  try {
    if (source === 'crypto') {
      const coins = symbols || 'bitcoin,ethereum,solana,cardano,polkadot,avalanche-2,chainlink';
      const res = await fetchWithRetry(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coins)}&vs_currencies=usd,brl&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
        { headers: { Accept: 'application/json' } },
        MAX_RETRIES
      );
      const data = await res.json();
      return jsonResponse({ source: 'coingecko', data, timestamp: new Date().toISOString() }, 200, origin);
    }
    if (source === 'b3' || source === 'nyse' || source === 'indices') {
      const syms = symbols || DEFAULT_SYMBOLS[source];
      const fields = 'symbol,shortName,longName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,marketCap,currency,regularMarketDayHigh,regularMarketDayLow,regularMarketOpen,regularMarketPreviousClose,fiftyTwoWeekHigh,fiftyTwoWeekLow';
      const res = await fetchWithRetry(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(syms)}&fields=${fields}`,
        { headers: { 'User-Agent': 'farpa.ai/4.2', Accept: 'application/json' } },
        MAX_RETRIES
      );
      const data = await res.json();
      const results = data?.quoteResponse?.result || [];
      return jsonResponse({ source, data: results, count: results.length, timestamp: new Date().toISOString() }, 200, origin);
    }
    return jsonResponse({ error: 'Unknown source. Use: crypto, b3, nyse, indices' }, 400, origin);
  } catch (e) {
    return jsonResponse({ error: `Market data unavailable after ${MAX_RETRIES} retries.`, detail: e.message }, 503, origin);
  }
}

// ── GET /chart ──

async function handleChart(request, origin) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol') || 'PETR4.SA';
  const days = parseInt(url.searchParams.get('days') || '30', 10);

  let range = '1mo', interval = '1d';
  if (days <= 1)        { range = '1d';  interval = '5m';  }
  else if (days <= 7)   { range = '5d';  interval = '1h';  }
  else if (days <= 30)  { range = '1mo'; interval = '1d';  }
  else if (days <= 90)  { range = '3mo'; interval = '1d';  }
  else if (days <= 180) { range = '6mo'; interval = '1d';  }
  else if (days <= 365) { range = '1y';  interval = '1wk'; }
  else                  { range = '2y';  interval = '1wk'; }

  try {
    const apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
    const res = await fetchWithRetry(
      apiUrl,
      { headers: { 'User-Agent': 'farpa.ai/4.2', Accept: 'application/json' } },
      MAX_RETRIES
    );
    const raw = await res.json();
    const result = raw?.chart?.result?.[0] || null;
    if (!result) return jsonResponse({ error: 'No chart data for symbol.', symbol }, 404, origin);

    const timestamps = result.timestamp || [];
    const q = result.indicators?.quote?.[0] || {};

    const prices = timestamps
      .map((t, i) => ({
        date:   new Date(t * 1000).toISOString(),
        open:   q.open?.[i]   ?? null,
        high:   q.high?.[i]   ?? null,
        low:    q.low?.[i]    ?? null,
        close:  q.close?.[i]  ?? null,
        volume: q.volume?.[i] ?? null,
      }))
      .filter(p => p.close !== null);

    return jsonResponse({ symbol, range, interval, prices, count: prices.length, timestamp: new Date().toISOString() }, 200, origin);
  } catch (e) {
    return jsonResponse({ error: 'Chart data unavailable.', detail: e.message }, 503, origin);
  }
}

// ── GET /yahoo ──

async function handleYahoo(request, origin) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol') || 'PETR4.SA';
  const range = url.searchParams.get('range') || '1d';
  const interval = url.searchParams.get('interval') || '5m';
  const type = url.searchParams.get('type') || 'chart';
  try {
    const apiUrl = type === 'quote'
      ? `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`
      : `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
    const res = await fetchWithRetry(
      apiUrl,
      { headers: { 'User-Agent': 'farpa.ai/4.2', Accept: 'application/json' } },
      MAX_RETRIES
    );
    const data = await res.json();
    const result = type === 'quote'
      ? data?.quoteResponse?.result || []
      : data?.chart?.result?.[0] || null;
    return jsonResponse({ symbol, type, range, interval, data: result, timestamp: new Date().toISOString() }, 200, origin);
  } catch (e) {
    return jsonResponse({ error: 'Yahoo Finance unavailable.', detail: e.message }, 503, origin);
  }
}

// ── Main Export ──

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const { pathname } = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    switch (true) {
      case pathname === '/ai' && request.method === 'POST':
        return handleAI(request, env, origin);
      case pathname === '/news' && request.method === 'GET':
        return handleNews(request, origin);
      case pathname === '/markets' && request.method === 'GET':
        return handleMarkets(request, origin);
      case pathname === '/yahoo' && request.method === 'GET':
        return handleYahoo(request, origin);
      case pathname === '/chart' && request.method === 'GET':
        return handleChart(request, origin);
      case pathname === '/health':
        return jsonResponse({
          status: 'ok',
          version: '4.2.0',
          routes: ['POST /ai', 'GET /news', 'GET /markets', 'GET /yahoo', 'GET /chart'],
          timestamp: new Date().toISOString(),
        });
      default:
        return jsonResponse(
          { error: 'Route not found.', routes: ['POST /ai', 'GET /news', 'GET /markets', 'GET /yahoo', 'GET /chart', 'GET /health'] },
          404, origin
        );
    }
  },
};
