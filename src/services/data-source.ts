import {
  createCustomer,
  createProduct,
  deleteCategory,
  deleteProduct,
  generateStoreFromPrompt,
  getDashboardMetrics,
  getStoreSettings,
  listCategories,
  listCustomers,
  listInvoices,
  listOrders,
  listProducts,
  listStoresForUser,
  loginUser,
  registerUser,
  saveCategory,
  updateOrderStatus,
  updateProduct,
  updateStoreSettings,
} from '@/services/mock-db'
import type {
  Customer,
  GeneratedStore,
  Product,
  SessionUser,
  StoreSettings,
} from '@/types/models'

export type DataSourceMode = 'local-fallback' | 'backend'

export const dataSourceMode: DataSourceMode =
  process.env.NEXT_PUBLIC_DATA_SOURCE === 'backend' ? 'backend' : 'local-fallback'

function backendNotConfigured<T>(operation: string): Promise<T> {
  return Promise.reject(
    new Error(
      `Backend adapter not configured for "${operation}". Set NEXT_PUBLIC_DATA_SOURCE=local-fallback or implement the real API adapter.`,
    ),
  )
}

export const dataSource = {
  auth: {
    login(input: { email: string; password: string }) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<SessionUser>('auth.login')
        : loginUser(input)
    },
    register(input: {
      fullName: string
      email: string
      password: string
      storeName: string
    }) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<{ user: SessionUser }>('auth.register')
        : registerUser(input)
    },
    listUserStores(user: SessionUser | null) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<ReturnType<typeof listStoresForUser>>('auth.listUserStores')
        : Promise.resolve(listStoresForUser(user))
    },
  },
  dashboard: {
    overview(storeId: string) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<ReturnType<typeof getDashboardMetrics>>('dashboard.overview')
        : Promise.resolve(getDashboardMetrics(storeId))
    },
    settings(storeId: string) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<StoreSettings>('dashboard.settings')
        : Promise.resolve(getStoreSettings(storeId))
    },
    updateSettings(storeId: string, settings: StoreSettings) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<StoreSettings>('dashboard.updateSettings')
        : updateStoreSettings(storeId, settings)
    },
  },
  products: {
    list(storeId: string) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<ReturnType<typeof listProducts>>('products.list')
        : Promise.resolve(listProducts(storeId))
    },
    create(storeId: string, input: Omit<Product, 'id' | 'storeId'>) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<Product>('products.create')
        : createProduct(storeId, input)
    },
    update(storeId: string, productId: string, input: Omit<Product, 'id' | 'storeId'>) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<Product>('products.update')
        : updateProduct(storeId, productId, input)
    },
    remove(storeId: string, productId: string) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<boolean>('products.remove')
        : deleteProduct(storeId, productId)
    },
  },
  categories: {
    list(storeId: string) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<ReturnType<typeof listCategories>>('categories.list')
        : Promise.resolve(listCategories(storeId))
    },
    save(
      storeId: string,
      input: { id?: string; name: string; description: string; image?: string },
    ) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<unknown>('categories.save')
        : saveCategory(storeId, input)
    },
    remove(storeId: string, categoryId: string) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<boolean>('categories.remove')
        : deleteCategory(storeId, categoryId)
    },
  },
  customers: {
    list(storeId: string) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<ReturnType<typeof listCustomers>>('customers.list')
        : Promise.resolve(listCustomers(storeId))
    },
    create(
      storeId: string,
      input: Omit<Customer, 'id' | 'storeId' | 'totalSpent' | 'lastOrder'>,
    ) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<Customer>('customers.create')
        : createCustomer(storeId, input)
    },
  },
  orders: {
    list(storeId: string) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<ReturnType<typeof listOrders>>('orders.list')
        : Promise.resolve(listOrders(storeId))
    },
    updateStatus(storeId: string, orderId: string, status: Parameters<typeof updateOrderStatus>[2]) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<unknown>('orders.updateStatus')
        : updateOrderStatus(storeId, orderId, status)
    },
  },
  billing: {
    listInvoices(storeId: string) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<ReturnType<typeof listInvoices>>('billing.listInvoices')
        : Promise.resolve(listInvoices(storeId))
    },
  },
  ai: {
    generate(prompt: string) {
      return dataSourceMode === 'backend'
        ? backendNotConfigured<GeneratedStore>('ai.generate')
        : generateStoreFromPrompt(prompt)
    },
  },
} as const
