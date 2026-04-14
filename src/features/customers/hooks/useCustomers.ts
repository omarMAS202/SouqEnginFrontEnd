'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { requireStoreScope } from '@/features/auth/utils/require-store-scope'

import { customersService } from '../services/customers.service'
import type { CustomerSchemaValues } from '../schemas/customer.schema'

export function useCustomers() {
  const { currentStoreId } = useAuth()
  return useQuery({
    queryKey: ['customers', currentStoreId],
    queryFn: () => customersService.list(requireStoreScope(currentStoreId)),
    enabled: !!currentStoreId,
  })
}

export function useCustomerMutations() {
  const queryClient = useQueryClient()
  const { currentStoreId } = useAuth()

  return {
    createCustomer: useMutation({
      mutationFn: (input: CustomerSchemaValues) => customersService.create(requireStoreScope(currentStoreId), input),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['customers', currentStoreId] }),
          queryClient.invalidateQueries({ queryKey: ['dashboard', currentStoreId] }),
        ])
      },
    }),
  }
}
