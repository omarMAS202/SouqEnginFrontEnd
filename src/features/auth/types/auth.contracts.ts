import type { RequestMetadata, StoreScopedResource } from '@/types/api-contracts'
import type { SessionUser, StoreRecord } from '@/types/models'

export interface LoginRequestDto {
  email: string
  password: string
}

export interface RegisterRequestDto {
  full_name: string
  email: string
  password: string
  store_name: string
}

export interface AuthUserDto {
  user_id: string
  full_name: string
  email: string
  role: SessionUser['role']
  accessible_store_ids: string[]
}

export interface AuthSessionResponseDto extends RequestMetadata {
  user: AuthUserDto
  current_store_id?: string | null
}

export interface StoreSummaryDto extends StoreScopedResource {
  id: string
  name: string
  url: string
  status?: StoreRecord['status'] | null
}

export interface StoreBootstrapResponseDto extends RequestMetadata {
  store: StoreSummaryDto | null
  available_stores: StoreSummaryDto[]
  current_store_id?: string | null
}

export interface StoreSelectorItem {
  id: string
  storeId: string
  name: string
  url: string
  status: StoreRecord['status'] | 'draft'
}

export function normalizeSessionUser(dto: AuthUserDto): SessionUser {
  return {
    id: dto.user_id,
    fullName: dto.full_name,
    email: dto.email,
    role: dto.role,
    storeIds: dto.accessible_store_ids ?? [],
  }
}

export function normalizeStoreSelectorItem(dto: StoreSummaryDto): StoreSelectorItem {
  return {
    id: dto.id,
    storeId: dto.store_id,
    name: dto.name,
    url: dto.url,
    status: dto.status ?? 'draft',
  }
}
