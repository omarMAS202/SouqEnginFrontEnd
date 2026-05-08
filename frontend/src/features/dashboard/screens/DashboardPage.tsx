'use client'

import { ArrowRight, ArrowUpRight, MoreHorizontal, Package, TrendingDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useLanguage } from '@/features/localization'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { cn } from '@/utils/cn'

import { useDashboardOverview } from '../hooks/useDashboard'

export default function DashboardPage() {
  const { t, direction, language } = useLanguage()
  const { user } = useAuth()
  const { data, isLoading, isError, error } = useDashboardOverview()

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />
  }

  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل لوحة التحكم' : 'Could not load dashboard'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  if (!data) {
    return (
      <EmptyState
        title={language === 'ar' ? 'لا توجد بيانات لعرضها بعد' : 'No dashboard data available yet'}
        description={
          language === 'ar'
            ? 'ستظهر الإحصاءات والطلبات الحديثة هنا بعد ربط بيانات المتجر.'
            : 'Stats and recent orders will appear here once store data is connected.'
        }
      />
    )
  }

  const stats = [
    {
      key: 'dashboard.totalOrders',
      value: data.stats.totalOrders.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
    },
    {
      key: 'dashboard.totalRevenue',
      value: `$${data.stats.totalRevenue.toLocaleString()}`,
      change: '+8.2%',
      trend: 'up',
    },
    {
      key: 'dashboard.totalProducts',
      value: data.stats.totalProducts.toLocaleString(),
      change: '+3.1%',
      trend: 'up',
    },
    {
      key: 'dashboard.totalCustomers',
      value: data.stats.totalCustomers.toLocaleString(),
      change: '-2.4%',
      trend: 'down',
    },
  ] as const

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    processing: 'bg-accent/10 text-accent',
    shipped: 'bg-primary/10 text-primary',
    delivered: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
  }

  return (
    <div className="space-y-8">
      <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between', direction === 'rtl' && 'md:flex-row-reverse')}>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.welcome')}, {user?.fullName ?? 'Ahmed'}</p>
        </div>
        <div className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
          <Button variant="outline" size="sm">
            {language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}
          </Button>
          <Link href="/dashboard/ai-generator">
            <Button size="sm" className="gap-2">
              <Package className="h-4 w-4" />
              {t('nav.aiGenerator')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
          return (
            <Card key={stat.key}>
              <CardContent className="pt-6">
                <div className={cn('flex items-start justify-between', direction === 'rtl' && 'flex-row-reverse')}>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t(stat.key)}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                    <div className={cn('mt-2 flex items-center gap-1', direction === 'rtl' && 'flex-row-reverse')}>
                      <TrendIcon className={cn('h-4 w-4', stat.trend === 'up' ? 'text-success' : 'text-destructive')} />
                      <span className={cn('text-sm font-medium', stat.trend === 'up' ? 'text-success' : 'text-destructive')}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'مقارنة بالشهر الماضي' : 'vs last month'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className={cn('flex flex-row items-center justify-between', direction === 'rtl' && 'flex-row-reverse')}>
            <CardTitle>{t('dashboard.recentOrders')}</CardTitle>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm" className={cn('gap-1', direction === 'rtl' && 'flex-row-reverse')}>
                {t('dashboard.viewAll')}
                <ArrowRight className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg bg-secondary/30 p-4 transition-colors hover:bg-secondary/50',
                    direction === 'rtl' && 'flex-row-reverse',
                  )}
                >
                  <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-medium text-primary">
                        {order.customerName.split(' ').map((part) => part[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">{order.id}</p>
                    </div>
                  </div>
                  <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', statusColors[order.status])}>
                      {t(`orders.${order.status}`)}
                    </span>
                    <span className="w-20 text-right font-semibold text-foreground">${order.total}</span>
                    <span className="w-24 text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'}>
                        <DropdownMenuItem>{language === 'ar' ? 'عرض التفاصيل' : 'View Details'}</DropdownMenuItem>
                        <DropdownMenuItem>{language === 'ar' ? 'تحديث الحالة' : 'Update Status'}</DropdownMenuItem>
                        <DropdownMenuItem>{language === 'ar' ? 'التواصل مع العميل' : 'Contact Customer'}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={cn('flex flex-row items-center justify-between', direction === 'rtl' && 'flex-row-reverse')}>
            <CardTitle>{language === 'ar' ? 'أفضل المنتجات' : 'Top Products'}</CardTitle>
            <Link href="/dashboard/products">
              <Button variant="ghost" size="sm" className={cn('gap-1', direction === 'rtl' && 'flex-row-reverse')}>
                {t('dashboard.viewAll')}
                <ArrowRight className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.map((product) => (
                <div key={product.id} className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales} {language === 'ar' ? 'مبيعات' : 'sales'}
                    </p>
                  </div>
                  <div className={cn('flex items-center gap-1 text-success', direction === 'rtl' && 'flex-row-reverse')}>
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="font-semibold">${product.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
