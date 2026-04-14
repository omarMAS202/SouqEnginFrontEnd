'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { aiGeneratorService } from '../services/ai-generator.service'
import type { StoreDraft } from '../types/ai-draft.types'

export function useRequestAIDraftMutation() {
  return useMutation({
    mutationFn: (prompt: string) => aiGeneratorService.requestDraft(prompt),
  })
}

export function useResolveAIDraftClarificationMutation() {
  return useMutation({
    mutationFn: ({
      prompt,
      clarificationAnswers,
    }: {
      prompt: string
      clarificationAnswers: Record<string, string>
    }) => aiGeneratorService.resolveClarification(prompt, clarificationAnswers),
  })
}

export function useApplyDraftPreviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: StoreDraft) => aiGeneratorService.applyDraftPreview(draft),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['storefront'] })
    },
  })
}
