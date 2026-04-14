'use client'

import { useQuery } from '@tanstack/react-query'

import { storefrontService } from '../services/storefront.service'

export function useStorefrontRuntime() {
  return useQuery({
    queryKey: ['storefront', 'runtime'],
    queryFn: () => storefrontService.getRuntime(),
    staleTime: Infinity,
  })
}

export function useStorefrontProducts() {
  return useQuery({
    queryKey: ['storefront', 'products'],
    queryFn: () => storefrontService.listProducts(),
  })
}

export function useStorefrontFeaturedProducts() {
  return useQuery({
    queryKey: ['storefront', 'products', 'featured'],
    queryFn: () => storefrontService.listFeaturedProducts(),
  })
}

export function useStorefrontCategories() {
  return useQuery({
    queryKey: ['storefront', 'categories'],
    queryFn: () => storefrontService.listCategories(),
  })
}

export function useStorefrontProduct(productSlug: string) {
  return useQuery({
    queryKey: ['storefront', 'product', productSlug],
    queryFn: () => storefrontService.getProduct(productSlug),
    enabled: !!productSlug,
  })
}

export function useStorefrontCategory(categorySlug: string) {
  return useQuery({
    queryKey: ['storefront', 'category', categorySlug],
    queryFn: () => storefrontService.getCategory(categorySlug),
    enabled: !!categorySlug,
  })
}

export function useStorefrontStaticPage(pageSlug: string) {
  return useQuery({
    queryKey: ['storefront', 'page', pageSlug],
    queryFn: () => storefrontService.getStaticPage(pageSlug),
    enabled: !!pageSlug,
  })
}

export function useStorefrontPolicyPage(policySlug: string) {
  return useQuery({
    queryKey: ['storefront', 'policy', policySlug],
    queryFn: () => storefrontService.getPolicyPage(policySlug),
    enabled: !!policySlug,
  })
}
