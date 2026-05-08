'use client'

import { useQuery } from '@tanstack/react-query'

import { useAuth } from './useAuth'
import { authService } from '../services/auth.service'

export function useUserStores() {
  const { user, accessToken } = useAuth()

  return useQuery({
    queryKey: ['auth', 'stores', user?.id, accessToken],
    queryFn: () => authService.listUserStores(user, accessToken),
    enabled: !!user,
    staleTime: Infinity,
  })
}

export function useCurrentStoreBootstrap() {
  const { user, currentStoreId, accessToken } = useAuth()

  return useQuery({
    queryKey: ['auth', 'store-bootstrap', user?.id, currentStoreId, accessToken],
    queryFn: () => authService.getCurrentStoreBootstrap(user, currentStoreId, accessToken),
    enabled: !!user,
    staleTime: Infinity,
  })
}
