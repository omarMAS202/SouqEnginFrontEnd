'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import type { UserRole } from '@/types/models'

import { useAuthStore, userHasRole } from '../store/auth-store'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const hydrated = useAuthStore((state) => state.hydrated)
  const currentStoreId = useAuthStore((state) => state.currentStoreId)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)
  const setCurrentStoreId = useAuthStore((state) => state.setCurrentStoreId)

  return {
    user,
    hydrated,
    currentStoreId,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setCurrentStoreId,
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
      router.replace(user?.role === 'admin' ? '/admin' : '/dashboard')
    }
  }, [hydrated, isAuthenticated, roles, router, user])

  return { hydrated, isAuthenticated, user }
}
