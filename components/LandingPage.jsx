import { Fragment, useEffect, useState } from 'react'
import { translations } from '../lib/translations'
import { product, isPlaceholder } from '../content/product'

// Animationsklassen für die Wörter des Claim-Banners (zyklisch vergeben)
const CLAIM_WORD_ANIMS = ['qa-from-left', 'qa-fade', 'qa-scale']

// Zusätzliche Klasse für sichtbar markierte Platzhaltertexte
const ph = (value) => (isPlaceholder(value) ? ' is-placeholder' : '')

// Hero-Medien: Scroll-Video nur, wenn im Content hinterlegt (hero.video)
const heroVideo = product.hero.video
const hasHeroVideo = Boolean(heroVideo)

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

  // Get current translations (generische UI) und Produktinhalte
  const t = translations[language]
  const c = product[language]

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
    if (hasHeroVideo && v && !prefersReducedMotion) {
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
    if (hasHeroVideo && !isVideoLoaded && !prefersReducedMotion) {
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
    // Beim Sprachwechsel laeuft der Effekt erneut: Listener, rAF-Schleifen und Timer sauber beenden
    let alive = true
    const cleanups = []
    const cleanup = () => { alive = false; cleanups.forEach(fn => fn()) }

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
          if (alive) requestAnimationFrame(renderHero)
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
        const handleScroll = () => {
          if (!ticking) {
            requestAnimationFrame(() => { onScroll(); ticking = false })
            ticking = true
          }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        cleanups.push(() => window.removeEventListener('scroll', handleScroll))
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

        const colors = c.colorReel.colors
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
          if (alive) requestAnimationFrame(renderColorReel)
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
        const handleScroll = () => {
          if (!ticking) {
            requestAnimationFrame(() => { seek(); ticking = false })
            ticking = true
          }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        cleanups.push(() => window.removeEventListener('scroll', handleScroll))
        seek()
      })()

    if (prefersReducedMotion) return cleanup

      // ── Hero entrance: prefix fade-in + erstes Wort sichtbar ────
      ; (function heroEntrance() {
        const prefix = document.querySelector('.hero-prefix')
        const words = document.querySelectorAll('.hero-word')
        if (!prefix) return
        const t1 = setTimeout(() => { prefix.classList.add('is-visible') }, 200)
        const t2 = setTimeout(() => {
          words.forEach((w, i) => {
            w.classList.toggle('is-active', i === 0)
            w.classList.remove('is-past')
          })
        }, 900)
        cleanups.push(() => { clearTimeout(t1); clearTimeout(t2) })
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
        cleanups.push(() => obs.disconnect())
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
        cleanups.push(() => obs.disconnect())
      })()

    return cleanup
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
      newErrors.name = t.form.validationNameRequired
    }

    if (!formData.email.trim()) {
      newErrors.email = t.form.validationEmailRequired
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.form.validationEmailInvalid
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
          setSubmitError(data.error || t.form.submitError);
        }
      } catch (error) {
        console.error('Submit error:', error);
        setSubmitError(t.form.submitError);
      } finally {
        setIsSending(false);
      }
    }
  };
  return (
    <>
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
      <section className={`hero${hasHeroVideo ? '' : ' hero--image'}`} id={product.id} data-screen-label="01 Hero">
        <div className="hero-stage">
          <div className="hero-right" aria-hidden="true">
            {hasHeroVideo && !prefersReducedMotion ? (
              <video
                key={isVideoMounted ? (isMobileVideo ? 'mobile' : 'desktop') : 'ssr'}
                className="hero-video"
                id="heroVideo"
                muted
                playsInline
                autoPlay
                preload="auto"
                poster={isVideoMounted && isMobileVideo ? heroVideo.mobile.poster : heroVideo.desktop.poster}
                onLoadedMetadata={(e) => { e.target.pause(); setIsVideoLoaded(true); }}
                onCanPlay={() => { setIsVideoLoaded(true); }}
              >
                <source src={isVideoMounted && isMobileVideo ? heroVideo.mobile.src : heroVideo.desktop.src} type="video/mp4" />
              </video>
            ) : hasHeroVideo ? (
              <img
                src={isVideoMounted && isMobileVideo ? heroVideo.mobile.poster : heroVideo.desktop.poster}
                alt={c.hero.imageAlt}
                className="hero-video"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            ) : (
              <picture className="hero-picture">
                <source media="(max-width: 768px)" srcSet={product.hero.image.mobile} />
                <img
                  src={product.hero.image.desktop}
                  alt={c.hero.imageAlt}
                  className="hero-video hero-image"
                  style={{
                    '--hero-pos-desktop': product.hero.image.position.desktop,
                    '--hero-pos-mobile': product.hero.image.position.mobile,
                  }}
                />
              </picture>
            )}

            {/* Vignette-Verlauf hinter der Headline für Lesbarkeit auf mittleren Screens */}
            <div className="hero-vignette" aria-hidden="true"></div>

            {hasHeroVideo && !isVideoLoaded && !prefersReducedMotion && (
               <div className="hero-loader" style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, color: 'var(--bone)', fontSize: '11px', letterSpacing: '0.1em', opacity: 0.6, textTransform: 'uppercase' }}>
                 {c.hero.loading}
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
              <span className="meta">{c.hero.meta}</span>
              <span className="dotline"></span>
              <span className="meta">{c.hero.productName}</span>
            </div>

            <div className="hero-reel" id="reel" aria-live="polite">
              {c.hero.reel.map((word, i) => (
                <div key={i} className="hero-word" data-i={i}>{word}</div>
              ))}
            </div>

            <div className="hero-subheadline">
              {c.hero.subheadline}
            </div>
          </div>
        </div>
      </section>

      {/* CLAIM-BANNER */}
      <section className="quote-banner">
        <div className="shell grid12">
          <div className="lhs"></div>
          <div className="body">
            <span className="meta quote-kicker">{c.claim.kicker}</span>
            <h3 className="quote-animated">
              {c.claim.words.map((word, i) => (
                <Fragment key={i}>
                  {i > 0 && ' '}
                  <span className={`qa-word ${CLAIM_WORD_ANIMS[i % CLAIM_WORD_ANIMS.length]}`} data-qorder={i}>{word}</span>
                </Fragment>
              ))}
            </h3>
          </div>
        </div>
      </section>

      {/* IM RAUM */}
      <section className="intro" id="raum" data-screen-label="02 Im Raum" style={{ background: '#000', padding: '120px 0' }}>
        <div className="shell grid12" style={{ alignItems: 'start' }}>

          {/* Top Left Labels */}
          <div className="col-label label-stack intro-left" style={{ marginBottom: '60px' }}>
            <span className="meta signal intro-marginalia" style={{ color: 'var(--bone)', marginTop: '3px' }}>
              {c.raum.label}<br />{c.raum.series}
            </span>
          </div>

          {/* Top Right Headline */}
          <div className="intro-right" style={{ marginBottom: '60px' }}>
            <h2 className="intro-anim" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, lineHeight: '1.2', color: 'var(--bone)', margin: 0, textWrap: 'balance' }}>
              {c.raum.headline}
            </h2>
          </div>

          {/* Text links */}
          <div className="intro-paragraphs">
            <p className="intro-anim" style={{ transitionDelay: '150ms' }}>
              {c.raum.text}
            </p>
          </div>

          {/* Bild rechts — komplett sichtbar */}
          <div className="intro-image">
            <img src={product.images.raum} alt={c.raum.imageAlt} />
          </div>

        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits" id="benefits" data-screen-label="03 Benefits">
        <div className="shell">
          <div className="benefits-head">
            <span className="meta">{c.benefits.label}</span>
            <h2 className="benefits-title">{c.benefits.headline}</h2>
          </div>
          <div className="benefits-grid">
            {product.benefitsGrid.map((cell, i) => {
              if (cell.type === 'image') {
                return (
                  <figure key={i} className={`benefit-media${cell.wide ? ' benefit-media--wide' : ''}`}>
                    <img src={product.images[cell.key]} alt={c.benefits.imageAlts[cell.key]} loading="lazy" />
                  </figure>
                )
              }
              const item = c.benefits.items[cell.index]
              return (
                <article key={i} className="benefit-tile">
                  <span className="benefit-num">{String(cell.index + 1).padStart(2, '0')}</span>
                  <h3 className="benefit-title">{item.title}</h3>
                  <p className="benefit-text">{item.text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testi" id="stimmen" data-screen-label="05 Stimmen">
        <div className="shell">
          <div className="testi-header-new">
            <div className="testi-title-wrap">
              <h2 className={`testi-title${ph(c.testimonials.title)}`}>{c.testimonials.title}</h2>
            </div>
          </div>

          <div className="testi-row">
            {c.testimonials.items.map((item, idx) => (
              <article key={idx} className="testi-card">
                <div className="testi-card-top">
                  <div className="testi-avatar">
                    {item.avatar
                      ? <img src={item.avatar} alt={item.name} />
                      : <span className="testi-avatar-initials" aria-hidden="true">{item.initials}</span>
                    }
                  </div>
                  <div className="testi-company-badge">
                    <span className={`badge-name${ph(item.company)}`}>{item.company}</span>
                  </div>
                </div>
                <div className="testi-quote-icon">"</div>
                <p className={`testi-quote${ph(item.quote)}`}>{item.quote}</p>
                <div className="testi-meta">
                  <span className={`name${ph(item.name)}`}>{item.name}</span>
                  <span className={`role${ph(item.role)}`}>{item.role}</span>
                  <span className={`location${ph(item.location)}`}>{item.location}</span>
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
            {c.trust.items.map((item, idx) => (
              <div key={idx} className="trust-cell">
                <div className={`trust-value trust-value--word${ph(item.value)}`}>{item.value}</div>
                <div className={`trust-label${ph(item.label)}`}>{item.label}</div>
              </div>
            ))}
          </div>
          <div className="trust-price-row">
            <p className={ph(c.trust.priceText).trim() || undefined}>{c.trust.priceText}</p>
          </div>
        </div>
      </section>

      {/* USP / MATERIAL — Fullscreen-Video (oder Platzhalterfläche) */}
      <section className="usp-wald" data-screen-label="Material">
        {product.materialVideo ? (
          <video
            className="usp-wald-video"
            src={product.materialVideo}
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
          />
        ) : (
          <div className="placeholder media-placeholder" aria-hidden="true">
            <div className="frame"></div>
            <span className="label-pl is-placeholder">{c.material.mediaNote}</span>
          </div>
        )}
        {/* Dark Overlay */}
        <div className="usp-wald-overlay" aria-hidden="true" />

        {/* Content */}
        <div className="usp-wald-content">
          <h3 className={`usp-wald-headline${ph(c.material.headline)}`}>{c.material.headline}</h3>
          <p className={`usp-wald-sub${ph(c.material.intro)}`}>{c.material.intro}</p>
          <div className="usp-wald-body">
            {c.material.paragraphs.map((text, idx) => (
              <p key={idx} className={ph(text).trim() || undefined}>{text}</p>
            ))}
          </div>
        </div>
      </section>

      {/* COLORREEL — scroll-gesteuertes Farb-Video (oder Platzhalterfläche) */}
      <section className={`colorreel${product.colorReelVideo ? '' : ' colorreel--placeholder'}`} id="kollektion" data-screen-label="04 Kollektion">
        <div className="colorreel-stage">
          {product.colorReelVideo ? (
            <video
              className="colorreel-video"
              id="colorReelVideo"
              muted
              playsInline
              preload="auto"
            >
              <source src={product.colorReelVideo} type="video/mp4" />
            </video>
          ) : (
            <div className="placeholder media-placeholder" aria-hidden="true">
              <div className="frame"></div>
              <span className="label-pl is-placeholder">{c.colorReel.mediaNote}</span>
            </div>
          )}
          <div className="colorreel-caption">
            <h3 className={ph(c.colorReel.headline).trim() || undefined}>{c.colorReel.headline}{' '}<span className="em">{c.colorReel.headlineEm}</span></h3>
            <div className={`colorreel-colorname${ph(c.colorReel.colors[0])}`} id="colorReelName">{c.colorReel.colors[0]}</div>
          </div>
          <div className="colorreel-progress" id="colorReelProgress"></div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="kontakt" data-screen-label="06 CTA">
        <div className="shell grid12">
          <div className="body">
            <h3>{c.cta.headline}</h3>
            <p style={{ marginBottom: '10px', fontWeight: '500' }}>
              {c.cta.text}
            </p>
            <p>
              {c.cta.emailLabel} <a className="cta-mail" href={`mailto:${product.contactEmail}`}>{product.contactEmail}</a>
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
                    <img src={product.images.modal} alt={c.form.modalImageAlt} className="modal-img" style={{ width: '100%', height: 'auto', display: 'block' }} />
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
                        <option value="">{t.form.selectPlaceholder}</option>
                        {c.form.topicOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <p style={{ fontSize: '11px', color: 'var(--bone-dim)', marginTop: '4px' }}>
                        {t.form.topicHint}
                      </p>
                    </div>
                    <div className="form-group">
                      <label htmlFor="message">{t.form.messageLabel}</label>
                      <textarea
                        id="message"
                        placeholder={c.form.messagePlaceholder}
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
                  {t.form.close}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
