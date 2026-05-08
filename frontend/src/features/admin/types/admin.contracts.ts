import type { RequestMetadata } from '@/types/api-contracts'

export interface AdminDashboardResponseDto extends RequestMetadata {
  stats?: {
    total_stores?: number | null
    active_users?: number | null
    total_orders?: number | null
    platform_revenue?: number | string | null
  } | null
  store_status?: {
    active?: number | null
    pending?: number | null
    suspended?: number | null
  } | null
  recent_stores?: AdminStoreDto[] | null
}

export interface AdminStoreDto {
  id: number | string
  name?: string | null
  owner_name?: string | null
  owner_email?: string | null
  status?: 'active' | 'suspended' | 'pending' | 'draft' | 'setup' | null
  products_count?: number | null
  orders_count?: number | null
  revenue_total?: number | string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface AdminStoresResponseDto extends RequestMetadata {
  items?: AdminStoreDto[] | null
}

export interface AdminUserDto {
  id: number | string
  full_name?: string | null
  email?: string | null
  role?: 'super_admin' | 'store_owner' | 'support' | null
  stores_count?: number | null
  status?: 'active' | 'invited' | 'suspended' | null
  created_at?: string | null
}

export interface AdminUsersResponseDto extends RequestMetadata {
  items?: AdminUserDto[] | null
}

export interface AdminSettingsDto extends RequestMetadata {
  settings?: {
    support_email?: string | null
    default_currency?: string | null
    allow_public_registration?: boolean | null
    require_store_approval?: boolean | null
    maintenance_mode?: boolean | null
  } | null
}

export interface AdminSettingsInput {
  supportEmail: string
  defaultCurrency: string
  allowPublicRegistration: boolean
  requireStoreApproval: boolean
  maintenanceMode: boolean
}

export interface AdminDashboardModel {
  stats: {
    totalStores: number
    activeUsers: number
    totalOrders: number
    platformRevenue: number
  }
  storeStatus: {
    active: number
    pending: number
    suspended: number
  }
  recentStores: AdminStoreModel[]
}

export interface AdminStoreModel {
  id: string
  name: string
  ownerName: string
  ownerEmail: string
  status: 'active' | 'suspended' | 'pending'
  productsCount: number
  ordersCount: number
  revenueTotal: number
  createdAt: string | null
  updatedAt: string | null
}

export interface AdminUserModel {
  id: string
  fullName: string
  email: string
  role: 'super_admin' | 'store_owner' | 'support'
  storesCount: number
  status: 'active' | 'invited' | 'suspended'
  createdAt: string | null
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

export function normalizeAdminStore(dto: AdminStoreDto): AdminStoreModel {
  const rawStatus = dto.status ?? 'pending'
  const status =
    rawStatus === 'active' || rawStatus === 'suspended' || rawStatus === 'pending'
      ? rawStatus
      : rawStatus === 'setup'
        ? 'pending'
        : 'pending'

  return {
    id: String(dto.id),
    name: dto.name ?? 'Store',
    ownerName: dto.owner_name ?? 'Store Owner',
    ownerEmail: dto.owner_email ?? '',
    status,
    productsCount: dto.products_count ?? 0,
    ordersCount: dto.orders_count ?? 0,
    revenueTotal: toNumber(dto.revenue_total),
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}

export function normalizeAdminUser(dto: AdminUserDto): AdminUserModel {
  return {
    id: String(dto.id),
    fullName: dto.full_name ?? 'User',
    email: dto.email ?? '',
    role: dto.role === 'super_admin' || dto.role === 'support' ? dto.role : 'store_owner',
    storesCount: dto.stores_count ?? 0,
    status:
      dto.status === 'active' || dto.status === 'invited' || dto.status === 'suspended'
        ? dto.status
        : 'active',
    createdAt: dto.created_at ?? null,
  }
}

export function normalizeAdminDashboard(dto: AdminDashboardResponseDto): AdminDashboardModel {
  return {
    stats: {
      totalStores: dto.stats?.total_stores ?? 0,
      activeUsers: dto.stats?.active_users ?? 0,
      totalOrders: dto.stats?.total_orders ?? 0,
      platformRevenue: toNumber(dto.stats?.platform_revenue),
    },
    storeStatus: {
      active: dto.store_status?.active ?? 0,
      pending: dto.store_status?.pending ?? 0,
      suspended: dto.store_status?.suspended ?? 0,
    },
    recentStores: dto.recent_stores?.map((store) => normalizeAdminStore(store)) ?? [],
  }
}

export function normalizeAdminSettings(dto: AdminSettingsDto): AdminSettingsInput {
  return {
    supportEmail: dto.settings?.support_email ?? '',
    defaultCurrency: dto.settings?.default_currency ?? 'USD',
    allowPublicRegistration: dto.settings?.allow_public_registration ?? true,
    requireStoreApproval: dto.settings?.require_store_approval ?? true,
    maintenanceMode: dto.settings?.maintenance_mode ?? false,
  }
}
