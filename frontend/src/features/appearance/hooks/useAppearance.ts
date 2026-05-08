'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { requireStoreScope } from '@/features/auth/utils/require-store-scope'

import { appearanceService } from '../services/appearance.service'
import type { UpdateAppearanceInput, UpdateStoreThemeInput } from '../types/appearance.contracts'

export function useAppearance() {
  const { currentStoreId } = useAuth()

  return useQuery({
    queryKey: ['appearance', currentStoreId],
    queryFn: () => appearanceService.get(requireStoreScope(currentStoreId)),
    enabled: !!currentStoreId,
  })
}

export function useAppearanceMutations() {
  const { currentStoreId } = useAuth()
  const queryClient = useQueryClient()

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['appearance', currentStoreId] }),
      queryClient.invalidateQueries({ queryKey: ['appearance', currentStoreId, 'theme'] }),
      queryClient.invalidateQueries({ queryKey: ['appearance', currentStoreId, 'theme-templates'] }),
    ])

  return {
    updateAppearance: useMutation({
      mutationFn: (input: UpdateAppearanceInput) =>
        appearanceService.update(requireStoreScope(currentStoreId), input),
      onSuccess: invalidate,
    }),
    uploadLogo: useMutation({
      mutationFn: ({ file, alt }: { file: File; alt?: string }) =>
        appearanceService.uploadLogo(requireStoreScope(currentStoreId), file, alt),
      onSuccess: invalidate,
    }),
    replaceAppearance: useMutation({
      mutationFn: (input: UpdateAppearanceInput) =>
        appearanceService.replace(requireStoreScope(currentStoreId), input),
      onSuccess: invalidate,
    }),
    updateTheme: useMutation({
      mutationFn: (input: UpdateStoreThemeInput) =>
        appearanceService.updateTheme(requireStoreScope(currentStoreId), input),
      onSuccess: invalidate,
    }),
  }
}

export function useStoreTheme() {
  const { currentStoreId } = useAuth()

  return useQuery({
    queryKey: ['appearance', currentStoreId, 'theme'],
    queryFn: () => appearanceService.getTheme(requireStoreScope(currentStoreId)),
    enabled: !!currentStoreId,
  })
}

export function useThemeTemplates() {
  const { currentStoreId } = useAuth()

  return useQuery({
    queryKey: ['appearance', currentStoreId, 'theme-templates'],
    queryFn: () => appearanceService.listThemeTemplates(requireStoreScope(currentStoreId)),
    enabled: !!currentStoreId,
  })
}
