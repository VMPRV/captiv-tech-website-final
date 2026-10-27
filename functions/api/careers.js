/**
 * Cloudflare Pages Function: /api/careers
 * Handles candidate applications, routing to hr@captivtech.com,
 * and generating confirmation receipts.
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { name, email, phone, role, resume, resumeAttachment, link, message } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name and email are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const selectedRole = role || 'J1026-1149 - Service Desk Technical Analyst';

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

    console.log(`[CAREER APPLICATION -> hr@captivtech.com] Role: ${selectedRole} - Candidate: ${name} (${email}) - Resume: ${resume || 'Attached'}`);

    if (env && env.RESEND_API_KEY) {
      try {
        const emailAttachments = [];
        if (resumeAttachment && resumeAttachment.base64) {
          emailAttachments.push({
            filename: resumeAttachment.filename || resume || 'Candidate_Resume.pdf',
            content: resumeAttachment.base64
          });
        }

        // Send to HR with attachments
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'CAPTIV Recruitment <noreply@captivtech.com>',
            to: ['hr@captivtech.com'],
            reply_to: email,
            subject: `CAPTIV Job Application: ${selectedRole} - ${name}`,
            text: `Candidate Name: ${name}\nCandidate Email: ${email}\nPhone: ${phone}\nPosition: ${selectedRole}\nResume / CV File: ${resume || 'Attached'}\nProfile: ${link}\n\nNotes:\n${message}\n\n[NOTE: Candidate resume file is attached to this email.]`,
            attachments: emailAttachments.length > 0 ? emailAttachments : undefined
          })
        });

        // Send confirmation to Candidate
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'CAPTIV Recruitment Team <noreply@captivtech.com>',
            to: [email],
            reply_to: 'hr@captivtech.com',
            subject: `CAPTIV - Application Received: ${selectedRole}`,
            text: applicantConfirmationText,
            html: applicantConfirmationHtml
          })
        });
      } catch (err) {}
    }

    return new Response(
      JSON.stringify({
        success: true,
        recipient: 'hr@captivtech.com',
        role: selectedRole,
        confirmationLetter: applicantConfirmationText,
        message: `Your application has been routed to hr@captivtech.com.`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error processing application.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

