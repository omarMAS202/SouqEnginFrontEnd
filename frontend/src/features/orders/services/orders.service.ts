import { useAuthStore } from '@/features/auth/store/auth-store'
import { appConfig } from '@/config/app'
import { dataSource } from '@/services/data-source'
import { dataSourceMode } from '@/services/data-source'
import { httpRequest } from '@/services/http-client'
import type { Order } from '@/types/models'

import {
  normalizeOrderDetail,
  normalizeOrderRecord,
  type OrderDetailModel,
  type OrderDetailResponseDto,
  type OrderListItemModel,
  type OrderListResponseDto,
  type OrderRecordDto,
} from '../types/order.contracts'

function getAccessToken() {
  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) {
    throw new Error('Authentication token is missing while loading orders.')
  }

  return accessToken
}

export const ordersService = {
  async list(storeId: string): Promise<OrderListItemModel[]> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      const { data } = await httpRequest<OrderListResponseDto>(`/stores/${storeId}/orders/`, {
        method: 'GET',
        accessToken,
      })

      return data.items.map((order) =>
        normalizeOrderRecord({
          ...order,
          store_id: order.store_id ?? String(data.store_id ?? storeId),
        }),
      )
    }

    const orders = await dataSource.orders.list(storeId)
    return orders.map((order) =>
      normalizeOrderRecord({
        id: order.id,
        store_id: order.storeId,
        customer_id: order.customerId,
        customer_name: order.customerName,
        email: order.email,
        phone: order.phone,
        address: order.address,
        total: order.total,
        status: order.status,
        created_at: order.date,
        items: order.items,
      }),
    )
  },
  async updateStatus(storeId: string, orderId: string, status: Order['status']) {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      const { data } = await httpRequest<{ order: OrderRecordDto }>(`/stores/${storeId}/orders/${orderId}/status/`, {
        method: 'PATCH',
        accessToken,
        body: JSON.stringify({ status }),
      })

      return normalizeOrderRecord({
        ...data.order,
        store_id: data.order.store_id ?? storeId,
      })
    }

    return dataSource.orders.updateStatus(storeId, orderId, status)
  },
  async getById(storeId: string, orderId: string): Promise<OrderDetailModel> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      const { data } = await httpRequest<OrderDetailResponseDto>(`/stores/${storeId}/orders/${orderId}/`, {
        method: 'GET',
        accessToken,
      })

      return normalizeOrderDetail({
        ...data.order,
        store_id: data.order.store_id ?? storeId,
      })
    }

    const order = (await this.list(storeId)).find((entry) => entry.id === orderId)

    if (!order) {
      throw new Error('Order not found.')
    }

    return {
      id: order.id,
      storeId: order.storeId,
      orderNumber: order.id,
      status: order.status,
      createdAt: order.date,
      updatedAt: null,
      subtotal: order.total,
      shippingFee: 0,
      discount: 0,
      total: order.total,
      paymentMethod: '',
      notes: '',
      customer: {
        id: order.customerId,
        name: order.customerName,
        email: order.email,
        phone: order.phone,
      },
      shippingAddress: {
        country: '',
        city: '',
        addressLine1: order.address,
        addressLine2: '',
        postalCode: '',
      },
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.id,
        productName: item.name,
        sku: '',
        imageUrl: null,
        quantity: item.quantity,
        unitPrice: item.price,
        lineTotal: item.price * item.quantity,
      })),
    }
  },
}
