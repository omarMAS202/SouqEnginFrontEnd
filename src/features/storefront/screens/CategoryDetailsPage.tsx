'use client'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { useLanguage } from '@/features/localization'

import { StorefrontProductCard } from '../components/StorefrontProductCard'
import { useStorefrontCategory } from '../hooks/useStorefrontRuntime'

export default function CategoryDetailsPage({
  categorySlug,
}: {
  categorySlug: string
}) {
  const { language } = useLanguage()
  const { data, isLoading, isError, error } = useStorefrontCategory(categorySlug)

  if (isLoading) return <LoadingState message={language === 'ar' ? 'جارٍ تحميل الفئة...' : 'Loading category...'} />
  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل الفئة' : 'Could not load category'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }
  if (!data) {
    return (
      <EmptyState
        title={language === 'ar' ? 'الفئة غير موجودة' : 'Category not found'}
        description={language === 'ar' ? 'تحقق من الرابط أو من بيانات المتجر الحالية.' : 'Check the URL or current storefront data.'}
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">{data.category.name}</h1>
        <p className="max-w-3xl text-muted-foreground">{data.category.description}</p>
      </div>

      {data.products.length === 0 ? (
        <EmptyState
          title={language === 'ar' ? 'لا توجد منتجات في هذه الفئة' : 'No products in this category yet'}
          description={language === 'ar' ? 'يمكن للمتجر تفعيل هذه الفئة لاحقاً عند توفر المنتجات.' : 'This category can be activated once products are available.'}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {data.products.map((product) => (
            <StorefrontProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
