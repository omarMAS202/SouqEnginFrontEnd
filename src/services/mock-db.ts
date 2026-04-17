'use client'

import { appConfig } from '@/config/app'
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/storage'
import type {
  Category,
  Customer,
  GeneratedStore,
  Invoice,
  MockDatabase,
  Order,
  Product,
  SessionUser,
  StoreRecord,
  StoreSettings,
  UserRecord,
} from '@/types/models'

const today = new Date().toISOString()

const defaultStoreTheme = {
  primaryColor: '#243b77',
  backgroundColor: '#f8fafc',
  font: 'system',
  style: 'modern',
} as const

const defaultStoreId = 'store-fashion'
const adminStoreId = 'store-admin-demo'
const ownerId = 'user-owner'
const adminId = 'user-admin'

const initialSettings: StoreSettings = {
  storeName: 'Fashion Boutique',
  storeUrl: 'fashion.souqengine.com',
  storeDescription: 'Premium fashion and accessories curated for modern shoppers.',
  storeEmail: 'contact@fashionboutique.com',
  storePhone: '+971 50 123 4567',
  currency: 'AED',
  timezone: 'Asia/Dubai',
  language: 'en',
  emailNotifications: true,
  orderNotifications: true,
  marketingNotifications: false,
  twoFactorAuth: false,
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

const seedUsers: UserRecord[] = [
  {
    id: ownerId,
    fullName: 'Ahmed Hassan',
    email: 'owner@souqengine.com',
    password: 'Owner123',
    role: 'store_owner',
    storeIds: [defaultStoreId],
  },
  {
    id: adminId,
    fullName: 'Admin User',
    email: 'admin@souqengine.com',
    password: 'Admin123',
    role: 'super_admin',
    storeIds: [adminStoreId],
  },
]

const seedStores: StoreRecord[] = [
  {
    id: defaultStoreId,
    name: 'Fashion Boutique',
    url: 'fashion.souqengine.com',
    description: 'Premium fashion and accessories for every season.',
    status: 'active',
    ownerId,
    theme: { ...defaultStoreTheme },
  },
  {
    id: adminStoreId,
    name: 'Platform Admin Demo',
    url: 'admin-demo.souqengine.com',
    description: 'Administrative demo store used for graduation project review.',
    status: 'active',
    ownerId: adminId,
    theme: { ...defaultStoreTheme, primaryColor: '#8b1e3f' },
  },
]

const seedCategories: Category[] = [
  { id: 'cat-women', storeId: defaultStoreId, name: 'Women', description: 'Women fashion and accessories', image: '' },
  { id: 'cat-men', storeId: defaultStoreId, name: 'Men', description: 'Men clothing and accessories', image: '' },
  { id: 'cat-accessories', storeId: defaultStoreId, name: 'Accessories', description: 'Bags, belts, and more', image: '' },
  { id: 'cat-watches', storeId: defaultStoreId, name: 'Watches', description: 'Luxury timepieces', image: '' },
]

const seedProducts: Product[] = [
  {
    id: 'prd-1',
    storeId: defaultStoreId,
    categoryId: 'cat-accessories',
    name: 'Premium Leather Bag',
    description: 'Elegant everyday bag with premium leather finish.',
    price: 299,
    stock: 45,
    status: 'active',
    image: '',
  },
  {
    id: 'prd-2',
    storeId: defaultStoreId,
    categoryId: 'cat-women',
    name: 'Silk Evening Dress',
    description: 'Formal silk dress for evening occasions.',
    price: 449,
    stock: 23,
    status: 'active',
    image: '',
  },
  {
    id: 'prd-3',
    storeId: defaultStoreId,
    categoryId: 'cat-watches',
    name: 'Gold Watch Collection',
    description: 'Statement luxury watch with gold accents.',
    price: 899,
    stock: 12,
    status: 'active',
    image: '',
  },
  {
    id: 'prd-4',
    storeId: defaultStoreId,
    categoryId: 'cat-accessories',
    name: 'Designer Sunglasses',
    description: 'Classic frame with UV protection.',
    price: 199,
    stock: 0,
    status: 'out_of_stock',
    image: '',
  },
]

const seedCustomers: Customer[] = [
  {
    id: 'cust-1',
    storeId: defaultStoreId,
    name: 'Ahmed Al-Farsi',
    email: 'ahmed@example.com',
    phone: '+971 50 123 4567',
    totalSpent: 2450,
    lastOrder: today,
  },
  {
    id: 'cust-2',
    storeId: defaultStoreId,
    name: 'Sara Al-Rashid',
    email: 'sara@example.com',
    phone: '+971 55 987 6543',
    totalSpent: 1890,
    lastOrder: '2026-03-28T10:15:00.000Z',
  },
  {
    id: 'cust-3',
    storeId: defaultStoreId,
    name: 'Mohammed Ali',
    email: 'mohammed@example.com',
    phone: '+971 52 456 7890',
    totalSpent: 750,
    lastOrder: '2026-03-20T10:15:00.000Z',
  },
]

const seedOrders: Order[] = [
  {
    id: 'ORD-001',
    storeId: defaultStoreId,
    customerId: 'cust-1',
    customerName: 'Ahmed Al-Farsi',
    email: 'ahmed@example.com',
    phone: '+971 50 123 4567',
    address: 'King Fahd Road, Riyadh, Saudi Arabia',
    total: 234,
    status: 'delivered',
    date: today,
    items: [{ id: 'prd-1', name: 'Premium Leather Bag', quantity: 1, price: 234 }],
  },
  {
    id: 'ORD-002',
    storeId: defaultStoreId,
    customerId: 'cust-2',
    customerName: 'Sara Al-Rashid',
    email: 'sara@example.com',
    phone: '+971 55 987 6543',
    address: 'Sheikh Zayed Road, Dubai, UAE',
    total: 449,
    status: 'processing',
    date: '2026-04-04T10:15:00.000Z',
    items: [{ id: 'prd-2', name: 'Silk Evening Dress', quantity: 1, price: 449 }],
  },
  {
    id: 'ORD-003',
    storeId: defaultStoreId,
    customerId: 'cust-3',
    customerName: 'Mohammed Ali',
    email: 'mohammed@example.com',
    phone: '+971 52 456 7890',
    address: 'Doha, Qatar',
    total: 899,
    status: 'shipped',
    date: '2026-04-02T10:15:00.000Z',
    items: [{ id: 'prd-3', name: 'Gold Watch Collection', quantity: 1, price: 899 }],
  },
]

const seedInvoices: Invoice[] = [
  { id: 'INV-001', storeId: defaultStoreId, date: '2026-04-01T10:15:00.000Z', amount: 79, status: 'paid', planId: 'pro' },
  { id: 'INV-002', storeId: defaultStoreId, date: '2026-03-01T10:15:00.000Z', amount: 79, status: 'paid', planId: 'pro' },
  { id: 'INV-003', storeId: defaultStoreId, date: '2026-02-01T10:15:00.000Z', amount: 79, status: 'paid', planId: 'pro' },
]

const seedDb: MockDatabase = {
  users: seedUsers,
  stores: seedStores,
  settings: {
    [defaultStoreId]: initialSettings,
    [adminStoreId]: {
      ...initialSettings,
      storeName: 'Platform Admin Demo',
      storeUrl: 'admin-demo.souqengine.com',
      storeEmail: 'admin@souqengine.com',
    },
  },
  categories: seedCategories,
  products: seedProducts,
  customers: seedCustomers,
  orders: seedOrders,
  invoices: seedInvoices,
}

function readDb(): MockDatabase {
  const raw = safeLocalStorageGet(appConfig.storageKey)
  if (!raw) {
    safeLocalStorageSet(appConfig.storageKey, JSON.stringify(seedDb))
    return clone(seedDb)
  }

  try {
    return JSON.parse(raw) as MockDatabase
  } catch {
    safeLocalStorageSet(appConfig.storageKey, JSON.stringify(seedDb))
    return clone(seedDb)
  }
}

function writeDb(db: MockDatabase) {
  safeLocalStorageSet(appConfig.storageKey, JSON.stringify(db))
}

export function getStoreSettings(storeId: string) {
  const db = readDb()
  return clone(db.settings[storeId] ?? initialSettings)
}

export async function updateStoreSettings(storeId: string, settings: StoreSettings) {
  const db = readDb()
  db.settings[storeId] = settings
  const store = db.stores.find((entry) => entry.id === storeId)
  if (store) {
    store.name = settings.storeName
    store.url = settings.storeUrl
    store.description = settings.storeDescription
  }
  writeDb(db)
  return clone(settings)
}

export function listStoresForUser(user: SessionUser | null) {
  if (!user) return []
  const db = readDb()
  return clone(db.stores.filter((store) => user.storeIds.includes(store.id)))
}

export function listProducts(storeId: string) {
  const db = readDb()
  const categoriesById = Object.fromEntries(db.categories.map((category) => [category.id, category.name]))
  return clone(
    db.products
      .filter((product) => product.storeId === storeId)
      .map((product) => ({
        ...product,
        category: categoriesById[product.categoryId] ?? 'Uncategorized',
      })),
  )
}

export async function createProduct(
  storeId: string,
  input: Omit<Product, 'id' | 'storeId'>,
) {
  const db = readDb()
  const product: Product = { ...input, id: uid('prd'), storeId }
  db.products.unshift(product)
  writeDb(db)
  return clone(product)
}

export async function updateProduct(storeId: string, productId: string, input: Omit<Product, 'id' | 'storeId'>) {
  const db = readDb()
  const target = db.products.find((product) => product.id === productId && product.storeId === storeId)
  if (!target) throw new Error('Product not found')
  Object.assign(target, input)
  writeDb(db)
  return clone(target)
}

export async function deleteProduct(storeId: string, productId: string) {
  const db = readDb()
  db.products = db.products.filter((product) => !(product.id === productId && product.storeId === storeId))
  writeDb(db)
  return true
}

export function listCategories(storeId: string) {
  const db = readDb()
  const counts = db.products.reduce<Record<string, number>>((acc, product) => {
    if (product.storeId !== storeId) return acc
    acc[product.categoryId] = (acc[product.categoryId] ?? 0) + 1
    return acc
  }, {})

  return clone(
    db.categories
      .filter((category) => category.storeId === storeId)
      .map((category) => ({
        ...category,
        productCount: counts[category.id] ?? 0,
      })),
  )
}

export async function saveCategory(
  storeId: string,
  input: { id?: string; name: string; description: string; image?: string },
) {
  const db = readDb()

  if (input.id) {
    const existing = db.categories.find((category) => category.id === input.id && category.storeId === storeId)
    if (!existing) throw new Error('Category not found')
    existing.name = input.name
    existing.description = input.description
    existing.image = input.image ?? existing.image
    writeDb(db)
    return clone(existing)
  }

  const category: Category = {
    id: uid('cat'),
    storeId,
    name: input.name,
    description: input.description,
    image: input.image ?? '',
  }
  db.categories.unshift(category)
  writeDb(db)
  return clone(category)
}

export async function deleteCategory(storeId: string, categoryId: string) {
  const db = readDb()
  db.categories = db.categories.filter((category) => !(category.id === categoryId && category.storeId === storeId))
  db.products = db.products.map((product) =>
    product.categoryId === categoryId && product.storeId === storeId
      ? { ...product, categoryId: '' }
      : product,
  )
  writeDb(db)
  return true
}

export function listCustomers(storeId: string) {
  const db = readDb()
  const ordersByCustomer = db.orders.reduce<Record<string, number>>((acc, order) => {
    if (order.storeId !== storeId) return acc
    acc[order.customerId] = (acc[order.customerId] ?? 0) + 1
    return acc
  }, {})

  return clone(
    db.customers
      .filter((customer) => customer.storeId === storeId)
      .map((customer) => ({
        ...customer,
        orders: ordersByCustomer[customer.id] ?? 0,
      })),
  )
}

export async function createCustomer(
  storeId: string,
  input: Omit<Customer, 'id' | 'storeId' | 'totalSpent' | 'lastOrder'>,
) {
  const db = readDb()
  const customer: Customer = {
    id: uid('cust'),
    storeId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    avatar: input.avatar,
    totalSpent: 0,
    lastOrder: today,
  }
  db.customers.unshift(customer)
  writeDb(db)
  return clone(customer)
}

export function listOrders(storeId: string) {
  const db = readDb()
  return clone(db.orders.filter((order) => order.storeId === storeId))
}

export async function updateOrderStatus(storeId: string, orderId: string, status: Order['status']) {
  const db = readDb()
  const order = db.orders.find((entry) => entry.id === orderId && entry.storeId === storeId)
  if (!order) throw new Error('Order not found')
  order.status = status
  writeDb(db)
  return clone(order)
}

export function listInvoices(storeId: string) {
  const db = readDb()
  return clone(db.invoices.filter((invoice) => invoice.storeId === storeId))
}

export function getDashboardMetrics(storeId: string) {
  const db = readDb()
  const storeOrders = db.orders.filter((order) => order.storeId === storeId)
  const storeProducts = db.products.filter((product) => product.storeId === storeId)
  const storeCustomers = db.customers.filter((customer) => customer.storeId === storeId)
  const totalRevenue = storeOrders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0)

  const topProducts = storeProducts
    .slice()
    .sort((a, b) => b.price * Math.max(b.stock, 1) - a.price * Math.max(a.stock, 1))
    .slice(0, 4)
    .map((product) => ({
      id: product.id,
      name: product.name,
      sales: Math.max(3, 50 - product.stock),
      revenue: product.price * Math.max(3, 50 - product.stock),
    }))

  return clone({
    stats: {
      totalOrders: storeOrders.length,
      totalRevenue,
      totalProducts: storeProducts.length,
      totalCustomers: storeCustomers.length,
    },
    recentOrders: storeOrders
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5),
    topProducts,
  })
}

