'use client'

import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Store, 
  Users, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  ArrowRight,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const stats = [
  { label: 'Total Stores', value: '156', change: '+12', icon: Store, color: 'primary' },
  { label: 'Active Users', value: '2,847', change: '+324', icon: Users, color: 'accent' },
  { label: 'Total Orders', value: '12,584', change: '+1,234', icon: ShoppingCart, color: 'success' },
  { label: 'Platform Revenue', value: '$284,352', change: '+$24,567', icon: DollarSign, color: 'warning' },
]

interface StoreItem {
  id: string
  name: string
  owner: string
  status: 'active' | 'suspended' | 'pending'
  products: number
  orders: number
  revenue: number
  createdAt: string
}

const recentStores: StoreItem[] = [
  { id: '1', name: 'Elegance Fashion', owner: 'Ahmed Al-Farsi', status: 'active', products: 124, orders: 567, revenue: 45600, createdAt: '2024-01-10' },
  { id: '2', name: 'Tech Galaxy', owner: 'Sarah Johnson', status: 'active', products: 89, orders: 234, revenue: 23400, createdAt: '2024-01-08' },
  { id: '3', name: 'Royal Gems', owner: 'Mohammed Hassan', status: 'pending', products: 45, orders: 89, revenue: 12300, createdAt: '2024-01-05' },
  { id: '4', name: 'Fresh Harvest', owner: 'Emily Chen', status: 'suspended', products: 0, orders: 0, revenue: 0, createdAt: '2024-01-02' },
  { id: '5', name: 'Urban Style', owner: 'Omar Al-Rashid', status: 'active', products: 234, orders: 890, revenue: 67800, createdAt: '2023-12-28' },
]

const statusIcons: Record<string, typeof CheckCircle> = {
  active: CheckCircle,
  suspended: XCircle,
  pending: AlertCircle,
}

const statusColors: Record<string, string> = {
  active: 'text-success',
  suspended: 'text-destructive',
  pending: 'text-warning',
}

const statusBgColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  suspended: 'bg-destructive/10 text-destructive',
  pending: 'bg-warning/10 text-warning',
}

export default function AdminDashboard() {
  const { t, direction } = useLanguage()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
        direction === 'rtl' && "md:flex-row-reverse"
      )}>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('admin.title')}</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>
        <div className={cn("flex items-center gap-3", direction === 'rtl' && "flex-row-reverse")}>
          <Button variant="outline" size="sm">
            Last 30 Days
          </Button>
          <Button size="sm">Export Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className={cn(
                  "flex items-start justify-between",
                  direction === 'rtl' && "flex-row-reverse"
                )}>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <div className={cn(
                      "flex items-center gap-1 mt-2",
                      direction === 'rtl' && "flex-row-reverse"
                    )}>
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">{stat.change}</span>
                      <span className="text-sm text-muted-foreground">this month</span>
                    </div>
                  </div>
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    stat.color === 'primary' && 'bg-primary/10',
                    stat.color === 'success' && 'bg-success/10',
                    stat.color === 'accent' && 'bg-accent/10',
                    stat.color === 'warning' && 'bg-warning/10',
                  )}>
                    <Icon className={cn(
                      "w-6 h-6",
                      stat.color === 'primary' && 'text-primary',
                      stat.color === 'success' && 'text-success',
                      stat.color === 'accent' && 'text-accent',
                      stat.color === 'warning' && 'text-warning',
                    )} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Store Status Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-4", direction === 'rtl' && "flex-row-reverse")}>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">142</p>
                <p className="text-sm text-muted-foreground">Active Stores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-4", direction === 'rtl' && "flex-row-reverse")}>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-4", direction === 'rtl' && "flex-row-reverse")}>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">6</p>
                <p className="text-sm text-muted-foreground">Suspended Stores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Stores */}
      <Card>
        <CardHeader className={cn(
          "flex flex-row items-center justify-between",
          direction === 'rtl' && "flex-row-reverse"
        )}>
          <CardTitle>{t('admin.allStores')}</CardTitle>
          <Link href="/admin/stores">
            <Button variant="ghost" size="sm" className={cn("gap-1", direction === 'rtl' && "flex-row-reverse")}>
              View All
              <ArrowRight className={cn("w-4 h-4", direction === 'rtl' && "rotate-180")} />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className={cn("py-3 text-sm font-medium text-muted-foreground", direction === 'rtl' ? 'text-right' : 'text-left')}>
                    {t('admin.storeName')}
                  </th>
                  <th className={cn("py-3 text-sm font-medium text-muted-foreground", direction === 'rtl' ? 'text-right' : 'text-left')}>
                    Owner
                  </th>
                  <th className={cn("py-3 text-sm font-medium text-muted-foreground", direction === 'rtl' ? 'text-right' : 'text-left')}>
                    {t('admin.status')}
                  </th>
                  <th className={cn("py-3 text-sm font-medium text-muted-foreground", direction === 'rtl' ? 'text-right' : 'text-left')}>
                    {t('admin.products')}
                  </th>
                  <th className={cn("py-3 text-sm font-medium text-muted-foreground", direction === 'rtl' ? 'text-right' : 'text-left')}>
                    {t('admin.orders')}
                  </th>
                  <th className={cn("py-3 text-sm font-medium text-muted-foreground", direction === 'rtl' ? 'text-right' : 'text-left')}>
                    Revenue
                  </th>
                  <th className="py-3 text-sm font-medium text-muted-foreground text-center w-16">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentStores.map((store) => {
                  const StatusIcon = statusIcons[store.status]
                  
                  return (
                    <tr key={store.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="py-4">
                        <div className={cn("flex items-center gap-3", direction === 'rtl' && "flex-row-reverse")}>
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Store className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{store.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-muted-foreground">{store.owner}</span>
                      </td>
                      <td className="py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                          statusBgColors[store.status],
                          direction === 'rtl' && "flex-row-reverse"
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {t(`admin.${store.status}`)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-foreground">{store.products}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-foreground">{store.orders}</span>
                      </td>
                      <td className="py-4">
                        <span className="font-semibold text-foreground">${store.revenue.toLocaleString()}</span>
                      </td>
                      <td className="py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'}>
                            <DropdownMenuItem>View Store</DropdownMenuItem>
                            <DropdownMenuItem>Contact Owner</DropdownMenuItem>
                            {store.status === 'active' ? (
                              <DropdownMenuItem className="text-destructive">
                                {t('admin.suspend')}
                              </DropdownMenuItem>
                            ) : store.status === 'suspended' ? (
                              <DropdownMenuItem className="text-success">
                                {t('admin.activate')}
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem className="text-success">Approve</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Reject</DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
