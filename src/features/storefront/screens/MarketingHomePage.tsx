'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, Globe, Layers3, Sparkles, Store, Wrench } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

const features = [
  {
    icon: Sparkles,
    title: { en: 'AI-assisted store setup', ar: 'إعداد المتجر بمساعدة الذكاء الاصطناعي' },
    description: {
      en: 'Generate a starter structure you can refine before connecting to live APIs.',
      ar: 'ولّد هيكلًا أوليًا للمتجر ثم عدّله قبل ربطه بواجهات API الحقيقية.',
    },
  },
  {
    icon: Globe,
    title: { en: 'Arabic and English UX', ar: 'تجربة عربية وإنجليزية' },
    description: {
      en: 'RTL and LTR support is built into the storefront and dashboard shell.',
      ar: 'دعم RTL وLTR مدمج داخل واجهة المتجر ولوحة التحكم.',
    },
  },
  {
    icon: Layers3,
    title: { en: 'Feature-first architecture', ar: 'هيكل معماري قائم على الميزات' },
    description: {
      en: 'The codebase is organized to help teams add products, orders, billing, and settings safely.',
      ar: 'تنظيم الكود يساعد الفريق على إضافة المنتجات والطلبات والفوترة والإعدادات بشكل آمن.',
    },
  },
  {
    icon: Wrench,
    title: { en: 'Backend integration ready', ar: 'جاهز للتكامل الخلفي' },
    description: {
      en: 'Adapters and screen states are structured so real endpoints can replace local fallbacks cleanly.',
      ar: 'طبقات الربط وحالات الشاشات مهيأة لاستبدال الـ fallback المحلي بنقاط نهاية حقيقية بسهولة.',
    },
  },
] as const

const highlights = [
  { value: { en: 'Structured', ar: 'منظّم' }, label: { en: 'Feature modules', ar: 'وحدات ميزات' } },
  { value: { en: 'Typed', ar: 'مكتوب النوع' }, label: { en: 'Forms and models', ar: 'النماذج والكيانات' } },
  { value: { en: 'Ready', ar: 'جاهز' }, label: { en: 'For API replacement', ar: 'لاستبدال الـ API' } },
  { value: { en: 'Clear', ar: 'واضح' }, label: { en: 'Screen states', ar: 'لحالات الشاشات' } },
] as const

export default function MarketingHomePage() {
  const { language, setLanguage, direction } = useLanguage()

  const copy = {
    badge: language === 'ar' ? 'واجهة تجارة إلكترونية جاهزة للتكامل' : 'Integration-ready e-commerce frontend',
    title:
      language === 'ar'
        ? 'ابنِ متجرك بهيكل احترافي ثم اربطه بالخلفية التي تختارها'
        : 'Build your storefront on a professional shell, then connect the backend you choose',
    subtitle:
      language === 'ar'
        ? 'SOUQ ENGINE يركز هنا على واجهة مرتبة، ثنائية اللغة، وقابلة للتوسعة حتى تبدأ تنفيذ الميزات بسرعة وبدون ارتباك.'
        : 'SOUQ ENGINE gives you a clean bilingual frontend foundation so you can start building features immediately without architectural confusion.',
    primaryCta: language === 'ar' ? 'ابدأ من مولد المتجر' : 'Start with the store generator',
    secondaryCta: language === 'ar' ? 'استعرض واجهة المتجر' : 'Preview storefront',
    dashboard: language === 'ar' ? 'لوحة التحكم' : 'Dashboard',
    admin: language === 'ar' ? 'لوحة الإدارة' : 'Admin',
    featuresTitle: language === 'ar' ? 'ما الذي جهزناه داخل الواجهة؟' : 'What is already prepared in the frontend?',
    featuresSubtitle:
      language === 'ar'
        ? 'ميزات عملية تساعدك على التطوير الآن، بدون ادعاءات تسويقية غير موثقة.'
        : 'Practical capabilities you can build on right now, without inflated demo claims.',
    ctaTitle:
      language === 'ar'
        ? 'ابدأ من أساس واضح ثم أوصل خدماتك الحقيقية لاحقاً'
        : 'Start from a clear foundation and plug in real services later',
    ctaSubtitle:
      language === 'ar'
        ? 'المشروع الآن مرتب بحيث يمكن استبدال موصلات البيانات الحالية بواجهات API حقيقية دون إعادة تنظيم الواجهة بالكامل.'
        : 'The current frontend is structured so local fallback adapters can be replaced with real API endpoints without another structural refactor.',
    ctaAction: language === 'ar' ? 'إنشاء متجر تجريبي' : 'Create a starter store',
    footer: language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.',
    ready: language === 'ar' ? 'جاهز للبدء' : 'Ready to start',
    honest: language === 'ar' ? 'بدون افتراضات خلفية مزيفة' : 'No fake backend assumptions',
    buildNow: language === 'ar' ? 'مناسب للتطوير الفوري' : 'Built for immediate development',
  }

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={cn('flex h-16 items-center justify-between', direction === 'rtl' && 'flex-row-reverse')}>
            <Link href="/" className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">SOUQ ENGINE</span>
            </Link>

            <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
              <Button variant="ghost" size="sm" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>
                <Globe className={cn('h-4 w-4', direction === 'rtl' ? 'ml-2' : 'mr-2')} />
                {language === 'en' ? 'العربية' : 'English'}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  {copy.dashboard}
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="sm">{copy.admin}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              {copy.badge}
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground text-balance md:text-6xl lg:text-7xl">
              {copy.title}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground text-pretty">{copy.subtitle}</p>
            <div className={cn('flex items-center justify-center gap-4 flex-wrap', direction === 'rtl' && 'flex-row-reverse')}>
              <Link href="/dashboard/ai-generator">
                <Button size="lg" className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                  <Sparkles className="h-5 w-5" />
                  {copy.primaryCta}
                  <ArrowRight className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
                </Button>
              </Link>
              <Link href="/storefront">
                <Button variant="outline" size="lg">
                  {copy.secondaryCta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {highlights.map((item) => (
              <div key={item.label.en} className="text-center">
                <p className="text-3xl font-bold text-primary md:text-4xl">
                  {language === 'ar' ? item.value.ar : item.value.en}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {language === 'ar' ? item.label.ar : item.label.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">{copy.featuresTitle}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{copy.featuresSubtitle}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title.en} className="text-center">
                <CardContent className="pb-6 pt-8">
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {language === 'ar' ? feature.title.ar : feature.title.en}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? feature.description.ar : feature.description.en}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-8 text-center md:p-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">{copy.ctaTitle}</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">{copy.ctaSubtitle}</p>
            <div className={cn('flex items-center justify-center gap-4 flex-wrap', direction === 'rtl' && 'flex-row-reverse')}>
              <Link href="/dashboard/ai-generator">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  {copy.ctaAction}
                </Button>
              </Link>
            </div>
            <div className={cn('mt-8 flex items-center justify-center gap-8 text-sm opacity-80', direction === 'rtl' && 'flex-row-reverse')}>
              <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                <CheckCircle className="h-4 w-4" />
                <span>{copy.ready}</span>
              </div>
              <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                <CheckCircle className="h-4 w-4" />
                <span>{copy.honest}</span>
              </div>
              <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                <CheckCircle className="h-4 w-4" />
                <span>{copy.buildNow}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className={cn('flex flex-col items-center justify-between gap-4 md:flex-row', direction === 'rtl' && 'md:flex-row-reverse')}>
            <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">SOUQ ENGINE</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 SOUQ ENGINE. {copy.footer}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
