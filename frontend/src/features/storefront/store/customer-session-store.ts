'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { customerAccountService } from '../services/storefront.service'
import type {
  CustomerAccount,
} from '../types/storefront.types'
import type {
  CustomerLoginFormValues,
  CustomerRegisterFormValues,
} from '../schemas/storefront.schema'

interface CustomerSessionState {
  customer: CustomerAccount | null
  hydrated: boolean
  setHydrated: (value: boolean) => void
  login: (input: CustomerLoginFormValues) => Promise<CustomerAccount>
  register: (input: CustomerRegisterFormValues) => Promise<CustomerAccount>
  logout: () => void
  refreshAccount: () => Promise<CustomerAccount>
  setCustomer: (customer: CustomerAccount) => void
}

export const useCustomerSessionStore = create<CustomerSessionState>()(
  persist(
    (set) => ({
      customer: null,
      hydrated: false,
      setHydrated(value) {
        set({ hydrated: value })
      },
      async login(input) {
        const customer = await customerAccountService.login(input)
        set({ customer })
        return customer
      },
      async register(input) {
        const customer = await customerAccountService.register(input)
        set({ customer })
        return customer
      },
      logout() {
        set({ customer: null })
      },
      async refreshAccount() {
        const customer = await customerAccountService.getAccount()
        set({ customer })
        return customer
      },
      setCustomer(customer) {
        set({ customer })
      },
    }),
    {
      name: 'souq-storefront-customer-session',
      partialize: (state) => ({ customer: state.customer }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
)
