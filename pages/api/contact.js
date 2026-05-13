import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY');
    return res.status(500).json({ error: 'Internal server error' });
  }

  const { name, email, phone, message, pageUrl, language, website, timeline } = req.body;

  // Honeypot check
  if (website) {
    // Stillschweigend erfolgreich antworten bei Spam
    return res.status(200).json({ success: true, message: 'Spam detected' });
  }

  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Bitte geben Sie Ihren Namen ein.' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Bitte geben Sie Ihre E-Mail-Adresse ein.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' });
  }

  // Length limits
  if (name.length > 120) return res.status(400).json({ error: 'Name zu lang.' });
  if (email.length > 180) return res.status(400).json({ error: 'E-Mail zu lang.' });
  if (phone && phone.length > 80) return res.status(400).json({ error: 'Telefonnummer zu lang.' });
  if (message && message.length > 2000) return res.status(400).json({ error: 'Nachricht zu lang.' });

  // Timeline validation
  const allowedTimelines = [
    'Noch offen',
    'So bald wie möglich',
    'In den nächsten 3 Monaten',
    'In den nächsten 6 Monaten',
    'In den nächsten 12 Monaten'
  ];
  const validTimeline = allowedTimelines.includes(timeline) ? timeline : 'Noch offen';

  // IP Address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(/, /)[0] : req.headers['x-real-ip'] || req.socket.remoteAddress;

  // Timestamp
  const timestamp = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

  // Metadata
  const userAgent = req.headers['user-agent'];
  const referrer = req.headers['referer'];

  const mailContent = `
    Neue Anfrage via Landingpage HIGH01
    
    Vor- und Nachname: ${name}
    E-Mail-Adresse: ${email}
    Telefonnummer: ${phone || 'Nicht angegeben'}
    Zeithorizont: ${validTimeline}
    
    Nachricht:
    ${message || 'Keine Nachricht'}
    
    --------------------------------------
    Timestamp: ${timestamp}
    IP-Adresse: ${ip}
    Referrer: ${referrer || 'Nicht vorhanden'}
    Landingpage-URL: ${pageUrl || 'Nicht mitgesendet'}
    User-Agent: ${userAgent}
    Browser-Sprache: ${language || 'Nicht mitgesendet'}
  `;

  const recipients = (process.env.CONTACT_TO_EMAIL || 'sales@hoellental.studio,edmund.laabs@hoellental.studio')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Studio Höllental <noreply@mail.hoellental.studio>';

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject: `Anfrage via Landingpage HIGH01 von "${name}"`,
      text: mailContent,
      replyTo: email,
    });

    // Send confirmation email
    const confirmationText = `Hallo ${name},

Ihre Anfrage ist bei uns eingegangen.

Ihre Daten:

Vor- und Nachname:
${name}

E-Mail-Adresse:
${email}

Telefonnummer:
${phone || "Nicht angegeben"}

Zeithorizont:
${validTimeline || "Noch offen"}

Nachricht:
${message || "Keine Nachricht"}

Mit freundlichen Grüßen,
Ihr Team von Studio Höllental Interiors`;

    const confirmationHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #ffffff; }
    .container { padding: 20px; max-width: 600px; }
    h1 { font-size: 18px; font-weight: normal; margin-bottom: 20px; }
    .label { color: #666666; font-size: 12px; text-transform: uppercase; margin-top: 15px; }
    .value { font-size: 16px; margin-bottom: 5px; }
    .footer { margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 15px; color: #666666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hallo ${name},</h1>
    <p>Ihre Anfrage ist bei uns eingegangen.</p>
    
    <div class="label">Vor- und Nachname:</div>
    <div class="value">${name}</div>
    
    <div class="label">E-Mail-Adresse:</div>
    <div class="value">${email}</div>
    
    <div class="label">Telefonnummer:</div>
    <div class="value">${phone || "Nicht angegeben"}</div>
    
    <div class="label">Zeithorizont:</div>
    <div class="value">${validTimeline || "Noch offen"}</div>
    
    <div class="label">Nachricht:</div>
    <div class="value">${message || "Keine Nachricht"}</div>
    
    <div class="footer">
      Mit freundlichen Grüßen,<br>
      Ihr Team von Studio Höllental Interiors
    </div>
  </div>
</body>
</html>`;

    try {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Ihre Anfrage bei Studio Höllental ist eingegangen',
        text: confirmationText,
        html: confirmationHtml,
      });
    } catch (confError) {
      console.error('Failed to send confirmation email:', confError);
      // Do not fail the request if confirmation fails
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Failed to send email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
