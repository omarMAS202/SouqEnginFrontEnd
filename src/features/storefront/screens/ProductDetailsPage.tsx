'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, ShoppingBag, Truck } from 'lucide-react'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

import { useCart } from '../hooks/useCart'
import { useStorefrontProduct } from '../hooks/useStorefrontRuntime'

export default function ProductDetailsPage({
  productSlug,
}: {
  productSlug: string
}) {
  const { language, direction } = useLanguage()
  const { addItem } = useCart()
  const { data: product, isLoading, isError, error } = useStorefrontProduct(productSlug)

  if (isLoading) return <LoadingState message={language === 'ar' ? 'جارٍ تحميل المنتج...' : 'Loading product...'} />
  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل المنتج' : 'Could not load product'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }
  if (!product) {
    return <EmptyState title={language === 'ar' ? 'المنتج غير موجود' : 'Product not found'} />
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/storefront/products" className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground', direction === 'rtl' && 'flex-row-reverse')}>
        {direction === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        {language === 'ar' ? 'العودة إلى المنتجات' : 'Back to products'}
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="flex aspect-square items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10 p-8">
              <ShoppingBag className="h-28 w-28 text-primary/25" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-3 gap-3">
            {product.images.slice(0, 3).map((image) => (
              <Card key={image.id}>
                <CardContent className="flex aspect-square items-center justify-center bg-secondary/30 p-4">
                  <ShoppingBag className="h-10 w-10 text-primary/20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-primary">{product.categoryName}</p>
            <h1 className="text-4xl font-bold text-foreground">{product.name}</h1>
            <p className="text-lg text-muted-foreground">{product.subtitle}</p>
          </div>

          <div className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
            <span className="text-3xl font-bold text-foreground">{product.price} AED</span>
            {product.compareAtPrice ? (
              <span className="text-lg text-muted-foreground line-through">{product.compareAtPrice} AED</span>
            ) : null}
          </div>

          <div className={cn('flex flex-wrap gap-2', direction === 'rtl' && 'flex-row-reverse')}>
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            <Badge>{product.stockStatus.replace('_', ' ')}</Badge>
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{language === 'ar' ? 'أبرز التفاصيل' : 'Highlights'}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {product.highlights.map((highlight) => (
                <li key={highlight}>• {highlight}</li>
              ))}
            </ul>
          </div>

          <div className={cn('flex flex-wrap gap-3', direction === 'rtl' && 'flex-row-reverse')}>
            <Button size="lg" onClick={() => addItem(product.id)}>
              {language === 'ar' ? 'أضف إلى السلة' : 'Add to cart'}
            </Button>
            <Link href="/storefront/checkout">
              <Button size="lg" variant="outline">
                {language === 'ar' ? 'ابدأ الطلب' : 'Start checkout'}
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className={cn('flex items-start gap-3 p-5', direction === 'rtl' && 'flex-row-reverse')}>
              <Truck className="mt-1 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  {language === 'ar' ? 'معلومة شحن قابلة للتخصيص' : 'Configurable shipping note'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar'
                    ? 'يمكن لاحقاً ربط هذا القسم بإعدادات الشحن الحقيقية الخاصة بالمتجر.'
                    : 'This block can later be driven by real store shipping configuration.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
