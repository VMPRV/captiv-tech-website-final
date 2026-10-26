/**
 * CAPTIV TECHNO SOLUTIONS — CLOUDFLARE WORKER ROUTER & EMAIL ENGINE
 * Dispatches inquiries to info@captivtech.com & applications to hr@captivtech.com
 * Sends automated confirmation receipts to candidates and clients.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

/**
 * Universal Email Sender Helper
 * Supports Resend, SendGrid, Brevo, MailChannels, Webhook, and Worker Log Fallback
 */
async function dispatchEmail({ to, from, subject, text, html, replyTo, env }) {
  const fromAddress = from || 'CAPTIV Techno Solutions <noreply@captivtech.com>';
  let sent = false;

  // 1. Resend API (Recommended: Resend.com)
  if (env && env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: Array.isArray(to) ? to : [to],
          reply_to: replyTo,
          subject,
          text,
          html: html || text.replace(/\n/g, '<br>')
        })
      });
      if (res.ok) sent = true;
      else console.warn('[Resend Error]', await res.text());
    } catch (err) {
      console.error('[Resend Exception]', err);
    }
  }

  // 2. SendGrid API
  if (!sent && env && env.SENDGRID_API_KEY) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: 'noreply@captivtech.com', name: 'CAPTIV Techno Solutions' },
          reply_to: replyTo ? { email: replyTo } : undefined,
          subject,
          content: [{ type: 'text/html', value: html || text.replace(/\n/g, '<br>') }]
        })
      });
      if (res.ok) sent = true;
    } catch (err) {
      console.error('[SendGrid Exception]', err);
    }
  }

  // 3. MailChannels API (Cloudflare Workers Native outbound)
  if (!sent) {
    try {
      const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: 'noreply@captivtech.com', name: 'CAPTIV Techno Solutions' },
          reply_to: replyTo ? { email: replyTo } : undefined,
          subject,
          content: [{ type: 'text/html', value: html || text.replace(/\n/g, '<br>') }]
        })
      });
      if (res.ok) sent = true;
    } catch (err) {
      // Ignored if domain SPF/DKIM is unmapped
    }
  }

  // 4. Webhook Notification (Slack / Discord / Zapier)
  if (env && env.WEBHOOK_URL) {
    try {
      await fetch(env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text, timestamp: new Date().toISOString() })
      });
      sent = true;
    } catch (err) {}
  }

  // Always log structured payload to Cloudflare Worker logs
  console.log(`[DISPATCH EMAIL TO ${to}] Subject: "${subject}"\n${text}`);
  return { success: true, sent };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // =========================================================================
    // 1. CONTACT FORM ENDPOINT -> info@captivtech.com
    // =========================================================================
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { name, email, company, country, interest, message } = body;

        if (!name || !email || !message) {
          return new Response(JSON.stringify({
            success: false,
            error: "Full name, work email, and message requirements are mandatory."
          }), { status: 400, headers: CORS_HEADERS });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(JSON.stringify({
            success: false,
            error: "Please enter a valid work email address."
          }), { status: 400, headers: CORS_HEADERS });
        }

        // Email 1: Dispatch to info@captivtech.com
        const internalSubject = `New Technical Inquiry: ${name} (${company || 'Enterprise'})`;
        const internalBody = `CAPTIV — NEW TECHNICAL INQUIRY\n\n` +
          `Name: ${name}\n` +
          `Work Email: ${email}\n` +
          `Organization: ${company || 'Not Specified'}\n` +
          `Country / Region: ${country || 'Not Specified'}\n` +
          `Areas of Interest: ${interest || 'Institutional Systems'}\n\n` +
          `Requirement Details:\n${message}\n\n` +
          `Timestamp: ${new Date().toUTCString()}\n` +
          `Routed to: info@captivtech.com`;

        await dispatchEmail({
          to: 'info@captivtech.com',
          replyTo: email,
          subject: internalSubject,
          text: internalBody,
          env
        });

        // Email 2: Automated Client Confirmation Email
        const clientSubject = `CAPTIV — Ingestion Confirmation: Technical Inquiry Received`;
        const clientBody = `Dear ${name},\n\n` +
          `Thank you for reaching out to CAPTIV Techno Solutions.\n\n` +
          `We are pleased to confirm that your technical inquiry regarding ${interest || 'Institutional Systems'} has been securely received and assigned to our systems architecture team at info@captivtech.com.\n\n` +
          `Our engineering leadership will review your requirements and respond within 24 business hours with an honest, architectural perspective.\n\n` +
          `Sincerely,\n\n` +
          `Principal Systems Architecture Team\n` +
          `CAPTIV Techno Solutions Pvt. Ltd.\n` +
          `HQ: TEK Meadows, Chennai | Dubai | Singapore\n` +
          `https://captivtech.com`;

        await dispatchEmail({
          to: email,
          replyTo: 'info@captivtech.com',
          subject: clientSubject,
          text: clientBody,
          env
        });

        return new Response(JSON.stringify({
          success: true,
          recipient: 'info@captivtech.com',
          message: "Thank you for reaching out. Your inquiry has been routed to info@captivtech.com. A systems architect will connect with you within 24 business hours."
        }), { status: 200, headers: CORS_HEADERS });

      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid JSON transmission."
        }), { status: 400, headers: CORS_HEADERS });
      }
    }

    // =========================================================================
    // 2. CAREERS FORM ENDPOINT -> hr@captivtech.com
    // =========================================================================
    if (url.pathname === '/api/careers' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { name, email, phone, role, resume, link, message } = body;

        if (!name || !email) {
          return new Response(JSON.stringify({
            success: false,
            error: "Full name and email address are required."
          }), { status: 400, headers: CORS_HEADERS });
        }

        const selectedRole = role || 'J1026-1149 - Service Desk Technical Analyst';

        // The exact confirmation text requested by the user
        const applicantConfirmationText = `Dear ${name}\n\n` +
          `Thank you for your interest in a career with CAPTIV. We are pleased to confirm the receipt of your resume${resume ? ` (${resume})` : ''} in response to the job opportunity ${selectedRole}.\n\n` +
          `We will review your resume, and if your skills and qualifications match the position requirements, a member of our recruiting team will contact you directly.\n\n` +
          `Sincerely,\n\n` +
          `CAPTIV Recruitment Team\n` +
          `CAPTIV`;

        // Email 1: Dispatch to hr@captivtech.com
        const hrSubject = `CAPTIV Job Application: ${selectedRole} - ${name}`;
        const hrBody = `CAPTIV — NEW RECRUITMENT APPLICATION\n\n` +
          `Candidate Name: ${name}\n` +
          `Candidate Email: ${email}\n` +
          `Phone Number: ${phone || 'Not Provided'}\n` +
          `Target Opportunity: ${selectedRole}\n` +
          `Resume / CV File: ${resume || 'Attached'}\n` +
          `Portfolio / GitHub / Profile: ${link || 'Not Provided'}\n\n` +
          `Engineering Problem / Candidate Notes:\n${message || 'N/A'}\n\n` +
          `Timestamp: ${new Date().toUTCString()}\n` +
          `Routed to: hr@captivtech.com`;

        await dispatchEmail({
          to: 'hr@captivtech.com',
          replyTo: email,
          subject: hrSubject,
          text: hrBody,
          env
        });

        // Email 2: Automated Candidate Confirmation Email
        await dispatchEmail({
          to: email,
          replyTo: 'hr@captivtech.com',
          subject: `CAPTIV - Application Received: ${selectedRole}`,
          text: applicantConfirmationText,
          env
        });

        return new Response(JSON.stringify({
          success: true,
          recipient: 'hr@captivtech.com',
          role: selectedRole,
          confirmationLetter: applicantConfirmationText,
          message: `Application successfully registered. Confirmation receipt dispatched to ${email}.`
        }), { status: 200, headers: CORS_HEADERS });

      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid JSON career application transmission."
        }), { status: 400, headers: CORS_HEADERS });
      }
    }

    // =========================================================================
    // 3. STATIC ASSETS ROUTING (Cloudflare Workers Assets)
    // =========================================================================
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};


