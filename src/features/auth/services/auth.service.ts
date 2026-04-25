import { appConfig } from '@/config/app'
import { dataSource, dataSourceMode } from '@/services/data-source'
import { ApiError, httpRequest } from '@/services/http-client'
import type { SessionUser, StoreRecord } from '@/types/models'

import type {
  AuthBootstrapInput,
  AuthLoginResponseDto,
  AuthMeResponseDto,
  AuthSessionModel,
  LoginRequestDto,
  RegisterRequestDto,
  RegisterResponseDto,
  RegistrationResult,
  StoreBootstrapResponseDto,
  StoreSelectorItem,
  StoreSummaryDto,
} from '../types/auth.contracts'
import {
  normalizeSessionUser,
  normalizeStoreSelectorItem,
} from '../types/auth.contracts'

function normalizeStoreSummary(store: StoreRecord): StoreSummaryDto {
  return {
    id: store.id,
    store_id: store.id,
    owner_id: store.ownerId,
    name: store.name,
    slug: store.url,
    subdomain: store.subdomain ?? null,
    description: store.description,
    tenant_id: null,
    created_at: null,
    updated_at: null,
    url: store.url,
    status: store.status,
  }
}

function normalizeBackendStore(store: {
  id: number
  owner: number
  name: string
  slug: string
  subdomain?: string | null
  description: string | null
  status: string
  tenant_id: number | null
  created_at: string
  updated_at: string
}): StoreSummaryDto {
  return {
    id: String(store.id),
    store_id: String(store.id),
    owner_id: String(store.owner),
    name: store.name,
    slug: store.slug,
    subdomain: store.subdomain ?? null,
    description: store.description,
    tenant_id: store.tenant_id !== null ? String(store.tenant_id) : null,
    created_at: store.created_at,
    updated_at: store.updated_at,
    url: store.slug,
    status:
      store.status === 'active' ||
      store.status === 'inactive' ||
      store.status === 'setup' ||
      store.status === 'draft'
        ? store.status
        : 'draft',
  }
}

function resolveCurrentStoreId(stores: StoreSelectorItem[], currentStoreId: string | null) {
  if (currentStoreId && stores.some((store) => store.storeId === currentStoreId)) {
    return currentStoreId
  }

  return stores[0]?.storeId ?? null
}

async function fetchMe(accessToken: string) {
  const { data } = await httpRequest<AuthMeResponseDto>('/auth/me/', {
    method: 'GET',
    accessToken,
  })

  return data
}

async function fetchStores(accessToken: string) {
  const { data } = await httpRequest<
    Array<{
      id: number
      owner: number
      name: string
      slug: string
      subdomain?: string | null
      description: string | null
      status: string
      tenant_id: number | null
      created_at: string
      updated_at: string
    }>
  >('/stores/', {
    method: 'GET',
    accessToken,
  })

  return data.map((store) => normalizeBackendStore(store))
}

async function refreshAccessToken(refreshToken: string) {
  const { data } = await httpRequest<{ access: string }>('/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken }),
  })

  return data.access
}

export const authService = {
  async login(input: LoginRequestDto): Promise<AuthSessionModel> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      const user = await dataSource.auth.login(input)
      const currentStoreId = user.storeIds[0] ?? null
      return {
        user,
        currentStoreId,
        stores: [],
        tenantId: null,
        accessToken: null,
        refreshToken: null,
      }
    }

    const { data } = await httpRequest<AuthLoginResponseDto>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(input),
    })

    return this.bootstrapSession({
      accessToken: data.access,
      refreshToken: data.refresh,
      currentStoreId: null,
    })
  },

  async register(input: RegisterRequestDto): Promise<RegistrationResult> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      await dataSource.auth.register({
        fullName: input.username,
        email: input.email,
        password: input.password,
        storeName: input.username,
      })

      return {
        message: 'Account created in local fallback mode.',
      }
    }

    const { data } = await httpRequest<RegisterResponseDto>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(input),
    })

    return {
      message: data.detail,
    }
  },

  async bootstrapSession(input: AuthBootstrapInput): Promise<AuthSessionModel> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      throw new Error('Auth bootstrap is only available in backend mode.')
    }

    if (!input.accessToken || !input.refreshToken) {
      throw new Error('Missing session tokens.')
    }

    let accessToken = input.accessToken

    try {
      const [me, storeSummaries] = await Promise.all([
        fetchMe(accessToken),
        fetchStores(accessToken),
      ])
      const stores = storeSummaries.map((store) => normalizeStoreSelectorItem(store))

      return {
        user: normalizeSessionUser(me, storeSummaries),
        currentStoreId: resolveCurrentStoreId(stores, input.currentStoreId),
        stores,
        tenantId: me.tenant_id !== null ? String(me.tenant_id) : null,
        accessToken,
        refreshToken: input.refreshToken,
      }
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error
      }

      accessToken = await refreshAccessToken(input.refreshToken)
      const [me, storeSummaries] = await Promise.all([
        fetchMe(accessToken),
        fetchStores(accessToken),
      ])
      const stores = storeSummaries.map((store) => normalizeStoreSelectorItem(store))

      return {
        user: normalizeSessionUser(me, storeSummaries),
        currentStoreId: resolveCurrentStoreId(stores, input.currentStoreId),
        stores,
        tenantId: me.tenant_id !== null ? String(me.tenant_id) : null,
        accessToken,
        refreshToken: input.refreshToken,
      }
    }
  },

  async listUserStores(user: SessionUser | null, accessToken?: string | null): Promise<StoreSelectorItem[]> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      const stores = await dataSource.auth.listUserStores(user)
      return stores.map((store) => normalizeStoreSelectorItem(normalizeStoreSummary(store)))
    }

    if (!accessToken) {
      throw new Error('Missing access token while loading stores.')
    }

    const stores = await fetchStores(accessToken)
    return stores.map((store) => normalizeStoreSelectorItem(store))
  },

  async getCurrentStoreBootstrap(
    user: SessionUser | null,
    currentStoreId: string | null,
    accessToken?: string | null,
  ): Promise<StoreBootstrapResponseDto> {
    const stores = await this.listUserStores(user, accessToken)
    const selectedStore =
      stores.find((store) => store.storeId === currentStoreId || store.id === currentStoreId) ??
      stores[0] ??
      null

    return {
      store: selectedStore
        ? {
            id: selectedStore.id,
            store_id: selectedStore.storeId,
            owner_id: user?.id ?? '',
            name: selectedStore.name,
            slug: selectedStore.slug,
            subdomain: selectedStore.subdomain ?? null,
            description: selectedStore.description ?? null,
            tenant_id: selectedStore.tenantId,
            created_at: null,
            updated_at: null,
            url: selectedStore.url,
            status: selectedStore.status,
          }
        : null,
      available_stores: stores.map((store) => ({
        id: store.id,
        store_id: store.storeId,
        owner_id: user?.id ?? '',
        name: store.name,
        slug: store.slug,
        subdomain: store.subdomain ?? null,
        description: store.description ?? null,
        tenant_id: store.tenantId,
        created_at: null,
        updated_at: null,
        url: store.url,
        status: store.status,
      })),
      current_store_id: selectedStore?.storeId ?? null,
    }
  },
}
