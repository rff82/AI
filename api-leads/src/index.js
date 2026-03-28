export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type"};
    if (request.method === "OPTIONS") return new Response(null, {headers:cors});
    if (request.method === "POST" && url.pathname === "/api/leads") {
      try {
        const {name,email,phone,interest} = await request.json();
        if (!name||!email) return Response.json({success:false,error:"Name and email required."},{status:400,headers:cors});
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({success:false,error:"Invalid email."},{status:400,headers:cors});
        const existing = await env.DB.prepare("SELECT id FROM leads WHERE email=?").bind(email).first();
        if (existing) return Response.json({success:false,error:"Email already registered."},{status:409,headers:cors});
        await env.DB.prepare("INSERT INTO leads (name,email,phone,interest) VALUES (?,?,?,?)").bind(name,email,phone||null,interest||null).run();
        return Response.json({success:true},{status:201,headers:cors});
      } catch(e) { return Response.json({success:false,error:"Server error."},{status:500,headers:cors}); }
    }
    if (request.method === "GET" && url.pathname === "/api/leads") {
      const r = await env.DB.prepare("SELECT id,name,email,phone,interest,created_at FROM leads ORDER BY created_at DESC LIMIT 500").all();
      return Response.json(r, {headers:cors});
    }
    if (request.method === "DELETE" && url.pathname.startsWith("/api/leads/")) {
      const id = url.pathname.split("/").pop();
      await env.DB.prepare("DELETE FROM leads WHERE id=?").bind(id).run();
      return Response.json({success:true},{headers:cors});
    }
    return Response.json({error:"Not found."},{status:404,headers:cors});
  }
};
