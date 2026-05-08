import { useEffect } from 'react'
import Script from 'next/script'

const LIFELINE_VIDEO_URL = '/videos/lifeline.mp4'

export default function LandingPage() {
  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── Hero video setup ──────────────────────────────────────────
    ;(function setupHeroVideo() {
      const v = document.getElementById('heroVideo')
      if (!v) return
      const onReady = () => { try { v.pause() } catch (e) {} }
      if (v.readyState >= 1) onReady()
      else v.addEventListener('loadedmetadata', onReady, { once: true })
    })()

    // ── Hero scroll engine ────────────────────────────────────────
    ;(function heroScroll() {
      const hero = document.querySelector('.hero')
      const reel = document.getElementById('reel')
      if (!hero || !reel) return
      const words = [...reel.querySelectorAll('.hero-word')]
      const bar   = document.getElementById('heroProgress')
      let lastIdx = -1

      function onScroll() {
        const rect   = hero.getBoundingClientRect()
        const total  = hero.offsetHeight - window.innerHeight
        const passed = Math.min(Math.max(-rect.top, 0), total)
        const t      = total > 0 ? passed / total : 0

        if (bar) bar.style.width = (t * 100) + '%'

        const v = document.getElementById('heroVideo')
        if (v && v.duration && isFinite(v.duration)) {
          const target = Math.max(0, Math.min(v.duration - 0.05, t * v.duration))
          if (Math.abs(v.currentTime - target) > 0.03) {
            try { v.currentTime = target } catch (e) {}
          }
        }

        const n   = words.length
        const idx = Math.min(n - 1, Math.floor(t * n))
        if (idx !== lastIdx) {
          words.forEach((w, i) => {
            w.classList.toggle('is-active', i === idx)
            w.classList.toggle('is-past',   i  <  idx)
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
    ;(function colorChooser() {
      const sec = document.querySelector('.colors')
      if (!sec) return
      const swatches = sec.querySelectorAll('.swatch')
      const nameOut  = document.getElementById('currentName')
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
    ;(function colorReelScroll() {
      const section = document.getElementById('kollektion')
      const v       = document.getElementById('colorReelVideo')
      const bar     = document.getElementById('colorReelProgress')
      const nameEl  = document.getElementById('colorReelName')
      if (!section || !v) return

      const colors = ['Chocolate','Dust','Earth','Ocean','Plant','Shadow','Stone']
      let lastColorIdx = -1

      function seek() {
        if (!v.duration || !isFinite(v.duration)) return
        const rect   = section.getBoundingClientRect()
        const total  = section.offsetHeight - window.innerHeight
        const passed = Math.min(Math.max(-rect.top, 0), total)
        const t      = total > 0 ? passed / total : 0

        if (bar) bar.style.width = (t * 100) + '%'

        const colorIdx = Math.min(colors.length - 1, Math.floor(t * colors.length))
        if (nameEl && colorIdx !== lastColorIdx) {
          nameEl.textContent = colors[colorIdx]
          lastColorIdx = colorIdx
        }

        const target = Math.max(0, Math.min(v.duration - 0.05, t * v.duration))
        if (Math.abs(v.currentTime - target) > 0.03) {
          try { v.currentTime = target } catch (e) {}
        }
      }

      v.load()
      v.addEventListener('canplay', () => { try { v.pause() } catch (e) {} seek() }, { once: true })

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
    ;(function heroEntrance() {
      const prefix = document.querySelector('.hero-prefix')
      const words  = document.querySelectorAll('.hero-word')
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
    ;(function introAnimate() {
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
    ;(function quoteBanner() {
      const section = document.querySelector('.quote-animated')
      if (!section) return
      const words = section.querySelectorAll('[data-qorder]')
      const bei   = section.querySelector('.qa-bei')
      const des   = section.querySelector('.qa-des')

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
          <a href="#high"     className="navlink">HIGH</a>
          <a href="#system"   className="navlink">System</a>
          <a href="#stimmen"  className="navlink">Stimmen</a>
          <a href="#kontakt"  className="navlink cta-pill">Analyse</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="high" data-screen-label="01 Hero">
        <div className="hero-stage">
          <div className="hero-right" aria-hidden="true">
            <video
              className="hero-video"
              id="heroVideo"
              src="/videos/hero01.mp4"
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
      <section className="intro" id="system" data-screen-label="02 Intro">
        <video className="intro-video" src="/videos/s2l.mp4" autoPlay muted loop playsInline preload="auto" />
        <div className="shell grid12">
          <div className="col-label label-stack">
            <span className="meta">№ 02 — Über</span>
            <span className="meta signal">Ein System, kein Möbelstück</span>
          </div>
          <div className="col-body">
            <h2 className="intro-anim">
              HIGH ist die Architektur eines Tages, an dem alles <span className="em">stimmen</span> muss.
            </h2>
            <p className="intro-anim" style={{ transitionDelay: '150ms' }}>
              Manche Arbeitstage enden mit einem Abschluss. Andere mit einer Entscheidung, die niemand sonst treffen wollte.
              HIGH ist für beides gemacht — ein Möbelstück für Räume, in denen Verantwortung getragen, nicht delegiert wird.
            </p>
            <p className="intro-anim" style={{ transitionDelay: '300ms' }}>
              Wir bauen für Klarheit. Für die ruhigen Minuten zwischen Sitzungen, für die ersten Stunden des Tages,
              für den letzten Gedanken am Abend. HIGH ordnet, ohne zu diktieren. Es ist Werkzeug, Ritual und Statement zugleich.
            </p>
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

          <div className="usp-grid">
            <article className="usp-cell" style={{ gridColumn: '1 / -1', minHeight: '80vh' }}>
              <div className="image-slot-wrap" style={{ flex: 1, minHeight: 0 }}>
                <image-slot id="usp-feature" placeholder="HIGH · Zürich" shape="rect" src="/images/usp-01.jpg" />
              </div>
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
              <span className="qa-word qa-from-left"  data-qorder="0">Zwischen</span>&nbsp;
              <span className="qa-word qa-from-top"   data-qorder="1">Druck</span>&nbsp;
              <span className="qa-word qa-fade"       data-qorder="2">und</span>&nbsp;
              <span className="qa-word qa-scale em"   data-qorder="3">Triumph</span>&nbsp;
              <span className="qa-word qa-fade"       data-qorder="4">—</span>&nbsp;
              <span className="qa-word qa-fade"       data-qorder="5">ein</span>&nbsp;
              <span className="qa-word qa-fade"       data-qorder="6">Möbelstück,</span>&nbsp;
              <span className="qa-word qa-fade"       data-qorder="7">das</span>&nbsp;
              <span className="qa-beides"             data-qorder="8">
                <span className="qa-bei qa-from-top">bei</span>
                <span className="qa-des qa-from-bottom">des</span>
              </span>&nbsp;
              <span className="qa-word qa-fade"       data-qorder="9">aushält.</span>
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
                <span className="sw-name">Stone</span>
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
          <div className="testi-head">
            <div className="lhs">
              <span className="meta">№ 05 — Stimmen</span>
            </div>
            <div className="rhs">
              <h3>Unternehmer, die <span className="em">Verantwortung</span> tragen.</h3>
            </div>
          </div>

          <div className="testi-row">
            <article className="testi-card">
              <div className="testi-portrait">
                <image-slot id="t1" placeholder="Porträt — Dr. Anselm Vogt" shape="rect" src="/images/ceo1.jpg" />
              </div>
              <p className="testi-quote">
                HIGH steht in meinem Büro wie eine Linie, an der man Tage ausrichtet —
                ich öffne es nicht oft, aber es ordnet alles, was um ihn herum geschieht
              </p>
              <div className="testi-meta">
                <span className="name">Dr. Anselm Vogt</span>
                <span className="role">CEO · Vogt Industriebeteiligungen</span>
              </div>
            </article>

            <article className="testi-card">
              <div className="testi-portrait">
                <image-slot id="t2" placeholder="Porträt — Marlene Berger" shape="rect" src="/images/ceo2.jpg" />
              </div>
              <p className="testi-quote">
                Ein Möbelstück, das mich zwingt, langsamer zu werden.
                Nach dem Closing einer Übernahme habe ich zum ersten Mal seit Wochen wieder zwei Minuten still gestanden
              </p>
              <div className="testi-meta">
                <span className="name">Marlene Berger</span>
                <span className="role">Geschäftsführerin · Berger &amp; Reith</span>
              </div>
            </article>

            <article className="testi-card">
              <div className="testi-portrait">
                <image-slot id="t3" placeholder="Porträt — Friedrich Kaltenbach" shape="rect" src="/images/ceo3.jpg" />
              </div>
              <p className="testi-quote">
                Wir kaufen kein Möbel — wir kaufen einen Platz im Raum, der nichts beweisen muss.
                HIGH ist die teuerste, leiseste Entscheidung in unserem Vorstandsbüro
              </p>
              <div className="testi-meta">
                <span className="name">Friedrich Kaltenbach</span>
                <span className="role">Vorstand · Kaltenbach Privatbankiers</span>
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
            <p>Eine HIGH-Konfiguration beginnt mit einem 60-minütigen Analysetermin — vor Ort, in Ihrem Büro,
              oder an einem ruhigen Ort Ihrer Wahl. Wir sehen, was Sie tun. Wir hören, was Sie brauchen.
              Erst danach reden wir über Material, Maße und Termin.</p>
            <a href="#" className="cta-button">
              Next Level Now
              <span className="arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* LIFELINE — external CDN video (too large for GitHub/Vercel) */}
      {LIFELINE_VIDEO_URL && (
        <section className="lifeline">
          <video
            className="lifeline-video"
            src={LIFELINE_VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </section>
      )}

      {/* FOOTER */}
      <footer data-screen-label="07 Footer">
        <div className="foot-grid">
          <div className="foot-mark">
            <img src="/images/hoellental_logo_black.svg" alt="höllental." />
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <h5>Studio</h5>
              <ul>
                <li><a href="#">Manifest</a></li>
                <li><a href="#">Werkstatt</a></li>
                <li><a href="#">Material</a></li>
                <li><a href="#">Presse</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>Stücke</h5>
              <ul>
                <li><a href="#">HIGH</a></li>
                <li><a href="#">HIGH &amp; WORK</a></li>
                <li><a href="#">Edition №2</a></li>
                <li><a href="#">Auftragsarbeit</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>Kontakt</h5>
              <ul>
                <li><a href="mailto:studio@hoellental.com">studio@hoellental.com</a></li>
                <li><a href="#">+49 7551 — 000 000</a></li>
                <li><a href="#">Termin buchen</a></li>
                <li><a href="#">Standort</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="foot-base">
          <span>© 2026 Studio Höllental Manufaktur</span>
          <span>Möbelstück HIGH · Edition I · № 001 / 144</span>
          <span><a href="#">Impressum</a> · <a href="#">Datenschutz</a></span>
        </div>
      </footer>
    </>
  )
}
