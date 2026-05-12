import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

  try {
    const data = await resend.emails.send({
      from: 'HIGH Landingpage <onboarding@resend.dev>',
      to: 'edmund.laabs@grabner.design',
      subject: `Anfrage via Landingpage HIGH01 von "${name}"`,
      text: mailContent,
      replyTo: email,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Failed to send email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
