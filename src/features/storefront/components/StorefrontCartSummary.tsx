'use client'

import { useLanguage } from '@/features/localization'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useCart } from '../hooks/useCart'

export function StorefrontCartSummary() {
  const { language } = useLanguage()
  const { summary } = useCart()

  const rows = [
    { label: language === 'ar' ? 'المجموع الفرعي' : 'Subtotal', value: summary.subtotal },
    { label: language === 'ar' ? 'الشحن' : 'Shipping', value: summary.shipping },
    { label: language === 'ar' ? 'الضريبة' : 'Tax', value: summary.tax },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{language === 'ar' ? 'ملخص الطلب' : 'Order summary'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span>{row.value.toFixed(2)} AED</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold">
          <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
          <span>{summary.total.toFixed(2)} AED</span>
        </div>
      </CardContent>
    </Card>
  )
}
