import { useAuthStore } from '@/features/auth/store/auth-store'
import { appConfig } from '@/config/app'
import { dataSource, dataSourceMode } from '@/services/data-source'
import { httpRequest } from '@/services/http-client'

import {
  normalizeProductImage,
  normalizeProductInventory,
  normalizeProductRecord,
  type CreateProductRequestDto,
  type ProductMutationInput,
  type ProductImageDto,
  type ProductImageModel,
  type ProductInventoryDto,
  type ProductInventoryModel,
  type ProductListItem,
  type ProductRecordDto,
  type UpdateProductRequestDto,
} from '../types/product.types'

type BackendProductRecord = {
  id: number | string
  store_id?: number | string
  category_id?: number | string | null
  category_name?: string | null
  name?: string | null
  description?: string | null
  price?: number | string | null
  sku?: string | null
  stock?: number | null
  status?: 'active' | 'draft' | 'out_of_stock' | null
  image_url?: string | null
  images?: ProductImageDto[] | null
  inventory?: ProductInventoryDto | null
  created_at?: string | null
  updated_at?: string | null
}

type LocalProductRecord = {
  id: string
  storeId: string
  categoryId: string
  category?: string
  name: string
  description: string
  price: number
  stock: number
  status: 'active' | 'draft' | 'out_of_stock'
  image: string
}

function createBackendProductPayload(request: CreateProductRequestDto | UpdateProductRequestDto) {
  const categoryId = Number(request.category_id)

  return {
    name: request.name,
    sku: request.sku,
    description: request.description,
    price: request.price,
    stock: request.stock,
    status: request.status,
    category: categoryId,
    category_id: categoryId,
    image_url: request.image_url,
  }
}

function normalizeLocalProduct(product: LocalProductRecord) {
  return normalizeProductRecord({
    id: product.id,
    store_id: product.storeId,
    category_id: product.categoryId,
    category_name: product.category,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    status: product.status,
    image_url: product.image,
  })
}

async function syncBackendProductImages(
  storeId: string,
  productId: string,
  input: ProductMutationInput,
  options: { replaceExisting?: boolean } = {},
) {
  if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
    return
  }

  const nextImageUrl = input.image ?? ''
  const previousImageUrl = input.existingImage ?? ''
  const hasImageChange =
    options.replaceExisting && (Boolean(input.imageFile) || nextImageUrl !== previousImageUrl)

  const existingImages = hasImageChange ? await productsService.listImages(storeId, productId) : []

  const shouldUpload = options.replaceExisting
    ? hasImageChange && (Boolean(input.imageFile) || Boolean(nextImageUrl))
    : Boolean(input.imageFile) || Boolean(nextImageUrl)

  if (shouldUpload) {
    const uploadedImage = await productsService.uploadImage(storeId, productId, {
      imageUrl: nextImageUrl || null,
      file: input.imageFile ?? null,
    })

    if (hasImageChange && existingImages.length > 0) {
      await Promise.all(
        existingImages
          .filter((image) => image.id !== uploadedImage.id)
          .map((image) => productsService.deleteImage(storeId, productId, image.id)),
      )
    }

    return
  }

  if (hasImageChange && existingImages.length > 0) {
    await Promise.all(existingImages.map((image) => productsService.deleteImage(storeId, productId, image.id)))
  }
}

function getAccessToken() {
  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) {
    throw new Error('Authentication token is missing while loading products.')
  }

  return accessToken
}

function normalizeBackendProduct(product: BackendProductRecord, storeId: string): ProductListItem {
  const derivedImage =
    product.image_url ??
    product.images?.[0]?.image_url ??
    product.images?.[0]?.image_file ??
    null

  const dto: ProductRecordDto = {
    id: String(product.id),
    store_id:
      product.store_id !== undefined && product.store_id !== null ? String(product.store_id) : storeId,
    category_id:
      product.category_id !== undefined && product.category_id !== null
        ? String(product.category_id)
        : null,
    category_name: product.category_name ?? null,
    name: product.name ?? null,
    description: product.description ?? null,
    price: typeof product.price === 'string' ? Number(product.price) : product.price ?? null,
    stock: product.stock ?? product.inventory?.stock_quantity ?? null,
    status: product.status ?? null,
    image_url: derivedImage,
    sku: product.sku ?? null,
    created_at: product.created_at ?? null,
    updated_at: product.updated_at ?? null,
  }

  return normalizeProductRecord(dto)
}

