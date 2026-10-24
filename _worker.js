export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API endpoints
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json();
        return new Response(JSON.stringify({
          success: true,
          message: "Thank you for reaching out. A CAPTIV systems engineer will connect with you within 24 hours.",
          received: { name: body.name, email: body.email }
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid JSON request" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve static assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};

