'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { appConfig } from '@/config/app'
import { safeLocalStorageRemove } from '@/lib/storage'
import type { SessionUser, UserRole } from '@/types/models'

import { authService } from '../services/auth.service'

type LoginInput = {
  email: string
  password: string
}

type RegisterInput = {
  fullName: string
  email: string
  password: string
  storeName: string
}

interface AuthState {
  user: SessionUser | null
  currentStoreId: string | null
  hydrated: boolean
  setHydrated: (value: boolean) => void
  login: (input: LoginInput) => Promise<SessionUser>
  register: (input: RegisterInput) => Promise<SessionUser>
  logout: () => void
  setCurrentStoreId: (storeId: string) => void
}

function getDefaultStoreId(user: SessionUser) {
  return user.storeIds[0] ?? null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      currentStoreId: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      async login(input) {
        const user = await authService.login(input)
        const currentStoreId = getDefaultStoreId(user)
        set({ user, currentStoreId })
        return user
      },
      async register(input) {
        const { user } = await authService.register({
          full_name: input.fullName,
          email: input.email,
          password: input.password,
          store_name: input.storeName,
        })
        const currentStoreId = getDefaultStoreId(user)
        set({ user, currentStoreId })
        return user
      },
      logout() {
        set({ user: null, currentStoreId: null })
        safeLocalStorageRemove(appConfig.authStorageKey)
      },
      setCurrentStoreId(storeId) {
        set({ currentStoreId: storeId })
      },
    }),
    {
      name: appConfig.authStorageKey,
      partialize: (state) => ({
        user: state.user,
        currentStoreId: state.currentStoreId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)

export function userHasRole(user: SessionUser | null, roles: UserRole[]) {
  return !!user && roles.includes(user.role)
}
