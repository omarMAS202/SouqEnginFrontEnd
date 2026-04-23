import type { RequestMetadata, StoreScopedResource } from '@/types/api-contracts'
import type { StoreSettings } from '@/types/models'

export interface DashboardOverviewRequestDto extends StoreScopedResource {
  range?: '7d' | '30d' | '90d'
}

export interface DashboardStatsDto {
  total_orders?: number | null
  total_revenue?: number | string | null
  total_products?: number | null
  total_customers?: number | null
}

export interface DashboardRecentOrderDto {
  id: string | number
  customer_name?: string | null
  total?: number | string | null
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | null
  created_at?: string | null
}

export interface DashboardTopProductDto {
  id: string | number
  name?: string | null
  sales_count?: number | null
  revenue_total?: number | string | null
}

export interface DashboardOverviewResponseDto extends RequestMetadata {
  store_id: string
  stats?: DashboardStatsDto | null
  recent_orders?: DashboardRecentOrderDto[] | null
  top_products?: DashboardTopProductDto[] | null
}

export interface DashboardOverviewModel {
  stats: {
    totalOrders: number
    totalRevenue: number
    totalProducts: number
    totalCustomers: number
  }
  recentOrders: Array<{
    id: string
    customerName: string
    total: number
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    date: string
  }>
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
}

export interface StoreSettingsResponseDto extends RequestMetadata {
  store_id: string | number
  settings: {
    storeName?: string | null
    storeUrl?: string | null
    storeDescription?: string | null
    storeEmail?: string | null
    storePhone?: string | null
    currency?: string | null
    timezone?: string | null
    language?: string | null
    emailNotifications?: boolean | null
    orderNotifications?: boolean | null
    marketingNotifications?: boolean | null
    twoFactorAuth?: boolean | null
  }
}

export interface UpdateStoreSettingsRequestDto extends StoreScopedResource {
  settings: StoreSettings
}

export interface PatchStoreSettingsRequestDto extends StoreScopedResource {
  settings: Partial<StoreSettings>
}

export interface StoreRecordResponseDto {
  id: number | string
  owner: number | string
  name?: string | null
  slug?: string | null
  description?: string | null
  status?: 'active' | 'suspended' | 'draft' | 'setup' | null
  tenant_id?: number | string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface StoreRecordModel {
  id: string
  ownerId: string
  name: string
  slug: string
  description: string
  status: 'active' | 'suspended' | 'draft' | 'setup'
  tenantId: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface UpdateStoreRequestDto {
  name: string
  slug: string
  description: string
  status: 'active' | 'suspended' | 'draft' | 'setup'
}

export interface PatchStoreRequestDto {
  name?: string
  slug?: string
  description?: string
  status?: 'active' | 'suspended' | 'draft' | 'setup'
}

export interface StoreDomainDto {
  id: number | string
  store: number | string
  domain?: string | null
  is_primary?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export interface StoreDomainModel {
  id: string
  storeId: string
  domain: string
  isPrimary: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface StoreDomainMutationInput {
  domain: string
  isPrimary: boolean
}

export interface PublishStoreRequestDto extends StoreScopedResource {
  action: 'publish' | 'unpublish'
}

export interface PublishStoreResponseDto {
  store?: {
    is_published?: boolean | null
    published_at?: string | null
  } | null
}

export interface PublishStoreModel {
  isPublished: boolean
  publishedAt: string | null
}

export interface SetSubdomainRequestDto extends StoreScopedResource {
  subdomain: string
}

export interface SetSubdomainResponseDto {
  store?: {
    subdomain?: string | null
  } | null
}

export interface SlugCheckRequestDto {
  slug: string
  store_id?: number | string
}

export interface SlugCheckResponseDto {
  slug: string
  available: boolean
}

export interface SlugSuggestRequestDto {
  name: string
  store_id?: number | string
  limit?: number
}

export interface SlugSuggestResponseDto {
  name: string
  suggestions: string[]
}

export function normalizeStoreRecord(dto: StoreRecordResponseDto): StoreRecordModel {
  return {
    id: String(dto.id),
    ownerId: String(dto.owner),
    name: dto.name ?? 'Store',
    slug: dto.slug ?? '',
    description: dto.description ?? '',
    status: dto.status ?? 'draft',
    tenantId: dto.tenant_id !== undefined && dto.tenant_id !== null ? String(dto.tenant_id) : null,
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}

export function normalizeStoreDomain(dto: StoreDomainDto): StoreDomainModel {
  return {
    id: String(dto.id),
    storeId: String(dto.store),
    domain: dto.domain ?? '',
    isPrimary: dto.is_primary ?? false,
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}
