'use client'

import { useMemo, useState } from 'react'

import {
  Eye,
  Filter,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  Phone,
  Search,
  ShoppingCart,
  Truck,
  User,
} from 'lucide-react'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/features/localization'
import { toast } from '@/hooks/useToast'
import type { Order } from '@/types/models'
import { cn } from '@/utils/cn'

import { useOrderMutations, useOrders } from '../hooks/useOrders'

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-warning/10 text-warning',
  processing: 'bg-accent/10 text-accent',
  shipped: 'bg-primary/10 text-primary',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
}

const nextStatusMap: Partial<Record<Order['status'], Order['status']>> = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
}

export default function OrdersPage() {
  const { t, direction, language } = useLanguage()
  const { data: orders = [], isLoading, isError, error } = useOrders()
  const { updateOrderStatus } = useOrderMutations()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const query = searchQuery.toLowerCase()
        return (
          order.customerName.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query) ||
          order.email.toLowerCase().includes(query)
        )
      }),
    [orders, searchQuery],
  )

  const stats = useMemo(
    () => [
      { label: language === 'ar' ? 'كل الطلبات' : 'All Orders', value: orders.length },
      { label: t('orders.pending'), value: orders.filter((order) => order.status === 'pending').length },
      { label: t('orders.shipped'), value: orders.filter((order) => order.status === 'shipped').length },
      { label: t('orders.delivered'), value: orders.filter((order) => order.status === 'delivered').length },
    ],
    [language, orders, t],
  )

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(language === 'ar' ? 'ar-AE' : 'en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />
  }

  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل الطلبات' : 'Could not load orders'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  const handleAdvanceStatus = async (order: Order) => {
    const nextStatus = nextStatusMap[order.status]
    if (!nextStatus) return

    try {
      await updateOrderStatus.mutateAsync({ orderId: order.id, status: nextStatus })
      toast({
        title: language === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated',
        description:
          language === 'ar'
            ? `تم نقل الطلب ${order.id} إلى ${t(`orders.${nextStatus}`)}.`
            : `Order ${order.id} moved to ${t(`orders.${nextStatus}`)}.`,
      })
    } catch (mutationError) {
      toast({
        title: language === 'ar' ? 'تعذر تحديث الطلب' : 'Could not update order',
        description: mutationError instanceof Error ? mutationError.message : undefined,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div
        className={cn(
          'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
          direction === 'rtl' && 'md:flex-row-reverse',
        )}
      >
        <div className={cn(direction === 'rtl' && 'text-right')}>
          <h1 className="text-3xl font-bold text-foreground">{t('orders.title')}</h1>
          <p className="text-muted-foreground">
            {language === 'ar'
              ? 'تابع الطلبات وراجع حالتها وبيانات العميل في مكان واحد.'
              : 'Track your orders, customer details, and delivery progress in one place.'}
          </p>
        </div>
        <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
          <Button variant="outline" size="sm">
            {language === 'ar' ? 'تصدير' : 'Export'}
          </Button>
          <Button variant="outline" size="sm">
            {language === 'ar' ? 'طباعة' : 'Print'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="py-4">
          <div
            className={cn(
              'flex flex-col gap-4 md:flex-row md:items-center',
              direction === 'rtl' && 'md:flex-row-reverse',
            )}
          >
            <div className="relative flex-1">
              <Search
                className={cn(
                  'absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
                  direction === 'rtl' ? 'right-3' : 'left-3',
                )}
              />
              <Input
                placeholder={language === 'ar' ? 'ابحث بالعميل أو رقم الطلب أو البريد' : 'Search by customer, order ID, or email'}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className={cn(direction === 'rtl' ? 'pr-10' : 'pl-10')}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {t('common.filter')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
            <ShoppingCart className="h-5 w-5" />
            {language === 'ar' ? `كل الطلبات (${filteredOrders.length})` : `All Orders (${filteredOrders.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <EmptyState
              title={language === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}
              description={
                language === 'ar'
                  ? 'ستظهر الطلبات هنا عند وصول أول عملية شراء من المتجر.'
                  : 'Orders will appear here once the first purchases arrive from the store.'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className={cn('py-3 text-sm font-medium text-muted-foreground', direction === 'rtl' ? 'text-right' : 'text-left')}>
                      {t('orders.orderId')}
                    </th>
                    <th className={cn('py-3 text-sm font-medium text-muted-foreground', direction === 'rtl' ? 'text-right' : 'text-left')}>
                      {t('orders.customer')}
                    </th>
                    <th className={cn('py-3 text-sm font-medium text-muted-foreground', direction === 'rtl' ? 'text-right' : 'text-left')}>
                      {t('orders.date')}
                    </th>
                    <th className={cn('py-3 text-sm font-medium text-muted-foreground', direction === 'rtl' ? 'text-right' : 'text-left')}>
                      {t('orders.total')}
                    </th>
                    <th className={cn('py-3 text-sm font-medium text-muted-foreground', direction === 'rtl' ? 'text-right' : 'text-left')}>
                      {t('orders.status')}
                    </th>
                    <th className="w-16 py-3 text-center text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'إجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border transition-colors hover:bg-secondary/30">
                      <td className="py-4">
                        <span className="font-mono text-sm font-medium text-foreground">{order.id}</span>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.email}</p>
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground">{formatDate(order.date)}</td>
                      <td className="py-4 font-semibold text-foreground">{formatCurrency(order.total)}</td>
                      <td className="py-4">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', statusColors[order.status])}>
                          {t(`orders.${order.status}`)}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'}>
                            <DropdownMenuItem className="gap-2" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                              {language === 'ar' ? 'عرض التفاصيل' : 'View details'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              disabled={!nextStatusMap[order.status] || updateOrderStatus.isPending}
                              onClick={() => void handleAdvanceStatus(order)}
                            >
                              <Truck className="h-4 w-4" />
                              {language === 'ar' ? 'تحديث الحالة' : 'Update status'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
              <span>{language === 'ar' ? `الطلب ${selectedOrder?.id}` : `Order ${selectedOrder?.id}`}</span>
              {selectedOrder ? (
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', statusColors[selectedOrder.status])}>
                  {t(`orders.${selectedOrder.status}`)}
                </span>
              ) : null}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">
                    {language === 'ar' ? 'بيانات العميل' : 'Customer information'}
                  </h3>
                  <div className={cn('flex items-center gap-2 text-sm', direction === 'rtl' && 'flex-row-reverse')}>
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className={cn('flex items-center gap-2 text-sm', direction === 'rtl' && 'flex-row-reverse')}>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.email}</span>
                  </div>
                  <div className={cn('flex items-center gap-2 text-sm', direction === 'rtl' && 'flex-row-reverse')}>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.phone}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">
                    {language === 'ar' ? 'عنوان الشحن' : 'Shipping address'}
                  </h3>
                  <div className={cn('flex items-start gap-2 text-sm', direction === 'rtl' && 'flex-row-reverse')}>
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.address}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-foreground">
                  {language === 'ar' ? 'عناصر الطلب' : 'Order items'}
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center justify-between rounded-lg bg-secondary/30 p-3',
                        direction === 'rtl' && 'flex-row-reverse',
                      )}
                    >
                      <div className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'ar' ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-foreground">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  'flex items-center justify-between border-t border-border pt-4',
                  direction === 'rtl' && 'flex-row-reverse',
                )}
              >
                <span className="text-lg font-semibold text-foreground">{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
