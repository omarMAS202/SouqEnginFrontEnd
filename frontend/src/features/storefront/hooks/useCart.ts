'use client'

import { useMemo } from 'react'

import { checkoutService } from '../services/storefront.service'
import { useStorefrontProducts } from './useStorefrontRuntime'
import { useCartStore } from '../store/cart-store'

export function useCart() {
  const items = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clear = useCartStore((state) => state.clear)
  const { data: products = [] } = useStorefrontProducts()

  const detailedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        product: products.find((product) => product.id === item.productId) ?? null,
      })),
    [items, products],
  )

  const summary = useMemo(() => checkoutService.getSummary(items), [items])

  return {
    items: detailedItems,
    summary,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    addItem,
    updateQuantity,
    removeItem,
    clear,
  }
}
