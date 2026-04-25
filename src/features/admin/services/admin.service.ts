import { appConfig } from '@/config/app'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { dataSourceMode } from '@/services/data-source'
import { httpRequest } from '@/services/http-client'

import {
  normalizeAdminDashboard,
  normalizeAdminSettings,
  normalizeAdminStore,
  normalizeAdminUser,
  type AdminDashboardModel,
  type AdminDashboardResponseDto,
  type AdminSettingsDto,
  type AdminSettingsInput,
  type AdminStoreDto,
  type AdminStoreModel,
  type AdminStoresResponseDto,
  type AdminUserModel,
  type AdminUsersResponseDto,
} from '../types/admin.contracts'

function getAccessToken() {
  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) {
    throw new Error('Authentication token is missing while loading admin data.')
  }

  return accessToken
}

const fallbackStores: AdminStoreModel[] = [
  {
    id: '1',
    name: 'Elegance Fashion',
    ownerName: 'Ahmed Al-Farsi',
    ownerEmail: 'ahmed@elegance.com',
    status: 'active',
    productsCount: 124,
    ordersCount: 567,
    revenueTotal: 45600,
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Tech Galaxy',
    ownerName: 'Sarah Johnson',
    ownerEmail: 'sarah@techgalaxy.com',
    status: 'active',
    productsCount: 89,
    ordersCount: 234,
    revenueTotal: 23400,
    createdAt: '2024-01-08T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Royal Gems',
    ownerName: 'Mohammed Hassan',
    ownerEmail: 'mohammed@royalgems.com',
    status: 'pending',
    productsCount: 45,
    ordersCount: 89,
    revenueTotal: 12300,
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-06T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Fresh Harvest',
    ownerName: 'Emily Chen',
    ownerEmail: 'emily@freshharvest.com',
    status: 'suspended',
    productsCount: 0,
    ordersCount: 0,
    revenueTotal: 0,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-09T00:00:00.000Z',
  },
]

const fallbackUsers: AdminUserModel[] = [
  {
    id: '1',
    fullName: 'Admin User',
    email: 'admin@souqengine.com',
    role: 'super_admin',
    storesCount: 0,
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    fullName: 'Ahmed Al-Farsi',
    email: 'ahmed@elegance.com',
    role: 'store_owner',
    storesCount: 1,
    status: 'active',
    createdAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: '3',
    fullName: 'Support Team',
    email: 'support@souqengine.com',
    role: 'support',
    storesCount: 0,
    status: 'invited',
    createdAt: '2024-01-12T00:00:00.000Z',
  },
]

const fallbackSettings: AdminSettingsInput = {
  supportEmail: 'support@souqengine.com',
  defaultCurrency: 'USD',
  allowPublicRegistration: true,
  requireStoreApproval: true,
  maintenanceMode: false,
}

function isBackendConfigured() {
  return dataSourceMode === 'backend' && Boolean(appConfig.apiBaseUrl)
}

export const adminService = {
  async getDashboard(): Promise<AdminDashboardModel> {
    if (isBackendConfigured()) {
      const accessToken = getAccessToken()
      const { data } = await httpRequest<AdminDashboardResponseDto>('/admin/dashboard/', {
        method: 'GET',
        accessToken,
      })

      return normalizeAdminDashboard(data)
    }

    return {
      stats: {
        totalStores: fallbackStores.length,
        activeUsers: 2847,
        totalOrders: 12584,
        platformRevenue: 284352,
      },
      storeStatus: {
        active: fallbackStores.filter((store) => store.status === 'active').length,
        pending: fallbackStores.filter((store) => store.status === 'pending').length,
        suspended: fallbackStores.filter((store) => store.status === 'suspended').length,
      },
      recentStores: fallbackStores,
    }
  },

  async listStores(search?: string): Promise<AdminStoreModel[]> {
    const normalizedSearch = search?.trim().toLowerCase() ?? ''

    if (isBackendConfigured()) {
      const accessToken = getAccessToken()
      const query = normalizedSearch ? `?search=${encodeURIComponent(normalizedSearch)}` : ''
      const { data } = await httpRequest<AdminStoresResponseDto>(`/admin/stores/${query}`, {
        method: 'GET',
        accessToken,
      })

      return data.items?.map((store) => normalizeAdminStore(store)) ?? []
    }

    if (!normalizedSearch) {
      return fallbackStores
    }

    return fallbackStores.filter((store) =>
      [store.name, store.ownerName, store.ownerEmail].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    )
  },

  async updateStoreStatus(storeId: string, status: AdminStoreModel['status']): Promise<AdminStoreModel> {
    if (isBackendConfigured()) {
      const accessToken = getAccessToken()
      const { data } = await httpRequest<{ store: AdminStoreDto }>(
        `/admin/stores/${storeId}/status/`,
        {
          method: 'PATCH',
          accessToken,
          body: JSON.stringify({ status }),
        },
      )

      return normalizeAdminStore(data.store)
    }

    const store = fallbackStores.find((entry) => entry.id === storeId)

    if (!store) {
      throw new Error('Store not found.')
    }

    return { ...store, status }
  },

  async listUsers(search?: string): Promise<AdminUserModel[]> {
    const normalizedSearch = search?.trim().toLowerCase() ?? ''

    if (isBackendConfigured()) {
      const accessToken = getAccessToken()
      const query = normalizedSearch ? `?search=${encodeURIComponent(normalizedSearch)}` : ''
      const { data } = await httpRequest<AdminUsersResponseDto>(`/admin/users/${query}`, {
        method: 'GET',
        accessToken,
      })

      return data.items?.map((user) => normalizeAdminUser(user)) ?? []
    }

    if (!normalizedSearch) {
      return fallbackUsers
    }

    return fallbackUsers.filter((user) =>
      [user.fullName, user.email, user.role].some((value) => value.toLowerCase().includes(normalizedSearch)),
    )
  },

  async getSettings(): Promise<AdminSettingsInput> {
    if (isBackendConfigured()) {
      const accessToken = getAccessToken()
      const { data } = await httpRequest<AdminSettingsDto>('/admin/settings/', {
        method: 'GET',
        accessToken,
      })

      return normalizeAdminSettings(data)
    }

    return fallbackSettings
  },

  async updateSettings(input: AdminSettingsInput): Promise<AdminSettingsInput> {
    if (isBackendConfigured()) {
      const accessToken = getAccessToken()
      const { data } = await httpRequest<AdminSettingsDto>('/admin/settings/', {
        method: 'PATCH',
        accessToken,
        body: JSON.stringify({
          settings: {
            support_email: input.supportEmail,
            default_currency: input.defaultCurrency,
            allow_public_registration: input.allowPublicRegistration,
            require_store_approval: input.requireStoreApproval,
            maintenance_mode: input.maintenanceMode,
          },
        }),
      })

      return normalizeAdminSettings(data)
    }

    return input
  },
}
