import type { StoreScopedResource } from '@/types/api-contracts'

export interface CategoryRecordDto {
  id: string | number
  store_id?: string | number
  name?: string | null
  description?: string | null
  image_url?: string | null
  product_count?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface SaveCategoryRequestDto extends StoreScopedResource {
  category_id?: string
  name: string
  description: string
  image_url?: string | null
}

export interface CategoryListItemModel {
  id: string
  storeId: string
  name: string
  description: string
  image: string
  productCount: number
}

export function normalizeCategoryRecord(
  dto: CategoryRecordDto,
  fallbackStoreId?: string,
): CategoryListItemModel {
  return {
    id: String(dto.id),
    storeId: dto.store_id !== undefined && dto.store_id !== null ? String(dto.store_id) : fallbackStoreId ?? '',
    name: dto.name ?? 'Untitled category',
    description: dto.description ?? '',
    image: dto.image_url ?? '',
    productCount: dto.product_count ?? 0,
  }
}
