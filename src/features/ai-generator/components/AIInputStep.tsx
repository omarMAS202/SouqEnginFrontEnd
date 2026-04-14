'use client'

import { useState } from 'react'
import { ArrowRight, Sparkles, Wand2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

interface AIInputStepProps {
  onGenerate: (prompt: string) => void
}

const examplePrompts = [
  'Modern Arabic skincare store for sensitive skin with a calm premium look and gift-ready sets',
  'Streetwear store for university students with bold drops, limited collections, and fast local delivery',
  'Home bakery storefront for custom cakes, celebration boxes, and seasonal sweets across Damascus',
]

export function AIInputStep({ onGenerate }: AIInputStepProps) {
  const { direction, language } = useLanguage()
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!prompt.trim()) return
    onGenerate(prompt.trim())
  }

  return (
    <div className="space-y-8">
      <div className={cn('space-y-3', direction === 'rtl' && 'text-right')}>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          {language === 'ar' ? 'مساعد إنشاء المتجر بالذكاء الاصطناعي' : 'AI store draft assistant'}
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'ar' ? 'ابدأ من فكرة، ثم راجع المسودة قبل اعتمادها' : 'Start from an idea, then review the draft before approval'}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {language === 'ar'
            ? 'الذكاء الاصطناعي ينشئ مسودة متجر قابلة للمراجعة والتعديل فقط. لن يتم اعتماد أي متجر أو حفظه نهائياً قبل أن تراجعه وتؤكد جاهزيته.'
            : 'AI creates a reviewable store draft only. Nothing is treated as final or persistence-ready until you review, edit, and confirm it.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'وصف فكرة المتجر' : 'Describe the store idea'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value.slice(0, 500))}
              rows={7}
              dir={direction}
              placeholder={
                language === 'ar'
                  ? 'مثال: متجر مستحضرات عناية طبيعية للأمهات الجدد مع ألوان هادئة، منتجات عضوية، وأسلوب عرض مريح بالعربية.'
                  : 'Example: a natural skincare store for new mothers with calm editorial branding, organic products, Arabic support, and gift bundles.'
              }
            />

            <div className={cn('flex items-center justify-between gap-4', direction === 'rtl' && 'flex-row-reverse')}>
              <p className="text-sm text-muted-foreground">{prompt.length}/500</p>
              <Button type="submit" size="lg" className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                <Wand2 className="h-4 w-4" />
                {language === 'ar' ? 'إنشاء مسودة المتجر' : 'Generate store draft'}
                <ArrowRight className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'أمثلة على prompts جيدة' : 'Example prompts'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {examplePrompts.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                className={cn(
                  'rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition hover:border-primary/40 hover:bg-secondary/40',
                  direction === 'rtl' && 'text-right',
                )}
              >
                {example}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