export const productsService = {
  async list(storeId: string): Promise<ProductListItem[]> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      const { data } = await httpRequest<BackendProductRecord[]>(`/products/${storeId}/products/`, {
        method: 'GET',
        accessToken,
      })

      return data.map((product) => normalizeBackendProduct(product, storeId))
    }

    const products = await dataSource.products.list(storeId)
    return products.map((product) => normalizeLocalProduct(product as LocalProductRecord))
  },

  async getById(storeId: string, productId: string): Promise<ProductListItem> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      const { data } = await httpRequest<BackendProductRecord>(`/products/${storeId}/products/${productId}/`, {
        method: 'GET',
        accessToken,
      })

      return normalizeBackendProduct(data, storeId)
    }

    const products = await this.list(storeId)
    const product = products.find((entry) => entry.id === productId)

    if (!product) {
      throw new Error('Product not found.')
    }

    return product
  },

  async create(storeId: string, input: ProductMutationInput): Promise<ProductListItem> {
    const request: CreateProductRequestDto = {
      store_id: storeId,
      category_id: input.categoryId,
      name: input.name,
      sku: input.sku,
      description: input.description,
      price: input.price,
      stock: input.stock,
      status: input.status,
      image_url: input.image || null,
    }

    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      const { data } = await httpRequest<BackendProductRecord>(`/products/${storeId}/products/`, {
        method: 'POST',
        accessToken,
        body: JSON.stringify(createBackendProductPayload(request)),
      })

      const createdProductId = String(data.id)

      if (request.stock !== 0) {
        await this.updateInventory(storeId, createdProductId, request.stock, 'PATCH')
      }

      await syncBackendProductImages(storeId, createdProductId, input)

      return this.getById(storeId, createdProductId)
    }

    const product = (await dataSource.products.create(storeId, input)) as LocalProductRecord
    return normalizeLocalProduct(product)
  },

  async update(storeId: string, productId: string, input: ProductMutationInput): Promise<ProductListItem> {
    const request: UpdateProductRequestDto = {
      store_id: storeId,
      product_id: productId,
      category_id: input.categoryId,
      name: input.name,
      sku: input.sku,
      description: input.description,
      price: input.price,
      stock: input.stock,
      status: input.status,
      image_url: input.image || null,
    }

    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      const { data } = await httpRequest<BackendProductRecord>(`/products/${storeId}/products/${productId}/`, {
        method: 'PATCH',
        accessToken,
        body: JSON.stringify(createBackendProductPayload(request)),
      })

      await this.updateInventory(storeId, productId, request.stock, 'PATCH')
      await syncBackendProductImages(storeId, productId, input, { replaceExisting: true })

      return this.getById(storeId, productId)
    }

    const product = (await dataSource.products.update(storeId, productId, input)) as LocalProductRecord
    return normalizeLocalProduct(product)
  },

  async remove(storeId: string, productId: string) {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      await httpRequest<null>(`/products/${storeId}/products/${productId}/`, {
        method: 'DELETE',
        accessToken,
      })

      return true
    }

    return dataSource.products.remove(storeId, productId)
  },

  async listImages(storeId: string, productId: string): Promise<ProductImageModel[]> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      const { data } = await httpRequest<ProductImageDto[]>(`/products/${storeId}/products/${productId}/images/`, {
        method: 'GET',
        accessToken,
      })

      return data.map((image) => normalizeProductImage(image))
    }

    const product = await this.getById(storeId, productId)
    return product.image
      ? [
          {
            id: `${product.id}-image`,
            asset_id: `${product.id}-image`,
            url: product.image,
            createdAt: null,
            updatedAt: null,
          },
        ]
      : []
  },

  async uploadImage(
    storeId: string,
    productId: string,
    input: { imageUrl?: string | null; file?: File | null },
  ): Promise<ProductImageModel> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()
      const body = new FormData()

      if (input.imageUrl) {
        body.append('image_url', input.imageUrl)
      }

      if (input.file) {
        body.append('image_file', input.file)
      }

      const { data } = await httpRequest<ProductImageDto>(`/products/${storeId}/products/${productId}/images/`, {
        method: 'POST',
        accessToken,
        body,
      })

      return normalizeProductImage(data)
    }

    throw new Error('Product image upload is only available in backend mode.')
  },

  async deleteImage(storeId: string, productId: string, imageId: string) {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      await httpRequest<null>(`/products/${storeId}/products/${productId}/images/${imageId}/`, {
        method: 'DELETE',
        accessToken,
      })

      return true
    }

    throw new Error('Product image deletion is only available in backend mode.')
  },

  async updateInventory(
    storeId: string,
    productId: string,
    stockQuantity: number,
    method: 'PUT' | 'PATCH' = 'PATCH',
  ): Promise<ProductInventoryModel> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()

      const { data } = await httpRequest<ProductInventoryDto>(`/products/${storeId}/products/${productId}/inventory/`, {
        method,
        accessToken,
        body: JSON.stringify({ stock_quantity: stockQuantity }),
      })

      return normalizeProductInventory(data)
    }

    throw new Error('Product inventory updates are only available in backend mode.')
  },
}
