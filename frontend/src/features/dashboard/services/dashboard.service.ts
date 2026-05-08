import { useAuthStore } from '@/features/auth/store/auth-store'
import { appConfig } from '@/config/app'
import { dataSource } from '@/services/data-source'
import { dataSourceMode } from '@/services/data-source'
import { httpRequest } from '@/services/http-client'
import type { Order, StoreSettings } from '@/types/models'

import type {
  DashboardOverviewModel,
  DashboardOverviewResponseDto,
  PatchStoreRequestDto,
  PublishStoreModel,
  PublishStoreResponseDto,
  SlugCheckResponseDto,
  SlugSuggestResponseDto,
  StoreDomainDto,
  StoreDomainModel,
  StoreDomainMutationInput,
  StoreRecordModel,
  StoreRecordResponseDto,
  StoreSettingsResponseDto,
  UpdateStoreRequestDto,
} from '../types/dashboard.contracts'
import { normalizeStoreDomain, normalizeStoreRecord } from '../types/dashboard.contracts'

const defaultOrderStatus: Order['status'] = 'pending'

function getAccessToken() {
  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) {
    throw new Error('Authentication token is missing while loading dashboard data.')
  }

  return accessToken
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

function normalizeSettingsResponse(
  response: StoreSettingsResponseDto,
): StoreSettings {
  const settings = response.settings
  const language = settings.language === 'ar' ? 'ar' : 'en'

  return {
    storeName: settings.storeName ?? '',
    storeUrl: settings.storeUrl ?? '',
    storeDescription: settings.storeDescription ?? '',
    storeEmail: settings.storeEmail ?? '',
    storePhone: settings.storePhone ?? '',
    currency: settings.currency ?? 'USD',
    timezone: settings.timezone ?? 'UTC',
    language,
    emailNotifications: settings.emailNotifications ?? true,
    orderNotifications: settings.orderNotifications ?? true,
    marketingNotifications: settings.marketingNotifications ?? false,
    twoFactorAuth: settings.twoFactorAuth ?? false,
  }
}

function normalizePublishResponse(response: PublishStoreResponseDto): PublishStoreModel {
  return {
    isPublished: response.store?.is_published ?? false,
    publishedAt: response.store?.published_at ?? null,
  }
}

