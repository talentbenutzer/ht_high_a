// ============================================================
// Produktinhalte – Brew (Premium Barista Workstation)
// ------------------------------------------------------------
// ALLE produktspezifischen Inhalte der Landingpage stehen hier.
// Für ein anderes Produkt muss nur diese Datei (plus Assets in
// public/images bzw. public/videos) ausgetauscht werden.
//
// Quelle der Texte: Produkt-Handout "Brew – the Essential" (PDF).
// Abschnitte ohne PDF-Inhalt sind mit // PLATZHALTER markiert und
// enthalten sichtbare Texte der Form "[BITTE ERGÄNZEN: …]".
// ============================================================

// Präfix, an dem die Seite Platzhaltertexte erkennt (sichtbare Markierung).
export const PLACEHOLDER_PREFIX = '[BITTE ERGÄNZEN'

export const isPlaceholder = (value) =>
  typeof value === 'string' && value.startsWith(PLACEHOLDER_PREFIX)

export const product = {
  id: 'brew',
  name: 'Brew – the Essential',
  shortName: 'Brew',
  series: 'LIFELINE SERIES',
  studio: 'Studio höllental.',
  contactEmail: 'info@hoellental.studio',

  // Kennung im Betreff/Text der Anfrage-Mail (pages/api/contact.js)
  mailTag: 'Landingpage BREW01',

  // SEO / Meta (pages/index.jsx, pages/success.jsx)
  site: {
    url: 'https://brew.hoellental.studio/',
  },
  meta: {
    title: 'Brew – the Essential | Studio Höllental',
    description:
      'Brew – the Essential: die Premium Barista Workstation der LIFELINE SERIES von Studio Höllental. Für Kaffeeliebhaber, Genießer und Experten – flexibel einsetzbar im privaten oder gewerblichen Bereich, auf Events oder Messen.',
  },

  // ── Bilder & Videos ─────────────────────────────────────────
  hero: {
    // video: null  → statisches Bild, Scroll-Scrubbing ist deaktiviert.
    // Für ein Scroll-Video stattdessen z. B.:
    // video: {
    //   desktop: { src: '/videos/<name>-desktop.mp4', poster: '/images/<name>-poster-desktop.jpg' },
    //   mobile:  { src: '/videos/<name>-mobile.mp4',  poster: '/images/<name>-poster-mobile.jpg' },
    // },
    video: null,
    image: {
      desktop: '/images/brew-hero.jpg',
      mobile: '/images/brew-hero-mobile.jpg',
      // Hochformat-Motiv: Möbel sitzt mittig/unten-mittig
      position: { desktop: 'center 30%', mobile: 'center 50%' },
    },
  },
  images: {
    raum: '/images/brew-raum.jpg',
    detailWorktop: '/images/brew-detail-01.jpg', // Oberkante / Arbeitsfläche
    detailTamper: '/images/brew-detail-02.jpg', // Abklopfrahmen mit Metallabdeckplatte, Kabelausschnitt
    detailLight: '/images/brew-detail-03.jpg', // LED-Beleuchtung am Sockel
    modal: '/images/brew-detail-01.jpg',
    success: '/images/brew-hero.jpg',
  },

  // Reihenfolge des Benefits-Rasters: Benefit-Kacheln (Index in benefits.items)
  // und Detailbilder (Schlüssel in images). wide = Bild über zwei Spalten.
  benefitsGrid: [
    { type: 'benefit', index: 0 },
    { type: 'benefit', index: 1 },
    { type: 'image', key: 'detailTamper' },
    { type: 'image', key: 'detailLight' },
    { type: 'benefit', index: 2 },
    { type: 'benefit', index: 3 },
    { type: 'benefit', index: 4 },
    { type: 'benefit', index: 5 },
    { type: 'benefit', index: 6 },
    { type: 'benefit', index: 7 },
    { type: 'image', key: 'detailWorktop', wide: true },
  ],

  // PLATZHALTER – kein Material-Video für Brew vorhanden (null = Platzhalterfläche)
  materialVideo: null,
  // PLATZHALTER – kein Farb-Video für Brew vorhanden (null = Platzhalterfläche)
  colorReelVideo: null,

  // ── Texte ───────────────────────────────────────────────────
  de: {
    hero: {
      meta: 'LIFELINE SERIES · Studio höllental.',
      productName: 'Brew – the Essential',
      reel: ['Kaffeeliebhaber.', 'Genießer.', 'Experten.'],
      subheadline: 'Für Kaffeeliebhaber, Genießer und Experten',
      imageAlt: 'Brew – the Essential mit Siebträgermaschine und Kaffeemühle vor dunkler Holzwand',
      loading: 'Brew wird geladen',
    },
    claim: {
      kicker: 'Deine Genussmomente',
      words: ['Just', 'brew', 'it!'],
    },
    raum: {
      label: 'Im Raum',
      series: 'LIFELINE SERIES',
      headline: 'Die Premium Barista Workstation – flexibel einsetzbar.',
      text: 'Ob als besonderer Benefit für Mitarbeiter, Hotelgäste oder Kunden, im privaten oder gewerblichen Bereich und auch als Highlight auf Events oder Messen, die Premium Barista Workstation ist flexibel einsetzbar.',
      imageAlt: 'Brew – the Essential im Raum',
    },
    benefits: {
      label: 'Brew – the Essential',
      headline: 'Benefits',
      items: [
        { title: 'Kabelmanagement', text: 'Ausschnitt mit Abdeckung für darunterliegenden unsichtbaren Anschluss der E-Geräte' },
        { title: 'Integrierter Abklopfrahmen', text: 'Mit Metallabdeckplatte' },
        { title: 'Herausnehmbare Auffangschale', text: 'Für allzeit saubere Arbeitsbereiche' },
        { title: 'Integrierte LED-Beleuchtung', text: 'Für atmosphärische Wirkung' },
        { title: 'Stauraum', text: 'Für Zubehör und Lagerung der Kaffeebohnen oder Tassen' },
        { title: 'Passgenaue Arbeitsfläche', text: 'Für unterschiedliche Siebträgermaschinen, Kaffeemühlen und Zubehör' },
        { title: 'Flexible Positionierung im Raum', text: 'Durch integrierte Rollen' },
        { title: 'Temper Matte', text: 'Mit Temper Matte' },
      ],
      imageAlts: {
        detailTamper: 'Detail: Arbeitsfläche mit integriertem Abklopfrahmen und Metallabdeckplatte',
        detailLight: 'Detail: integrierte LED-Beleuchtung am Sockel',
        detailWorktop: 'Detail: Oberkante und Arbeitsfläche',
      },
    },
    // PLATZHALTER – Testimonials (keine Kundenstimmen zu Brew im PDF)
    testimonials: {
      title: '[BITTE ERGÄNZEN: Überschrift Kundenstimmen]',
      items: [
        { initials: '?', company: '[BITTE ERGÄNZEN: Firma]', quote: '[BITTE ERGÄNZEN: Kundenzitat zu Brew]', name: '[BITTE ERGÄNZEN: Name]', role: '[BITTE ERGÄNZEN: Position, Firma]', location: '[BITTE ERGÄNZEN: Kurzbeschreibung Firma]' },
        { initials: '?', company: '[BITTE ERGÄNZEN: Firma]', quote: '[BITTE ERGÄNZEN: Kundenzitat zu Brew]', name: '[BITTE ERGÄNZEN: Name]', role: '[BITTE ERGÄNZEN: Position, Firma]', location: '[BITTE ERGÄNZEN: Kurzbeschreibung Firma]' },
        { initials: '?', company: '[BITTE ERGÄNZEN: Firma]', quote: '[BITTE ERGÄNZEN: Kundenzitat zu Brew]', name: '[BITTE ERGÄNZEN: Name]', role: '[BITTE ERGÄNZEN: Position, Firma]', location: '[BITTE ERGÄNZEN: Kurzbeschreibung Firma]' },
      ],
    },
    // PLATZHALTER – Trust-Block (Kennzahlen und Preis nicht im PDF)
    trust: {
      items: [
        { value: '[BITTE ERGÄNZEN: Stunden]', label: '[BITTE ERGÄNZEN: Handarbeitsstunden je Brew]' },
        { value: '[BITTE ERGÄNZEN: Ort]', label: '[BITTE ERGÄNZEN: Fertigungsort]' },
        { value: '[BITTE ERGÄNZEN: Zertifikat]', label: '[BITTE ERGÄNZEN: Zertifikat/Material]' },
        { value: '[BITTE ERGÄNZEN: Jahr]', label: '[BITTE ERGÄNZEN: Gegründet]' },
      ],
      priceText: '[BITTE ERGÄNZEN: Preis-/Verfügbarkeitshinweis (Kauf- und Mietmodelle)]',
    },
    // PLATZHALTER – Material-Abschnitt (usp-wald), kein Brew-Material vorhanden
    material: {
      mediaNote: '[BITTE ERGÄNZEN: Material-Video (Hintergrund)]',
      headline: '[BITTE ERGÄNZEN: Headline Material]',
      intro: '[BITTE ERGÄNZEN: Einleitung Material/Herkunft]',
      paragraphs: [
        '[BITTE ERGÄNZEN: Text Material/Verarbeitung]',
        '[BITTE ERGÄNZEN: Text Nachhaltigkeit/Zertifizierung]',
      ],
    },
    // PLATZHALTER – Farb-Reel (colorreel), keine Oberflächen/Farben im PDF
    colorReel: {
      mediaNote: '[BITTE ERGÄNZEN: Farb-/Oberflächen-Video]',
      headline: '[BITTE ERGÄNZEN: Headline Oberflächen]',
      headlineEm: '[BITTE ERGÄNZEN: Zusatz]',
      colors: ['[BITTE ERGÄNZEN: Farbnamen]'],
    },
    cta: {
      headline: 'Brew – the Essential.',
      text: 'Für mehr Produktinformationen, Kauf- und Mietmodelle oder bespoke Optionen kontaktieren Sie uns.',
      emailLabel: 'E-Mail:',
    },
    form: {
      topicOptions: ['Produktinformationen', 'Kauf- und Mietmodelle', 'Bespoke Optionen'],
      messagePlaceholder: 'Wo und wie möchten Sie Brew einsetzen?',
      modalImageAlt: 'Brew – the Essential, Detail der Arbeitsfläche',
    },
  },

  en: {
    hero: {
      meta: 'LIFELINE SERIES · Studio höllental.',
      productName: 'Brew – the Essential',
      reel: ['Coffee lovers.', 'Connoisseurs.', 'Experts.'],
      subheadline: 'For coffee lovers, connoisseurs and experts',
      imageAlt: 'Brew – the Essential with espresso machine and grinder in front of a dark wooden wall',
      loading: 'Loading Brew',
    },
    claim: {
      kicker: 'Your moments of indulgence',
      words: ['Just', 'brew', 'it!'],
    },
    raum: {
      label: 'In the room',
      series: 'LIFELINE SERIES',
      headline: 'The premium barista workstation – wherever you need it.',
      text: 'Whether as a special benefit for employees, hotel guests or clients, in private or commercial spaces, or as a highlight at events and trade fairs – the premium barista workstation adapts to any setting.',
      imageAlt: 'Brew – the Essential in a room',
    },
    benefits: {
      label: 'Brew – the Essential',
      headline: 'Benefits',
      items: [
        { title: 'Cable management', text: 'Covered cut-out for a concealed connection of all electrical appliances below' },
        { title: 'Integrated knock box frame', text: 'With metal cover plate' },
        { title: 'Removable drip tray', text: 'For a clean workspace at all times' },
        { title: 'Integrated LED lighting', text: 'For an atmospheric effect' },
        { title: 'Storage space', text: 'For accessories and for storing coffee beans or cups' },
        { title: 'Tailored work surface', text: 'For a wide range of espresso machines, grinders and accessories' },
        { title: 'Flexible positioning', text: 'Thanks to integrated castors' },
        { title: 'Tamper mat', text: 'Tamper mat included' },
      ],
      imageAlts: {
        detailTamper: 'Detail: work surface with integrated knock box frame and metal cover plate',
        detailLight: 'Detail: integrated LED lighting at the base',
        detailWorktop: 'Detail: top edge and work surface',
      },
    },
    // PLATZHALTER – Testimonials
    testimonials: {
      title: '[BITTE ERGÄNZEN: Überschrift Kundenstimmen (EN)]',
      items: [
        { initials: '?', company: '[BITTE ERGÄNZEN: Firma]', quote: '[BITTE ERGÄNZEN: Kundenzitat zu Brew (EN)]', name: '[BITTE ERGÄNZEN: Name]', role: '[BITTE ERGÄNZEN: Position, Firma (EN)]', location: '[BITTE ERGÄNZEN: Kurzbeschreibung Firma (EN)]' },
        { initials: '?', company: '[BITTE ERGÄNZEN: Firma]', quote: '[BITTE ERGÄNZEN: Kundenzitat zu Brew (EN)]', name: '[BITTE ERGÄNZEN: Name]', role: '[BITTE ERGÄNZEN: Position, Firma (EN)]', location: '[BITTE ERGÄNZEN: Kurzbeschreibung Firma (EN)]' },
        { initials: '?', company: '[BITTE ERGÄNZEN: Firma]', quote: '[BITTE ERGÄNZEN: Kundenzitat zu Brew (EN)]', name: '[BITTE ERGÄNZEN: Name]', role: '[BITTE ERGÄNZEN: Position, Firma (EN)]', location: '[BITTE ERGÄNZEN: Kurzbeschreibung Firma (EN)]' },
      ],
    },
    // PLATZHALTER – Trust-Block
    trust: {
      items: [
        { value: '[BITTE ERGÄNZEN: Stunden]', label: '[BITTE ERGÄNZEN: Handarbeitsstunden je Brew (EN)]' },
        { value: '[BITTE ERGÄNZEN: Ort (EN)]', label: '[BITTE ERGÄNZEN: Fertigungsort (EN)]' },
        { value: '[BITTE ERGÄNZEN: Zertifikat (EN)]', label: '[BITTE ERGÄNZEN: Zertifikat/Material (EN)]' },
        { value: '[BITTE ERGÄNZEN: Jahr]', label: '[BITTE ERGÄNZEN: Gegründet (EN)]' },
      ],
      priceText: '[BITTE ERGÄNZEN: Preis-/Verfügbarkeitshinweis (EN)]',
    },
    // PLATZHALTER – Material-Abschnitt
    material: {
      mediaNote: '[BITTE ERGÄNZEN: Material-Video (Hintergrund)]',
      headline: '[BITTE ERGÄNZEN: Headline Material (EN)]',
      intro: '[BITTE ERGÄNZEN: Einleitung Material/Herkunft (EN)]',
      paragraphs: [
        '[BITTE ERGÄNZEN: Text Material/Verarbeitung (EN)]',
        '[BITTE ERGÄNZEN: Text Nachhaltigkeit/Zertifizierung (EN)]',
      ],
    },
    // PLATZHALTER – Farb-Reel
    colorReel: {
      mediaNote: '[BITTE ERGÄNZEN: Farb-/Oberflächen-Video]',
      headline: '[BITTE ERGÄNZEN: Headline Oberflächen (EN)]',
      headlineEm: '[BITTE ERGÄNZEN: Zusatz (EN)]',
      colors: ['[BITTE ERGÄNZEN: Farbnamen (EN)]'],
    },
    cta: {
      headline: 'Brew – the Essential.',
      text: 'For more product information, purchase and rental models or bespoke options, please get in touch.',
      emailLabel: 'Email:',
    },
    form: {
      topicOptions: ['Product information', 'Purchase and rental models', 'Bespoke options'],
      messagePlaceholder: 'Where and how would you like to use Brew?',
      modalImageAlt: 'Brew – the Essential, detail of the work surface',
    },
  },
}
