'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CartItem } from '../types/storefront.types'

interface CartState {
  items: CartItem[]
  addItem: (productId: string, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem(productId, quantity = 1) {
        set((state) => {
          const existing = state.items.find((item) => item.productId === productId)
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            }
          }

          return {
            items: [...state.items, { productId, quantity }],
          }
        })
      },
      updateQuantity(productId, quantity) {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item,
                ),
        }))
      },
      removeItem(productId) {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }))
      },
      clear() {
        set({ items: [] })
      },
    }),
    { name: 'souq-storefront-cart' },
  ),
)