export const dashboardService = {
  async getOverview(storeId: string): Promise<DashboardOverviewModel> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()
      const { data } = await httpRequest<DashboardOverviewResponseDto>(`/stores/${storeId}/dashboard/`, {
        method: 'GET',
        accessToken,
      })

      return {
        stats: {
          totalOrders: data.stats?.total_orders ?? 0,
          totalRevenue: toNumber(data.stats?.total_revenue),
          totalProducts: data.stats?.total_products ?? 0,
          totalCustomers: data.stats?.total_customers ?? 0,
        },
        recentOrders:
          data.recent_orders?.map((order) => ({
            id: String(order.id),
            customerName: order.customer_name ?? 'Customer',
            total: toNumber(order.total),
            status: order.status ?? defaultOrderStatus,
            date: order.created_at ?? new Date(0).toISOString(),
          })) ?? [],
        topProducts:
          data.top_products?.map((product) => ({
            id: String(product.id),
            name: product.name ?? 'Product',
            sales: product.sales_count ?? 0,
            revenue: toNumber(product.revenue_total),
          })) ?? [],
      }
    }

    const response = await dataSource.dashboard.overview(storeId)

    return {
      stats: {
        totalOrders: response?.stats?.totalOrders ?? 0,
        totalRevenue: response?.stats?.totalRevenue ?? 0,
        totalProducts: response?.stats?.totalProducts ?? 0,
        totalCustomers: response?.stats?.totalCustomers ?? 0,
      },
      recentOrders:
        response?.recentOrders?.map((order) => ({
          id: order.id,
          customerName: order.customerName ?? 'Customer',
          total: order.total ?? 0,
          status: order.status ?? defaultOrderStatus,
          date: order.date ?? new Date(0).toISOString(),
        })) ?? [],
      topProducts:
        response?.topProducts?.map((product) => ({
          id: product.id,
          name: product.name ?? 'Product',
          sales: product.sales ?? 0,
          revenue: product.revenue ?? 0,
        })) ?? [],
    }
  },
  async getSettings(storeId: string): Promise<StoreSettings> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()
      const { data } = await httpRequest<StoreSettingsResponseDto>(
        `/stores/${storeId}/settings/`,
        {
          method: 'GET',
          accessToken,
        },
      )

      return normalizeSettingsResponse(data)
    }

    return dataSource.dashboard.settings(storeId)
  },
  async updateSettings(storeId: string, settings: StoreSettings): Promise<StoreSettings> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()
      const { data } = await httpRequest<StoreSettingsResponseDto>(
        `/stores/${storeId}/settings/`,
        {
          method: 'PUT',
          accessToken,
          body: JSON.stringify({
            settings,
          }),
        },
      )

      return normalizeSettingsResponse(data)
    }

    return dataSource.dashboard.updateSettings(storeId, settings)
  },
  async patchSettings(storeId: string, settings: Partial<StoreSettings>): Promise<StoreSettings> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()
      const { data } = await httpRequest<StoreSettingsResponseDto>(`/stores/${storeId}/settings/`, {
        method: 'PATCH',
        accessToken,
        body: JSON.stringify({
          settings,
        }),
      })

      return normalizeSettingsResponse(data)
    }

    const current = await dataSource.dashboard.settings(storeId)
    return dataSource.dashboard.updateSettings(storeId, { ...current, ...settings })
  },
  async replaceStore(storeId: string, input: UpdateStoreRequestDto): Promise<StoreRecordModel> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      throw new Error('Store updates are only available in backend mode.')
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<StoreRecordResponseDto>(`/stores/${storeId}/`, {
      method: 'PUT',
      accessToken,
      body: JSON.stringify(input),
    })

    return normalizeStoreRecord(data)
  },
  async patchStore(storeId: string, input: PatchStoreRequestDto): Promise<StoreRecordModel> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      throw new Error('Store updates are only available in backend mode.')
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<StoreRecordResponseDto>(`/stores/${storeId}/`, {
      method: 'PATCH',
      accessToken,
      body: JSON.stringify(input),
    })

    return normalizeStoreRecord(data)
  },
  async deleteStore(storeId: string): Promise<void> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      throw new Error('Store deletion is only available in backend mode.')
    }

    const accessToken = getAccessToken()
    await httpRequest<null>(`/stores/${storeId}/delete/`, {
      method: 'DELETE',
      accessToken,
    })
  },
  async listDomains(storeId: string): Promise<StoreDomainModel[]> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      return []
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<StoreDomainDto[]>(`/stores/${storeId}/domains/`, {
      method: 'GET',
      accessToken,
    })

    return data.map((domain) => normalizeStoreDomain(domain))
  },
  async getDomain(storeId: string, domainId: string): Promise<StoreDomainModel> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      throw new Error('Store domain details are only available in backend mode.')
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<StoreDomainDto>(`/stores/${storeId}/domains/${domainId}/`, {
      method: 'GET',
      accessToken,
    })

    return normalizeStoreDomain(data)
  },
  async createDomain(storeId: string, input: StoreDomainMutationInput): Promise<StoreDomainModel> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      throw new Error('Store domain creation is only available in backend mode.')
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<StoreDomainDto>(`/stores/${storeId}/domains/`, {
      method: 'POST',
      accessToken,
      body: JSON.stringify({
        domain: input.domain,
        is_primary: input.isPrimary,
      }),
    })

    return normalizeStoreDomain(data)
  },
  async replaceDomain(storeId: string, domainId: string, input: StoreDomainMutationInput): Promise<StoreDomainModel> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      throw new Error('Store domain updates are only available in backend mode.')
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<StoreDomainDto>(`/stores/${storeId}/domains/${domainId}/`, {
      method: 'PUT',
      accessToken,
      body: JSON.stringify({
        domain: input.domain,
        is_primary: input.isPrimary,
      }),
    })

    return normalizeStoreDomain(data)
  },
  async patchDomain(storeId: string, domainId: string, input: Partial<StoreDomainMutationInput>): Promise<StoreDomainModel> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      throw new Error('Store domain updates are only available in backend mode.')
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<StoreDomainDto>(`/stores/${storeId}/domains/${domainId}/`, {
      method: 'PATCH',
      accessToken,
      body: JSON.stringify({
        domain: input.domain,
        is_primary: input.isPrimary,
      }),
    })

    return normalizeStoreDomain(data)
  },
  async deleteDomain(storeId: string, domainId: string): Promise<void> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      throw new Error('Store domain deletion is only available in backend mode.')
    }

    const accessToken = getAccessToken()
    await httpRequest<null>(`/stores/${storeId}/domains/${domainId}/`, {
      method: 'DELETE',
      accessToken,
    })
  },
  async publishStore(storeId: string, action: 'publish' | 'unpublish'): Promise<PublishStoreModel> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      throw new Error('Store publishing is only available in backend mode.')
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<PublishStoreResponseDto>(`/stores/${storeId}/publish/`, {
      method: 'PATCH',
      accessToken,
      body: JSON.stringify({ action }),
    })

    return normalizePublishResponse(data)
  },
  async setSubdomain(storeId: string, subdomain: string): Promise<string> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      throw new Error('Subdomain updates are only available in backend mode.')
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<{ store?: { subdomain?: string | null } | null }>(`/stores/${storeId}/subdomain/`, {
      method: 'PATCH',
      accessToken,
      body: JSON.stringify({ subdomain }),
    })

    return data.store?.subdomain ?? ''
  },
  async checkSlug(slug: string, storeId?: string | null): Promise<SlugCheckResponseDto> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      return { slug, available: true }
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<SlugCheckResponseDto>(`/stores/slug/check/`, {
      method: 'POST',
      accessToken,
      body: JSON.stringify({
        slug,
        store_id: storeId ? Number(storeId) : undefined,
      }),
    })

    return data
  },
  async suggestSlugs(name: string, storeId?: string | null, limit = 5): Promise<SlugSuggestResponseDto> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      const base = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      return {
        name,
        suggestions: Array.from({ length: limit }, (_, index) => (index === 0 ? base : `${base}-${index}`)),
      }
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<SlugSuggestResponseDto>(`/stores/slug/suggest/`, {
      method: 'POST',
      accessToken,
      body: JSON.stringify({
        name,
        store_id: storeId ? Number(storeId) : undefined,
        limit,
      }),
    })

    return data
  },
}
