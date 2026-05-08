'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, LogOut, MapPinned, Package2, UserCircle2 } from 'lucide-react'
import { useEffect } from 'react'

import { useLanguage } from '@/features/localization'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'

import { useCustomerSession } from '../hooks/useCustomerAccount'

const accountLinks = [
  { href: '/storefront/account', icon: LayoutGrid, label: { en: 'Overview', ar: 'نظرة عامة' } },
  { href: '/storefront/account/profile', icon: UserCircle2, label: { en: 'Profile', ar: 'الملف الشخصي' } },
  { href: '/storefront/account/addresses', icon: MapPinned, label: { en: 'Addresses', ar: 'العناوين' } },
  { href: '/storefront/account/orders', icon: Package2, label: { en: 'Orders', ar: 'الطلبات' } },
]

export function CustomerAccountShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { direction, language } = useLanguage()
  const { customer, hydrated, isAuthenticated, logout } = useCustomerSession()

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/storefront/login')
    }
  }, [hydrated, isAuthenticated, router])

  if (!hydrated) {
    return <div className="py-16 text-center text-muted-foreground">{language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
  }

  if (!isAuthenticated) return null

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Card>
        <CardContent className="space-y-6 p-5">
          <div className={cn(direction === 'rtl' && 'text-right')}>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {language === 'ar' ? 'حساب العميل' : 'Customer account'}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{customer?.fullName}</h2>
            <p className="text-sm text-muted-foreground">{customer?.email}</p>
          </div>

          <nav className="space-y-1">
            {accountLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    direction === 'rtl' && 'flex-row-reverse',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {language === 'ar' ? item.label.ar : item.label.en}
                </Link>
              )
            })}
          </nav>

          <Button
            variant="outline"
            className={cn('w-full gap-2', direction === 'rtl' && 'flex-row-reverse')}
            onClick={() => {
              logout()
              router.push('/storefront')
            }}
          >
            <LogOut className="h-4 w-4" />
            {language === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
          </Button>
        </CardContent>
      </Card>

      <div>{children}</div>
    </div>
  )
}
