import type { MediaAssetDto, RequestMetadata, StoreScopedResource } from '@/types/api-contracts'
import type { Product } from '@/types/models'

export interface ProductRecordDto {
  id: string | number
  store_id: string | number
  category_id?: string | number | null
  category_name?: string | null
  name?: string | null
  description?: string | null
  price?: number | null
  stock?: number | null
  status?: Product['status'] | null
  image_url?: string | null
  sku?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CreateProductRequestDto extends StoreScopedResource {
  category_id: string
  name: string
  sku: string
  description: string
  price: number
  stock: number
  status: Product['status']
  image_url?: string | null
}

export interface UpdateProductRequestDto extends CreateProductRequestDto {
  product_id: string
}

export interface ProductListItem extends Product {
  categoryLabel: string
  sku?: string
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ProductFormValues {
  name: string
  sku: string
  description: string
  price: number
  stock: number
  categoryId: string
  status: Product['status']
  image: string
}

export interface ProductMutationInput extends ProductFormValues {
  imageFile?: File | null
  existingImage?: string | null
}

export interface ProductImageDto extends RequestMetadata {
  id: string | number
  image_url?: string | null
  image_file?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ProductImageModel extends MediaAssetDto {
  id: string
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ProductInventoryDto extends RequestMetadata {
  id: string | number
  stock_quantity?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ProductInventoryModel {
  id: string
  stockQuantity: number
  createdAt?: string | null
  updatedAt?: string | null
}

export function normalizeProductRecord(dto: ProductRecordDto): ProductListItem {
  return {
    id: String(dto.id),
    storeId: String(dto.store_id),
    categoryId: dto.category_id !== undefined && dto.category_id !== null ? String(dto.category_id) : '',
    name: dto.name ?? 'Untitled product',
    description: dto.description ?? '',
    price: dto.price ?? 0,
    stock: dto.stock ?? 0,
    status: dto.status ?? 'draft',
    image: dto.image_url ?? '',
    categoryLabel: dto.category_name ?? 'Uncategorized',
    sku: dto.sku ?? undefined,
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}

export function normalizeProductImage(dto: ProductImageDto): ProductImageModel {
  return {
    id: String(dto.id),
    asset_id: String(dto.id),
    url: dto.image_url || dto.image_file || null,
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}

export function normalizeProductInventory(dto: ProductInventoryDto): ProductInventoryModel {
  return {
    id: String(dto.id),
    stockQuantity: dto.stock_quantity ?? 0,
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}
