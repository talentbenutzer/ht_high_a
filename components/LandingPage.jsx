import { useEffect, useState } from 'react'
import Script from 'next/script'
import { translations } from '../lib/translations'

const LIFELINE_VIDEO_URL = '/videos/lifeline.mp4'

const getCurrentDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export default function LandingPage() {
  const [language, setLanguage] = useState('de')
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

  // Language switcher handler
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', newLang)
    }
  }

  // Get current translations
  const t = translations[language]

  useEffect(() => {
    setIsVideoMounted(true)

    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'de'
    setLanguage(savedLanguage)

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



  }, [language])
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
      newErrors.name = language === 'de' ? 'Name erforderlich' : 'Name required'
    }

    if (!formData.email.trim()) {
      newErrors.email = language === 'de' ? 'E-Mail erforderlich' : 'Email required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'de' ? 'Ungültige E-Mail' : 'Invalid email'
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
            language: navigator.language,
            languagePreference: language
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          sessionStorage.setItem('contactData', JSON.stringify(formData));
          sessionStorage.setItem('contactLanguage', language);
          window.location.href = '/success';
        } else {
          setSubmitError(data.error || (language === 'de' ? 'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.' : 'The request could not be sent. Please try again later.'));
        }
      } catch (error) {
        console.error('Submit error:', error);
        setSubmitError(language === 'de' ? 'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.' : 'The request could not be sent. Please try again later.');
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
      <nav className="nav" aria-label={t.nav.ariaLabel}>
        <div className="left">
          <a href="#" className="wordmark" data-screen-label="Wordmark">
            <img src="/images/st_hoellental_in.svg" alt="höllental." />
          </a>
        </div>
        <div></div>
        <div className="right">
          {/* Language Switcher */}
          <div className="lang-switcher">
            <button
              className={`lang-btn ${language === 'de' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('de')}
              aria-label="Deutsch"
              title="Deutsch"
            >
              DE
            </button>
            <span className="lang-separator">/</span>
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
              aria-label="English"
              title="English"
            >
              EN
            </button>
          </div>

          <button
            type="button"
            className={`navlink cta-pill nav-studio-cta${isMainCtaVisible ? ' is-faded' : ''}${isModalOpen ? ' is-hidden' : ''}`}
            onClick={() => setIsModalOpen(true)}
            aria-label={t.cta.button}
            aria-hidden={isModalOpen ? 'true' : undefined}
          >
            <span className="nav-cta-label">{t.nav.studioCall}</span>
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
                 {language === 'de' ? 'HIGH wird geladen' : 'Loading HIGH'}
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
              <span className="meta">{t.hero.meta}</span>
              <span className="dotline"></span>
              <span className="meta">{t.hero.productName}</span>
            </div>

            <div className="hero-reel" id="reel" aria-live="polite">
              {t.hero.reel.map((word, i) => (
                <div key={i} className="hero-word" data-i={i}>{word}</div>
              ))}
            </div>

            <div className="hero-subheadline">
              {language === 'de'
                ? 'HIGH-Board – Interior-Manufaktur für Räume, in denen entschieden wird.'
                : 'HIGH-Board – Interior Manufactory for spaces where decisions are made.'
              }
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
              {language === 'de' ? (
                <>
                  <span className="qa-word qa-from-left" data-qorder="0">Verantwortung</span>{' '}
                  <span className="qa-word qa-fade" data-qorder="1">braucht</span>{' '}
                  <span className="qa-word qa-scale" data-qorder="2">Raum.</span>
                </>
              ) : (
                <>
                  <span className="qa-word qa-from-left" data-qorder="0">Responsibility</span>{' '}
                  <span className="qa-word qa-fade" data-qorder="1">demands</span>{' '}
                  <span className="qa-word qa-scale" data-qorder="2">space.</span>
                </>
              )}
            </h3>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="intro" id="system" data-screen-label="02 Intro" style={{ background: '#000', padding: '120px 0' }}>
        <div className="shell grid12" style={{ alignItems: 'start' }}>

          {/* Top Left Labels */}
          <div className="col-label label-stack intro-left" style={{ marginBottom: '60px' }}>
            <span className="meta signal intro-marginalia" style={{ color: 'var(--bone)', marginTop: '3px' }}>
              {language === 'de'
                ? <>Entstanden im Schwarzwald.<br />Entwickelt für Fokus.</>
                : <>Created in the Black Forest.<br />Designed for Focus.</>
              }
            </span>
          </div>

          {/* Top Right Headline */}
          <div className="intro-right" style={{ marginBottom: '60px' }}>
            <h2 className="intro-anim" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, lineHeight: '1.2', color: 'var(--bone)', margin: 0, textWrap: 'balance' }}>
              {language === 'de'
                ? 'Zwischen Druck und Triumph – ein Möbelstück, das beides aushält.'
                : 'Between pressure and triumph – a furniture piece that withstands both.'
              }
            </h2>
          </div>

          {/* Text links */}
          <div className="intro-paragraphs">
            <p className="intro-anim" style={{ transitionDelay: '150ms' }}>
              {language === 'de'
                ? 'Das HIGH-Board ist kein Möbelstück wie jedes andere. Es ist ein Stück Kontrollierbarkeit – geboren aus der Überforderung von Räumen, die zu viel Unordnung ertragen, und zu wenig Struktur bieten.'
                : 'The HIGH-Board is not just any furniture piece. It is a piece of controllability – born from the overwhelm of spaces that tolerate too much disorder and offer too little structure.'
              }
            </p>
            <p className="intro-anim" style={{ transitionDelay: '225ms' }}>
              {language === 'de'
                ? 'HIGH-Board bringt Ruhe in die Unruhe. Es schafft sichtbare Ablagen für das, was sonst auf dem Schreibtisch endet. Es spaltet einen Arbeitsraum in Bereiche auf, die unterschiedliche Aufgaben erfüllen. Es definiert, wo Fokus stattfindet und wo nicht.'
                : 'HIGH-Board brings calm into chaos. It creates visible surfaces for what would otherwise end up on your desk. It divides a work space into zones that serve different purposes. It defines where focus happens and where it does not.'
              }
            </p>
            <p className="intro-anim" style={{ transitionDelay: '300ms' }}>
              {language === 'de'
                ? 'Die Manufaktur hat es zur Aufgabe gemacht, dieses Gefühl von „ich habe das im Griff" in ein Möbelstück zu übersetzen. Das gelingt nur mit Präzision. Mit Handarbeit. Mit Materialien, die das Versprechen halten.'
                : 'Our manufactory has made it our mission to translate this feeling of "I have this under control" into a furniture piece. This is only possible with precision. With craftsmanship. With materials that keep the promise.'
              }
            </p>
          </div>

          {/* Bild rechts — komplett sichtbar */}
          <div className="intro-image">
            <picture>
              <source media="(max-width: 900px)" srcSet="/images/office_mob.jpg" />
              <img src="/images/office.jpg" alt={language === 'de' ? 'Büro-Setting mit HIGH-Board' : 'Office setting with HIGH-Board'} />
            </picture>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testi" id="stimmen" data-screen-label="05 Stimmen">
        <div className="shell">
          <div className="testi-header-new">
            <div className="testi-title-wrap">
              <h2 className="testi-title">
                {language === 'de'
                  ? <>Unternehmer,<br />die <span className="text-muted">Verantwortung</span> tragen.</>
                  : <>Entrepreneurs<br />who take <span className="text-muted">responsibility</span>.</>
                }
              </h2>
            </div>
          </div>

          <div className="testi-row">
            {t.testimonials.items.map((item, idx) => (
              <article key={idx} className="testi-card">
                <div className="testi-card-top">
                  <div className="testi-avatar">
                    {idx === 0 && <img src="/images/hhf_gehring.jpg" alt={item.name} />}
                    {idx === 1 && <img src="/images/timo_horl.png" alt={item.name} />}
                    {idx === 2 && <img src="/images/christoph_ernst.png" alt={item.name} />}
                  </div>
                  <div className="testi-company-badge">
                    <span className="badge-name">{idx === 0 ? 'Holzhaus Fabrik' : idx === 1 ? 'Horl 1993 GmbH' : 'Büba'}</span>
                  </div>
                </div>
                <div className="testi-quote-icon">"</div>
                <p className="testi-quote">{item.quote}</p>
                <div className="testi-meta">
                  <span className="name">{item.name}</span>
                  <span className="role">{item.role}</span>
                  <span className="location">{item.location}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST-SEKTION */}
      <section className="trust" data-screen-label="Trust">
        <div className="shell">
          <div className="trust-grid">
            <div className="trust-cell">
              <div className="trust-value trust-value--num">{t.trust.hours}</div>
              <div className="trust-label">{t.trust.hoursLabel}</div>
            </div>
            <div className="trust-cell">
              <div className="trust-value trust-value--word">{t.trust.locationValue}</div>
              <div className="trust-label">{t.trust.location}</div>
            </div>
            <div className="trust-cell">
              <div className="trust-value trust-value--word">{t.trust.certValue}</div>
              <div className="trust-label">{t.trust.cert}</div>
            </div>
            <div className="trust-cell">
              <div className="trust-value trust-value--num">{t.trust.experienceValue}</div>
              <div className="trust-label">{t.trust.experience}</div>
            </div>
          </div>
          <div className="trust-price-row">
            <p>{t.trust.priceText}</p>
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
          <h3 className="usp-wald-headline">{t.usp.headline}</h3>
          <p className="usp-wald-sub">{t.usp.intro}</p>
          <div className="usp-wald-body">
            <p>{t.usp.description}</p>
            <p>
              {language === 'de'
                ? <><strong>Regional zertifiziert.</strong> Kurze Transportwege. Geringer CO₂-Fußabdruck. Ein Versprechen, das wir einlösen, nicht nur aussprechen.</>
                : <><strong>Regionally certified.</strong> Short transport routes. Low carbon footprint. A promise we keep, not just make.</>
              }
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
            <h3>{language === 'de' ? 'Sieben Oberflächen. ' : 'Seven finishes. '}<span className="em">{language === 'de' ? 'Jede eine eigene Stimmung.' : 'Each with its own character.'}</span></h3>
            <div className="colorreel-colorname" id="colorReelName">Shadow</div>
          </div>
          <div className="colorreel-progress" id="colorReelProgress"></div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="kontakt" data-screen-label="06 CTA">
        <div className="shell grid12">
          <div className="body">
            <h3>{t.cta.quote}</h3>
            <p style={{ marginBottom: '10px', fontWeight: '500' }}>
              {language === 'de'
                ? 'Wir analysieren ausgewählte CEO- und Unternehmerbüros auf Fokus, Klarheit und Wirkung.'
                : 'We analyze selected CEO and entrepreneur offices for focus, clarity, and impact.'
              }
            </p>
            <p>
              {language === 'de'
                ? <>Eine Konfiguration von Studio höllental. beginnt mit einem persönlichen Analysetermin. Wir sehen, was Sie tun. Wir hören, was Sie brauchen.<br />Erst danach reden wir über Material und Maße.</>
                : <>A configuration by Studio höllental. begins with a personal analysis call. We see what you do. We listen to what you need.<br />Only then do we talk about materials and dimensions.</>
              }
            </p>
            <a href="#" className="cta-button" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>
              {t.cta.button}
              <span className="arrow" aria-hidden="true">→</span>
            </a>
          </div>
          <div className="lhs cta-person">
            <div className="cta-person-img">
              <img src="/images/cf_hoellental.jpeg" alt={t.cta.personName} />
            </div>
            <div className="sales-manager-text">
              <span className="cta-person-name">{t.cta.personName}</span>
              <span className="cta-person-role">{t.cta.personRole}</span>
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
                <li><a href="https://hoellental.studio/de/studio">{language === 'de' ? 'Studio' : 'Studio'}</a></li>
                <li><a href="https://hoellental.studio/de/produkte/bespoke">Bespoke</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>LIFELINE</h5>
              <ul>
                <li><a href="https://hoellental.studio/de/produkte/high">High</a></li>
                <li><a href="https://hoellental.studio/de/produkte/low">Low</a></li>
                <li><a href="https://hoellental.studio/de/produkte/long">Long</a></li>
                <li><a href="https://hoellental.studio/de/produkte/work">Work</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>{language === 'de' ? 'KONTAKT' : 'CONTACT'}</h5>
              <ul>
                <li><a href="mailto:info@hoellental.studio">info@hoellental.studio</a></li>
                <li><a href="tel:+497626977211">+49 7626 977211</a></li>
                <li><a href="#kontakt">{language === 'de' ? 'Studio-Termin' : 'Request a call'}</a></li>
              </ul>
              <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--bone-dim)', lineHeight: '1.6' }}>
                Studio höllental.<br />
                Tüchlinger Weg 1<br />
                79400 Kandern<br />
                {language === 'de' ? 'Deutschland' : 'Germany'}
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
            <a href="https://hoellental.studio/de/impressum">{language === 'de' ? 'Impressum' : 'Imprint'}</a> · <a href="https://hoellental.studio/de/datenschutz">{language === 'de' ? 'Datenschutz' : 'Privacy policy'}</a>
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
                  <h3>{t.form.modalTitle}</h3>
                  <div style={{ margin: '20px 0' }}>
                    <img src="/images/high_end.jpg" alt={t.form.modalTitle} className="modal-img" style={{ width: '100%', height: 'auto', display: 'block' }} />
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
                      <label htmlFor="name">{t.form.nameLabel} *</label>
                      <input
                        type="text"
                        id="name"
                        placeholder={t.form.namePlaceholder}
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
                      <label htmlFor="email">{t.form.emailLabel} *</label>
                      <input
                        type="email"
                        id="email"
                        placeholder={t.form.emailPlaceholder}
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
                      <label htmlFor="phone">{t.form.phoneLabel}</label>
                      <input
                        type="tel"
                        id="phone"
                        placeholder={t.form.phonePlaceholder}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        disabled={isSending}
                        style={{ height: '52px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="topic" style={{ textTransform: 'none' }}>{t.form.topicLabel}</label>
                      <select
                        id="topic"
                        value={formData.topic}
                        onChange={(e) => setFormData({...formData, topic: e.target.value})}
                        disabled={isSending}
                        style={{ background: '#2a2a2a', border: '1px solid #404040', padding: '16px', color: 'var(--bone)', fontFamily: 'inherit', fontSize: '16px', width: '100%', height: '52px' }}
                      >
                        <option value="">{language === 'de' ? 'Bitte wählen' : 'Please select'}</option>
                        {t.form.topicOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <p style={{ fontSize: '11px', color: 'var(--bone-dim)', marginTop: '4px' }}>
                        {language === 'de' ? 'Optional, hilft uns bei der Vorbereitung.' : 'Optional, helps us prepare.'}
                      </p>
                    </div>
                    <div className="form-group">
                      <label htmlFor="message">{t.form.messageLabel}</label>
                      <textarea
                        id="message"
                        placeholder={t.form.messagePlaceholder}
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
                      {isSending ? t.form.buttonSending : t.form.buttonSend}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div style={{ animation: 'modalFadeIn 0.3s forwards', textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', marginBottom: '16px' }}>{t.form.successTitle}</h3>
                <p style={{ fontSize: '16px', color: 'var(--bone)', marginBottom: '30px', lineHeight: '1.4' }}>
                  {t.form.successMessage}
                </p>
                <button className="cta-button" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setIsModalOpen(false); setIsSuccess(false); setFormData({name:'', email:'', phone:'', topic:'', message:'', website:''}); }}>
                  {language === 'de' ? 'Schließen' : 'Close'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
