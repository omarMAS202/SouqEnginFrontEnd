import { useAuthStore } from '@/features/auth/store/auth-store'
import { appConfig } from '@/config/app'
import { dataSource, dataSourceMode } from '@/services/data-source'
import { httpRequest } from '@/services/http-client'

import { normalizeCategoryRecord, type CategoryListItemModel, type SaveCategoryRequestDto } from '../types/category.contracts'

type BackendCategoryRecord = {
  id: number | string
  store_id?: number | string
  name?: string | null
  description?: string | null
  image_url?: string | null
  product_count?: number | null
  created_at?: string | null
  updated_at?: string | null
}

type LocalCategoryRecord = {
  id: string
  storeId: string
  name: string
  description: string
  image: string
  productCount?: number
}

function getAccessToken() {
  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) {
    throw new Error('Authentication token is missing while loading categories.')
  }

  return accessToken
}

function normalizeBackendCategory(category: BackendCategoryRecord, storeId: string) {
  return normalizeCategoryRecord(category, storeId)
}

function normalizeLocalCategory(category: LocalCategoryRecord, storeId: string) {
  return normalizeCategoryRecord(
    {
      id: category.id,
      store_id: category.storeId,
      name: category.name,
      description: category.description,
      image_url: category.image,
      product_count: category.productCount ?? 0,
    },
    storeId,
  )
}

export const categoriesService = {
  async list(storeId: string): Promise<CategoryListItemModel[]> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      const { data } = await httpRequest<BackendCategoryRecord[]>(`/categories/stores/${storeId}/categories/`, {
        method: 'GET',
        accessToken,
      })

      return data.map((category) => normalizeBackendCategory(category, storeId))
    }

    const categories = await dataSource.categories.list(storeId)
    return categories.map((category) => normalizeLocalCategory(category as LocalCategoryRecord, storeId))
  },
  async save(
    storeId: string,
    input: { id?: string; name: string; description: string; image?: string },
  ): Promise<CategoryListItemModel> {
    const request: SaveCategoryRequestDto = {
      store_id: storeId,
      category_id: input.id,
      name: input.name,
      description: input.description,
      image_url: input.image ?? null,
    }

    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()
      const path = request.category_id
        ? `/categories/stores/${storeId}/categories/${request.category_id}/`
        : `/categories/stores/${storeId}/categories/`
      const method = request.category_id ? 'PATCH' : 'POST'

      const { data } = await httpRequest<BackendCategoryRecord>(path, {
        method,
        accessToken,
        body: JSON.stringify({
          name: request.name,
          description: request.description,
          image_url: request.image_url,
        }),
      })

      return normalizeBackendCategory(data, storeId)
    }

    const category = (await dataSource.categories.save(storeId, {
      id: request.category_id,
      name: request.name,
      description: request.description,
      image: request.image_url ?? undefined,
    })) as LocalCategoryRecord

    return normalizeLocalCategory(category, storeId)
  },
  async remove(storeId: string, categoryId: string) {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      await httpRequest<null>(`/categories/stores/${storeId}/categories/${categoryId}/`, {
        method: 'DELETE',
        accessToken,
      })

      return true
    }

    return dataSource.categories.remove(storeId, categoryId)
  },
}
