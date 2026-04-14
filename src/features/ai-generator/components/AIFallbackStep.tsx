'use client'

import { AlertTriangle, ArrowLeft, RefreshCcw, ShieldCheck, Wrench } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

interface AIFallbackStepProps {
  prompt: string
  errorMessage?: string
  hasPartialDraft?: boolean
  onRetry: () => void
  onUseStarterTemplate: () => void
  onContinuePartialDraft?: () => void
  onBack: () => void
}

export function AIFallbackStep({
  prompt,
  errorMessage,
  hasPartialDraft = false,
  onRetry,
  onUseStarterTemplate,
  onContinuePartialDraft,
  onBack,
}: AIFallbackStepProps) {
  const { direction, language } = useLanguage()

  return (
    <Card>
      <CardHeader className={cn('flex flex-row items-start gap-4', direction === 'rtl' && 'flex-row-reverse')}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <CardTitle>
            {language === 'ar' ? 'المسودة الحالية تحتاج مسار متابعة بديل' : 'This draft needs a safer fallback path'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {language === 'ar'
              ? 'لم نصل بعد إلى مسودة موثوقة بما يكفي. يمكنك إعادة المحاولة، أو استخدام قالب ابتدائي، أو متابعة التعديل اليدوي إن توفرت مسودة جزئية.'
              : 'We do not yet have a reliable enough draft. You can retry generation, switch to a starter template, or continue editing a partial result if one exists.'}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">{prompt}</div>
        {errorMessage ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <Button variant="outline" className="h-auto justify-start gap-3 px-4 py-4 text-left" onClick={onRetry}>
            <RefreshCcw className="h-4 w-4" />
            <span>
              <span className="block font-medium">{language === 'ar' ? 'إعادة التوليد' : 'Retry generation'}</span>
              <span className="block text-xs text-muted-foreground">
                {language === 'ar' ? 'إرسال الفكرة من جديد' : 'Submit the same idea again'}
              </span>
            </span>
          </Button>

          <Button variant="outline" className="h-auto justify-start gap-3 px-4 py-4 text-left" onClick={onUseStarterTemplate}>
            <ShieldCheck className="h-4 w-4" />
            <span>
              <span className="block font-medium">{language === 'ar' ? 'استخدم قالباً ابتدائياً' : 'Use a starter template'}</span>
              <span className="block text-xs text-muted-foreground">
                {language === 'ar' ? 'مسودة آمنة وقابلة للتعديل' : 'Safe editable storefront baseline'}
              </span>
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto justify-start gap-3 px-4 py-4 text-left"
            disabled={!hasPartialDraft || !onContinuePartialDraft}
            onClick={onContinuePartialDraft}
          >
            <Wrench className="h-4 w-4" />
            <span>
              <span className="block font-medium">{language === 'ar' ? 'أكمل يدوياً' : 'Continue manually'}</span>
              <span className="block text-xs text-muted-foreground">
                {language === 'ar' ? 'تحرير المسودة الجزئية الحالية' : 'Review and fix the partial draft'}
              </span>
            </span>
          </Button>
        </div>

        <div className={cn('flex justify-start', direction === 'rtl' && 'justify-end')}>
          <Button variant="ghost" onClick={onBack} className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}>
            <ArrowLeft className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
            {language === 'ar' ? 'العودة' : 'Back'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
