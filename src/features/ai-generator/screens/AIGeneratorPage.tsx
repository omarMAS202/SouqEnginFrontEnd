'use client'

import { useState } from 'react'

import { useLanguage } from '@/features/localization'
import { toast } from '@/hooks/useToast'

import { AIClarificationStep } from '../components/AIClarificationStep'
import { AIConfirmationStep } from '../components/AIConfirmationStep'
import { AIFallbackStep } from '../components/AIFallbackStep'
import { AIInputStep } from '../components/AIInputStep'
import { AIProcessingStep } from '../components/AIProcessingStep'
import { AIResultsStep } from '../components/AIResultsStep'
import {
  useApplyDraftPreviewMutation,
  useRequestAIDraftMutation,
  useResolveAIDraftClarificationMutation,
} from '../hooks/useAiGenerator'
import { aiGeneratorService } from '../services/ai-generator.service'
import type {
  AIDraftLifecycleState,
  AIDraftLifecycleStatus,
  StoreDraft,
} from '../types/ai-draft.types'

const initialLifecycleState: AIDraftLifecycleState = {
  status: 'idle',
  prompt: '',
  clarificationQuestions: [],
  clarificationAnswers: {},
  draft: null,
  previewApplied: false,
}

function getDraftStatus(draft: StoreDraft): AIDraftLifecycleStatus {
  return draft.validation.hasBlockingIssues ? 'validation_failed' : 'needs_review'
}

