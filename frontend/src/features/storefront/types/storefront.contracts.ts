import type {
  AuditMetadata,
  DraftResourceMetadata,
  MediaAssetDto,
  PaginatedResponseDto,
  RequestMetadata,
  StoreScopedResource,
  TenantScopedResource,
} from '@/types/api-contracts'

import type {
  AiGeneratedStorefrontPayload,
  CartItem,
  CheckoutInput,
  CustomerAccount,
  Product,
  StorefrontRuntime,
} from './storefront.types'

export interface StorefrontRuntimeResponseDto extends RequestMetadata, StoreScopedResource, TenantScopedResource {
  store_slug?: string | null
  runtime?: Partial<StorefrontRuntime> | null
}

export interface PublicProductDto extends StoreScopedResource {
  id: string
  slug?: string | null
  name?: string | null
  subtitle?: string | null
  description?: string | null
  category_id?: string | null
  category_name?: string | null
  price?: number | null
  compare_at_price?: number | null
  sku?: string | null
  stock_status?: Product['stockStatus'] | null
  stock_count?: number | null
  media?: MediaAssetDto[] | null
  featured?: boolean | null
}

export interface CustomerAccountResponseDto extends RequestMetadata {
  customer: CustomerAccount | null
}

export interface CheckoutStartRequestDto extends StoreScopedResource {
  cart_items: CartItem[]
  customer_input: CheckoutInput
}

export interface CheckoutStartResponseDto extends RequestMetadata {
  checkout_id?: string | null
  status: 'pending-backend' | 'requires-payment' | 'created'
  redirect_url?: string | null
}

export interface StorefrontDraftResponseDto extends DraftResourceMetadata, AuditMetadata {
  store_id?: string | null
  runtime?: StorefrontRuntime | null
  payload?: AiGeneratedStorefrontPayload | null
}

export interface StorefrontCatalogResponseDto extends PaginatedResponseDto<PublicProductDto> {
  store_id: string
}

export interface PublicStoreSummaryResponseDto extends RequestMetadata {
  store: {
    id: string | number
    name?: string | null
    subdomain?: string | null
    description?: string | null
  }
}
