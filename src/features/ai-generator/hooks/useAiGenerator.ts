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
      storeId,
      clarificationAnswers,
    }: {
      prompt: string
      storeId: string | null
      clarificationAnswers: Record<string, string>
    }) => aiGeneratorService.resolveClarification(prompt, storeId, clarificationAnswers),
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

export function useApplyAIDraftBackendMutation() {
  return useMutation({
    mutationFn: (draft: StoreDraft) => aiGeneratorService.applyDraftToBackend(draft),
  })
}