export default function AIGeneratorPage() {
  const { language } = useLanguage()
  const requestDraft = useRequestAIDraftMutation()
  const resolveClarification = useResolveAIDraftClarificationMutation()
  const applyDraftPreview = useApplyDraftPreviewMutation()
  const [lifecycle, setLifecycle] = useState<AIDraftLifecycleState>(initialLifecycleState)

  const handlePromptSubmit = async (prompt: string) => {
    setLifecycle((current) => ({
      ...current,
      status: 'submitting',
      prompt,
      clarificationQuestions: [],
      clarificationAnswers: {},
      errorMessage: undefined,
      draft: null,
      previewApplied: false,
      confirmedAt: undefined,
    }))

    try {
      const response = await requestDraft.mutateAsync(prompt)

      if (response.kind === 'clarification') {
        setLifecycle((current) => ({
          ...current,
          status: 'clarifying',
          clarificationQuestions: response.questions ?? [],
        }))
        return
      }

      if (!response.draft) {
        setLifecycle((current) => ({
          ...current,
          status: 'fallback_required',
          errorMessage: language === 'ar' ? 'تعذّر إنشاء مسودة قابلة للمراجعة.' : 'Could not create a reviewable draft.',
        }))
        return
      }

      const nextStatus = getDraftStatus(response.draft)
      setLifecycle((current) => ({
        ...current,
        status: nextStatus,
        draft: response.draft ?? null,
      }))
    } catch (error) {
      setLifecycle((current) => ({
        ...current,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : undefined,
      }))
      toast({
        title: language === 'ar' ? 'فشل إنشاء مسودة المتجر' : 'Failed to generate store draft',
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handleClarificationSubmit = async (answers: Record<string, string>) => {
    setLifecycle((current) => ({
      ...current,
      status: 'generating',
      clarificationAnswers: answers,
      errorMessage: undefined,
    }))

    try {
      const draft = await resolveClarification.mutateAsync({
        prompt: lifecycle.prompt,
        clarificationAnswers: answers,
      })

      setLifecycle((current) => ({
        ...current,
        status: getDraftStatus(draft),
        draft,
      }))
    } catch (error) {
      setLifecycle((current) => ({
        ...current,
        status: 'fallback_required',
        clarificationAnswers: answers,
        errorMessage: error instanceof Error ? error.message : undefined,
      }))
      toast({
        title: language === 'ar' ? 'تعذّر متابعة التوضيحات' : 'Could not continue with clarification',
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handleUpdateDraft = (runtime: StoreDraft['runtime']) => {
    if (!lifecycle.draft) return

    const nextDraft = aiGeneratorService.updateDraftRuntime(lifecycle.draft, runtime)
    setLifecycle((current) => ({
      ...current,
      draft: nextDraft,
      status: getDraftStatus(nextDraft),
      previewApplied: false,
    }))
  }

  const handleUseStarterTemplate = () => {
    try {
      const draft = aiGeneratorService.createStarterDraft(lifecycle.prompt || 'Starter template store')
      setLifecycle((current) => ({
        ...current,
        draft,
        status: getDraftStatus(draft),
        errorMessage: undefined,
        previewApplied: false,
      }))
    } catch (error) {
      toast({
        title: language === 'ar' ? 'تعذّر إنشاء القالب الابتدائي' : 'Could not create starter template',
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handleRetry = async () => {
    await handlePromptSubmit(lifecycle.prompt)
  }

  const handleConfirm = async () => {
    if (!lifecycle.draft) return
    if (lifecycle.draft.validation.hasBlockingIssues) {
      toast({
        title: language === 'ar' ? 'أصلح المشاكل أولاً' : 'Fix validation issues first',
        description:
          language === 'ar'
            ? 'لا يمكن اعتماد المسودة قبل معالجة المشاكل البنيوية الظاهرة في التحقق.'
            : 'The draft cannot be confirmed until the blocking validation issues are resolved.',
        variant: 'destructive',
      })
      return
    }

    const confirmedDraft = await aiGeneratorService.confirmDraft(lifecycle.draft)

    setLifecycle((current) => ({
      ...current,
      draft: confirmedDraft,
      status: 'confirmed',
      confirmedAt: confirmedDraft.metadata.confirmed_at ?? new Date().toISOString(),
    }))

    toast({
      title: language === 'ar' ? 'تم اعتماد المسودة' : 'Draft confirmed',
      description:
        language === 'ar'
          ? 'المسودة أصبحت جاهزة للإرسال إلى backend عندما يصبح عقد الحفظ النهائي متوفراً.'
          : 'The draft is now ready to be sent to the backend when the final persistence contract is available.',
    })
  }

  const handleApplyPreview = async () => {
    if (!lifecycle.draft) return

    try {
      await applyDraftPreview.mutateAsync(lifecycle.draft)
      setLifecycle((current) => ({
        ...current,
        previewApplied: true,
      }))
      toast({
        title: language === 'ar' ? 'تم تحديث معاينة الواجهة' : 'Storefront preview updated',
        description:
          language === 'ar'
            ? 'يمكنك الآن فتح واجهة المتجر لمراجعة المسودة المطبقة محلياً.'
            : 'You can now open the storefront to review the locally applied draft.',
      })
    } catch (error) {
      toast({
        title: language === 'ar' ? 'تعذّر تحديث المعاينة' : 'Could not update storefront preview',
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handleBack = () => {
    if (lifecycle.status === 'clarifying') {
      setLifecycle(initialLifecycleState)
      return
    }

    if (lifecycle.status === 'confirmed' && lifecycle.draft) {
      setLifecycle((current) => ({
        ...current,
        status: current.draft ? getDraftStatus(current.draft) : 'idle',
      }))
      return
    }

    if (
      lifecycle.status === 'validation_failed' ||
      lifecycle.status === 'needs_review' ||
      lifecycle.status === 'generated' ||
      lifecycle.status === 'fallback_required' ||
      lifecycle.status === 'failed'
    ) {
      setLifecycle(initialLifecycleState)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {lifecycle.status === 'idle' ? <AIInputStep onGenerate={(prompt) => void handlePromptSubmit(prompt)} /> : null}

      {(lifecycle.status === 'submitting' || lifecycle.status === 'generating') ? (
        <AIProcessingStep
          prompt={lifecycle.prompt}
          status={lifecycle.status === 'submitting' ? 'submitting' : 'generating'}
        />
      ) : null}

      {lifecycle.status === 'clarifying' ? (
        <AIClarificationStep
          prompt={lifecycle.prompt}
          questions={lifecycle.clarificationQuestions}
          initialAnswers={lifecycle.clarificationAnswers}
          onSubmit={(answers) => void handleClarificationSubmit(answers)}
          onBack={handleBack}
        />
      ) : null}

      {(lifecycle.status === 'needs_review' ||
        lifecycle.status === 'validation_failed') &&
      lifecycle.draft ? (
        <AIResultsStep
          draft={lifecycle.draft}
          onUpdateRuntime={handleUpdateDraft}
          onConfirm={() =>
            setLifecycle((current) => ({
              ...current,
              status: 'generated',
            }))
          }
          onBack={handleBack}
        />
      ) : null}

      {(lifecycle.status === 'fallback_required' || lifecycle.status === 'failed') ? (
        <AIFallbackStep
          prompt={lifecycle.prompt}
          errorMessage={lifecycle.errorMessage}
          hasPartialDraft={!!lifecycle.draft}
          onRetry={() => void handleRetry()}
          onUseStarterTemplate={handleUseStarterTemplate}
          onContinuePartialDraft={
            lifecycle.draft
              ? () =>
                  setLifecycle((current) => ({
                    ...current,
                    status: current.draft ? getDraftStatus(current.draft) : 'idle',
                  }))
              : undefined
          }
          onBack={handleBack}
        />
      ) : null}

      {lifecycle.status === 'confirmed' && lifecycle.draft ? (
        <AIConfirmationStep
          draft={lifecycle.draft}
          isConfirmed={true}
          previewApplied={lifecycle.previewApplied}
          onBack={handleBack}
          onConfirm={() => void handleConfirm()}
          onApplyPreview={() => void handleApplyPreview()}
          isApplyingPreview={applyDraftPreview.isPending}
        />
      ) : null}

      {lifecycle.status === 'generated' && lifecycle.draft ? (
        <AIConfirmationStep
          draft={lifecycle.draft}
          isConfirmed={false}
          previewApplied={lifecycle.previewApplied}
          onBack={() =>
            setLifecycle((current) => ({
              ...current,
              status: current.draft ? getDraftStatus(current.draft) : 'idle',
            }))
          }
          onConfirm={() => void handleConfirm()}
          onApplyPreview={() => void handleApplyPreview()}
          isApplyingPreview={applyDraftPreview.isPending}
        />
      ) : null}
    </div>
  )
}
