import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppProviders } from '@/lib/providers/AppProviders'
import './globals.css'

export const metadata: Metadata = {
  title: 'SOUQ ENGINE | AI-Powered E-Commerce Platform',
  description: 'Create and manage your online store with AI. Build beautiful storefronts in minutes with SOUQ ENGINE.',
  generator: 'SOUQ ENGINE',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var language = window.localStorage.getItem('souq-language');
                if (language === 'ar' || language === 'en') {
                  document.documentElement.lang = language;
                  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
                }
              } catch (error) {}
            `,
          }}
        />
        <AppProviders>
          {children}
        </AppProviders>
        <Analytics />
      </body>
    </html>
  )
}
