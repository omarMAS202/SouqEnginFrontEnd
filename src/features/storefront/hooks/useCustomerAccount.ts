'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  CustomerLoginFormValues,
  CustomerRegisterFormValues,
  CustomerAddressFormValues,
} from '../schemas/storefront.schema'
import { customerAccountService } from '../services/storefront.service'
import { useCustomerSessionStore } from '../store/customer-session-store'

export function useCustomerSession() {
  const customer = useCustomerSessionStore((state) => state.customer)
  const hydrated = useCustomerSessionStore((state) => state.hydrated)
  const loginAction = useCustomerSessionStore((state) => state.login)
  const registerAction = useCustomerSessionStore((state) => state.register)
  const logout = useCustomerSessionStore((state) => state.logout)
  const refreshAccount = useCustomerSessionStore((state) => state.refreshAccount)

  return {
    customer,
    hydrated,
    isAuthenticated: !!customer,
    logout,
    refreshAccount,
    login(input: CustomerLoginFormValues) {
      return loginAction(input)
    },
    register(input: CustomerRegisterFormValues) {
      return registerAction(input)
    },
  }
}

export function useCustomerAccountQuery() {
  const { isAuthenticated } = useCustomerSession()

  return useQuery({
    queryKey: ['storefront', 'customer-account'],
    queryFn: () => customerAccountService.getAccount(),
    enabled: isAuthenticated,
  })
}

export function useCustomerAccountMutations() {
  const queryClient = useQueryClient()
  const setCustomer = useCustomerSessionStore((state) => state.setCustomer)

  return {
    updateProfile: useMutation({
      mutationFn: (input: { fullName: string; email: string; phone: string }) =>
        customerAccountService.updateProfile(input),
      onSuccess: async (customer) => {
        setCustomer(customer)
        await queryClient.invalidateQueries({ queryKey: ['storefront', 'customer-account'] })
      },
    }),
    saveAddress: useMutation({
      mutationFn: (input: CustomerAddressFormValues & { id?: string }) =>
        customerAccountService.saveAddress(input),
      onSuccess: async (customer) => {
        setCustomer(customer)
        await queryClient.invalidateQueries({ queryKey: ['storefront', 'customer-account'] })
      },
    }),
  }
}

export function useCustomerOrder(orderId: string) {
  const { isAuthenticated } = useCustomerSession()
  return useQuery({
    queryKey: ['storefront', 'customer-order', orderId],
    queryFn: () => customerAccountService.getOrder(orderId),
    enabled: isAuthenticated && !!orderId,
  })
}
