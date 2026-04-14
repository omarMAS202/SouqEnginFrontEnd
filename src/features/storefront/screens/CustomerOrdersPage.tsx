'use client'

import Link from 'next/link'

import { EmptyState } from '@/components/shared/ScreenState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/features/localization'

import { CustomerAccountShell } from '../components/CustomerAccountShell'
import { useCustomerAccountQuery } from '../hooks/useCustomerAccount'

export default function CustomerOrdersPage() {
  const { language } = useLanguage()
  const { data: customer } = useCustomerAccountQuery()

  return (
    <CustomerAccountShell>
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'سجل الطلبات' : 'Order history'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!customer?.orders.length ? (
            <EmptyState
              title={language === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}
              description={language === 'ar' ? 'ستظهر طلبات العميل هنا لاحقاً.' : 'Customer orders will appear here later.'}
            />
          ) : (
            customer.orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total.toFixed(2)} AED</p>
                    <p className="text-sm capitalize text-muted-foreground">{order.status}</p>
                  </div>
                </div>
                <Link href={`/storefront/account/orders/${order.id}`} className="mt-3 inline-block text-sm text-primary hover:underline">
                  {language === 'ar' ? 'عرض التفاصيل' : 'View details'}
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </CustomerAccountShell>
  )
}
