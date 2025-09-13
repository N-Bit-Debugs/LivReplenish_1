"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRef } from 'react';

export default function Providers({ children }) {
  // useRef ensures the client is only created once per session
  const clientRef = useRef();
  if (!clientRef.current) {
    clientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          retry: 2,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: 1,
        },
      },
    });
  }

  return (
    <QueryClientProvider client={clientRef.current}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}