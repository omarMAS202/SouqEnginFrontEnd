import type { RequestMetadata, StoreScopedResource } from '@/types/api-contracts'
import type { SessionUser, UserRole } from '@/types/models'

export interface LoginRequestDto {
  email: string
  password: string
}

export interface RegisterRequestDto {
  username: string
  email: string
  password: string
  role: 'Store Owner'
}

export interface AuthLoginResponseDto extends RequestMetadata {
  access: string
  refresh: string
  user_id: number
  role: 'Store Owner' | 'Super Admin'
  tenant_id: number | null
}

export interface AuthMeResponseDto extends RequestMetadata {
  user_id: number
  username: string
  email: string
  role: 'Store Owner' | 'Super Admin'
  tenant_id: number | null
  is_active: boolean
  display_name?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface RegisterResponseDto extends RequestMetadata {
  detail: string
}

export interface StoreSummaryDto extends StoreScopedResource {
  id: string
  owner_id: string
  name: string
  slug: string
  description?: string | null
  tenant_id: string | null
  created_at?: string | null
  updated_at?: string | null
  url: string
  status?: 'active' | 'suspended' | 'draft' | 'setup' | null
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
  slug: string
  description?: string
  tenantId: string | null
  url: string
  status: 'active' | 'suspended' | 'draft' | 'setup'
}

export interface AuthSessionModel {
  user: SessionUser
  currentStoreId: string | null
  stores: StoreSelectorItem[]
  tenantId: string | null
  accessToken: string | null
  refreshToken: string | null
}

export interface RegistrationResult {
  message: string
}

export interface AuthBootstrapInput {
  accessToken: string | null
  refreshToken: string | null
  currentStoreId: string | null
}

export function normalizeUserRole(role: AuthLoginResponseDto['role'] | AuthMeResponseDto['role']): UserRole {
  return role === 'Super Admin' ? 'super_admin' : 'store_owner'
}

export function normalizeSessionUser(
  me: AuthMeResponseDto,
  stores: StoreSummaryDto[],
): SessionUser {
  return {
    id: String(me.user_id),
    fullName: me.display_name?.trim() || me.username,
    email: me.email,
    role: normalizeUserRole(me.role),
    storeIds: stores.map((store) => store.store_id),
  }
}

export function normalizeStoreSelectorItem(dto: StoreSummaryDto): StoreSelectorItem {
  return {
    id: dto.id,
    storeId: dto.store_id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description ?? undefined,
    tenantId: dto.tenant_id,
    url: dto.url,
    status: dto.status ?? 'draft',
  }
}
