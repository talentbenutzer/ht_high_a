import { useEffect, useState } from 'react'
import Script from 'next/script'

const LIFELINE_VIDEO_URL = '/videos/lifeline.mp4'

const getCurrentDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: '',
    message: '',
    website: '' // Honeypot
  })
  const [errors, setErrors] = useState({})
  const [isMobileVideo, setIsMobileVideo] = useState(false)
  const [isVideoMounted, setIsVideoMounted] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMainCtaVisible, setIsMainCtaVisible] = useState(false)

  useEffect(() => {
    setIsVideoMounted(true)
    const checkMobile = () => setIsMobileVideo(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // play/pause init for iOS — Video lädt, spielt kurz an, pausiert für Scroll-Scrubbing
  useEffect(() => {
    const v = document.getElementById('heroVideo');
    if (v && !prefersReducedMotion) {
      setIsVideoLoaded(false);
      v.load();
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          v.pause();
          setIsVideoLoaded(true);
        }).catch(() => {
          // Silently ignore autoplay errors to prevent console noise
        });
      }
    }
  }, [isMobileVideo, prefersReducedMotion]);

  useEffect(() => {
    let timeout;
    if (!isVideoLoaded && !prefersReducedMotion) {
      timeout = setTimeout(() => {
        setIsVideoLoaded(true); // Fallback to hide loader after 5s
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [isVideoLoaded, prefersReducedMotion]);

  // Sticky-CTA ausblenden sobald Haupt-CTA-Block sichtbar ist
  useEffect(() => {
    const target = document.getElementById('kontakt');
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsMainCtaVisible(entry.isIntersecting && entry.intersectionRatio >= 0.3);
        });
      },
      { threshold: [0, 0.3, 0.6] }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // ── Hero video setup ──────────────────────────────────────────
      ; (function setupHeroVideo() {
        const v = document.getElementById('heroVideo')
        if (!v) return
        const onReady = () => { try { v.pause() } catch (e) { } }
        // Ensure video stays paused initially
        v.addEventListener('canplay', onReady, { once: true })
        if (v.readyState >= 1) onReady()
        else v.addEventListener('loadedmetadata', onReady, { once: true })
      })()

      // ── Hero scroll engine ────────────────────────────────────────
      ; (function heroScroll() {
        const hero = document.querySelector('.hero')
        const reel = document.getElementById('reel')
        if (!hero || !reel) return
        const words = [...reel.querySelectorAll('.hero-word')]
        const bar = document.getElementById('heroProgress')
        let lastIdx = -1

        let targetTime = 0
        let currentTime = 0
        let hasInitializedTime = false

        function renderHero() {
          const v = document.getElementById('heroVideo')
          if (v && v.readyState >= 1 && v.duration && isFinite(v.duration)) {
            if (!hasInitializedTime) {
              currentTime = targetTime
              hasInitializedTime = true
            }
            // LERP for smooth scrubbing
            currentTime += (targetTime - currentTime) * 0.08

            if (Math.abs(v.currentTime - currentTime) > 0.01) {
              try { v.currentTime = currentTime } catch (e) { }
            }
          }
          requestAnimationFrame(renderHero)
        }
        requestAnimationFrame(renderHero)

        function onScroll() {
          const rect = hero.getBoundingClientRect()
          const total = hero.offsetHeight - window.innerHeight
          const passed = Math.min(Math.max(-rect.top, 0), total)
          const t = total > 0 ? passed / total : 0

          if (bar) bar.style.width = (t * 100) + '%'

          const v = document.getElementById('heroVideo')
          if (v && v.duration && isFinite(v.duration)) {
            targetTime = Math.max(0, Math.min(v.duration - 0.05, (t / 0.75) * v.duration))
          }

          const n = words.length
          const idx = Math.min(n - 1, Math.floor(t * n))
          if (idx !== lastIdx) {
            words.forEach((w, i) => {
              w.classList.toggle('is-active', i === idx)
              w.classList.toggle('is-past', i < idx)
            })
            lastIdx = idx
          }
        }

        let ticking = false
        window.addEventListener('scroll', () => {
          if (!ticking) {
            requestAnimationFrame(() => { onScroll(); ticking = false })
            ticking = true
          }
        }, { passive: true })
        onScroll()
      })()

      // ── Color chooser ─────────────────────────────────────────────
      ; (function colorChooser() {
        const sec = document.querySelector('.colors')
        if (!sec) return
        const swatches = sec.querySelectorAll('.swatch')
        const nameOut = document.getElementById('currentName')
        function applyColor(s) {
          sec.style.setProperty('--mod-bg', s.dataset.color)
          sec.style.setProperty('--mod-on', s.dataset.on || '#fff')
          if (nameOut) nameOut.textContent = s.querySelector('.sw-name').textContent
        }
        swatches.forEach(s => {
          s.addEventListener('click', () => {
            swatches.forEach(o => { o.classList.remove('is-active'); o.setAttribute('aria-selected', 'false') })
            s.classList.add('is-active'); s.setAttribute('aria-selected', 'true')
            applyColor(s)
          })
        })
        const active = sec.querySelector('.swatch.is-active')
        if (active) applyColor(active)
      })()

      // ── Colorreel scroll engine ───────────────────────────────────
      ; (function colorReelScroll() {
        const section = document.getElementById('kollektion')
        const v = document.getElementById('colorReelVideo')
        const bar = document.getElementById('colorReelProgress')
        const nameEl = document.getElementById('colorReelName')
        if (!section || !v) return

        const colors = ['Shadow', 'Chocolate', 'Earth', 'Ocean', 'Sand', 'Plant', 'Dust']
        let lastColorIdx = -1

        let targetTime = 0
        let currentTime = 0
        let hasInitializedTime = false

        function renderColorReel() {
          if (v.readyState >= 1 && v.duration && isFinite(v.duration)) {
            if (!hasInitializedTime) {
              currentTime = targetTime
              hasInitializedTime = true
            }
            // LERP for smooth scrubbing
            currentTime += (targetTime - currentTime) * 0.08

            if (Math.abs(v.currentTime - currentTime) > 0.01) {
              try { v.currentTime = currentTime } catch (e) { }
            }
          }
          requestAnimationFrame(renderColorReel)
        }
        requestAnimationFrame(renderColorReel)

        function seek() {
          if (!v.duration || !isFinite(v.duration)) return
          const rect = section.getBoundingClientRect()
          const total = section.offsetHeight - window.innerHeight
          const passed = Math.min(Math.max(-rect.top, 0), total)
          const t = total > 0 ? passed / total : 0

          if (bar) bar.style.width = (t * 100) + '%'

          const colorIdx = Math.min(colors.length - 1, Math.floor(t * colors.length))
          if (nameEl && colorIdx !== lastColorIdx) {
            nameEl.textContent = colors[colorIdx]
            lastColorIdx = colorIdx
          }

          targetTime = Math.max(0, Math.min(v.duration - 0.05, t * v.duration))
        }

        v.load()
        v.addEventListener('canplay', () => { try { v.pause() } catch (e) { } seek() }, { once: true })

        let ticking = false
        window.addEventListener('scroll', () => {
          if (!ticking) {
            requestAnimationFrame(() => { seek(); ticking = false })
            ticking = true
          }
        }, { passive: true })
        seek()
      })()

    if (prefersReducedMotion) return

      // ── Hero entrance: prefix fade-in + erstes Wort sichtbar ────
      ; (function heroEntrance() {
        const prefix = document.querySelector('.hero-prefix')
        const words = document.querySelectorAll('.hero-word')
        if (!prefix) return
        setTimeout(() => { prefix.classList.add('is-visible') }, 200)
        setTimeout(() => {
          words.forEach((w, i) => {
            w.classList.toggle('is-active', i === 0)
            w.classList.remove('is-past')
          })
        }, 900)
      })()

      // ── Intro text fade-in ────────────────────────────────────────
      ; (function introAnimate() {
        const els = document.querySelectorAll('.intro-anim')
        if (!els.length) return
        const obs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target) }
          })
        }, { threshold: 0.15 })
        els.forEach(el => obs.observe(el))
      })()

      // ── Quote banner word-by-word ─────────────────────────────────
      ; (function quoteBanner() {
        const section = document.querySelector('.quote-animated')
        if (!section) return
        const words = section.querySelectorAll('[data-qorder]')
        const bei = section.querySelector('.qa-bei')
        const des = section.querySelector('.qa-des')

        const obs = new IntersectionObserver(entries => {
          if (!entries[0].isIntersecting) return
          obs.disconnect()
          words.forEach(el => {
            const delay = parseInt(el.dataset.qorder) * 140
            if (el.classList.contains('qa-beides')) {
              setTimeout(() => { if (bei) bei.classList.add('revealed'); if (des) des.classList.add('revealed') }, delay)
            } else {
              setTimeout(() => el.classList.add('revealed'), delay)
            }
          })
        }, { threshold: 0.4 })
        obs.observe(section.closest('.quote-banner') || section)
      })()



  }, [])
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false)
        setIsSuccess(false)
        setErrors({})
        setSubmitError('')
      }
    }
    if (isModalOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isModalOpen])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    setSubmitError('');
    
    if (!formData.name.trim()) {
      newErrors.name = 'Bitte geben Sie Ihren Namen ein.';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSending(true);
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            pageUrl: window.location.href,
            language: navigator.language
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          sessionStorage.setItem('contactData', JSON.stringify(formData));
          window.location.href = '/success';
        } else {
          setSubmitError(data.error || 'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie direkt an info@hoellental.studio.');
        }
      } catch (error) {
        console.error('Submit error:', error);
        setSubmitError('Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie direkt an info@hoellental.studio.');
      } finally {
        setIsSending(false);
      }
    }
  };
  return (
    <>
      {/* Load custom web component after page render */}
      <Script src="/image-slot.js" strategy="afterInteractive" />

      {/* NAV */}
      <nav className="nav" aria-label="Hauptnavigation">
        <div className="left">
          <a href="#" className="wordmark" data-screen-label="Wordmark">
            <img src="/images/st_hoellental_in.svg" alt="höllental." />
          </a>
        </div>
        <div></div>
        <div className="right">
          <button
            type="button"
            className={`navlink cta-pill nav-studio-cta${isMainCtaVisible ? ' is-faded' : ''}${isModalOpen ? ' is-hidden' : ''}`}
            onClick={() => setIsModalOpen(true)}
            aria-label="Studio-Termin anfragen"
            aria-hidden={isModalOpen ? 'true' : undefined}
          >
            <span className="nav-cta-label">Studio-Termin</span>
            <span className="nav-cta-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="high" data-screen-label="01 Hero">
        <div className="hero-stage">
          <div className="hero-right" aria-hidden="true">
            {!prefersReducedMotion ? (
              <video
                key={isVideoMounted ? (isMobileVideo ? 'mobile' : 'desktop') : 'ssr'}
                className="hero-video"
                id="heroVideo"
                muted
                playsInline
                autoPlay
                preload="auto"
                poster={isVideoMounted && isMobileVideo ? "/images/high-scroll-poster-mobile.jpg" : "/images/high-scroll-poster-desktop.jpg"}
                onLoadedMetadata={(e) => { e.target.pause(); setIsVideoLoaded(true); }}
                onCanPlay={() => { setIsVideoLoaded(true); }}
              >
                <source src={isVideoMounted && isMobileVideo ? "/videos/high-scroll-mobile.mp4" : "/videos/high-scroll-desktop.mp4"} type="video/mp4" />
              </video>
            ) : (
              <img
                src={isVideoMounted && isMobileVideo ? "/images/high-scroll-poster-mobile.jpg" : "/images/high-scroll-poster-desktop.jpg"}
                alt="HIGH"
                className="hero-video"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            )}

            {/* Vignette-Verlauf hinter der Headline für Lesbarkeit auf mittleren Screens */}
            <div className="hero-vignette" aria-hidden="true"></div>

            {!isVideoLoaded && !prefersReducedMotion && (
               <div className="hero-loader" style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, color: 'var(--bone)', fontSize: '11px', letterSpacing: '0.1em', opacity: 0.6, textTransform: 'uppercase' }}>
                 HIGH wird geladen
                 <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.2)', marginTop: '8px', position: 'relative', overflow: 'hidden' }}>
                   <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '30%', background: 'rgba(255,255,255,0.6)', animation: 'loaderSlide 1.5s infinite ease-in-out' }}></div>
                 </div>
               </div>
            )}
            <style jsx>{`
              @keyframes loaderSlide {
                0% { left: -30%; }
                100% { left: 100%; }
              }
            `}</style>
          </div>

          <div className="hero-progress" id="heroProgress"></div>

          <div className="hero-left">
            <div className="hero-meta-top">
              <span className="meta">№ 001 · Studio höllental.</span>
              <span className="dotline"></span>
              <span className="meta">Möbelstück HIGH</span>
            </div>

            <div className="hero-reel" id="reel" aria-live="polite">
              <div className="hero-word" data-i="0">Performance.</div>
              <div className="hero-word" data-i="1">Klarheit.</div>
              <div className="hero-word" data-i="2">Dynamik.</div>
              <div className="hero-word" data-i="3">Fokus.</div>
            </div>

            <div className="hero-subheadline">
              HIGHboard – Manufaktur für Räume, in denen entschieden wird.
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE BANNER */}
      <section className="quote-banner">
        <div className="shell grid12">
          <div className="lhs"></div>
          <div className="body">
            <h3 className="quote-animated">
              <span className="qa-word qa-from-left" data-qorder="0">Verantwortung</span>{' '}
              <span className="qa-word qa-fade" data-qorder="1">braucht</span>{' '}
              <span className="qa-word qa-scale" data-qorder="2">Raum.</span>
            </h3>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="intro" id="system" data-screen-label="02 Intro" style={{ background: '#000', padding: '120px 0' }}>
        <div className="shell grid12" style={{ alignItems: 'start' }}>
          
          {/* Top Left Labels */}
          <div className="col-label label-stack intro-left" style={{ marginBottom: '60px' }}>
            <span className="meta signal intro-marginalia" style={{ color: 'var(--bone)', marginTop: '3px' }}>Entstanden im Schwarzwald.<br />Entwickelt für Fokus.</span>
          </div>
          
          {/* Top Right Headline */}
          <div className="intro-right" style={{ marginBottom: '60px' }}>
            <h2 className="intro-anim" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, lineHeight: '1.2', color: 'var(--bone)', margin: 0, textWrap: 'balance' }}>
              Zwischen Druck und Triumph – ein Möbelstück, das beides aushält.
            </h2>
          </div>
          
          {/* Text links */}
          <div className="intro-paragraphs">
            <p className="intro-anim" style={{ transitionDelay: '150ms' }}>
              Manche Arbeitstage enden mit einem Abschluss. Andere mit einer Entscheidung, die Verantwortung verlangt.
            </p>
            <p className="intro-anim" style={{ transitionDelay: '225ms' }}>
              HIGH ist für beides gemacht – ein Möbelstück für Räume, in denen Verantwortung getragen und bewusst übernommen wird.
            </p>
            <p className="intro-anim" style={{ transitionDelay: '300ms' }}>
              Für die ruhigen Minuten zwischen Sitzungen, für die ersten Stunden des Tages, für den letzten Gedanken am Abend. Es ist Werkzeug, Ritual und Statement zugleich.
            </p>
          </div>

          {/* Bild rechts — komplett sichtbar */}
          <div className="intro-image">
            <img src="/images/sw_office.jpg" alt="Büro-Setting mit HIGHboard" />
          </div>
          
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testi" id="stimmen" data-screen-label="05 Stimmen">
        <div className="shell">
          <div className="testi-header-new">
            <div className="testi-title-wrap">
              <h2 className="testi-title">Unternehmer,<br />die <span className="text-muted">Verantwortung</span> tragen.</h2>
            </div>
          </div>

          {/* TODO: Testimonial-Avatare einheitlich neu produzieren —
              idealerweise B/W-Porträts oder einheitlich gefarbene Aufnahmen,
              gleicher Hintergrund/Setup. Aktuell drei verschiedene Foto-Stile.
              Übergangslösung: CSS grayscale-Filter für visuelle Konsistenz. */}
          <div className="testi-row">
            <article className="testi-card">
              <div className="testi-card-top">
                <div className="testi-avatar">
                  <img src="/images/sascha_gehring.png" alt="Sascha Gehring" />
                </div>
                <div className="testi-company-badge">
                  <span className="badge-name">Holzhaus Fabrik</span>
                </div>
              </div>
              <div className="testi-quote-icon">“</div>
              <p className="testi-quote">
                Sehr klar, sehr hochwertig und bis ins Detail sauber umgesetzt.
                Genau die Art von Zusammenarbeit, die wir schätzen.
              </p>
              <div className="testi-meta">
                <span className="name">Sascha Gehring</span>
                <span className="role">CEO, Holzhaus Fabrik</span>
                <span className="location">Innovationsführer im Holzbau</span>
              </div>
            </article>

            <article className="testi-card">
              <div className="testi-card-top">
                <div className="testi-avatar">
                  <img src="/images/timo_horl.png" alt="Timo Horl" />
                </div>
                <div className="testi-company-badge">
                  <span className="badge-name">Horl 1993 GmbH</span>
                </div>
              </div>
              <div className="testi-quote-icon">“</div>
              <p className="testi-quote">
                Studio höllental. hat sofort verstanden, was uns wichtig ist.
                Das Ergebnis passt heute perfekt zu meinem Alltag.
              </p>
              <div className="testi-meta">
                <span className="name">Timo Horl</span>
                <span className="role">Founder, Horl 1993 GmbH</span>
                <span className="location">Premium-Marke mit weltweitem Erfolg</span>
              </div>
            </article>

            <article className="testi-card">
              <div className="testi-card-top">
                <div className="testi-avatar">
                  <img src="/images/christoph_ernst.png" alt="Christoph Ernst" />
                </div>
                <div className="testi-company-badge">
                  <span className="badge-name">Büba</span>
                </div>
              </div>
              <div className="testi-quote-icon">“</div>
              <p className="testi-quote">
                Klare Gestaltung, starke Materialien und eine sehr angenehme Zusammenarbeit.
                Das Gesamtbild passt einfach.
              </p>
              <div className="testi-meta">
                <span className="name">Christoph Ernst</span>
                <span className="role">CEO, Büba</span>
                <span className="location">Marktführer Gebäudedienstleister</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* TRUST-SEKTION */}
      <section className="trust" data-screen-label="Trust">
        <div className="shell">
          <div className="trust-grid">
            <div className="trust-cell">
              <div className="trust-value trust-value--num">123 Stunden</div>
              <div className="trust-label">Handarbeit je HIGHboard</div>
            </div>
            <div className="trust-cell">
              <div className="trust-value trust-value--word">Schwarzwald</div>
              <div className="trust-label">Hier gefertigt</div>
            </div>
            <div className="trust-cell">
              <div className="trust-value trust-value--word">Regional</div>
              <div className="trust-label">Zertifiziertes Holz</div>
            </div>
            <div className="trust-cell">
              <div className="trust-value trust-value--num">17 Jahre</div>
              <div className="trust-label">Manufaktur-Tradition</div>
            </div>
          </div>
          <div className="trust-price-row">
            <p>Highboard HIGH wird in limitierter Auflage gefertigt. Preise auf Anfrage, im fünfstelligen Bereich.</p>
          </div>
        </div>
      </section>

      {/* USP / MATERIAL — Waldvideo Fullscreen */}
      <section className="usp-wald" data-screen-label="Material">
        {/* Background Video */}
        <video
          className="usp-wald-video"
          src="/videos/heimisch_holz.mp4"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
        />
        {/* Dark Overlay */}
        <div className="usp-wald-overlay" aria-hidden="true" />

        {/* Content */}
        <div className="usp-wald-content">
          <h3 className="usp-wald-headline">Spürbare Präzision.</h3>
          <p className="usp-wald-sub">Jedes Stück HIGHboard beginnt hier: im Schwarzwald.</p>
          <div className="usp-wald-body">
            <p>
              Wir beziehen unser Holz von Waldwirtschaften, die wir kennen. Förster
              mit Namen, Wälder mit Geschichte, Bäume mit Herkunftszertifikat.
              Nicht aus einer Datenbank — aus einer Beziehung.
            </p>
            <p>
              <strong>Regional zertifiziert.</strong> Kurze Transportwege. Geringer CO₂-Fußabdruck.
              Ein Versprechen, das wir einlösen, nicht nur aussprechen.
            </p>
          </div>
        </div>
      </section>

      {/* COLORREEL */}
      <section className="colorreel" id="kollektion" data-screen-label="04 Kollektion">
        <div className="colorreel-stage">
          <video
            className="colorreel-video"
            id="colorReelVideo"
            muted
            playsInline
            preload="auto"
          >
            <source src="/videos/color.mp4" type="video/mp4" />
          </video>
          <div className="colorreel-caption">
            <h3>Sieben Oberflächen. <span className="em">Jede eine eigene Stimmung.</span></h3>
            <div className="colorreel-colorname" id="colorReelName">Chocolate</div>
          </div>
          <div className="colorreel-progress" id="colorReelProgress"></div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="kontakt" data-screen-label="06 CTA">
        <div className="shell grid12">
          <div className="body">
            <h3>Mit Sicherheit die beste Entscheidung des Tages</h3>
            <p style={{ marginBottom: '10px', fontWeight: '500' }}>Wir analysieren ausgewählte CEO- und Unternehmerbüros auf Fokus, Klarheit und Wirkung.</p>
            <p>
              {'Eine Konfiguration von Studio höllental. beginnt mit einem persönlichen Analysetermin. Wir sehen, was Sie tun. Wir hören, was Sie brauchen.'}<br />
              {'Erst danach reden wir über Material und Maße.'}
            </p>
            <a href="#" className="cta-button" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>
              Studio-Termin anfragen
              <span className="arrow" aria-hidden="true">→</span>
            </a>
          </div>
          <div className="lhs" style={{ display: 'flex', alignItems: 'center', gap: '15px', alignSelf: 'flex-end' }}>
            <div style={{ backgroundColor: '#2a2a2a', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '80px', height: '80px', flexShrink: 0, overflow: 'hidden', borderRadius: '50%' }}>
              <img src="/images/cf01q.png" alt="Christian Frei" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div className="sales-manager-text" style={{ fontSize: '11px', color: 'var(--bone-dim)', lineHeight: '1.4', letterSpacing: '0.05em' }}>
              <span style={{ color: 'var(--bone)', fontWeight: '500', fontSize: '13px' }}>Christian Frei</span><br />
              Business Development &<br />Partnership
            </div>
          </div>
        </div>
      </section>



      {/* FOOTER */}
      <footer data-screen-label="07 Footer">
        <div className="foot-grid">
          <div className="foot-mark">
            <img src="/images/hoellental_logo_black.svg" alt="höllental." />
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <h5>STUDIO</h5>
              <ul>
                <li><a href="https://hoellental.studio/de/studio">Studio</a></li>
                <li><a href="https://hoellental.studio/de/produkte/bespoke">Bespoke</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>PIECES</h5>
              <ul>
                <li><a href="https://hoellental.studio/de/produkte/high">High</a></li>
                <li><a href="https://hoellental.studio/de/produkte/low">Low</a></li>
                <li><a href="https://hoellental.studio/de/produkte/long">Long</a></li>
                <li><a href="https://hoellental.studio/de/produkte/work">Work</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>KONTAKT</h5>
              <ul>
                <li><a href="mailto:info@hoellental.studio">info@hoellental.studio</a></li>
                <li><a href="tel:+497626977211">+49 7626 977211</a></li>
                <li><a href="#kontakt">Studio-Termin</a></li>
              </ul>
              <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--bone-dim)', lineHeight: '1.6' }}>
                Studio höllental.<br />
                Tüchlinger Weg 1<br />
                79400 Kandern<br />
                Deutschland
              </div>
            </div>
          </div>
        </div>
        <div className="foot-base">
          <span className="foot-copyright">© 2026 Studio Höllental Interiors</span>
          <span>
            <a href="https://www.instagram.com/hoellental/" target="_blank" rel="noopener noreferrer">Instagram</a> • <a href="https://www.linkedin.com/company/studio-h%C3%B6llental/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </span>
          <span>
            <a href="https://hoellental.studio/de/impressum">Impressum</a> · <a href="https://hoellental.studio/de/datenschutz">Datenschutz</a>
          </span>
        </div>
      </footer>
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsModalOpen(false); setIsSuccess(false); setErrors({}); setSubmitError(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setIsModalOpen(false); setIsSuccess(false); setErrors({}); setSubmitError(''); }}>✕</button>
            
            {!isSuccess ? (
              <div className="modal-grid" style={{ animation: 'modalFadeIn 0.3s forwards' }}>
                <div className="modal-left">
                  <h3>Studio-Termin anfragen</h3>
                  <div style={{ margin: '20px 0' }}>
                    <img src="/images/high_end.jpg" alt="Studio-Termin" className="modal-img" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                </div>
                <div className="modal-right">
                  <form onSubmit={handleSubmit}>
                    {/* Honeypot field */}
                    <div style={{ display: 'none' }}>
                      <label htmlFor="website">Website</label>
                      <input 
                        type="text" 
                        id="website" 
                        value={formData.website} 
                        onChange={(e) => setFormData({...formData, website: e.target.value})} 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="name">Vor- und Nachname *</label>
                      <input 
                        type="text" 
                        id="name" 
                        placeholder="Max Mustermann" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        aria-invalid={errors.name ? 'true' : 'false'}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        disabled={isSending}
                        style={{ height: '52px' }}
                      />
                      {errors.name && <span id="name-error" className="error-text" style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '4px' }}>{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">E-Mail-Adresse *</label>
                      <input 
                        type="email" 
                        id="email" 
                        placeholder="max@unternehmen.de" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        disabled={isSending}
                        style={{ height: '52px' }}
                      />
                      {errors.email && <span id="email-error" className="error-text" style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '4px' }}>{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Telefonnummer (optional)</label>
                      <input
                        type="tel"
                        id="phone"
                        placeholder="optional"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        disabled={isSending}
                        style={{ height: '52px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="topic" style={{ textTransform: 'none' }}>Worum geht es?</label>
                      <select
                        id="topic"
                        value={formData.topic}
                        onChange={(e) => setFormData({...formData, topic: e.target.value})}
                        disabled={isSending}
                        style={{ background: '#2a2a2a', border: '1px solid #404040', padding: '16px', color: 'var(--bone)', fontFamily: 'inherit', fontSize: '16px', width: '100%', height: '52px' }}
                      >
                        <option value="">Bitte wählen</option>
                        <option value="Neues Büro im Aufbau">Neues Büro im Aufbau</option>
                        <option value="Bestehendes Büro neu denken">Bestehendes Büro neu denken</option>
                        <option value="Persönlicher Rückzugsraum">Persönlicher Rückzugsraum</option>
                      </select>
                      <p style={{ fontSize: '11px', color: 'var(--bone-dim)', marginTop: '4px' }}>
                        Optional, hilft uns bei der Vorbereitung.
                      </p>
                    </div>
                    <div className="form-group">
                      <label htmlFor="message">Nachricht</label>
                      <textarea 
                        id="message" 
                        placeholder="Was möchten Sie verändern?" 
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        style={{ minHeight: '90px', maxHeight: '110px', resize: 'vertical', background: '#2a2a2a', border: '1px solid #404040', padding: '16px', color: 'var(--bone)', fontFamily: 'inherit', fontSize: '16px' }}
                        disabled={isSending}
                      />
                    </div>
                    
                    {submitError && (
                      <p style={{ color: '#ff4d4d', fontSize: '14px', marginTop: '10px', marginBottom: '10px' }}>
                        {submitError}
                      </p>
                    )}

                    <button type="submit" className="cta-button" style={{ marginTop: '10px', width: '100%', justifyContent: 'center', height: '64px' }} disabled={isSending}>
                      {isSending ? 'Wird gesendet …' : 'Anfrage senden'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div style={{ animation: 'modalFadeIn 0.3s forwards', textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', marginBottom: '16px' }}>Vielen Dank.</h3>
                <p style={{ fontSize: '16px', color: 'var(--bone)', marginBottom: '30px', lineHeight: '1.4' }}>
                  Ihre Anfrage wurde übermittelt. Wir melden uns persönlich bei Ihnen.
                </p>
                <button className="cta-button" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setIsModalOpen(false); setIsSuccess(false); setFormData({name:'', email:'', phone:'', topic:'', message:'', website:''}); }}>
                  Schließen
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
