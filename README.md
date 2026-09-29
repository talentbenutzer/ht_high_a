# Brew – the Essential · Landingpage

Landingpage für **Brew – the Essential**, die Premium Barista Workstation der LIFELINE SERIES von Studio Höllental.
Ziel-Domain: https://brew.hoellental.studio/ (Next.js 14, Pages Router, Kontaktformular über Resend).

## Lokale Entwicklung

```bash
npm install
cp .env.example .env.local   # Werte eintragen (siehe unten)
npm run dev                  # http://localhost:3000
npm run build                # Produktions-Build prüfen
```

## Wo werden Inhalte gepflegt?

- **`content/product.js`**: alle produktspezifischen Inhalte, also Produktname, Texte DE/EN (Hero, Claim, „Im Raum“, Benefits, CTA), Bild- und Videopfade, Formular-Anliegen, Meta-Daten, Canonical-URL und die Mail-Kennung (`mailTag`).
  Für ein anderes Produkt genügt es, diese Datei und die Assets in `public/images` bzw. `public/videos` auszutauschen.
- **`lib/translations.js`**: generische UI-Texte (Navigation, Formular-Labels, Erfolgsseite).
- **Hero-Video statt Bild:** In `content/product.js` bei `hero.video` die Video- und Posterpfade eintragen (Beispiel steht dort im Kommentar). Mit `video: null` zeigt die Seite das statische Bild ohne Scroll-Scrubbing.

## Offene Platzhalter

Platzhalter erscheinen auf der Seite gelb gestrichelt als `[BITTE ERGÄNZEN: …]` und sind in `content/product.js` mit `// PLATZHALTER` markiert (jeweils DE und EN):

1. **Testimonials** (`testimonials`): Überschrift sowie 3 × Zitat, Name, Position/Firma, Kurzbeschreibung und Firmen-Badge. Optional lässt sich pro Eintrag ein `avatar`-Bildpfad setzen; ohne ihn erscheint ein Initialen-Kreis (`initials`).
2. **Trust-Block** (`trust`): Handarbeitsstunden je Brew, Fertigungsort, Zertifikat/Material, Gründungsjahr und der Preis-/Verfügbarkeitshinweis.
3. **Material-Abschnitt** (`material`, `materialVideo`): Headline, Einleitung, 2 Absätze und das Hintergrund-Video (`materialVideo: '/videos/…mp4'`).
4. **Farb-/Oberflächen-Reel** (`colorReel`, `colorReelVideo`): Headline, Zusatz, Farbnamen (`colors`) und das scroll-gesteuerte Video (`colorReelVideo: '/videos/…mp4'`). Sobald ein Video gesetzt ist, läuft der Abschnitt wieder als Scroll-Reel.
5. Optional **Hero-Video** (`hero.video`), siehe oben.

## Deployment (Vercel)

1. In Vercel **Add New → Project** wählen und dieses Repository importieren. Das Framework (Next.js) wird automatisch erkannt.
2. Unter **Settings → Environment Variables** folgende Variablen setzen:
   - `RESEND_API_KEY`: API-Key von Resend
   - `CONTACT_TO_EMAIL`: Empfänger der Anfragen, mehrere Adressen durch Komma getrennt
   - `RESEND_FROM_EMAIL`: Absender, z. B. `Studio Höllental <noreply@mail.hoellental.studio>` (Domain muss in Resend verifiziert sein)
3. Deployen.
4. Unter **Settings → Domains** die Domain `brew.hoellental.studio` hinzufügen.
5. Beim DNS-Anbieter von `hoellental.studio` einen **CNAME**-Eintrag anlegen: `brew` → `cname.vercel-dns.com`. Danach in Vercel prüfen, ob die Domain als „Valid“ angezeigt wird.

## Indexierung

`brew.hoellental.studio` ist **bewusst auf noindex** gestellt: `middleware.js` setzt dort den Header `X-Robots-Tag: noindex`, und `public/robots.txt` enthält `Disallow: /`.
Zum Freischalten beide Stellen anpassen und die Sitemap (`public/sitemap.xml`) in `robots.txt` referenzieren.
