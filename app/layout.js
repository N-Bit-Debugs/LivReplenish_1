import Navigation from '@/app/Navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

// Create a client instance outside of the component to prevent re-creation on every render
let queryClient;

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // With SSR, we usually want to set some default staleTime
          // above 0 to avoid refetching immediately on the client
          staleTime: 60 * 1000, // 1 minute
          retry: 2,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: 1,
        },
      },
    });
  }
  return queryClient;
}

export const metadata = {
  title: 'LivReplenish - Your Vitality Journey',
  description: 'Personalized rituals and insights to enhance your mental vitality and well-being',
  keywords: 'vitality, wellness, meditation, focus, habits, neuroplasticity',
  authors: [{ name: 'LivReplenish Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#10B981',
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

// Client-side Providers wrapper
function Provideres({ children }) {
  const client = getQueryClient();

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

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
        
        {/* Prevent zoom on iOS */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
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