import { dataSource } from '@/services/data-source'

import type { CustomerSchemaValues } from '../schemas/customer.schema'
import { normalizeCustomerRecord, type CustomerListItemModel } from '../types/customer.contracts'

export const customersService = {
  async list(storeId: string): Promise<CustomerListItemModel[]> {
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
  create(storeId: string, input: CustomerSchemaValues) {
    return dataSource.customers.create(storeId, input)
  },
}
