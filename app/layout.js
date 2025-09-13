// app/layout.js
import { Inter, Merriweather } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const merriweather = Merriweather({ 
  subsets: ['latin'], 
  weight: ['300', '400', '700'],
  display: 'swap',
  variable: '--font-merriweather'
});

export const metadata = {
  title: {
    default: 'LivReplenish - Your Vitality Journey',
    template: '%s | LivReplenish'
  },
  description: 'Transform your daily routine with personalized wellness rituals designed to enhance your mental vitality, focus, and overall well-being.',
  keywords: [
    'vitality', 'wellness', 'meditation', 'focus', 'habits', 
    'neuroplasticity', 'mindfulness', 'personal growth', 'mental health'
  ],
  authors: [{ name: 'LivReplenish Team', url: 'https://livreplenish.com' }],
  creator: 'LivReplenish',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://livreplenish.com',
    title: 'LivReplenish - Your Vitality Journey',
    description: 'Transform your daily routine with personalized wellness rituals designed to enhance your mental vitality and well-being.',
    siteName: 'LivReplenish',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LivReplenish - Personalized Wellness Rituals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LivReplenish - Your Vitality Journey',
    description: 'Transform your daily routine with personalized wellness rituals designed to enhance your mental vitality and well-being.',
    images: ['/og-image.png'],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'wellness',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10B981' },
    { media: '(prefers-color-scheme: dark)', color: '#059669' },
  ],
  colorScheme: 'light',
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en" 
      className={`scroll-smooth ${inter.variable} ${merriweather.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Critical resource hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link rel="dns-prefetch" href="https://api.livreplenish.com" />
        
        {/* PWA and mobile optimization */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LivReplenish" />
        <meta name="application-name" content="LivReplenish" />
        <meta name="msapplication-TileColor" content="#10B981" />
        <meta name="theme-color" content="#10B981" />
        
        {/* Performance and accessibility */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="light" />
      </head>
      
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-900`}>
        <Providers>
          {/* Skip navigation link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded-lg z-50 focus:z-50"
          >
            Skip to main content
          </a>
          
          {/* Main app wrapper */}
          <div className="min-h-screen flex flex-col">
            {/* Main content */}
            <main id="main-content" className="flex-1" role="main">
              {children}
            </main>
          </div>
          
          {/* Global loading overlay */}
          <div 
            id="global-loading" 
            className="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 items-center justify-center"
            role="status"
            aria-label="Loading"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 flex items-center space-x-4 max-w-sm mx-4">
              <div className="relative">
                <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full"></div>
                <div className="absolute inset-0 animate-pulse w-8 h-8 border-3 border-emerald-200 rounded-full"></div>
              </div>
              <div>
                <p className="text-slate-800 font-semibold">Loading</p>
                <p className="text-slate-600 text-sm">Please wait...</p>
              </div>
            </div>
          </div>
          
          {/* Toast notifications portal */}
          <div 
            id="toast-container" 
            className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none"
            aria-live="polite"
            aria-atomic="false"
          >
            {/* Toast notifications will be rendered here */}
          </div>
        </Providers>
        
        {/* Service Worker Registration Script */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                      .then((registration) => {
                        console.log('SW registered: ', registration);
                      })
                      .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `,
            }}
          />
        )}
        
        {/* Analytics placeholder - replace with your analytics */}
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
