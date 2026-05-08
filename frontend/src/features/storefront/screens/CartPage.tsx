'use client'

import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'

import { EmptyState } from '@/components/shared/ScreenState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

import { StorefrontCartSummary } from '../components/StorefrontCartSummary'
import { useCart } from '../hooks/useCart'

export default function CartPage() {
  const { language, direction } = useLanguage()
  const { items, updateQuantity, removeItem } = useCart()

  if (!items.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title={language === 'ar' ? 'سلتك فارغة' : 'Your cart is empty'}
          description={language === 'ar' ? 'أضف بعض المنتجات أولاً ثم تابع إلى الطلب.' : 'Add products first, then continue to checkout.'}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className={cn(direction === 'rtl' && 'text-right')}>
        <h1 className="text-4xl font-bold text-foreground">{language === 'ar' ? 'سلة التسوق' : 'Shopping cart'}</h1>
        <p className="text-muted-foreground">
          {language === 'ar'
            ? 'الخطوة التالية هي مراجعة العناصر ثم المتابعة إلى نموذج الطلب.'
            : 'Review your items, then continue to the checkout foundation.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map(({ product, quantity }) =>
            product ? (
              <Card key={product.id}>
                <CardContent className={cn('flex gap-4 p-5', direction === 'rtl' && 'flex-row-reverse')}>
                  <div className="flex h-28 w-24 items-center justify-center rounded-2xl bg-secondary/40">
                    <ShoppingBag className="h-10 w-10 text-primary/20" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className={cn('flex items-start justify-between gap-4', direction === 'rtl' && 'flex-row-reverse')}>
                      <div className={cn(direction === 'rtl' && 'text-right')}>
                        <h2 className="text-lg font-semibold text-foreground">{product.name}</h2>
                        <p className="text-sm text-muted-foreground">{product.subtitle}</p>
                      </div>
                      <button onClick={() => removeItem(product.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className={cn('flex items-center justify-between gap-4', direction === 'rtl' && 'flex-row-reverse')}>
                      <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                        <Button size="icon" variant="outline" onClick={() => updateQuantity(product.id, quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <Button size="icon" variant="outline" onClick={() => updateQuantity(product.id, quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="text-lg font-semibold text-foreground">
                        {(product.price * quantity).toFixed(2)} AED
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null,
          )}
        </div>

        <div className="space-y-4">
          <StorefrontCartSummary />
          <Link href="/storefront/checkout">
            <Button className="w-full" size="lg">
              {language === 'ar' ? 'المتابعة إلى الطلب' : 'Continue to checkout'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
