'use client'

import Link from 'next/link'
import { ShoppingBag, Star } from 'lucide-react'

import { useLanguage } from '@/features/localization'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'

import { useCart } from '../hooks/useCart'
import type { Product } from '../types/storefront.types'

export function StorefrontProductCard({ product }: { product: Product }) {
  const { direction, language } = useLanguage()
  const { addItem } = useCart()

  return (
    <Card className="group overflow-hidden border-border/80 bg-card">
      <CardContent className="p-0">
        <Link href={`/storefront/products/${product.slug}`} className="block">
          <div className="relative aspect-[4/5] bg-gradient-to-br from-primary/5 to-accent/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-primary/20" />
            </div>
            {product.compareAtPrice ? (
              <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                {language === 'ar' ? 'عرض' : 'Sale'}
              </span>
            ) : null}
          </div>
        </Link>

        <div className="space-y-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{product.categoryName}</p>
            <Link href={`/storefront/products/${product.slug}`}>
              <h3 className="mt-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">{product.subtitle}</p>
          </div>

          <div className={cn('flex items-center gap-2 text-sm', direction === 'rtl' && 'flex-row-reverse')}>
            <Star className="h-4 w-4 fill-current text-accent" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({product.reviewsCount} {language === 'ar' ? 'مراجعة' : 'reviews'})
            </span>
          </div>

          <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
            <span className="text-lg font-bold text-foreground">{product.price} AED</span>
            {product.compareAtPrice ? (
              <span className="text-sm text-muted-foreground line-through">{product.compareAtPrice} AED</span>
            ) : null}
          </div>

          <Button className="w-full" onClick={() => addItem(product.id)}>
            {language === 'ar' ? 'أضف إلى السلة' : 'Add to cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
