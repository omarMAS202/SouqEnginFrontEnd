'use client'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/features/localization'

import { useStorefrontPolicyPage, useStorefrontStaticPage } from '../hooks/useStorefrontRuntime'

export function StaticContentPage({
  pageSlug,
}: {
  pageSlug: string
}) {
  const { language } = useLanguage()
  const { data: page, isLoading, isError, error } = useStorefrontStaticPage(pageSlug)

  if (isLoading) return <LoadingState message={language === 'ar' ? 'جارٍ تحميل الصفحة...' : 'Loading page...'} />
  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل الصفحة' : 'Could not load page'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  if (!page) return <EmptyState title={language === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'} />

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">{page.title}</h1>
        <p className="text-muted-foreground">{page.lead}</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="leading-8 text-foreground">{page.body}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function PolicyContentPage({
  policySlug,
}: {
  policySlug: string
}) {
  const { language } = useLanguage()
  const { data: policy, isLoading, isError, error } = useStorefrontPolicyPage(policySlug)

  if (isLoading) return <LoadingState message={language === 'ar' ? 'جارٍ تحميل السياسات...' : 'Loading policy...'} />
  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل السياسات' : 'Could not load policy'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  if (!policy) return <EmptyState title={language === 'ar' ? 'السياسة غير موجودة' : 'Policy not found'} />

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">{policy.title}</h1>
        <p className="text-muted-foreground">{policy.summary}</p>
      </div>
      {policy.sections.map((section) => (
        <Card key={section.id}>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
            <p className="leading-8 text-muted-foreground">{section.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
