import dynamic from 'next/dynamic'
import Head from 'next/head'
import { product } from '../content/product'

// Load entire page client-side to avoid hydration errors from
// DOM-dependent scroll scripts and localStorage-based language state.
const LandingPage = dynamic(() => import('../components/LandingPage'), {
  ssr: false,
  loading: () => <div style={{ background: '#000', minHeight: '100vh' }} />,
})

export default function Home() {
  return (
    <>
      <Head>
        <title>{product.meta.title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={product.meta.description} />
        <link rel="canonical" href={product.site.url} />
        <meta property="og:url" content={product.site.url} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=neue-montreal@400,500,300,700,800&display=swap" />
      </Head>
      <LandingPage />
    </>
  )
}
