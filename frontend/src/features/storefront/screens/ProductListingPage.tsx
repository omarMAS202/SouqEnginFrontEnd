'use client'

import { useMemo, useState } from 'react'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/features/localization'

import { StorefrontProductCard } from '../components/StorefrontProductCard'
import { useStorefrontCategories, useStorefrontProducts } from '../hooks/useStorefrontRuntime'

export default function ProductListingPage() {
  const { language } = useLanguage()
  const { data: products = [], isLoading, isError, error } = useStorefrontProducts()
  const { data: categories = [] } = useStorefrontCategories()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.subtitle.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = category === 'all' || product.categoryId === category
        return matchesSearch && matchesCategory
      }),
    [category, products, search],
  )

  if (isLoading) return <LoadingState message={language === 'ar' ? 'جارٍ تحميل المنتجات...' : 'Loading products...'} />
  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل المنتجات' : 'Could not load products'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">{language === 'ar' ? 'كل المنتجات' : 'All products'}</h1>
        <p className="text-muted-foreground">
          {language === 'ar'
            ? 'واجهة قائمة منتجات قابلة للربط لاحقاً مع pagination والتصفية من الـ backend.'
            : 'A storefront product index ready to connect to backend filtering and pagination later.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={language === 'ar' ? 'ابحث عن منتج أو وصف مختصر' : 'Search products'}
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'ar' ? 'كل الفئات' : 'All categories'}</SelectItem>
            {categories.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          title={language === 'ar' ? 'لا توجد منتجات مطابقة' : 'No products match your filters'}
          description={language === 'ar' ? 'جرّب تغيير البحث أو الفئة المحددة.' : 'Try a different search or category.'}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <StorefrontProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
