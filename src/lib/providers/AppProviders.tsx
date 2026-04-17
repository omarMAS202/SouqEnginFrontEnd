'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

import { Toaster } from '@/components/ui/toaster'
import { AuthBootstrap } from '@/features/auth/components/AuthBootstrap'
import { LanguageProvider } from '@/features/localization'
import { createQueryClient } from '@/services/query-client'

import { ThemeProvider } from './ThemeProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthBootstrap />
          {children}
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </LanguageProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
