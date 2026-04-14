'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, MessageSquareMore } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

import type { AIDraftClarificationQuestion } from '../types/ai-draft.types'

interface AIClarificationStepProps {
  prompt: string
  questions: AIDraftClarificationQuestion[]
  initialAnswers: Record<string, string>
  onSubmit: (answers: Record<string, string>) => void
  onBack: () => void
}

export function AIClarificationStep({
  prompt,
  questions,
  initialAnswers,
  onSubmit,
  onBack,
}: AIClarificationStepProps) {
  const { direction, language } = useLanguage()
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className={cn('flex flex-row items-start gap-4', direction === 'rtl' && 'flex-row-reverse')}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageSquareMore className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <CardTitle>
              {language === 'ar' ? 'نحتاج بعض التوضيحات قبل إنشاء المسودة' : 'A few clarifications are needed before generating the draft'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {language === 'ar'
                ? 'الوصف الحالي جيد كبداية، لكن إضافة هذه التفاصيل ستنتج مسودة متجر أقرب لما تريده.'
                : 'The current prompt is a good start, but these answers will produce a stronger and more usable store draft.'}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">{prompt}</div>

          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={question.id}>{question.prompt}</Label>
                <Input
                  id={question.id}
                  dir={direction}
                  value={answers[question.id] ?? ''}
                  placeholder={question.placeholder}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <div className={cn('flex items-center justify-between gap-3', direction === 'rtl' && 'flex-row-reverse')}>
            <Button variant="ghost" onClick={onBack} className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}>
              <ArrowLeft className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
              {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
            <Button
              onClick={() => onSubmit(answers)}
              className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}
            >
              {language === 'ar' ? 'متابعة إنشاء المسودة' : 'Continue draft generation'}
              <ArrowRight className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