export async function registerUser(input: {
  fullName: string
  email: string
  password: string
  storeName: string
}) {
  const db = readDb()
  const normalizedEmail = input.email.toLowerCase()
  if (db.users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.')
  }

  const userId = uid('user')
  const storeId = uid('store')
  const storeUrl = input.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const user: UserRecord = {
    id: userId,
    fullName: input.fullName,
    email: normalizedEmail,
    password: input.password,
    role: 'store_owner',
    storeIds: [storeId],
  }

  const store: StoreRecord = {
    id: storeId,
    name: input.storeName,
    url: `${storeUrl || 'new-store'}.souqengine.com`,
    description: `${input.storeName} storefront created with SOUQ ENGINE.`,
    status: 'active',
    ownerId: userId,
    theme: { ...defaultStoreTheme },
  }

  db.users.push(user)
  db.stores.push(store)
  db.settings[storeId] = {
    ...initialSettings,
    storeName: input.storeName,
    storeUrl: store.url,
    storeEmail: normalizedEmail,
  }
  writeDb(db)

  const sessionUser: SessionUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    storeIds: user.storeIds,
  }

  return { user: sessionUser, store }
}

export async function loginUser(input: { email: string; password: string }) {
  const db = readDb()
  const user = db.users.find(
    (entry) => entry.email.toLowerCase() === input.email.toLowerCase() && entry.password === input.password,
  )

  if (!user) {
    throw new Error('Invalid email or password.')
  }

  const sessionUser: SessionUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    storeIds: user.storeIds,
  }

  return sessionUser
}

