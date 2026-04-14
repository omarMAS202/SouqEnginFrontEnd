'use client'

import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

import type { AIDraftValidationResult } from '../types/ai-draft.types'

interface AIDraftValidationSummaryProps {
  validation: AIDraftValidationResult
}

export function AIDraftValidationSummary({
  validation,
}: AIDraftValidationSummaryProps) {
  const { direction, language } = useLanguage()

  const errors = validation.issues.filter((issue) => issue.severity === 'error')
  const warnings = validation.issues.filter((issue) => issue.severity === 'warning')

  if (validation.issues.length === 0) {
    return (
      <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>{language === 'ar' ? 'المسودة صالحة للمراجعة' : 'Draft is ready for review'}</AlertTitle>
        <AlertDescription>
          {language === 'ar'
            ? 'لم يتم العثور على مشاكل بنيوية في المسودة. ما زالت المراجعة البشرية مطلوبة قبل التأكيد.'
            : 'No structural issues were found in the draft. Human review is still required before confirmation.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className={cn(validation.hasBlockingIssues && 'border-destructive/30 bg-destructive/5')}>
      {validation.hasBlockingIssues ? <ShieldAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      <AlertTitle>
        {validation.hasBlockingIssues
          ? language === 'ar'
            ? 'المسودة تحتاج مراجعة قبل التأكيد'
            : 'Draft needs fixes before confirmation'
          : language === 'ar'
            ? 'المسودة قابلة للمراجعة مع بعض الملاحظات'
            : 'Draft is reviewable with a few warnings'}
      </AlertTitle>
      <AlertDescription className="space-y-4">
        <div className={cn('flex flex-wrap gap-2', direction === 'rtl' && 'flex-row-reverse')}>
          <Badge variant={validation.hasBlockingIssues ? 'destructive' : 'secondary'}>
            {language === 'ar' ? `أخطاء: ${errors.length}` : `Errors: ${errors.length}`}
          </Badge>
          <Badge variant="outline">
            {language === 'ar' ? `تحذيرات: ${warnings.length}` : `Warnings: ${warnings.length}`}
          </Badge>
        </div>

        <ul className="space-y-2 text-sm">
          {validation.issues.map((issue) => (
            <li key={issue.id} className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
              <span className="font-medium text-foreground">{issue.path}</span>
              <span className="text-muted-foreground"> - {issue.message}</span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
