'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCurrentStoreBootstrap } from '@/features/auth/hooks/useUserStores'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

const navigation = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.aiGenerator', href: '/dashboard/ai-generator', icon: Sparkles },
  { key: 'nav.products', href: '/dashboard/products', icon: Package },
  { key: 'nav.categories', href: '/dashboard/categories', icon: FolderTree },
  { key: 'nav.orders', href: '/dashboard/orders', icon: ShoppingCart },
  { key: 'nav.customers', href: '/dashboard/customers', icon: Users },
  { key: 'nav.appearance', href: '/dashboard/appearance', icon: Palette },
  { key: 'nav.settings', href: '/dashboard/settings', icon: Settings },
  { key: 'nav.billing', href: '/dashboard/billing', icon: CreditCard },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { t, direction, language } = useLanguage()
  const { setCurrentStoreId } = useAuth()
  const { data: bootstrap } = useCurrentStoreBootstrap()
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false)

  const stores = bootstrap?.available_stores ?? []
  const selectedStore =
    bootstrap?.store ??
    stores[0] ?? {
      id: 'store-shell',
      store_id: 'store-shell',
      name: language === 'ar' ? 'مساحة المتجر' : 'Store Workspace',
      url: language === 'ar' ? 'بانتظار الربط الخلفي' : 'Awaiting backend integration',
    }

  return (
    <aside
      className={cn(
        'fixed top-0 z-40 flex h-screen w-64 flex-col border-border bg-sidebar',
        direction === 'rtl' ? 'right-0 border-l' : 'left-0 border-r',
      )}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">SOUQ ENGINE</span>
        </Link>
      </div>

      <div className="border-b border-sidebar-border p-4">
        <button
          onClick={() => setStoreDropdownOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-lg bg-sidebar-accent p-3 transition-colors hover:bg-sidebar-accent/80"
        >
          <div className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-4 w-4 text-primary" />
            </div>
            <div className={cn('text-start', direction === 'rtl' && 'text-end')}>
              <p className="text-sm font-medium text-sidebar-foreground">{selectedStore.name}</p>
              <p className="text-xs text-muted-foreground">{selectedStore.url}</p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              storeDropdownOpen && 'rotate-180',
            )}
          />
        </button>

        {storeDropdownOpen && stores.length > 0 ? (
          <div className="mt-2 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => {
                  setCurrentStoreId(store.store_id)
                  setStoreDropdownOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-3 p-3 transition-colors hover:bg-sidebar-accent',
                  selectedStore.store_id === store.store_id && 'bg-sidebar-accent',
                  direction === 'rtl' && 'flex-row-reverse',
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                  <Store className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm text-sidebar-foreground">{store.name}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                direction === 'rtl' && 'flex-row-reverse',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{t(item.key)}</span>
              {item.key === 'nav.aiGenerator' ? (
                <span
                  className={cn(
                    'rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground',
                    direction === 'rtl' ? 'mr-auto' : 'ml-auto',
                  )}
                >
                  AI
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <Link
          href="/storefront"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent',
            direction === 'rtl' && 'flex-row-reverse',
          )}
        >
          <Store className="h-5 w-5" />
          <span>{t('store.shop')}</span>
        </Link>
      </div>
    </aside>
  )
}
