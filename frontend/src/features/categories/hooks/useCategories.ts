'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { requireStoreScope } from '@/features/auth/utils/require-store-scope'

import { categoriesService } from '../services/categories.service'
import type { CategorySchemaValues } from '../schemas/category.schema'

export function useCategories() {
  const { currentStoreId } = useAuth()
  return useQuery({
    queryKey: ['categories', currentStoreId],
    queryFn: () => categoriesService.list(requireStoreScope(currentStoreId)),
    enabled: !!currentStoreId,
  })
}

export function useCategoryMutations() {
  const queryClient = useQueryClient()
  const { currentStoreId } = useAuth()

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['categories', currentStoreId] }),
      queryClient.invalidateQueries({ queryKey: ['products', currentStoreId] }),
    ])

  return {
    saveCategory: useMutation({
      mutationFn: ({ id, input }: { id?: string; input: CategorySchemaValues }) =>
        categoriesService.save(requireStoreScope(currentStoreId), { id, ...input }),
      onSuccess: invalidate,
    }),
    deleteCategory: useMutation({
      mutationFn: (categoryId: string) => categoriesService.remove(requireStoreScope(currentStoreId), categoryId),
      onSuccess: invalidate,
    }),
  }
}
