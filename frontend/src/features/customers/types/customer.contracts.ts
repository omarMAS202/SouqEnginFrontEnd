import type { RequestMetadata, StoreScopedResource } from '@/types/api-contracts'

export interface CustomerRecordDto extends StoreScopedResource {
  id: string | number
  name?: string | null
  email?: string | null
  phone?: string | null
  total_spent?: number | string | null
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

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

export function normalizeCustomerRecord(dto: CustomerRecordDto): CustomerListItemModel {
  return {
    id: String(dto.id),
    storeId: dto.store_id,
    name: dto.name ?? 'Customer',
    email: dto.email ?? '',
    phone: dto.phone ?? '',
    totalSpent: toNumber(dto.total_spent),
    lastOrder: dto.last_order_at ?? null,
    avatar: dto.avatar_url ?? undefined,
    ordersCount: dto.orders_count ?? 0,
  }
}
