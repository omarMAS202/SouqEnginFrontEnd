'use client'

import { useQuery } from '@tanstack/react-query'

import { useAuth } from './useAuth'
import { authService } from '../services/auth.service'

export function useUserStores() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['auth', 'stores', user?.id],
    queryFn: () => authService.listUserStores(user),
    enabled: !!user,
    staleTime: Infinity,
  })
}

export function useCurrentStoreBootstrap() {
  const { user, currentStoreId } = useAuth()

  return useQuery({
    queryKey: ['auth', 'store-bootstrap', user?.id, currentStoreId],
    queryFn: () => authService.getCurrentStoreBootstrap(user, currentStoreId),
    enabled: !!user,
    staleTime: Infinity,
  })
}