export async function generateStoreFromPrompt(prompt: string): Promise<GeneratedStore> {
  const normalized = prompt.trim() || 'Modern lifestyle store'
  const baseName = normalized.split(' ').slice(0, 2).join(' ')
  const categories = ['Featured', 'New Arrivals', 'Best Sellers']
  return {
    name: `${baseName} Store`,
    description: `AI-generated storefront inspired by: ${normalized}.`,
    categories: categories.map((name) => ({
      id: uid('cat'),
      name,
      description: `${name} collection for ${baseName}.`,
    })),
    products: Array.from({ length: 4 }).map((_, index) => ({
      id: uid('prd'),
      name: `${baseName} Product ${index + 1}`,
      description: `Curated product ${index + 1} for the ${baseName} concept.`,
      price: 75 + index * 25,
      category: categories[index % categories.length],
      image: '',
    })),
    theme: { ...defaultStoreTheme },
  }
}

export async function createStoreFromGeneratedStore(owner: SessionUser, generatedStore: GeneratedStore) {
  const db = readDb()
  const storeId = uid('store')
  const store: StoreRecord = {
    id: storeId,
    name: generatedStore.name,
    url: `${generatedStore.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.souqengine.com`,
    description: generatedStore.description,
    status: 'active',
    ownerId: owner.id,
    theme: generatedStore.theme,
  }

  db.stores.push(store)
  db.settings[storeId] = {
    ...initialSettings,
    storeName: generatedStore.name,
    storeUrl: store.url,
    storeDescription: generatedStore.description,
    storeEmail: owner.email,
  }
  db.categories.push(
    ...generatedStore.categories.map((category) => ({
      id: category.id,
      storeId,
      name: category.name,
      description: category.description,
      image: '',
    })),
  )
  db.products.push(
    ...generatedStore.products.map((product) => ({
      id: product.id,
      storeId,
      categoryId:
        db.categories.find(
          (category) => category.storeId === storeId && category.name === product.category,
        )?.id ?? '',
      name: product.name,
      description: product.description,
      price: product.price,
      stock: 10,
      status: 'draft' as const,
      image: product.image,
    })),
  )
  const ownerRecord = db.users.find((user) => user.id === owner.id)
  if (ownerRecord && !ownerRecord.storeIds.includes(storeId)) {
    ownerRecord.storeIds.push(storeId)
  }
  writeDb(db)
  return clone(store)
}
