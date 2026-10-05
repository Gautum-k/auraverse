import nodemailer from 'nodemailer';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getEmailMode() {
  if (process.env.BREVO_API_KEY) return 'Brevo';
  if (process.env.MAIL_USER && process.env.MAIL_PASS) return 'Gmail SMTP';
  return 'off';
}

export async function sendWelcomeEmail({ name, toEmail }) {
  try {
    console.log(`Sending welcome email to ${toEmail}`);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const escapedName = escapeHtml(name);

    const subject = `Welcome to Auraverse, ${name}`;

    const textContent = `Hello ${name},

Welcome to Auraverse. Your account is ready, and here is what you can do.

- Upload your music: add original songs, covers, remixes or demos with a cover image, genre, language and mood.
- Build playlists: save the tracks you love and keep them in your library.
- Find artists: follow artists and see what they are releasing.
- Collaborate: post a request on the collab board, or answer one, to find vocalists, producers and musicians.

Get started
1. Complete your profile with a photo, your city and a short bio.
2. Upload your first track.
3. Follow a few artists and check the collab board.

Open Auraverse: ${clientUrl}

Your profile page is at ${clientUrl}/edit-profile

Regards,
The Auraverse team

You received this email because an account was created on Auraverse with this address. If this was not you, you can ignore this message.`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="background-color: #121212; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px 16px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #121212; padding: 24px; border-radius: 8px;">
    <div style="font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 24px;">Auraverse</div>
    <p style="color: #ffffff; font-size: 16px; margin-bottom: 16px;">Hello ${escapedName},</p>
    <p style="color: #ffffff; font-size: 16px; margin-bottom: 20px;">Welcome to Auraverse. Your account is ready, and here is what you can do.</p>
    
    <ul style="color: #b3b3b3; font-size: 14px; line-height: 1.6; padding-left: 20px; margin-bottom: 24px;">
      <li style="margin-bottom: 8px;"><strong style="color: #ffffff;">Upload your music:</strong> add original songs, covers, remixes or demos with a cover image, genre, language and mood.</li>
      <li style="margin-bottom: 8px;"><strong style="color: #ffffff;">Build playlists:</strong> save the tracks you love and keep them in your library.</li>
      <li style="margin-bottom: 8px;"><strong style="color: #ffffff;">Find artists:</strong> follow artists and see what they are releasing.</li>
      <li style="margin-bottom: 8px;"><strong style="color: #ffffff;">Collaborate:</strong> post a request on the collab board, or answer one, to find vocalists, producers and musicians.</li>
    </ul>

    <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin-bottom: 12px;">Get started</p>
    <ol style="color: #b3b3b3; font-size: 14px; line-height: 1.6; padding-left: 20px; margin-bottom: 24px;">
      <li style="margin-bottom: 6px;">Complete your profile with a photo, your city and a short bio.</li>
      <li style="margin-bottom: 6px;">Upload your first track.</li>
      <li style="margin-bottom: 6px;">Follow a few artists and check the collab board.</li>
    </ol>

    <div style="margin-bottom: 24px;">
      <a href="${clientUrl}" style="background-color: #1ed760; color: #000000; text-decoration: none; padding: 12px 28px; border-radius: 500px; font-weight: bold; font-size: 14px; display: inline-block;">Open Auraverse</a>
    </div>

    <p style="color: #b3b3b3; font-size: 14px; margin-bottom: 24px;">Your profile page is at <a href="${clientUrl}/edit-profile" style="color: #1ed760; text-decoration: underline;">${clientUrl}/edit-profile</a></p>

    <p style="color: #ffffff; font-size: 14px; margin-bottom: 32px;">Regards,<br>The Auraverse team</p>

    <hr style="border: none; border-top: 1px solid #282828; margin-bottom: 16px;" />
    <p style="color: #b3b3b3; font-size: 12px; line-height: 1.4; margin: 0;">You received this email because an account was created on Auraverse with this address. If this was not you, you can ignore this message.</p>
  </div>
</body>
</html>`;

    // 1. Brevo API mode
    if (process.env.BREVO_API_KEY) {
      const rawFrom = process.env.MAIL_FROM || 'noreply@auraverse.com';
      const senderEmail = rawFrom.includes('<') ? rawFrom.split('<')[1].replace('>', '').trim() : rawFrom.trim();
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Auraverse', email: senderEmail },
          to: [{ email: toEmail, name }],
          subject,
          htmlContent,
          textContent,
        }),
      });

      if (!brevoRes.ok) {
        const errData = await brevoRes.json().catch(() => ({}));
        console.error(`Welcome email via Brevo failed to ${toEmail}: ${errData.message || brevoRes.statusText}`);
        return;
      }
      console.log(`Welcome email sent to ${toEmail}`);
      return;
    }

    // 2. Gmail SMTP mode
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      const host = process.env.MAIL_HOST || 'smtp.gmail.com';
      const port = Number(process.env.MAIL_PORT) || 587;
      const user = process.env.MAIL_USER;
      const pass = process.env.MAIL_PASS;
      const from = process.env.MAIL_FROM || user || 'Auraverse <noreply@auraverse.com>';

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`Welcome email sent to ${toEmail}`);
      return;
    }

    // 3. Off mode
    console.log(`Welcome email skipped for ${toEmail}: No email service configured.`);
  } catch (err) {
    console.error(`Welcome email failed to ${toEmail}:`, err.message);
  }
}
