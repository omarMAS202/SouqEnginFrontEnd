'use client'

import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { requireStoreScope } from '@/features/auth/utils/require-store-scope'

import { billingService } from '../services/billing.service'

export function useBillingSnapshot() {
  const { currentStoreId } = useAuth()
  return useQuery({
    queryKey: ['billing', currentStoreId],
    queryFn: () => billingService.getBillingSnapshot(requireStoreScope(currentStoreId)),
    enabled: !!currentStoreId,
  })
}

export const useInvoices = useBillingSnapshot
