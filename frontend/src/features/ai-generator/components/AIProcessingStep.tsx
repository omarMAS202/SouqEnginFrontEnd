'use client'

import { Loader2, Sparkles } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

interface AIProcessingStepProps {
  prompt: string
  status: 'submitting' | 'generating'
}

export function AIProcessingStep({ prompt, status }: AIProcessingStepProps) {
  const { direction, language } = useLanguage()

  const steps =
    status === 'submitting'
      ? [
          language === 'ar' ? 'تحليل وصف المتجر' : 'Analyzing the store brief',
          language === 'ar' ? 'التحقق من الحاجة إلى توضيحات إضافية' : 'Checking whether clarification is needed',
        ]
      : [
          language === 'ar' ? 'تجهيز هيكل المتجر' : 'Preparing the store structure',
          language === 'ar' ? 'تكوين الفئات والمنتجات الأولية' : 'Drafting starter categories and products',
          language === 'ar' ? 'تطبيق الإعدادات والثيم والصفحات' : 'Applying theme, settings, and content pages',
          language === 'ar' ? 'فحص صلاحية المسودة للمراجعة' : 'Validating the draft for review',
        ]

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-8 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Sparkles className="h-9 w-9" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            {status === 'submitting'
              ? language === 'ar'
                ? 'جارٍ تجهيز طلب الذكاء الاصطناعي'
                : 'Preparing the AI request'
              : language === 'ar'
                ? 'جارٍ إنشاء مسودة المتجر'
                : 'Generating the store draft'}
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            {language === 'ar'
              ? 'يتم الآن تحويل الفكرة إلى مسودة متجر قابلة للمراجعة، مع التحقق من الحقول الأساسية قبل عرض النتيجة.'
              : 'The idea is being converted into a reviewable storefront draft, with validation checks before the result is shown.'}
          </p>
          <p className="max-w-2xl rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            {prompt}
          </p>
        </div>

        <div className="w-full max-w-xl space-y-3">
          {steps.map((step, index) => (
            <div
              key={step}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left',
                direction === 'rtl' && 'flex-row-reverse text-right',
              )}
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-foreground">
                {index + 1}. {step}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
