'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { requireStoreScope } from '@/features/auth/utils/require-store-scope'
import type { StoreSettings } from '@/types/models'

import { dashboardService } from '../services/dashboard.service'

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
