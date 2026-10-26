/**
 * Cloudflare Pages Function: /api/careers
 * Handles candidate applications, routing to hr@captivtech.com,
 * and generating confirmation receipts.
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { name, email, phone, role, link, message } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name and email are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const selectedRole = role || 'J1026-1149 - Service Desk Technical Analyst';

    const applicantConfirmationText = `Dear ${name}\n\n` +
      `Thank you for your interest in a career with CAPTIV. We are pleased to confirm the receipt of your resume in response to the job opportunity ${selectedRole}.\n\n` +
      `We will review your resume, and if your skills and qualifications match the position requirements, a member of our recruiting team will contact you directly.\n\n` +
      `Sincerely,\n\n` +
      `CAPTIV Recruitment Team\n` +
      `CAPTIV`;

    console.log(`[CAREER APPLICATION -> hr@captivtech.com] Role: ${selectedRole} - Candidate: ${name} (${email})`);

    if (env && env.RESEND_API_KEY) {
      try {
        // Send to HR
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
            text: `Candidate Name: ${name}\nCandidate Email: ${email}\nPhone: ${phone}\nPosition: ${selectedRole}\nProfile: ${link}\n\nNotes:\n${message}`
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
            text: applicantConfirmationText
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

