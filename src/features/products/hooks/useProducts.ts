'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { requireStoreScope } from '@/features/auth/utils/require-store-scope'

import { productsService } from '../services/products.service'
import type { ProductSchemaValues } from '../schemas/product.schema'

export function useProducts() {
  const { currentStoreId } = useAuth()
  return useQuery({
    queryKey: ['products', currentStoreId],
    queryFn: () => productsService.list(requireStoreScope(currentStoreId)),
    enabled: !!currentStoreId,
  })
}

export function useProductMutations() {
  const queryClient = useQueryClient()
  const { currentStoreId } = useAuth()

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['products', currentStoreId] }),
      queryClient.invalidateQueries({ queryKey: ['categories', currentStoreId] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', currentStoreId] }),
    ]) 

  return {
    createProduct: useMutation({
      mutationFn: (input: ProductSchemaValues) => productsService.create(requireStoreScope(currentStoreId), input),
      onSuccess: invalidate,
    }),
    updateProduct: useMutation({
      mutationFn: ({ productId, input }: { productId: string; input: ProductSchemaValues }) =>
        productsService.update(requireStoreScope(currentStoreId), productId, input),
      onSuccess: invalidate,
    }),
    deleteProduct: useMutation({
      mutationFn: (productId: string) => productsService.remove(requireStoreScope(currentStoreId), productId),
      onSuccess: invalidate,
    }),
  }
}
