'use client'

import Link from 'next/link'
import { AlertCircle, ArrowRight, CheckCircle, DollarSign, ShoppingCart, Store, TrendingUp, Users, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

import { useAdminDashboard, useAdminStoreMutations } from '../hooks/useAdmin'
import type { AdminStoreModel } from '../types/admin.contracts'

const statConfig = [
  { key: 'totalStores', label: 'Total Stores', icon: Store, color: 'primary' },
  { key: 'activeUsers', label: 'Active Users', icon: Users, color: 'accent' },
  { key: 'totalOrders', label: 'Total Orders', icon: ShoppingCart, color: 'success' },
  { key: 'platformRevenue', label: 'Platform Revenue', icon: DollarSign, color: 'warning' },
] as const

function statusBadgeVariant(status: AdminStoreModel['status']) {
  if (status === 'active') return 'default'
  if (status === 'suspended') return 'destructive'
  return 'secondary'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminDashboardPage() {
  const { direction } = useLanguage()
  const dashboardQuery = useAdminDashboard()
  const { updateStoreStatus } = useAdminStoreMutations()

  if (dashboardQuery.isLoading) {
    return <LoadingState message="Loading platform overview..." />
  }

  if (dashboardQuery.isError) {
    return (
      <ErrorState
        title="Unable to load the super admin dashboard."
        description={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : undefined}
      />
    )
  }

  const dashboard = dashboardQuery.data

  if (!dashboard) {
    return <EmptyState title="No admin data yet." description="Connect the backend dashboard endpoint to populate this view." />
  }

  return (
    <div className="space-y-8">
      <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between', direction === 'rtl' && 'md:flex-row-reverse')}>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Super Admin</h1>
          <p className="text-muted-foreground">Platform-wide monitoring, approvals, and operational controls.</p>
        </div>
        <div className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
          <Link href="/admin/settings">
            <Button variant="outline">Platform Settings</Button>
          </Link>
          <Link href="/admin/stores">
            <Button>Review Stores</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statConfig.map((stat) => {
          const Icon = stat.icon
          const value =
            stat.key === 'platformRevenue'
              ? formatCurrency(dashboard.stats.platformRevenue)
              : dashboard.stats[stat.key].toLocaleString()

          return (
            <Card key={stat.key}>
              <CardContent className="pt-6">
                <div className={cn('flex items-start justify-between', direction === 'rtl' && 'flex-row-reverse')}>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
                    <div className={cn('mt-2 flex items-center gap-1 text-success', direction === 'rtl' && 'flex-row-reverse')}>
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Live snapshot</span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl',
                      stat.color === 'primary' && 'bg-primary/10',
                      stat.color === 'accent' && 'bg-accent/10',
                      stat.color === 'success' && 'bg-success/10',
                      stat.color === 'warning' && 'bg-warning/10',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-6 w-6',
                        stat.color === 'primary' && 'text-primary',
                        stat.color === 'accent' && 'text-accent',
                        stat.color === 'success' && 'text-success',
                        stat.color === 'warning' && 'text-warning',
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{dashboard.storeStatus.active}</p>
                <p className="text-sm text-muted-foreground">Active Stores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{dashboard.storeStatus.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{dashboard.storeStatus.suspended}</p>
                <p className="text-sm text-muted-foreground">Suspended Stores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className={cn('flex flex-row items-center justify-between', direction === 'rtl' && 'flex-row-reverse')}>
          <div>
            <CardTitle>Recent Stores</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">The latest stores that need monitoring or approval.</p>
          </div>
          <Link href="/admin/stores">
            <Button variant="ghost" size="sm" className={cn('gap-1', direction === 'rtl' && 'flex-row-reverse')}>
              View all stores
              <ArrowRight className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {dashboard.recentStores.length === 0 ? (
            <EmptyState title="No stores available." description="Once the backend returns stores, they will appear here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.recentStores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{store.name}</p>
                        <p className="text-xs text-muted-foreground">{store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'No date'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{store.ownerName}</p>
                        <p className="text-xs text-muted-foreground">{store.ownerEmail || 'No email'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(store.status)} className="capitalize">
                        {store.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{store.productsCount.toLocaleString()}</TableCell>
                    <TableCell>{store.ordersCount.toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(store.revenueTotal)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {store.status !== 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateStoreStatus.isPending}
                            onClick={() => updateStoreStatus.mutate({ storeId: store.id, status: 'active' })}
                          >
                            Activate
                          </Button>
                        ) : null}
                        {store.status !== 'suspended' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateStoreStatus.isPending}
                            onClick={() => updateStoreStatus.mutate({ storeId: store.id, status: 'suspended' })}
                          >
                            Suspend
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
