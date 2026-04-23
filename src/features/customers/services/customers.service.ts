import { useAuthStore } from '@/features/auth/store/auth-store'
import { appConfig } from '@/config/app'
import { dataSource } from '@/services/data-source'
import { dataSourceMode } from '@/services/data-source'
import { httpRequest } from '@/services/http-client'

import type { CustomerSchemaValues } from '../schemas/customer.schema'
import {
  normalizeCustomerRecord,
  type CustomerListItemModel,
  type CustomerListResponseDto,
} from '../types/customer.contracts'

function getAccessToken() {
  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) {
    throw new Error('Authentication token is missing while loading customers.')
  }

  return accessToken
}

export const customersService = {
  async list(storeId: string): Promise<CustomerListItemModel[]> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      const { data } = await httpRequest<CustomerListResponseDto>(`/stores/${storeId}/customers/`, {
        method: 'GET',
        accessToken,
      })

      return data.items.map((customer) =>
        normalizeCustomerRecord({
          ...customer,
          store_id: customer.store_id ?? String(data.store_id ?? storeId),
        }),
      )
    }

    const customers = await dataSource.customers.list(storeId)
    return customers.map((customer) =>
      normalizeCustomerRecord({
        id: customer.id,
        store_id: customer.storeId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        total_spent: customer.totalSpent,
        last_order_at: customer.lastOrder ?? null,
        avatar_url: customer.avatar ?? null,
        orders_count: 'orders' in customer ? customer.orders : 0,
      }),
    )
  },
  async create(storeId: string, input: CustomerSchemaValues) {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      throw new Error('Customer creation is not available because the backend customer create endpoint is not exposed yet.')
    }

    return dataSource.customers.create(storeId, input)
  },
}
