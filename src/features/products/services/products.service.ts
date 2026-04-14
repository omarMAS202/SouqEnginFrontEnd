import { dataSource } from '@/services/data-source'

import type { ProductSchemaValues } from '../schemas/product.schema'
import { normalizeProductRecord, type ProductListItem } from '../types/product.types'

export const productsService = {
  async list(storeId: string): Promise<ProductListItem[]> {
    const products = await dataSource.products.list(storeId)
    return products.map((product) =>
      normalizeProductRecord({
        id: product.id,
        store_id: product.storeId,
        category_id: product.categoryId,
        category_name: 'category' in product ? product.category : undefined,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: product.status,
        image_url: product.image,
      }),
    )
  },
  create(storeId: string, input: ProductSchemaValues) {
    return dataSource.products.create(storeId, input)
  },
  update(storeId: string, productId: string, input: ProductSchemaValues) {
    return dataSource.products.update(storeId, productId, input)
  },
  remove: dataSource.products.remove,
}
