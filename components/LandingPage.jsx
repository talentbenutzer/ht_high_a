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
    timeline: 'Noch offen',
    message: '',
    website: '' // Honeypot
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // ── Hero video setup ──────────────────────────────────────────
      ; (function setupHeroVideo() {
        const v = document.getElementById('heroVideo')
        if (!v) return
        const onReady = () => { try { v.pause() } catch (e) { } }
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

        function onScroll() {
          const rect = hero.getBoundingClientRect()
          const total = hero.offsetHeight - window.innerHeight
          const passed = Math.min(Math.max(-rect.top, 0), total)
          const t = total > 0 ? passed / total : 0

          if (bar) bar.style.width = (t * 100) + '%'

          const v = document.getElementById('heroVideo')
          if (v && v.duration && isFinite(v.duration)) {
            const target = Math.max(0, Math.min(v.duration - 0.05, t * 2 * v.duration))
            if (Math.abs(v.currentTime - target) > 0.03) {
              try { v.currentTime = target } catch (e) { }
            }
          }

          const n = words.length
          const idx = Math.min(n - 1, Math.floor(t * 2 * n))
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

        const colors = ['Chocolate', 'Dust', 'Earth', 'Ocean', 'Plant', 'Shadow', 'Sand']
        let lastColorIdx = -1

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

          const target = Math.max(0, Math.min(v.duration - 0.05, t * v.duration))
          if (Math.abs(v.currentTime - target) > 0.03) {
            try { v.currentTime = target } catch (e) { }
          }
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

      // ── Hero entrance (skip if reduced-motion) ────────────────────
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
            <img src="/images/hoellental_logo_black.svg" alt="höllental." />
          </a>
        </div>
        <div></div>
        <div className="right">
          <a href="#high" className="navlink">HIGH</a>
          <a href="#system" className="navlink">Fokus</a>
          <a href="#kollektion" className="navlink">Kollektion</a>
          <a href="#stimmen" className="navlink">Stimmen</a>
          <a href="#kontakt" className="navlink cta-pill">Analyse</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="high" data-screen-label="01 Hero">
        <div className="hero-stage">
          <div className="hero-right" aria-hidden="true">
            <video
              className="hero-video"
              id="heroVideo"
              src="/videos/33.mp4"
              muted
              playsInline
              preload="auto"
            />
          </div>

          <div className="hero-progress" id="heroProgress"></div>

          <div className="hero-left">
            <div className="hero-meta-top">
              <span className="meta">№ 001 · Studio Höllental</span>
              <span className="dotline"></span>
              <span className="meta">Möbelstück HIGH</span>
            </div>

            <div className="hero-prefix">Du möchtest</div>

            <div className="hero-reel" id="reel" aria-live="polite">
              <div className="hero-word" data-i="0">Klarheit.</div>
              <div className="hero-word" data-i="1">Dynamik.</div>
              <div className="hero-word" data-i="2">Fokus.</div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="intro" id="system" data-screen-label="02 Intro" style={{ background: '#000', padding: '120px 0' }}>
        <div className="shell grid12">
          <div className="col-label label-stack" style={{ gridColumn: '1 / 13', marginBottom: '60px' }}>
            <span className="meta" style={{ color: 'var(--mid-2)' }}>№ 02 — Über</span>
            <span className="meta signal" style={{ color: 'var(--bone)', opacity: 0.8 }}>Entstanden im Schwarzwald. Entwickelt für Fokus.</span>
          </div>
          
          <div className="col-body" style={{ gridColumn: '1 / 6' }}>
            <h2 className="intro-anim" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, lineHeight: '1.2', color: 'var(--bone)', marginBottom: '40px' }}>
              Das Interior-Piece ist die Architektur eines Tages, an dem alles <span className="em">stimmen</span> muss.
            </h2>
            <p className="intro-anim" style={{ transitionDelay: '150ms', color: 'var(--bone-dim)', lineHeight: '1.6', marginBottom: '24px' }}>
              Manche Arbeitstage enden mit einem Abschluss. Andere mit einer Entscheidung, die Verantwortung verlangt. HIGH ist für beides gemacht — ein Möbelstück für Räume, in denen Verantwortung getragen und bewusst übernommen wird.
            </p>
            <p className="intro-anim" style={{ transitionDelay: '300ms', color: 'var(--bone-dim)', lineHeight: '1.6' }}>
              Wir bauen für Klarheit. Für die ruhigen Minuten zwischen Sitzungen, für die ersten Stunden des Tages, für den letzten Gedanken am Abend. Es ist Werkzeug, Ritual und Statement zugleich.
            </p>
          </div>
          
          <div style={{ gridColumn: '7 / 13' }}>
            <video
              src="/videos/p1.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{ width: '100%', borderRadius: '12px', display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* USP / DETAIL GRID */}
      <section className="usp">
        <div className="shell">
          <div className="usp-head">
            <div className="lhs">
              <span className="meta">№ 03 — Das Stück</span>
              <h3>Jedes Stück. <span className="em">Ein Einzelstück.</span></h3>
            </div>
          </div>

        </div> {/* Close previous shell */}

        {/* Full width image section */}
        <div style={{ width: '100%', position: 'relative', height: '80vh', marginBottom: '80px' }}>
          <div className="image-slot-wrap" style={{ width: '100%', height: '100%', borderBottom: '1px solid var(--line)', borderTop: '1px solid var(--line)' }}>
            <image-slot id="usp-feature" placeholder="HIGH · Zürich" shape="rect" src="/images/usp-01.jpg" style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>
          <div className="shell" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div className="usp-overlay-text-top" style={{ position: 'absolute', left: 'var(--page-pad)', top: '60px', maxWidth: '600px', pointerEvents: 'auto' }}>
              <h3 style={{ fontSize: 'clamp(32px, 4vw, 56px)', color: 'var(--bone)', fontWeight: '300', lineHeight: '1.1' }}>Material, Ruhe und Präzision stehen im Mittelpunkt</h3>
            </div>
            <div className="usp-overlay-text-bottom" style={{ position: 'absolute', left: 'var(--page-pad)', bottom: '60px', maxWidth: '600px', pointerEvents: 'auto' }}>
              <p style={{ color: 'var(--bone-dim)', fontSize: 'clamp(15px, 1.2vw, 18px)', lineHeight: '1.6' }}>
                Ihre Umgebung beeinflusst Entscheidungen - jeden Tag.
              </p>
            </div>
          </div>
        </div>

        <div className="shell"> {/* Open new shell */}

          <div className="usp-text-block" style={{ marginTop: '80px', marginBottom: '40px', maxWidth: '800px' }}>
            <p style={{ fontSize: '20px', lineHeight: '1.6', color: 'var(--bone)', fontWeight: '300' }}>
              Das Highboard vereint durchdachte Funktionalität mit höchstem gestalterischem Anspruch. Seine samtige, pflegeleichte Oberfläche schafft visuelle Ruhe und überzeugt in der Haptik. Zwei Türen mit Tip-on Beschlag öffnen den Blick auf ein durchdachtes Innenleben aus Schubladen, sensorischer Innenbeleuchtung und optionalen Erweiterungen wie einem Weindegustationsset oder einem Humidor mit Wasserbetäubelung.
            </p>
          </div>

          <div className="usp-grid" style={{ marginTop: '40px' }}>
            <article className="usp-cell" style={{ gridColumn: 'span 4' }}>
              <div className="image-slot-wrap" style={{ width: '100%', aspectRatio: '4/3', marginBottom: '20px' }}>
                <image-slot placeholder="Samtige Oberfläche" shape="rect" style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
              <h4>Samtige Oberfläche</h4>
              <p style={{ minHeight: '3em' }}>Schafft visuelle Ruhe und überzeugt in der Haptik.</p>
            </article>
            <article className="usp-cell" style={{ gridColumn: 'span 4' }}>
              <div className="image-slot-wrap" style={{ width: '100%', aspectRatio: '4/3', marginBottom: '20px' }}>
                <image-slot placeholder="Tip-on & Beleuchtung" shape="rect" style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
              <h4>Tip-on & Licht</h4>
              <p style={{ minHeight: '3em' }}>Sensorische Innenbeleuchtung und durchdachte Schubladen.</p>
            </article>
            <article className="usp-cell" style={{ gridColumn: 'span 4' }}>
              <div className="image-slot-wrap" style={{ width: '100%', aspectRatio: '4/3', marginBottom: '20px' }}>
                <image-slot placeholder="Erweiterungen" shape="rect" style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
              <h4>Exklusive Optionen</h4>
              <p style={{ minHeight: '3em' }}>Weindegustationsset oder Humidor mit Wasserbetäubelung.</p>
            </article>
          </div>
        </div>
      </section>

      {/* QUOTE BANNER */}
      <section className="quote-banner">
        <div className="shell grid12">
          <div className="lhs"><span className="meta">№ 04</span></div>
          <div className="body">
            <h3 className="quote-animated">
              <span className="qa-word qa-from-left" data-qorder="0">Zwischen</span>&nbsp;
              <span className="qa-word qa-from-top" data-qorder="1">Druck</span>&nbsp;
              <span className="qa-word qa-fade" data-qorder="2">und</span>&nbsp;
              <span className="qa-word qa-scale em" data-qorder="3">Triumph</span>&nbsp;
              <span className="qa-word qa-fade" data-qorder="4">—</span>&nbsp;
              <span className="qa-word qa-fade" data-qorder="5">ein</span>&nbsp;
              <span className="qa-word qa-fade" data-qorder="6">Möbelstück,</span>&nbsp;
              <span className="qa-word qa-fade" data-qorder="7">das</span>&nbsp;
              <span className="qa-beides" data-qorder="8">
                <span className="qa-bei qa-from-top">bei</span>
                <span className="qa-des qa-from-bottom">des</span>
              </span>&nbsp;
              <span className="qa-word qa-fade" data-qorder="9">aushält.</span>
            </h3>
          </div>
        </div>
      </section>

      {/* COLORREEL */}
      <section className="colorreel" id="kollektion" data-screen-label="04 Kollektion">
        <div className="colorreel-stage">
          <video
            className="colorreel-video"
            id="colorReelVideo"
            src="/videos/cho.mp4"
            muted
            playsInline
            preload="auto"
          />
          <div className="colorreel-caption">
            <span className="meta">№ 04 — Kollektion</span>
            <h3>Sieben Oberflächen. <span className="em">Jede eine eigene Stimmung.</span></h3>
            <div className="colorreel-colorname" id="colorReelName">Chocolate</div>
          </div>
          <div className="colorreel-progress" id="colorReelProgress"></div>
        </div>
      </section>

      {/* COLOR CHOOSER */}
      <section className="colors" id="farben" data-screen-label="05 Farben" style={{ display: 'none' }}>
        <div className="shell">
          <div className="colors-head">
            <div className="lhs">
              <span className="meta">№ 04 — Material</span>
              <h3>Sieben <span className="em">Oberflächen</span>. Eine Entscheidung.</h3>
            </div>
            <div className="rhs">
              <p>Jeder Farbton ist eine eigene Stimmung. Wählen Sie die Oberfläche, mit der HIGH in Ihrem Raum stehen soll.</p>
            </div>
          </div>

          <div className="swatches" role="tablist" aria-label="Farbauswahl">
            <button type="button" className="swatch is-active" role="tab" aria-selected="true"
              data-color="#3a2e22" data-on="#f3f1ec">
              <span className="sw-fill" style={{ background: '#3a2e22' }}></span>
              <span className="sw-meta">
                <span className="sw-rule"></span>
                <span className="sw-num">01</span>
                <span className="sw-name">Earth</span>
              </span>
            </button>
            <button type="button" className="swatch" role="tab" aria-selected="false"
              data-color="#b8a994" data-on="#1a1a1a">
              <span className="sw-fill" style={{ background: '#b8a994' }}></span>
              <span className="sw-meta">
                <span className="sw-rule"></span>
                <span className="sw-num">02</span>
                <span className="sw-name">Dust</span>
              </span>
            </button>
            <button type="button" className="swatch" role="tab" aria-selected="false"
              data-color="#0e0e0e" data-on="#f3f1ec">
              <span className="sw-fill" style={{ background: '#0e0e0e' }}></span>
              <span className="sw-meta">
                <span className="sw-rule"></span>
                <span className="sw-num">03</span>
                <span className="sw-name">Shadow</span>
              </span>
            </button>
            <button type="button" className="swatch" role="tab" aria-selected="false"
              data-color="#1d2d3a" data-on="#f3f1ec">
              <span className="sw-fill" style={{ background: '#1d2d3a' }}></span>
              <span className="sw-meta">
                <span className="sw-rule"></span>
                <span className="sw-num">04</span>
                <span className="sw-name">Ocean</span>
              </span>
            </button>
            <button type="button" className="swatch" role="tab" aria-selected="false"
              data-color="#2f3a2a" data-on="#f3f1ec">
              <span className="sw-fill" style={{ background: '#2f3a2a' }}></span>
              <span className="sw-meta">
                <span className="sw-rule"></span>
                <span className="sw-num">05</span>
                <span className="sw-name">Plant</span>
              </span>
            </button>
            <button type="button" className="swatch" role="tab" aria-selected="false"
              data-color="#7a7873" data-on="#1a1a1a">
              <span className="sw-fill" style={{ background: '#7a7873' }}></span>
              <span className="sw-meta">
                <span className="sw-rule"></span>
                <span className="sw-num">06</span>
                <span className="sw-name">Sand</span>
              </span>
            </button>
            <button type="button" className="swatch" role="tab" aria-selected="false"
              data-color="#3b2418" data-on="#f3f1ec">
              <span className="sw-fill" style={{ background: '#3b2418' }}></span>
              <span className="sw-meta">
                <span className="sw-rule"></span>
                <span className="sw-num">07</span>
                <span className="sw-name">Chocolate</span>
              </span>
            </button>
          </div>

          <div className="colors-foot">
            <span className="meta current-meta">Aktuell — <span id="currentName">Earth</span></span>
            <span className="meta">HIGH · Edition I</span>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testi" id="stimmen" data-screen-label="05 Stimmen">
        <div className="shell">
          <div className="testi-header-new">
            <div className="testi-title-wrap">
              <span className="testi-sub">STIMMEN</span>
              <h2 className="testi-title">Unternehmer, die <span className="text-muted">Verantwortung</span> tragen.</h2>
            </div>
            <div className="testi-nav">
              <button className="testi-nav-btn prev" aria-label="Previous">←</button>
              <button className="testi-nav-btn next" aria-label="Next">→</button>
            </div>
          </div>

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
                Genau die Art von Zusammenarbeit, die wir schätzen
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
                Das Ergebnis passt heute perfekt zu meinem Alltag
              </p>
              <div className="testi-meta">
                <span className="name">Timo Horl</span>
                <span className="role">Founder, Horl 1993 GmbH</span>
                <span className="location">Weltweit erfolgreiches Premiumbrand</span>
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
                Das Gesamtbild passt einfach
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

      {/* CTA */}
      <section className="cta" id="kontakt" data-screen-label="06 CTA">
        <div className="shell grid12">
          <div className="lhs label-stack">
            <span className="meta">№ 06 — Analyse</span>
            <span className="meta signal">Persönlich</span>
          </div>
          <div className="body">
            <h3>Mit Sicherheit die beste <span className="em">Entscheidung</span> des Tages</h3>
            <p style={{ marginBottom: '10px', fontWeight: '500' }}>Wir analysieren ausgewählte CEO- und Unternehmerbüros auf Fokus, Klarheit und Wirkung.</p>
            <p>Eine Studio höllental-Konfiguration beginnt mit einem 30-minütigen Analysetermin. Wir sehen, was Sie tun. Wir hören, was Sie brauchen. Erst danach reden wir über Material, Maße und Termin.</p>
            <a href="#" className="cta-button" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>
              30-minütigen Analysetermin anfragen
              <span className="arrow" aria-hidden="true">→</span>
            </a>
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
                <li><a href="#kontakt">Termin buchen</a></li>
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
          <span>© 2026 Studio höllental Interiors</span>
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
                  <h3>Analysetermin anfragen</h3>
                  <p style={{ fontSize: '14px', color: 'var(--bone-dim)', marginBottom: '24px', lineHeight: '1.5' }}>
                    Wir melden uns persönlich bei Ihnen, um zu prüfen, ob HIGH zu Ihrem Büro, Ihren Abläufen und Ihren Anforderungen passt.
                  </p>
                  <div className="trust-points" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--bone-dim)', fontSize: '14px' }}>
                      <span style={{ color: 'var(--bone)' }}>—</span> Persönliche Rückmeldung
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--bone-dim)', fontSize: '14px' }}>
                      <span style={{ color: 'var(--bone)' }}>—</span> Kein Newsletter
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--bone-dim)', fontSize: '14px' }}>
                      <span style={{ color: 'var(--bone)' }}>—</span> Keine Weitergabe Ihrer Daten
                    </div>
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
                      <label htmlFor="phone">Telefonnummer</label>
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
                      <label htmlFor="timeline" style={{ textTransform: 'none' }}>Wann möchten Sie Ihre Arbeitsumgebung verändern?</label>
                      <select 
                        id="timeline" 
                        value={formData.timeline}
                        onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                        disabled={isSending}
                        style={{ background: '#2a2a2a', border: '1px solid #404040', padding: '16px', color: 'var(--bone)', fontFamily: 'inherit', fontSize: '16px', width: '100%', height: '52px' }}
                      >
                        <option value="Noch offen">Noch offen</option>
                        <option value="So bald wie möglich">So bald wie möglich</option>
                        <option value="In den nächsten 3 Monaten">In den nächsten 3 Monaten</option>
                        <option value="In den nächsten 6 Monaten">In den nächsten 6 Monaten</option>
                        <option value="In den nächsten 12 Monaten">In den nächsten 12 Monaten</option>
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
                    
                    <p style={{ fontSize: '11px', color: 'var(--bone-dim)', marginTop: '12px', textAlign: 'center' }}>
                      Wir melden uns persönlich. Kein Newsletter. Keine Weitergabe Ihrer Daten.
                    </p>
                  </form>
                </div>
              </div>
            ) : (
              <div style={{ animation: 'modalFadeIn 0.3s forwards', textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', marginBottom: '16px' }}>Vielen Dank.</h3>
                <p style={{ fontSize: '16px', color: 'var(--bone)', marginBottom: '30px', lineHeight: '1.4' }}>
                  Ihre Anfrage wurde übermittelt. Wir melden uns persönlich bei Ihnen.
                </p>
                <button className="cta-button" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setIsModalOpen(false); setIsSuccess(false); setFormData({name:'', email:'', phone:'', timeline:'Noch offen', message:'', website:''}); }}>
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
