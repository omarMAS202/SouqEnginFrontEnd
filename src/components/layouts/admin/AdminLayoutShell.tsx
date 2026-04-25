'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, Globe, LayoutDashboard, Moon, Settings, Shield, Store, Sun, User, Users } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AuthRouteGuard } from '@/features/auth/components/AuthRouteGuard'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

const navigation = [
  { key: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'All Stores', href: '/admin/stores', icon: Store },
  { key: 'Users', href: '/admin/users', icon: Users },
  { key: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { language, setLanguage, direction } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <AuthRouteGuard roles={['super_admin']}>
      <div className="min-h-screen bg-background">
        <aside
          className={cn(
            'fixed top-0 z-40 flex h-screen w-64 flex-col border-border bg-sidebar',
            direction === 'rtl' ? 'right-0 border-l' : 'left-0 border-r',
          )}
        >
          <div className="flex h-16 items-center border-b border-sidebar-border px-6">
            <Link href="/admin" className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive">
                <Shield className="h-5 w-5 text-destructive-foreground" />
              </div>
              <div>
                <span className="text-lg font-semibold text-sidebar-foreground">SOUQ ENGINE</span>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'المشرف العام' : 'Super Admin'}
                </p>
              </div>
            </Link>
          </div>

          <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    direction === 'rtl' && 'flex-row-reverse',
                    isActive
                      ? 'bg-destructive text-destructive-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.key}</span>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-sidebar-border p-4">
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent',
                direction === 'rtl' && 'flex-row-reverse',
              )}
            >
              <Store className="h-5 w-5" />
              <span>{language === 'ar' ? 'الانتقال إلى المتجر' : 'Switch to Store'}</span>
            </Link>
          </div>
        </aside>

        <header
          className={cn(
            'fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm',
            direction === 'rtl' ? 'left-0 right-64' : 'left-64 right-0',
          )}
        >
          <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
            <h1 className="text-lg font-semibold text-foreground">
              {language === 'ar' ? 'لوحة الإدارة العامة' : 'Super Admin Panel'}
            </h1>
          </div>

          <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">{language === 'en' ? 'EN' : 'العربية'}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'}>
                <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ar')}>العربية</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                    <User className="h-4 w-4 text-destructive" />
                  </div>
                  <div className={cn('hidden text-start md:block', direction === 'rtl' && 'text-end')}>
                    <p className="text-sm font-medium">{user?.fullName ?? 'Admin User'}</p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'المشرف العام' : 'Super Admin'}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'} className="w-56">
                <div className="p-2">
                  <p className="text-sm font-medium">{user?.fullName ?? 'Admin User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email ?? 'admin@souqengine.com'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{language === 'ar' ? 'الملف الشخصي' : 'Profile'}</DropdownMenuItem>
                <DropdownMenuItem>{language === 'ar' ? 'الإعدادات' : 'Settings'}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    logout()
                    window.location.href = '/login'
                  }}
                >
                  {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className={cn('min-h-screen pt-16', direction === 'rtl' ? 'mr-64' : 'ml-64')}>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AuthRouteGuard>
  )
}
