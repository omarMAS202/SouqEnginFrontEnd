'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ExternalLink, Rocket, Save } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

import type { StoreDraft } from '../types/ai-draft.types'

interface AIConfirmationStepProps {
  draft: StoreDraft
  isConfirmed: boolean
  previewApplied: boolean
  onBack: () => void
  onConfirm: () => void
  onApplyPreview: () => void
  isApplyingPreview?: boolean
}

export function AIConfirmationStep({
  draft,
  isConfirmed,
  previewApplied,
  onBack,
  onConfirm,
  onApplyPreview,
  isApplyingPreview = false,
}: AIConfirmationStepProps) {
  const { direction, language } = useLanguage()
  const runtime = draft.runtime

  return (
    <div className="space-y-6">
      <div className={cn('flex items-start justify-between gap-4', direction === 'rtl' && 'flex-row-reverse')}>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'تأكيد جاهزية المسودة' : 'Confirm draft readiness'}
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            {language === 'ar'
              ? 'هذه الخطوة لا تحفظ المتجر فعلياً في قاعدة البيانات. هي فقط تميّز المسودة على أنها مراجعة بشرية وجاهزة للإرسال إلى backend لاحقاً.'
              : 'This step does not persist the store to a database. It only marks the draft as human-reviewed and ready for future backend persistence.'}
          </p>
        </div>

        <Button variant="ghost" onClick={onBack} className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}>
          <ArrowLeft className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
          {language === 'ar' ? 'العودة للتعديل' : 'Back to editing'}
        </Button>
      </div>

      {isConfirmed ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>{language === 'ar' ? 'تم اعتماد المسودة' : 'Draft confirmed'}</AlertTitle>
          <AlertDescription>
            {language === 'ar'
              ? 'أصبحت المسودة الآن جاهزة للإرسال إلى backend عند توفر عقد الحفظ النهائي.'
              : 'The draft is now marked as ready to be sent to the backend when the final persistence contract is available.'}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'ملخص المسودة الجاهزة' : 'Ready-to-confirm draft summary'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المتجر' : 'Store'}</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{runtime.profile.name}</p>
              <p className="text-sm text-muted-foreground">{runtime.profile.slogan}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الثيم' : 'Theme'}</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{runtime.theme.themeName}</p>
              <p className="text-sm text-muted-foreground">{runtime.theme.primaryColor}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الفئات' : 'Categories'}</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{runtime.categories.length}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المنتجات' : 'Products'}</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{runtime.products.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'الإجراءات التالية' : 'Next actions'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={onConfirm}
              disabled={isConfirmed}
              size="lg"
              className={cn('w-full gap-2', direction === 'rtl' && 'flex-row-reverse')}
            >
              <Save className="h-4 w-4" />
              {isConfirmed
                ? language === 'ar'
                  ? 'تم اعتماد المسودة'
                  : 'Draft already confirmed'
                : language === 'ar'
                  ? 'اعتماد المسودة كجاهزة للحفظ'
                  : 'Mark draft as ready for persistence'}
            </Button>

            <Button
              variant="outline"
              onClick={onApplyPreview}
              disabled={isApplyingPreview}
              className={cn('w-full gap-2', direction === 'rtl' && 'flex-row-reverse')}
            >
              <Rocket className="h-4 w-4" />
              {isApplyingPreview
                ? language === 'ar'
                  ? 'جارٍ تطبيق المعاينة...'
                  : 'Applying preview...'
                : previewApplied
                  ? language === 'ar'
                    ? 'تم تحديث معاينة الواجهة'
                    : 'Storefront preview updated'
                  : language === 'ar'
                    ? 'تطبيق المسودة على معاينة الواجهة'
                    : 'Apply draft to storefront preview'}
            </Button>

            <Link href="/storefront" className="block">
              <Button variant="ghost" className={cn('w-full gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                {language === 'ar' ? 'فتح معاينة الواجهة' : 'Open storefront preview'}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
