'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

import { StorefrontSectionRenderer } from '../components/StorefrontSectionRenderer'
import { useStorefrontRuntime } from '../hooks/useStorefrontRuntime'

export default function StorefrontHomePage() {
  const { direction, language } = useLanguage()
  const { data: runtime, isLoading, isError, error } = useStorefrontRuntime()

  if (isLoading) return <LoadingState message={language === 'ar' ? 'جارٍ تحميل الصفحة الرئيسية...' : 'Loading homepage...'} />
  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل الصفحة الرئيسية' : 'Could not load homepage'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }
  if (!runtime) {
    return <EmptyState title={language === 'ar' ? 'لا توجد بيانات للصفحة الرئيسية' : 'No homepage data available'} />
  }

  const hero = runtime.homePage.hero

  return (
    <div className="space-y-16 pb-16">
      <section className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className={cn('space-y-6', direction === 'rtl' && 'text-right')}>
            <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              {hero.badge}
            </span>
            <h1 className="text-5xl font-bold leading-tight text-foreground" style={{ fontFamily: runtime.theme.fontHeading }}>
              {hero.title}
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">{hero.subtitle}</p>
            <div className={cn('flex flex-wrap gap-3', direction === 'rtl' && 'flex-row-reverse')}>
              <Link href={hero.primaryCtaHref}>
                <Button size="lg" className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                  {hero.primaryCtaLabel}
                  <ArrowRight className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
                </Button>
              </Link>
              {hero.secondaryCtaLabel && hero.secondaryCtaHref ? (
                <Link href={hero.secondaryCtaHref}>
                  <Button size="lg" variant="outline">
                    {hero.secondaryCtaLabel}
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="aspect-[4/5] w-full max-w-md rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-sm">
              <div className="flex h-full flex-col justify-between rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-accent/10 p-8">
                <div className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                  {runtime.profile.name}
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-semibold text-foreground" style={{ fontFamily: runtime.theme.fontHeading }}>
                    {runtime.profile.slogan}
                  </h2>
                  <p className="text-muted-foreground">{runtime.profile.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        {runtime.homePage.sections.map((section) => (
          <StorefrontSectionRenderer key={section.id} section={section} />
        ))}
      </div>
    </div>
  )
}
