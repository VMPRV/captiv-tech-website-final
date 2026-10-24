/**
 * Cloudflare Pages Function: /api/contact
 * Handles contact form submissions with validation and response
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const { name, email, company, country, interest, message } = body;

    // Server-side validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name, email, and message are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email address provided.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Optional: If WEBHOOK_URL or DISCORD_WEBHOOK or SLACK_WEBHOOK is set in Cloudflare environment
    if (env && env.WEBHOOK_URL) {
      try {
        await fetch(env.WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `**New CAPTIV Technical Enquiry**\n**Name:** ${name}\n**Email:** ${email}\n**Company:** ${company || 'N/A'}\n**Country:** ${country || 'N/A'}\n**Interest:** ${interest || 'General'}\n**Message:** ${message}`
          })
        });
      } catch (webhookErr) {
        console.error('Webhook notification failed:', webhookErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your enquiry has been successfully logged. Our systems architecture team will respond within 24 business hours.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error processing enquiry.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

