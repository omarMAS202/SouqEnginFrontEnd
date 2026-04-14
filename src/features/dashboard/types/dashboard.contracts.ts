import type { RequestMetadata, StoreScopedResource } from '@/types/api-contracts'
import type { StoreSettings } from '@/types/models'

export interface DashboardOverviewRequestDto extends StoreScopedResource {
  range?: '7d' | '30d' | '90d'
}

export interface DashboardStatsDto {
  total_orders?: number | null
  total_revenue?: number | null
  total_products?: number | null
  total_customers?: number | null
}

export interface DashboardRecentOrderDto {
  id: string
  customer_name?: string | null
  total?: number | null
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | null
  created_at?: string | null
}

export interface DashboardTopProductDto {
  id: string
  name?: string | null
  sales_count?: number | null
  revenue_total?: number | null
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
  store_id: string
  settings: StoreSettings
}

export interface UpdateStoreSettingsRequestDto extends StoreScopedResource {
  settings: StoreSettings
}
