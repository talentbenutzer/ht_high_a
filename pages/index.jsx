import dynamic from 'next/dynamic'
import Head from 'next/head'

// Load entire page client-side to avoid hydration errors from
// custom elements (<image-slot>) and DOM-dependent scroll scripts.
const LandingPage = dynamic(() => import('../components/LandingPage'), {
  ssr: false,
  loading: () => <div style={{ background: '#000', minHeight: '100vh' }} />,
})

export default function Home() {
  return (
    <>
      <Head>
        <title>HIGH — Studio Höllental</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="HIGH — Das Möbelstück für Räume, in denen Verantwortung getragen wird. Studio Höllental Manufaktur." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=neue-montreal@400,500,300,700,800&display=swap" />
      </Head>
      <LandingPage />
    </>
  )
}
