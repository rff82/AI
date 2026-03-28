/**
 * farpa.ai — Cloudflare Worker · farpa-proxy v4.1
 * 
 * Routes:
 *   POST /ai        → Proxy Anthropic Claude API (5 retries + exponential backoff)
 *   GET  /news      → Financial news via RSS feeds (BR/US/Crypto)
 *   GET  /markets   → Public market APIs proxy (B3, NYSE, Crypto, Indices)
 *   GET  /yahoo     → Yahoo Finance chart data proxy
 *   GET  /health    → Health check
 * 
 * Architecture:
 *   - fetchWithRetry: 5 attempts, exponential backoff (500ms → 8s)
 *   - CORS: farpa.ai + dev origins (pages.dev, workers.dev, localhost)
 *   - Structured error responses with retry metadata
 */

interface Env {
  ANTHROPIC_API_KEY: string;
}

// ── Configuration ──

const ALLOWED_ORIGINS = ['https://farpa.ai', 'https://www.farpa.ai'];
const MAX_RETRIES = 5;
const BASE_TIMEOUT = 8000;
const AI_TIMEOUT = 30000;

interface RSSFeed {
  url: string;
  label: string;
}

const RSS_FEEDS: Record<string, RSSFeed[]> = {
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

const DEFAULT_SYMBOLS: Record<string, string> = {
  b3: 'PETR4.SA,VALE3.SA,ITUB4.SA,BBDC4.SA,ABEV3.SA,WEGE3.SA,RENT3.SA,BBAS3.SA',
  nyse: 'AAPL,MSFT,GOOGL,AMZN,NVDA,META,TSLA,JPM',
  indices: '^BVSP,^GSPC,^IXIC,^DJI,USDBRL=X',
};

// ── CORS helpers ──

function corsHeaders(origin: string): Record<string, string> {
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

function jsonResponse(data: unknown, status = 200, origin = '*'): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

// ── fetchWithRetry: 5 attempts with exponential backoff ──

async function fetchWithRetry(
  url: string,
  options: RequestInit & { timeout?: number } = {},
  maxRetries = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutMs = options.timeout || BASE_TIMEOUT;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) return res;

      // Retry on 5xx server errors only
      if (res.status >= 500 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 500;
        console.log(`Retry ${attempt + 1}/${maxRetries} for ${url} — status ${res.status}, waiting ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 500;
        console.log(`Retry ${attempt + 1}/${maxRetries} for ${url} — ${lastError.message}, waiting ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError || new Error(`Max retries (${maxRetries}) exceeded for ${url}`);
}

// ── POST /ai — Anthropic Claude proxy ──

async function handleAI(request: Request, env: Env, origin: string): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse({ error: 'ANTHROPIC_API_KEY not configured.' }, 500, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.' }, 400, origin);
  }

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
          model: (body.model as string) || 'claude-sonnet-4-20250514',
          max_tokens: (body.max_tokens as number) || 600,
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
    return jsonResponse(
      { error: 'AI service unavailable after retries.', detail: (e as Error).message },
      503, origin
    );
  }
}

// ── GET /news — RSS financial news ──

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

function parseRSS(xmlText: string, label: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

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

async function handleNews(request: Request, origin: string): Promise<Response> {
  const url = new URL(request.url);
  const market = url.searchParams.get('market') || 'br';
  const feeds = RSS_FEEDS[market] || RSS_FEEDS.br;
  const allItems: NewsItem[] = [];

  await Promise.allSettled(
    feeds.map(async (feed) => {
      try {
        const res = await fetchWithRetry(
          feed.url,
          { headers: { 'User-Agent': 'farpa.ai/4.1 RSS Reader' }, timeout: 5000 },
          3
        );
        if (!res.ok) return;
        const text = await res.text();
        allItems.push(...parseRSS(text, feed.label));
      } catch (e) {
        console.warn(`RSS error [${feed.label}]:`, (e as Error).message);
      }
    })
  );

  const seen = new Set<string>();
  const unique = allItems
    .filter(i => { if (seen.has(i.title)) return false; seen.add(i.title); return true; })
    .sort((a, b) => (b.pubDate ? new Date(b.pubDate).getTime() : 0) - (a.pubDate ? new Date(a.pubDate).getTime() : 0))
    .slice(0, 8);

  return jsonResponse({ items: unique, market, count: unique.length }, 200, origin);
}

// ── GET /markets — Public market APIs (B3 / NYSE / Crypto / Indices) ──

async function handleMarkets(request: Request, origin: string): Promise<Response> {
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
        { headers: { 'User-Agent': 'farpa.ai/4.1', Accept: 'application/json' } },
        MAX_RETRIES
      );
      const data = await res.json() as Record<string, unknown>;
      const results = (data?.quoteResponse as Record<string, unknown>)?.result || [];
      return jsonResponse({ source, data: results, count: (results as unknown[]).length, timestamp: new Date().toISOString() }, 200, origin);
    }

    return jsonResponse({ error: 'Unknown source. Use: crypto, b3, nyse, indices' }, 400, origin);
  } catch (e) {
    return jsonResponse(
      { error: `Market data unavailable after ${MAX_RETRIES} retries.`, detail: (e as Error).message },
      503, origin
    );
  }
}

// ── GET /yahoo — Yahoo Finance chart/quote proxy ──

async function handleYahoo(request: Request, origin: string): Promise<Response> {
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
      { headers: { 'User-Agent': 'farpa.ai/4.1', Accept: 'application/json' } },
      MAX_RETRIES
    );
    const data = await res.json() as Record<string, unknown>;
    const result = type === 'quote'
      ? (data?.quoteResponse as Record<string, unknown>)?.result || []
      : (data?.chart as Record<string, unknown>)?.result?.[0] || null;

    return jsonResponse({ symbol, type, range, interval, data: result, timestamp: new Date().toISOString() }, 200, origin);
  } catch (e) {
    return jsonResponse({ error: 'Yahoo Finance unavailable.', detail: (e as Error).message }, 503, origin);
  }
}

// ── Main Export ──

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
      case pathname === '/health':
        return jsonResponse({
          status: 'ok',
          version: '4.1.0',
          routes: ['POST /ai', 'GET /news', 'GET /markets', 'GET /yahoo'],
          timestamp: new Date().toISOString(),
        });
      default:
        return jsonResponse(
          { error: 'Route not found.', routes: ['POST /ai', 'GET /news', 'GET /markets', 'GET /yahoo', 'GET /health'] },
          404, origin
        );
    }
  },
} satisfies ExportedHandler<Env>;
