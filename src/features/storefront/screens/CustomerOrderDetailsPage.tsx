'use client'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/features/localization'

import { CustomerAccountShell } from '../components/CustomerAccountShell'
import { useCustomerOrder } from '../hooks/useCustomerAccount'

export default function CustomerOrderDetailsPage({
  orderId,
}: {
  orderId: string
}) {
  const { language } = useLanguage()
  const { data: order, isLoading, isError, error } = useCustomerOrder(orderId)

  if (isLoading) return <LoadingState message={language === 'ar' ? 'جارٍ تحميل الطلب...' : 'Loading order...'} />
  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل الطلب' : 'Could not load order'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  return (
    <CustomerAccountShell>
      {!order ? (
        <EmptyState title={language === 'ar' ? 'الطلب غير موجود' : 'Order not found'} />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? `تفاصيل الطلب ${order.orderNumber}` : `Order ${order.orderNumber}`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="capitalize">{order.status}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{language === 'ar' ? 'عناصر الطلب' : 'Order items'}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <p className="font-medium text-foreground">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'الكمية' : 'Quantity'}: {item.quantity}
                    </p>
                  </div>
                  <span>{item.unitPrice.toFixed(2)} AED</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{language === 'ar' ? 'عنوان الشحن' : 'Shipping address'}</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <p>{order.shippingAddress.recipientName}</p>
              <p className="text-muted-foreground">{order.shippingAddress.addressLine1}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </CustomerAccountShell>
  )
}
