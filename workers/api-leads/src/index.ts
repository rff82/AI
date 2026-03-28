/**
 * farpa.ai — Cloudflare Worker · api-leads v4.1
 * 
 * Routes:
 *   POST   /api/leads     → Create lead (name, email, phone?, interest?)
 *   GET    /api/leads     → List leads (most recent first, limit 500)
 *   DELETE /api/leads/:id → Delete lead by ID
 *   GET    /health        → Health check
 * 
 * Bindings:
 *   D1: leads-db (table: leads)
 */

interface Env {
  DB: D1Database;
}

interface LeadBody {
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
}

// ── CORS ──

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// ── Validation ──

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Main Export ──

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Health check
    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok', service: 'api-leads', version: '4.1.0' });
    }

    // POST /api/leads — create lead
    if (request.method === 'POST' && url.pathname === '/api/leads') {
      try {
        const body = await request.json() as LeadBody;
        const { name, email, phone, interest } = body;

        if (!name || !email) {
          return jsonResponse({ success: false, error: 'Name and email are required.' }, 400);
        }
        if (!EMAIL_REGEX.test(email)) {
          return jsonResponse({ success: false, error: 'Invalid email address.' }, 400);
        }

        // Check for existing email
        const existing = await env.DB.prepare('SELECT id FROM leads WHERE email = ?').bind(email).first();
        if (existing) {
          return jsonResponse({ success: false, error: 'This email is already registered.' }, 409);
        }

        await env.DB.prepare(
          'INSERT INTO leads (name, email, phone, interest) VALUES (?, ?, ?, ?)'
        ).bind(name, email, phone || null, interest || null).run();

        return jsonResponse({ success: true, message: 'Registration successful!' }, 201);
      } catch (err) {
        console.error('Create lead error:', err);
        return jsonResponse({ success: false, error: 'Internal server error.' }, 500);
      }
    }

    // GET /api/leads — list leads
    if (request.method === 'GET' && url.pathname === '/api/leads') {
      try {
        const limit = parseInt(url.searchParams.get('limit') || '500', 10);
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);
        const results = await env.DB.prepare(
          'SELECT id, name, email, phone, interest, source, created_at FROM leads ORDER BY created_at DESC LIMIT ? OFFSET ?'
        ).bind(Math.min(limit, 500), offset).all();

        return jsonResponse(results);
      } catch (err) {
        console.error('List leads error:', err);
        return jsonResponse({ error: 'Failed to fetch leads.' }, 500);
      }
    }

    // DELETE /api/leads/:id — delete lead
    if (request.method === 'DELETE' && url.pathname.startsWith('/api/leads/')) {
      const id = url.pathname.split('/').pop();
      if (!id || isNaN(Number(id))) {
        return jsonResponse({ error: 'Valid numeric ID required.' }, 400);
      }
      try {
        const result = await env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(Number(id)).run();
        return jsonResponse({
          success: true,
          deleted: result.meta?.changes === 1,
        });
      } catch (err) {
        console.error('Delete lead error:', err);
        return jsonResponse({ error: 'Failed to delete.' }, 500);
      }
    }

    return jsonResponse({ error: 'Route not found.' }, 404);
  },
} satisfies ExportedHandler<Env>;
