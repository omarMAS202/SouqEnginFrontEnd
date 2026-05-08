'use client'

import Link from 'next/link'
import { Globe, Menu, Search, ShoppingBag, Store, User } from 'lucide-react'
import { useState } from 'react'

import { useLanguage } from '@/features/localization'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { cn } from '@/utils/cn'

import { useCustomerSession } from '@/features/storefront/hooks/useCustomerAccount'
import { useCart } from '@/features/storefront/hooks/useCart'
import { useStorefrontRuntime } from '@/features/storefront/hooks/useStorefrontRuntime'

export default function StorefrontLayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { language, setLanguage, direction } = useLanguage()
  const { data: runtime, isLoading, isError, error } = useStorefrontRuntime()
  const { count } = useCart()
  const { isAuthenticated } = useCustomerSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (isLoading) {
    return <LoadingState message={language === 'ar' ? 'جارٍ تحميل المتجر...' : 'Loading storefront...'} />
  }

  if (isError || !runtime) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل المتجر' : 'Could not load storefront'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  const visibleNavigation = runtime.navigation.filter((item) => item.isVisible)

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      dir={direction}
      style={
        {
          '--storefront-primary': runtime.theme.primaryColor,
          '--storefront-accent': runtime.theme.accentColor,
          '--storefront-surface': runtime.theme.surfaceColor,
          '--storefront-background': runtime.theme.backgroundColor,
          '--storefront-foreground': runtime.theme.foregroundColor,
          '--storefront-muted': runtime.theme.mutedColor,
          '--storefront-radius':
            runtime.theme.borderRadius === 'xl'
              ? '1.5rem'
              : runtime.theme.borderRadius === 'lg'
                ? '1rem'
                : runtime.theme.borderRadius === 'md'
                  ? '0.75rem'
                  : '0.5rem',
          fontFamily: runtime.theme.fontBody,
        } as React.CSSProperties
      }
    >
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={cn('flex h-16 items-center justify-between gap-4', direction === 'rtl' && 'flex-row-reverse')}>
            <Link href="/storefront" className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold" style={{ fontFamily: runtime.theme.fontHeading }}>
                  {runtime.profile.logoText}
                </p>
                <p className="text-xs text-muted-foreground">{runtime.profile.slogan}</p>
              </div>
            </Link>

            <nav className={cn('hidden items-center gap-6 md:flex', direction === 'rtl' && 'flex-row-reverse')}>
              {visibleNavigation.map((item) => (
                <Link key={item.id} href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
              <div className="relative hidden md:block">
                <Search className={cn('absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground', direction === 'rtl' ? 'right-3' : 'left-3')} />
                <Input
                  placeholder={language === 'ar' ? 'ابحث في المتجر' : 'Search the store'}
                  className={cn('w-64', direction === 'rtl' ? 'pr-10 text-right' : 'pl-10')}
                />
              </div>

              <Button variant="ghost" size="sm" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>
                <Globe className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">{language === 'en' ? 'العربية' : 'English'}</span>
              </Button>

              <Link href={isAuthenticated ? '/storefront/account' : '/storefront/login'}>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/storefront/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {count > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {count}
                    </span>
                  ) : null}
                </Button>
              </Link>

              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen((value) => !value)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {mobileMenuOpen ? (
            <nav className="space-y-1 border-t border-border/70 py-4 md:hidden">
              {visibleNavigation.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      <main className="bg-[var(--storefront-background)]">{children}</main>

      <footer className="mt-16 border-t border-border/70 bg-card/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className={cn('grid gap-8 md:grid-cols-4', direction === 'rtl' && 'text-right')}>
            <div className="space-y-3">
              <div className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Store className="h-5 w-5" />
                </div>
                <span className="text-lg font-semibold" style={{ fontFamily: runtime.theme.fontHeading }}>
                  {runtime.profile.name}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{runtime.footer.about}</p>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-foreground">{language === 'ar' ? 'التصفح' : 'Navigate'}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {runtime.footer.navigation.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="hover:text-foreground">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-foreground">{language === 'ar' ? 'الدعم' : 'Support'}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {runtime.footer.supportLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-foreground">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-foreground">{runtime.footer.contactTitle}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {runtime.footer.contactLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                {runtime.profile.socialLinks.map((item) => (
                  <Link key={item.label} href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className={cn('mt-8 flex flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between', direction === 'rtl' && 'md:flex-row-reverse')}>
            <p>{language === 'ar' ? 'مدعوم بواسطة Souq Engine' : 'Powered by Souq Engine'}</p>
            <div className={cn('flex flex-wrap gap-4', direction === 'rtl' && 'flex-row-reverse')}>
              {runtime.footer.legalLinks.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
