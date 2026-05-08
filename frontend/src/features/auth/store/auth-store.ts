'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { appConfig } from '@/config/app'
import { safeLocalStorageRemove } from '@/lib/storage'
import type { SessionUser, UserRole } from '@/types/models'

import { authService } from '../services/auth.service'
import type { AuthSessionModel, RegistrationResult } from '../types/auth.contracts'

type LoginInput = {
  email: string
  password: string
}

type RegisterInput = {
  username: string
  email: string
  password: string
}

interface AuthState {
  user: SessionUser | null
  currentStoreId: string | null
  accessToken: string | null
  refreshToken: string | null
  tenantId: string | null
  hydrated: boolean
  bootstrapSession: () => Promise<void>
  login: (input: LoginInput) => Promise<AuthSessionModel>
  register: (input: RegisterInput) => Promise<RegistrationResult>
  logout: () => void
  setCurrentStoreId: (storeId: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      currentStoreId: null,
      accessToken: null,
      refreshToken: null,
      tenantId: null,
      hydrated: false,
      async bootstrapSession() {
        const state = get()

        if (!state.accessToken || !state.refreshToken) {
          set({ hydrated: true })
          return
        }

        try {
          const session = await authService.bootstrapSession({
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
            currentStoreId: state.currentStoreId,
          })

          set({
            user: session.user,
            currentStoreId: session.currentStoreId,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            tenantId: session.tenantId,
            hydrated: true,
          })
        } catch {
          safeLocalStorageRemove(appConfig.authStorageKey)
          set({
            user: null,
            currentStoreId: null,
            accessToken: null,
            refreshToken: null,
            tenantId: null,
            hydrated: true,
          })
        }
      },
      async login(input) {
        const session = await authService.login(input)
        set({
          user: session.user,
          currentStoreId: session.currentStoreId,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          tenantId: session.tenantId,
          hydrated: true,
        })
        return session
      },
      async register(input) {
        return authService.register({
          username: input.username,
          email: input.email,
          password: input.password,
          role: 'Store Owner',
        })
      },
      logout() {
        set({
          user: null,
          currentStoreId: null,
          accessToken: null,
          refreshToken: null,
          tenantId: null,
          hydrated: true,
        })
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
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tenantId: state.tenantId,
      }),
    },
  ),
)

export function userHasRole(user: SessionUser | null, roles: UserRole[]) {
  return !!user && roles.includes(user.role)
}
