import type { RequestMetadata, StoreScopedResource } from '@/types/api-contracts'
import type { Product } from '@/types/models'

export interface ProductRecordDto extends StoreScopedResource {
  id: string
  category_id?: string | null
  category_name?: string | null
  name?: string | null
  description?: string | null
  price?: number | null
  stock?: number | null
  status?: Product['status'] | null
  image_url?: string | null
}

export interface ProductListResponseDto extends RequestMetadata {
  store_id: string
  items: ProductRecordDto[]
}

export interface CreateProductRequestDto extends StoreScopedResource {
  category_id: string
  name: string
  description: string
  price: number
  stock: number
  status: Product['status']
  image_url?: string | null
}

export interface UpdateProductRequestDto extends CreateProductRequestDto {
  product_id: string
}

export interface DeleteProductRequestDto extends StoreScopedResource {
  product_id: string
}

export interface ProductListItem extends Product {
  categoryLabel: string
}

export interface ProductFormValues {
  name: string
  description: string
  price: number
  stock: number
  categoryId: string
  status: Product['status']
  image: string
}

export function normalizeProductRecord(dto: ProductRecordDto): ProductListItem {
  return {
    id: dto.id,
    storeId: dto.store_id,
    categoryId: dto.category_id ?? '',
    name: dto.name ?? 'Untitled product',
    description: dto.description ?? '',
    price: dto.price ?? 0,
    stock: dto.stock ?? 0,
    status: dto.status ?? 'draft',
    image: dto.image_url ?? '',
    categoryLabel: dto.category_name ?? 'Uncategorized',
  }
}
