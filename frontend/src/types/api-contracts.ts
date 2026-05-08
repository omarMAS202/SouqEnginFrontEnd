export interface RequestMetadata {
  request_id?: string | null
  trace_id?: string | null
}

export interface StoreScopedResource {
  store_id: string
}

export interface TenantScopedResource {
  tenant_id: string
}

export interface DraftResourceMetadata extends RequestMetadata {
  draft_id?: string | null
  expires_at?: string | null
  confirmed_at?: string | null
}

export interface AuditMetadata {
  audit_id?: string | null
  actor_id?: string | null
  actor_type?: 'merchant' | 'admin' | 'system' | 'ai' | null
  created_at?: string | null
}

export interface PaginationParams {
  page?: number
  page_size?: number
  search?: string
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
}

export interface PaginatedResponseDto<T> extends RequestMetadata {
  items: T[]
  total: number
  page: number
  page_size: number
  has_next_page: boolean
}

export interface MediaAssetDto {
  asset_id?: string | null
  url?: string | null
  alt?: string | null
  mime_type?: string | null
}
