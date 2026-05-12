import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function SuccessPage() {
  const [data, setData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedData = sessionStorage.getItem('contactData')
    if (storedData) {
      setData(JSON.parse(storedData))
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
      
      <section className="hero" style={{ height: '100vh', overflow: 'hidden' }}>
        <div className="hero-stage" style={{ height: '100%' }}>
          <div className="hero-right">
            <video
              className="hero-video"
              src="/videos/33.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
            />
          </div>
          
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(20, 20, 19, 0.6)', color: 'var(--bone)', textAlign: 'center', padding: '40px' }}>
            
            <h1 style={{ fontSize: 'clamp(40px, 7vw, 120px)', fontWeight: 300, marginBottom: '40px', letterSpacing: '0.015em', lineHeight: '1.1' }}>
              Vielen Dank {data.name}
            </h1>
            
            <div style={{ maxWidth: '500px', width: '100%', background: '#141413', border: '1px solid var(--line)', padding: '40px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 300, marginBottom: '24px', color: 'var(--bone)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eingegebene Daten</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: 'var(--bone-dim)' }}>
                <div><span style={{ color: 'var(--bone)', fontWeight: 500 }}>E-Mail:</span> {data.email}</div>
                <div><span style={{ color: 'var(--bone)', fontWeight: 500 }}>Telefon:</span> {data.phone || 'Nicht angegeben'}</div>
                <div><span style={{ color: 'var(--bone)', fontWeight: 500 }}>Zeithorizont:</span> {data.timeline}</div>
                {data.message && (
                  <div>
                    <span style={{ color: 'var(--bone)', fontWeight: 500 }}>Nachricht:</span><br />
                    <div style={{ marginTop: '4px', lineHeight: '1.5' }}>{data.message}</div>
                  </div>
                )}
              </div>
              
              <button 
                className="cta-button" 
                style={{ marginTop: '32px', width: '100%', justifyContent: 'center', height: '52px' }}
                onClick={() => {
                  sessionStorage.removeItem('contactData');
                  router.push('/');
                }}
              >
                Zur Startseite
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
