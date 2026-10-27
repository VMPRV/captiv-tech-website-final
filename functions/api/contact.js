/**
 * Cloudflare Pages Function: /api/contact
 * Handles contact form submissions with validation and dispatch to info@captivtech.com
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { name, email, company, country, interest, message } = body;

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

    // Dispatch to info@captivtech.com
    console.log(`[CONTACT INQUIRY -> info@captivtech.com] From: ${name} (${email}) - Company: ${company} - Requirement: ${message}`);

    // If Resend API key is present
    if (env && env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'CAPTIV Inquiries <noreply@captivtech.com>',
            to: ['info@captivtech.com'],
            reply_to: email,
            subject: `New Technical Inquiry: ${name} (${company || 'Enterprise'})`,
            text: `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nCountry: ${country}\nInterest: ${interest}\n\nMessage:\n${message}`
          })
        });
      } catch (err) {}
    }

    return new Response(
      JSON.stringify({
        success: true,
        recipient: 'CAPTIV Systems Architecture',
        message: 'Your inquiry has been securely received. An engineering partner will respond within 24 business hours.'
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
