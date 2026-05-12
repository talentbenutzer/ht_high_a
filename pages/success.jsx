import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function SuccessPage() {
  const [data, setData] = useState(null)
  const [animated, setAnimated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedData = sessionStorage.getItem('contactData')
    if (storedData) {
      setData(JSON.parse(storedData))
      // Trigger animation after mount
      setTimeout(() => setAnimated(true), 100)
    } else {
      router.push('/')
    }
  }, [router])

  if (!data) {
    return <div style={{ background: '#000', minHeight: '100vh' }} />
  }

  return (
    <>
      <Head>
        <title>Vielen Dank — Studio Höllental</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=neue-montreal@400,500,300,700,800&display=swap" />
      </Head>
      
      <section className="hero" style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <div className="hero-stage" style={{ height: '100%' }}>
          <div className="hero-right">
            <video
              className="hero-video"
              src="/videos/33.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              loop={false}
            />
          </div>
          
          {/* Top Left Logo */}
          <div style={{ position: 'absolute', top: 'var(--page-pad)', left: 'var(--page-pad)', zIndex: 3 }}>
            <a href="/" className="wordmark">
              <img src="/images/hoellental_logo_black.svg" alt="höllental." style={{ height: '20px' }} />
            </a>
          </div>
          
          {/* Left Middle Text */}
          <div style={{ 
            position: 'absolute', 
            left: 'var(--page-pad)', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            zIndex: 2,
            textAlign: 'left'
          }}>
            <h1 style={{ 
              fontSize: 'clamp(40px, 7vw, 120px)', 
              fontWeight: 300, 
              letterSpacing: '0.015em', 
              lineHeight: '1.1',
              color: 'var(--bone)',
              opacity: animated ? 1 : 0,
              filter: animated ? 'blur(0)' : 'blur(18px)',
              transition: 'opacity 800ms cubic-bezier(.2,.6,.2,1), filter 900ms cubic-bezier(.2,.6,.2,1)',
              whiteSpace: 'nowrap'
            }}>
              Vielen Dank<br />
              {data.name}
            </h1>
          </div>
          
          {/* Bottom Right Data */}
          <div style={{ 
            position: 'absolute', 
            right: 'var(--page-pad)', 
            bottom: 'var(--page-pad)', 
            zIndex: 2,
            textAlign: 'right',
            color: 'var(--bone)',
            background: 'rgba(20, 20, 19, 0.4)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '32px',
            border: '1px solid var(--line)',
            maxWidth: '400px'
          }}>
            <h2 style={{ fontSize: '12px', fontWeight: 500, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bone-dim)' }}>Eingegebene Daten</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--bone-dim)' }}>
              <div>E-Mail: <span style={{ color: 'var(--bone)' }}>{data.email}</span></div>
              <div>Telefon: <span style={{ color: 'var(--bone)' }}>{data.phone || 'Nicht angegeben'}</span></div>
              <div>Zeithorizont: <span style={{ color: 'var(--bone)' }}>{data.timeline}</span></div>
              {data.message && (
                <div style={{ marginTop: '8px' }}>
                  Nachricht:<br />
                  <span style={{ color: 'var(--bone)' }}>{data.message}</span>
                </div>
              )}
            </div>
            
            <button 
              style={{ 
                marginTop: '24px', 
                fontSize: '12px',
                color: 'var(--bone)',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: 0
              }}
              onClick={() => {
                sessionStorage.removeItem('contactData');
                router.push('/');
              }}
            >
              ← Zur Startseite
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
