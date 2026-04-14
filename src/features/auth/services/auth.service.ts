import { dataSource } from '@/services/data-source'
import type { SessionUser, StoreRecord } from '@/types/models'

import type {
  LoginRequestDto,
  RegisterRequestDto,
  StoreBootstrapResponseDto,
  StoreSelectorItem,
  StoreSummaryDto,
} from '../types/auth.contracts'
import { normalizeStoreSelectorItem } from '../types/auth.contracts'

function normalizeStoreSummary(store: StoreRecord): StoreSummaryDto {
  return {
    id: store.id,
    store_id: store.id,
    name: store.name,
    url: store.url,
    status: store.status,
  }
}

export const authService = {
  login(input: LoginRequestDto) {
    return dataSource.auth.login(input)
  },
  register(input: RegisterRequestDto) {
    return dataSource.auth.register({
      fullName: input.full_name,
      email: input.email,
      password: input.password,
      storeName: input.store_name,
    })
  },
  async listUserStores(user: SessionUser | null): Promise<StoreSelectorItem[]> {
    const stores = await dataSource.auth.listUserStores(user)
    return stores.map((store) => normalizeStoreSelectorItem(normalizeStoreSummary(store)))
  },
  async getCurrentStoreBootstrap(user: SessionUser | null, currentStoreId: string | null): Promise<StoreBootstrapResponseDto> {
    const stores = await dataSource.auth.listUserStores(user)
    const normalizedStores = stores.map((store) => normalizeStoreSummary(store))
    const selectedStore =
      normalizedStores.find((store) => store.store_id === currentStoreId || store.id === currentStoreId) ??
      normalizedStores[0] ??
      null

    return {
      store: selectedStore,
      available_stores: normalizedStores,
      current_store_id: selectedStore?.store_id ?? null,
    }
  },
}
