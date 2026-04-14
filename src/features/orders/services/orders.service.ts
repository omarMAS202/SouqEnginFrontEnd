import { dataSource } from '@/services/data-source'

import { normalizeOrderRecord, type OrderListItemModel } from '../types/order.contracts'

export const ordersService = {
  async list(storeId: string): Promise<OrderListItemModel[]> {
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
  updateStatus: dataSource.orders.updateStatus,
}
