import type { RequestMetadata, StoreScopedResource } from '@/types/api-contracts'

export interface CategoryRecordDto extends StoreScopedResource {
  id: string
  name?: string | null
  description?: string | null
  image_url?: string | null
  product_count?: number | null
}

export interface SaveCategoryRequestDto extends StoreScopedResource {
  category_id?: string
  name: string
  description: string
  image_url?: string | null
}

export interface DeleteCategoryRequestDto extends StoreScopedResource {
  category_id: string
}

export interface CategoryListResponseDto extends RequestMetadata {
  store_id: string
  items: CategoryRecordDto[]
}

export interface CategoryListItemModel {
  id: string
  storeId: string
  name: string
  description: string
  image: string
  productCount: number
}

export function normalizeCategoryRecord(dto: CategoryRecordDto): CategoryListItemModel {
  return {
    id: dto.id,
    storeId: dto.store_id,
    name: dto.name ?? 'Untitled category',
    description: dto.description ?? '',
    image: dto.image_url ?? '',
    productCount: dto.product_count ?? 0,
  }
}
