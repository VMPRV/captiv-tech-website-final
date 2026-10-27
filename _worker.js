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
async function dispatchEmail({ to, from, subject, text, html, replyTo, attachments, env }) {
  const fromAddress = from || 'CAPTIV Techno Solutions <noreply@captivtech.com>';
  let sent = false;

  // 1. Resend API (Recommended: Resend.com)
  if (env && env.RESEND_API_KEY) {
    try {
      const resendPayload = {
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        reply_to: replyTo,
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>')
      };

      if (attachments && attachments.length > 0) {
        resendPayload.attachments = attachments.map(att => ({
          filename: att.filename,
          content: att.base64 || att.content
        }));
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resendPayload)
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
      const sendGridPayload = {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@captivtech.com', name: 'CAPTIV Techno Solutions' },
        reply_to: replyTo ? { email: replyTo } : undefined,
        subject,
        content: [{ type: 'text/html', value: html || text.replace(/\n/g, '<br>') }]
      };

      if (attachments && attachments.length > 0) {
        sendGridPayload.attachments = attachments.map(att => ({
          content: att.base64 || att.content,
          filename: att.filename,
          type: att.type || 'application/pdf',
          disposition: 'attachment'
        }));
      }

      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sendGridPayload)
      });
      if (res.ok) sent = true;
    } catch (err) {
      console.error('[SendGrid Exception]', err);
    }
  }

  // 3. MailChannels API (Cloudflare Workers Native outbound)
  if (!sent) {
    try {
      const mailChannelsPayload = {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@captivtech.com', name: 'CAPTIV Techno Solutions' },
        reply_to: replyTo ? { email: replyTo } : undefined,
        subject,
        content: [{ type: 'text/html', value: html || text.replace(/\n/g, '<br>') }]
      };

      if (attachments && attachments.length > 0) {
        mailChannelsPayload.attachments = attachments.map(att => ({
          type: att.type || 'application/pdf',
          filename: att.filename,
          content: att.base64 || att.content,
          disposition: 'attachment'
        }));
      }

      const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mailChannelsPayload)
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
          `We are pleased to confirm that your technical inquiry regarding ${interest || 'Institutional Systems'} has been securely received and assigned to our systems architecture team.\n\n` +
          `Our engineering leadership will review your requirements and respond within 24 business hours with an honest, architectural perspective.\n\n` +
          `Sincerely,\n\n` +
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
          recipient: 'CAPTIV Systems Architecture',
          message: "Thank you for reaching out. Your inquiry has been securely received. An engineering partner will connect with you within 24 business hours."
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
        const { name, email, phone, role, resume, resumeAttachment, link, message } = body;

        if (!name || !email) {
          return new Response(JSON.stringify({
            success: false,
            error: "Full name and email address are required."
          }), { status: 400, headers: CORS_HEADERS });
        }

        const selectedRole = role || 'J1026-1149 - Service Desk Technical Analyst';

        // Prepare email attachments array
        const emailAttachments = [];
        if (resumeAttachment && resumeAttachment.base64) {
          emailAttachments.push({
            filename: resumeAttachment.filename || resume || 'Candidate_Resume.pdf',
            type: resumeAttachment.type || 'application/pdf',
            base64: resumeAttachment.base64
          });
        }

        // The exact candidate confirmation text
        const candidateGreeting = name ? `Dear ${name},` : 'Dear Candidate,';
        const applicantConfirmationText = `${candidateGreeting}\n\n` +
          `Thank you for reaching out to CAPTIV Techno Solutions Private Limited and expressing your interest in career opportunities with us.\n\n` +
          `We have received your email and resume successfully. Our HR team will review your profile and contact you if your qualifications and experience match our current job openings.\n\n` +
          `We appreciate your interest in being part of CAPTIV Tech and thank you for considering us for your career journey.\n\n` +
          `Best Regards,\n` +
          `HR Team\n` +
          `CAPTIV Techno Solutions\n` +
          `Excellence Delivered\n` +
          `https://captivtech.com`;

        const applicantConfirmationHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received - CAPTIV Techno Solutions</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 32px 16px; }
    .main { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0, 56, 144, 0.06); }
    .header { padding: 32px 36px 24px 36px; border-bottom: 2px solid #003890; text-align: left; background: #ffffff; }
    .logo { height: 32px; width: auto; display: block; }
    .content { padding: 32px 36px; font-size: 15px; color: #334155; }
    .content p { margin: 0 0 16px 0; }
    .status-card { background: #f8fafc; border-left: 4px solid #003890; border-radius: 6px; padding: 14px 18px; margin: 24px 0; font-size: 14px; border: 1px solid #e2e8f0; border-left-width: 4px; }
    .status-card div { margin-bottom: 4px; }
    .status-card div:last-child { margin-bottom: 0; }
    .signoff { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .tagline { color: #003890; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
    .footer { padding: 20px 36px; background-color: #f8fafc; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <img src="https://captiv-tech-website-final.whitedevilthalapathy.workers.dev/assets/CAPTIV_NEW_BLACK.png" alt="CAPTIV Techno Solutions" class="logo" />
      </div>
      <div class="content">
        <p><strong>${candidateGreeting}</strong></p>
        <p>Thank you for reaching out to <strong>CAPTIV Techno Solutions Private Limited</strong> and expressing your interest in career opportunities with us.</p>
        <p>We have received your email and resume successfully. Our HR team will review your profile and contact you if your qualifications and experience match our current job openings.</p>
        <div class="status-card">
          <div><strong>Position:</strong> ${selectedRole}</div>
          <div><strong>Document:</strong> ${resume || (resumeAttachment ? resumeAttachment.filename : 'Resume / CV Attached')}</div>
          <div><strong>Status:</strong> Successfully Registered &amp; Under Review</div>
        </div>
        <p>We appreciate your interest in being part of CAPTIV Tech and thank you for considering us for your career journey.</p>
        <div class="signoff">
          <p style="margin: 0 0 6px 0;"><strong>Best Regards,</strong></p>
          <p style="margin: 0; color: #0f172a; font-weight: 600;">HR Team</p>
          <p style="margin: 0; color: #475569;">CAPTIV Techno Solutions</p>
          <div class="tagline">Excellence Delivered</div>
          <p style="margin: 8px 0 0 0;"><a href="https://captivtech.com" style="color: #003890; text-decoration: none; font-weight: 500;">https://captivtech.com</a></p>
        </div>
      </div>
      <div class="footer">
        &copy; 2026 CAPTIV Techno Solutions Pvt. Ltd. &middot; TEK Meadows, Tower C, Chennai 600119 &middot; Excellence Delivered
      </div>
    </div>
  </div>
</body>
</html>`;

        // Email 1: Dispatch to hr@captivtech.com with resume attachment
        const hrSubject = `CAPTIV Job Application: ${selectedRole} - ${name}`;
        const hrBody = `CAPTIV — NEW RECRUITMENT APPLICATION\n\n` +
          `Candidate Name: ${name}\n` +
          `Candidate Email: ${email}\n` +
          `Phone Number: ${phone || 'Not Provided'}\n` +
          `Target Opportunity: ${selectedRole}\n` +
          `Attached Resume / CV: ${resume || (resumeAttachment ? resumeAttachment.filename : 'Attached')}\n` +
          `Portfolio / GitHub / Profile: ${link || 'Not Provided'}\n\n` +
          `Engineering Problem / Candidate Notes:\n${message || 'N/A'}\n\n` +
          `Timestamp: ${new Date().toUTCString()}\n` +
          `Routed to: hr@captivtech.com\n\n` +
          `${emailAttachments.length > 0 ? '[NOTE: Candidate resume file is attached to this email.]' : ''}`;

        await dispatchEmail({
          to: 'hr@captivtech.com',
          replyTo: email,
          subject: hrSubject,
          text: hrBody,
          attachments: emailAttachments,
          env
        });

        // Email 2: Automated Candidate Confirmation Email
        await dispatchEmail({
          to: email,
          replyTo: 'hr@captivtech.com',
          subject: `CAPTIV - Application Received: ${selectedRole}`,
          text: applicantConfirmationText,
          html: applicantConfirmationHtml,
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


