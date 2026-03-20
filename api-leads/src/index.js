export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === "POST" && url.pathname === "/api/leads") {
      try {
        const body = await request.json();
        const { name, email, phone, interest } = body;

        if (!name || !email) {
          return Response.json(
            { success: false, error: "Name and email are required." },
            { status: 400, headers: corsHeaders }
          );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return Response.json(
            { success: false, error: "Invalid email address." },
            { status: 400, headers: corsHeaders }
          );
        }

        const existing = await env.DB.prepare(
          "SELECT id FROM leads WHERE email = ?"
        ).bind(email).first();

        if (existing) {
          return Response.json(
            { success: false, error: "This email is already registered." },
            { status: 409, headers: corsHeaders }
          );
        }

        await env.DB.prepare(
          "INSERT INTO leads (name, email, phone, interest) VALUES (?, ?, ?, ?)"
        ).bind(name, email, phone || null, interest || null).run();

        return Response.json(
          { success: true, message: "Registration successful!" },
          { status: 201, headers: corsHeaders }
        );
      } catch (err) {
        return Response.json(
          { success: false, error: "Internal server error." },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    if (request.method === "GET" && url.pathname === "/api/leads") {
      const results = await env.DB.prepare(
        "SELECT id, name, email, phone, interest, created_at FROM leads ORDER BY created_at DESC LIMIT 100"
      ).all();
      return Response.json(results, { headers: corsHeaders });
    }

    return Response.json(
      { error: "Route not found." },
      { status: 404, headers: corsHeaders }
    );
  }
};
