'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { authService } from '@/features/auth/services/auth.service'
import { requireStoreScope } from '@/features/auth/utils/require-store-scope'
import type { StoreSettings } from '@/types/models'

import { dashboardService } from '../services/dashboard.service'
import type { PatchStoreRequestDto, StoreDomainMutationInput, UpdateStoreRequestDto } from '../types/dashboard.contracts'

export function useDashboardOverview() {
  const { currentStoreId } = useAuth()
  return useQuery({
    queryKey: ['dashboard', currentStoreId],
    queryFn: () => dashboardService.getOverview(requireStoreScope(currentStoreId)),
    enabled: !!currentStoreId,
  })
}

export function useStoreSettings() {
  const { currentStoreId } = useAuth()
  return useQuery({
    queryKey: ['settings', currentStoreId],
    queryFn: () => dashboardService.getSettings(requireStoreScope(currentStoreId)),
    enabled: !!currentStoreId,
  })
}

export function useStoreSettingsMutation() {
  const queryClient = useQueryClient()
  const { currentStoreId } = useAuth()
  return useMutation({
    mutationFn: (settings: StoreSettings) =>
      dashboardService.updateSettings(requireStoreScope(currentStoreId), settings),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['settings', currentStoreId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', currentStoreId] }),
      ])
    },
  })
}

export function useStoreDomains() {
  const { currentStoreId } = useAuth()

  return useQuery({
    queryKey: ['store-domains', currentStoreId],
    queryFn: () => dashboardService.listDomains(requireStoreScope(currentStoreId)),
    enabled: !!currentStoreId,
  })
}

export function useStoreManagementMutations() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, accessToken, currentStoreId, logout, setCurrentStoreId } = useAuth()

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['settings', currentStoreId] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', currentStoreId] }),
      queryClient.invalidateQueries({ queryKey: ['store-domains', currentStoreId] }),
      queryClient.invalidateQueries({ queryKey: ['auth', 'stores'] }),
      queryClient.invalidateQueries({ queryKey: ['auth', 'store-bootstrap'] }),
    ])
  }

  return {
    replaceStore: useMutation({
      mutationFn: (input: UpdateStoreRequestDto) =>
        dashboardService.replaceStore(requireStoreScope(currentStoreId), input),
      onSuccess: invalidate,
    }),
    patchStore: useMutation({
      mutationFn: (input: PatchStoreRequestDto) =>
        dashboardService.patchStore(requireStoreScope(currentStoreId), input),
      onSuccess: invalidate,
    }),
    createDomain: useMutation({
      mutationFn: (input: StoreDomainMutationInput) =>
        dashboardService.createDomain(requireStoreScope(currentStoreId), input),
      onSuccess: invalidate,
    }),
    replaceDomain: useMutation({
      mutationFn: ({ domainId, input }: { domainId: string; input: StoreDomainMutationInput }) =>
        dashboardService.replaceDomain(requireStoreScope(currentStoreId), domainId, input),
      onSuccess: invalidate,
    }),
    patchDomain: useMutation({
      mutationFn: ({ domainId, input }: { domainId: string; input: Partial<StoreDomainMutationInput> }) =>
        dashboardService.patchDomain(requireStoreScope(currentStoreId), domainId, input),
      onSuccess: invalidate,
    }),
    deleteDomain: useMutation({
      mutationFn: (domainId: string) => dashboardService.deleteDomain(requireStoreScope(currentStoreId), domainId),
      onSuccess: invalidate,
    }),
    publishStore: useMutation({
      mutationFn: (action: 'publish' | 'unpublish') =>
        dashboardService.publishStore(requireStoreScope(currentStoreId), action),
      onSuccess: invalidate,
    }),
    setSubdomain: useMutation({
      mutationFn: (subdomain: string) =>
        dashboardService.setSubdomain(requireStoreScope(currentStoreId), subdomain),
      onSuccess: invalidate,
    }),
    patchSettings: useMutation({
      mutationFn: (settings: Partial<StoreSettings>) =>
        dashboardService.patchSettings(requireStoreScope(currentStoreId), settings),
      onSuccess: invalidate,
    }),
    deleteStore: useMutation({
      mutationFn: () => dashboardService.deleteStore(requireStoreScope(currentStoreId)),
      onSuccess: async () => {
        await invalidate()
        const remainingStores = await authService.listUserStores(user, accessToken)
        const nextStore =
          remainingStores.find((store) => store.storeId !== currentStoreId) ??
          remainingStores[0] ??
          null

        if (nextStore) {
          setCurrentStoreId(nextStore.storeId)
          router.replace('/dashboard')
          return
        }

        logout()
        router.replace('/login')
      },
    }),
  }
}

export function useSlugAvailability(slug: string, enabled = false) {
  const { currentStoreId } = useAuth()

  return useQuery({
    queryKey: ['store-slug-check', currentStoreId, slug],
    queryFn: () => dashboardService.checkSlug(slug, currentStoreId),
    enabled: enabled && !!slug,
  })
}

export function useSlugSuggestions(name: string, enabled = false, limit = 5) {
  const { currentStoreId } = useAuth()

  return useQuery({
    queryKey: ['store-slug-suggest', currentStoreId, name, limit],
    queryFn: () => dashboardService.suggestSlugs(name, currentStoreId, limit),
    enabled: enabled && !!name,
  })
}
