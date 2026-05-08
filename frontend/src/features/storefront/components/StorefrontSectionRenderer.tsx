'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Quote, Sparkles } from 'lucide-react'

import { useLanguage } from '@/features/localization'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'

import { useStorefrontCategories, useStorefrontFeaturedProducts } from '../hooks/useStorefrontRuntime'
import type { StorefrontSectionConfig } from '../types/storefront.types'
import { StorefrontProductCard } from './StorefrontProductCard'

export function StorefrontSectionRenderer({
  section,
}: {
  section: StorefrontSectionConfig
}) {
  const { direction, language } = useLanguage()
  const { data: categories = [] } = useStorefrontCategories()
  const { data: featuredProducts = [] } = useStorefrontFeaturedProducts()

  if (!section.enabled) return null

  if (section.type === 'featured_categories') {
    const items = categories
      .filter((category) => (section.categoryIds?.length ? section.categoryIds.includes(category.id) : true))
      .slice(0, section.limit ?? 4)

    return (
      <section className="space-y-6">
        <div className={cn('flex items-end justify-between gap-4', direction === 'rtl' && 'flex-row-reverse')}>
          <div className={cn(direction === 'rtl' && 'text-right')}>
            <h2 className="text-3xl font-bold text-foreground">{section.title}</h2>
            <p className="text-muted-foreground">{section.subtitle}</p>
          </div>
          <Link href="/storefront/categories">
            <Button variant="ghost" className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}>
              {language === 'ar' ? 'كل الفئات' : 'All categories'}
              <ArrowRight className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((category) => (
            <Link key={category.id} href={`/storefront/categories/${category.slug}`}>
              <Card className="h-full border-border/70 transition-transform hover:-translate-y-1 hover:border-primary/30">
                <CardContent className="space-y-3 p-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {category.productCount} {language === 'ar' ? 'منتجات' : 'products'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  if (section.type === 'featured_products') {
    const items = featuredProducts
      .filter((product) => (section.productIds?.length ? section.productIds.includes(product.id) : true))
      .slice(0, section.limit ?? 4)

    return (
      <section className="space-y-6">
        <div className={cn(direction === 'rtl' && 'text-right')}>
          <h2 className="text-3xl font-bold text-foreground">{section.title}</h2>
          <p className="text-muted-foreground">{section.subtitle}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {items.map((product) => (
            <StorefrontProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    )
  }

  if (section.type === 'promotional_grid') {
    return (
      <section className="space-y-6">
        <div className={cn(direction === 'rtl' && 'text-right')}>
          <h2 className="text-3xl font-bold text-foreground">{section.title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {section.blocks?.map((block) => (
            <Card key={block.id} className="border-border/70 bg-gradient-to-br from-card to-secondary/40">
              <CardContent className="space-y-3 p-6">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{block.title}</h3>
                <p className="text-sm text-muted-foreground">{block.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (section.type === 'testimonials') {
    return (
      <section className="space-y-6">
        <div className={cn(direction === 'rtl' && 'text-right')}>
          <h2 className="text-3xl font-bold text-foreground">{section.title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {section.testimonials?.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-4 p-6">
                <Quote className="h-5 w-5 text-accent" />
                <p className="text-foreground">{item.quote}</p>
                <div>
                  <p className="font-semibold text-foreground">{item.customerName}</p>
                  <p className="text-sm text-muted-foreground">{item.customerTitle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (section.type === 'newsletter') {
    return (
      <section>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10">
          <CardContent className="space-y-4 p-8 text-center">
            <h2 className="text-3xl font-bold text-foreground">{section.title}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">{section.subtitle}</p>
            <Button>{language === 'ar' ? 'سجل اهتمامك' : 'Join the list'}</Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className={cn(direction === 'rtl' && 'text-right')}>
        <h2 className="text-3xl font-bold text-foreground">{section.title}</h2>
        <p className="text-muted-foreground">{section.content ?? section.subtitle}</p>
      </div>
    </section>
  )
}
