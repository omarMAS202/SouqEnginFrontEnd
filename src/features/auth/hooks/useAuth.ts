'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import type { UserRole } from '@/types/models'

import { useAuthStore, userHasRole } from '../store/auth-store'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const hydrated = useAuthStore((state) => state.hydrated)
  const currentStoreId = useAuthStore((state) => state.currentStoreId)
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const tenantId = useAuthStore((state) => state.tenantId)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)
  const setCurrentStoreId = useAuthStore((state) => state.setCurrentStoreId)
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession)

  return {
    user,
    hydrated,
    currentStoreId,
    accessToken,
    refreshToken,
    tenantId,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setCurrentStoreId,
    bootstrapSession,
  }
}

export function useRequireAuth(roles?: UserRole[]) {
  const router = useRouter()
  const { hydrated, isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (!hydrated) return

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    if (roles?.length && !userHasRole(user, roles)) {
      router.replace(user?.role === 'super_admin' ? '/admin' : '/dashboard')
    }
  }, [hydrated, isAuthenticated, roles, router, user])

  return { hydrated, isAuthenticated, user }
}
