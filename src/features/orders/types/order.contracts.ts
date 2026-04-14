import type { RequestMetadata, StoreScopedResource } from '@/types/api-contracts'
import type { Order } from '@/types/models'

export interface OrderItemDto {
  id: string
  name?: string | null
  quantity?: number | null
  price?: number | null
}

export interface OrderRecordDto extends StoreScopedResource {
  id: string
  customer_id?: string | null
  customer_name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  total?: number | null
  status?: Order['status'] | null
  created_at?: string | null
  items?: OrderItemDto[] | null
}

export interface OrderListResponseDto extends RequestMetadata {
  store_id: string
  items: OrderRecordDto[]
}

export interface UpdateOrderStatusRequestDto extends StoreScopedResource {
  order_id: string
  status: Order['status']
}

export interface OrderListItemModel extends Order {}

export function normalizeOrderRecord(dto: OrderRecordDto): OrderListItemModel {
  return {
    id: dto.id,
    storeId: dto.store_id,
    customerId: dto.customer_id ?? '',
    customerName: dto.customer_name ?? 'Customer',
    email: dto.email ?? '',
    phone: dto.phone ?? '',
    address: dto.address ?? '',
    total: dto.total ?? 0,
    status: dto.status ?? 'pending',
    date: dto.created_at ?? new Date(0).toISOString(),
    items:
      dto.items?.map((item) => ({
        id: item.id,
        name: item.name ?? 'Order item',
        quantity: item.quantity ?? 0,
        price: item.price ?? 0,
      })) ?? [],
  }
}
