// app/layout.js
import Navigation from '@/app/Navigation';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LivReplenish - Your Vitality Journey',
  description: 'Personalized rituals and insights to enhance your mental vitality and well-being',
  keywords: 'vitality, wellness, meditation, focus, habits, neuroplasticity',
  authors: [{ name: 'LivReplenish Team' }],
  metadataBase: new URL('http://localhost:3000'),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'LivReplenish - Your Vitality Journey',
    description: 'Personalized rituals and insights to enhance your mental vitality and well-being',
    type: 'website',
    url: 'https://livreplenish.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LivReplenish App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LivReplenish - Your Vitality Journey',
    description: 'Personalized rituals and insights to enhance your mental vitality and well-being',
    images: ['/og-image.png'],
  },
};

// Move viewport and themeColor to separate export as required by Next.js 15
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10B981',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        
        {/* Additional meta tags for PWA and mobile optimization */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LivReplenish" />
      </head>
      
      <body className={`${inter.className} antialiased min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50`}>
        <Providers>
          <div className="flex min-h-screen">
            {/* Navigation - shows on all pages except onboarding */}
            <Navigation />
            
            {/* Main content area */}
            <main className="flex-1 lg:ml-0">
              {children}
            </main>
          </div>
          
          {/* Global loading indicator */}
          <div id="global-loading" className="hidden">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center space-x-4">
                <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                <span className="text-slate-700 font-medium">Loading...</span>
              </div>
            </div>
          </div>
          
          {/* Toast notifications container */}
          <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2">
            {/* Toast notifications will be rendered here */}
          </div>
        </Providers>
        
        {/* Service Worker Registration for PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}