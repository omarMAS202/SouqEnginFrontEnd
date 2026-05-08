'use client'

import {
  Building2,
  Calendar,
  Check,
  CreditCard,
  Download,
  Receipt,
  Sparkles,
  Zap,
} from 'lucide-react'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

import { useBillingSnapshot } from '../hooks/useBilling'

interface PlanDefinition {
  id: 'starter' | 'pro' | 'enterprise'
  price: number
  description: { en: string; ar: string }
  features: { en: string; ar: string }[]
  popular?: boolean
}

const plans: PlanDefinition[] = [
  {
    id: 'starter',
    price: 29,
    description: {
      en: 'Perfect for small businesses and first launches.',
      ar: 'مناسب للمتاجر الصغيرة والانطلاقة الأولى.',
    },
    features: [
      { en: 'Up to 100 products', ar: 'حتى 100 منتج' },
      { en: 'Basic analytics', ar: 'تحليلات أساسية' },
      { en: 'Email support', ar: 'دعم عبر البريد الإلكتروني' },
      { en: '1 staff account', ar: 'حساب موظف واحد' },
    ],
  },
  {
    id: 'pro',
    price: 79,
    description: {
      en: 'Balanced plan for growing stores and operational teams.',
      ar: 'الخطة الأنسب للمتاجر النامية والفرق التشغيلية.',
    },
    features: [
      { en: 'Unlimited products', ar: 'منتجات غير محدودة' },
      { en: 'Advanced analytics', ar: 'تحليلات متقدمة' },
      { en: 'Priority support', ar: 'دعم بأولوية' },
      { en: '5 staff accounts', ar: 'خمسة حسابات للموظفين' },
      { en: 'AI store generator', ar: 'مولد متجر بالذكاء الاصطناعي' },
      { en: 'Custom domain', ar: 'نطاق مخصص' },
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    price: 199,
    description: {
      en: 'For high-volume stores with advanced operational needs.',
      ar: 'للمتاجر الكبيرة ذات العمليات والاحتياجات المتقدمة.',
    },
    features: [
      { en: 'Everything in Pro', ar: 'كل ما في خطة الاحترافي' },
      { en: 'Dedicated support', ar: 'دعم مخصص' },
      { en: 'Unlimited staff', ar: 'عدد غير محدود من الموظفين' },
      { en: 'API access', ar: 'وصول إلى الواجهة البرمجية' },
      { en: 'White-label options', ar: 'خيارات علامة تجارية بيضاء' },
      { en: 'SLA guarantee', ar: 'ضمان اتفاقية مستوى الخدمة' },
    ],
  },
]

export default function BillingPage() {
  const { t, direction, language } = useLanguage()
  const { data, isLoading, isError, error } = useBillingSnapshot()
  const invoices = data?.invoices ?? []

  const currentPlan = data?.subscription?.planId ?? invoices[0]?.planId ?? 'pro'
  const nextPaymentDate = data?.subscription?.nextPaymentAt ?? null

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(language === 'ar' ? 'ar-AE' : 'en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)

  const formatDate = (date: Date | string) =>
    new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(typeof date === 'string' ? new Date(date) : date)

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />
  }

  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل بيانات الفوترة' : 'Could not load billing data'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className={cn(direction === 'rtl' && 'text-right')}>
        <h1 className="text-2xl font-bold text-foreground">{t('billing.title')}</h1>
        <p className="text-muted-foreground">
          {language === 'ar'
            ? 'راجع خطتك الحالية، والفواتير السابقة، واستعدادك للنمو القادم.'
            : 'Review your active plan, billing history, and readiness for your next growth step.'}
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
        <div
          className={cn(
            'flex flex-col justify-between gap-4 md:flex-row md:items-center',
            direction === 'rtl' && 'md:flex-row-reverse',
          )}
        >
          <div className={cn(direction === 'rtl' && 'text-right')}>
            <div className={cn('mb-2 flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse justify-end')}>
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">{t('billing.currentPlan')}</span>
            </div>
            <h2 className="mb-1 text-3xl font-bold">{t(`billing.plans.${currentPlan}`)}</h2>
            <p className="opacity-80">
              {formatCurrency(plans.find((plan) => plan.id === currentPlan)?.price ?? 79)}
              {language === 'ar' ? ' / شهرياً' : ' / month'}
            </p>
          </div>

          <div className={cn('flex flex-col gap-3 sm:flex-row', direction === 'rtl' && 'sm:flex-row-reverse')}>
            <div className={cn('flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur', direction === 'rtl' && 'flex-row-reverse')}>
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {t('billing.nextPayment')}:{' '}
                {nextPaymentDate ? formatDate(nextPaymentDate) : language === 'ar' ? 'غير متاح' : 'Not available'}
              </span>
            </div>
            <Button variant="secondary" className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}>
              <CreditCard className="h-4 w-4" />
              {t('billing.paymentMethod')}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className={cn('mb-4 text-lg font-semibold', direction === 'rtl' && 'text-right')}>
          {language === 'ar' ? 'خطط الاشتراك' : 'Subscription plans'}
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan
            const Icon = plan.id === 'starter' ? Zap : plan.id === 'pro' ? Sparkles : Building2

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-xl border-2 bg-card p-6 transition-all',
                  isCurrentPlan ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50',
                  plan.popular && 'ring-2 ring-accent ring-offset-2',
                )}
              >
                {plan.popular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    {language === 'ar' ? 'الأكثر اختياراً' : 'Most Popular'}
                  </div>
                ) : null}

                <div className={cn('space-y-4', direction === 'rtl' && 'text-right')}>
                  <div className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse justify-end')}>
                    <div className={cn('rounded-lg p-2', isCurrentPlan ? 'bg-primary/10' : 'bg-muted')}>
                      <Icon className={cn('h-5 w-5', isCurrentPlan ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <h4 className="font-semibold">{t(`billing.plans.${plan.id}`)}</h4>
                  </div>

                  <div>
                    <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                    <span className="text-muted-foreground">{language === 'ar' ? ' / شهر' : ' / month'}</span>
                  </div>

                  <p className="text-sm text-muted-foreground">{language === 'ar' ? plan.description.ar : plan.description.en}</p>

                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature.en} className={cn('flex items-center gap-2 text-sm', direction === 'rtl' && 'flex-row-reverse')}>
                        <Check className="h-4 w-4 shrink-0 text-green-500" />
                        <span>{language === 'ar' ? feature.ar : feature.en}</span>
                      </li>
                    ))}
                  </ul>

                  <Button variant={isCurrentPlan ? 'outline' : 'default'} className="w-full" disabled={isCurrentPlan}>
                    {isCurrentPlan ? (language === 'ar' ? 'الخطة الحالية' : 'Current Plan') : t('billing.upgrade')}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className={cn('flex items-center justify-between border-b border-border p-4', direction === 'rtl' && 'flex-row-reverse')}>
          <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
            <Receipt className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">{t('billing.invoices')}</h3>
          </div>
        </div>

        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <EmptyState
              title={language === 'ar' ? 'لا توجد فواتير بعد' : 'No invoices yet'}
              description={
                language === 'ar'
                  ? 'ستظهر سجلات الفوترة هنا عند ربط نظام الاشتراكات أو إصدار أول فاتورة.'
                  : 'Billing history will appear here once subscriptions are connected or the first invoice is issued.'
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={cn('flex items-center justify-between p-4 transition-colors hover:bg-muted/50', direction === 'rtl' && 'flex-row-reverse')}
                >
                  <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
                    <div className="rounded-lg bg-muted p-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className={cn(direction === 'rtl' && 'text-right')}>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                    </div>
                  </div>

                  <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
                    <div className={cn(direction === 'rtl' && 'text-right')}>
                      <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs',
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700',
                        )}
                      >
                        {invoice.status === 'paid' ? (language === 'ar' ? 'مدفوع' : 'Paid') : language === 'ar' ? 'معلّق' : 'Pending'}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
