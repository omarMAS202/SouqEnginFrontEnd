'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { adminService } from '../services/admin.service'
import type { AdminSettingsInput, AdminStoreModel } from '../types/admin.contracts'

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboard(),
  })
}

export function useAdminStores(search?: string) {
  return useQuery({
    queryKey: ['admin', 'stores', search ?? ''],
    queryFn: () => adminService.listStores(search),
  })
}

export function useAdminUsers(search?: string) {
  return useQuery({
    queryKey: ['admin', 'users', search ?? ''],
    queryFn: () => adminService.listUsers(search),
  })
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminService.getSettings(),
  })
}

export function useAdminStoreMutations() {
  const queryClient = useQueryClient()

  return {
    updateStoreStatus: useMutation({
      mutationFn: ({ storeId, status }: { storeId: string; status: AdminStoreModel['status'] }) =>
        adminService.updateStoreStatus(storeId, status),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
          queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] }),
        ])
      },
    }),
  }
}

export function useAdminSettingsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AdminSettingsInput) => adminService.updateSettings(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
    },
  })
}
