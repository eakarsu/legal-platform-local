"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <ToastViewport />
        </ToastProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
