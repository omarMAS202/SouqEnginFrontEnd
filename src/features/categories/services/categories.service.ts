import { dataSource } from '@/services/data-source'

import { normalizeCategoryRecord, type CategoryListItemModel, type SaveCategoryRequestDto } from '../types/category.contracts'

export const categoriesService = {
  async list(storeId: string): Promise<CategoryListItemModel[]> {
    const categories = await dataSource.categories.list(storeId)
    return categories.map((category) =>
      normalizeCategoryRecord({
        id: category.id,
        store_id: category.storeId,
        name: category.name,
        description: category.description,
        image_url: category.image,
        product_count: 'productCount' in category ? category.productCount : 0,
      }),
    )
  },
  save(storeId: string, input: { id?: string; name: string; description: string; image?: string }) {
    const request: SaveCategoryRequestDto = {
      store_id: storeId,
      category_id: input.id,
      name: input.name,
      description: input.description,
      image_url: input.image ?? null,
    }
    return dataSource.categories.save(storeId, {
      id: request.category_id,
      name: request.name,
      description: request.description,
      image: request.image_url ?? undefined,
    })
  },
  remove: dataSource.categories.remove,
}
