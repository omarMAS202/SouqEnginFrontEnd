'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

import { useStorefrontCategories } from '../hooks/useStorefrontRuntime'

export default function CategoryListingPage() {
  const { language, direction } = useLanguage()
  const { data: categories = [], isLoading, isError, error } = useStorefrontCategories()

  if (isLoading) return <LoadingState message={language === 'ar' ? 'جارٍ تحميل الفئات...' : 'Loading categories...'} />
  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل الفئات' : 'Could not load categories'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  if (!categories.length) {
    return <EmptyState title={language === 'ar' ? 'لا توجد فئات متاحة' : 'No categories available'} />
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className={cn(direction === 'rtl' && 'text-right')}>
        <h1 className="text-4xl font-bold text-foreground">{language === 'ar' ? 'تصفح الفئات' : 'Browse categories'}</h1>
        <p className="text-muted-foreground">
          {language === 'ar'
            ? 'كل فئة في هذا المتجر يمكن إظهارها أو إعادة ترتيبها من خلال config المتجر أو مخرجات الذكاء الاصطناعي.'
            : 'Each category can later be controlled by storefront config or normalized AI store output.'}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/storefront/categories/${category.slug}`}>
            <Card className="h-full border-border/70 transition-transform hover:-translate-y-1 hover:border-primary/30">
              <CardContent className="space-y-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{category.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                </div>
                <div className={cn('flex items-center justify-between text-sm', direction === 'rtl' && 'flex-row-reverse')}>
                  <span className="font-medium text-primary">
                    {category.productCount} {language === 'ar' ? 'منتج' : 'products'}
                  </span>
                  <ArrowRight className={cn('h-4 w-4 text-muted-foreground', direction === 'rtl' && 'rotate-180')} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
