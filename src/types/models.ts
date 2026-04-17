export type UserRole = 'store_owner' | 'super_admin'

export interface StoreTheme {
  primaryColor: string
  backgroundColor: string
  font: string
  style: string
}

export interface StoreSettings {
  storeName: string
  storeUrl: string
  storeDescription: string
  storeEmail: string
  storePhone: string
  currency: string
  timezone: string
  language: 'en' | 'ar'
  emailNotifications: boolean
  orderNotifications: boolean
  marketingNotifications: boolean
  twoFactorAuth: boolean
}

export interface StoreRecord {
  id: string
  name: string
  url: string
  description: string
  status: 'active' | 'suspended'
  ownerId: string
  theme: StoreTheme
}

export interface UserRecord {
  id: string
  fullName: string
  email: string
  password: string
  role: UserRole
  storeIds: string[]
}

export interface SessionUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  storeIds: string[]
}

export interface Category {
  id: string
  storeId: string
  name: string
  description: string
  image: string
}

export interface Product {
  id: string
  storeId: string
  categoryId: string
  name: string
  description: string
  price: number
  stock: number
  status: 'active' | 'draft' | 'out_of_stock'
  image: string
}

export interface Customer {
  id: string
  storeId: string
  name: string
  email: string
  phone: string
  totalSpent: number
  lastOrder: string
  avatar?: string
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  storeId: string
  customerId: string
  customerName: string
  email: string
  phone: string
  address: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
  items: OrderItem[]
}

export interface Invoice {
  id: string
  storeId: string
  date: string
  amount: number
  status: 'paid' | 'pending'
  planId: 'starter' | 'pro' | 'enterprise'
}

export interface GeneratedStore {
  name: string
  description: string
  categories: Array<{ id: string; name: string; description: string }>
  products: Array<{
    id: string
    name: string
    description: string
    price: number
    category: string
    image: string
  }>
  theme: StoreTheme
}

export interface MockDatabase {
  users: UserRecord[]
  stores: StoreRecord[]
  settings: Record<string, StoreSettings>
  categories: Category[]
  products: Product[]
  customers: Customer[]
  orders: Order[]
  invoices: Invoice[]
}
