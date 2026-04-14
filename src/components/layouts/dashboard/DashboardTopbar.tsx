'use client'

import { Bell, ChevronDown, Globe, LogOut, Moon, Search, Sun, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

export function DashboardTopbar() {
  const { language, setLanguage, t, direction } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm',
        direction === 'rtl' ? 'left-0 right-64' : 'left-64 right-0',
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          {searchOpen ? (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={t('common.search')}
                className="h-9 w-64"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">{t('common.search')}</span>
              <kbd className="hidden h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
                Ctrl+K
              </kbd>
            </Button>
          )}
        </div>
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
            <DropdownMenuItem onClick={() => setLanguage('en')}>
              <span className={cn(language === 'en' && 'font-semibold')}>English</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('ar')}>
              <span className={cn(language === 'ar' && 'font-semibold')}>العربية</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className={cn('hidden text-start md:block', direction === 'rtl' && 'text-end')}>
                <p className="text-sm font-medium">{user?.fullName ?? 'Store Owner'}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? 'owner@souqengine.com'}</p>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'} className="w-56">
            <div className="p-2">
              <p className="text-sm font-medium">{user?.fullName ?? 'Store Owner'}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? 'owner@souqengine.com'}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>{t('nav.settings')}</DropdownMenuItem>
            <DropdownMenuItem>{t('nav.billing')}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                logout()
                router.replace('/login')
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('auth.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
