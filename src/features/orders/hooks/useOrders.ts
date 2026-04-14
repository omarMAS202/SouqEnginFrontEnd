'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { requireStoreScope } from '@/features/auth/utils/require-store-scope'

import { ordersService } from '../services/orders.service'
import type { Order } from '@/types/models'

export function useOrders() {
  const { currentStoreId } = useAuth()
  return useQuery({
    queryKey: ['orders', currentStoreId],
    queryFn: () => ordersService.list(requireStoreScope(currentStoreId)),
    enabled: !!currentStoreId,
  })
}

export function useOrderMutations() {
  const queryClient = useQueryClient()
  const { currentStoreId } = useAuth()

  return {
    updateOrderStatus: useMutation({
      mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
        ordersService.updateStatus(requireStoreScope(currentStoreId), orderId, status),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['orders', currentStoreId] }),
          queryClient.invalidateQueries({ queryKey: ['dashboard', currentStoreId] }),
        ])
      },
    }),
  }
}
