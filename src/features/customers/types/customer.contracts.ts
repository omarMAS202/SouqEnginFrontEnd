import type { RequestMetadata, StoreScopedResource } from '@/types/api-contracts'

export interface CustomerRecordDto extends StoreScopedResource {
  id: string
  name?: string | null
  email?: string | null
  phone?: string | null
  total_spent?: number | null
  last_order_at?: string | null
  avatar_url?: string | null
  orders_count?: number | null
}

export interface CustomerListResponseDto extends RequestMetadata {
  store_id: string
  items: CustomerRecordDto[]
}

export interface CreateCustomerRequestDto extends StoreScopedResource {
  name: string
  email: string
  phone: string
}

export interface CustomerListItemModel {
  id: string
  storeId: string
  name: string
  email: string
  phone: string
  totalSpent: number
  lastOrder: string | null
  avatar?: string
  ordersCount: number
}

export function normalizeCustomerRecord(dto: CustomerRecordDto): CustomerListItemModel {
  return {
    id: dto.id,
    storeId: dto.store_id,
    name: dto.name ?? 'Customer',
    email: dto.email ?? '',
    phone: dto.phone ?? '',
    totalSpent: dto.total_spent ?? 0,
    lastOrder: dto.last_order_at ?? null,
    avatar: dto.avatar_url ?? undefined,
    ordersCount: dto.orders_count ?? 0,
  }
}
