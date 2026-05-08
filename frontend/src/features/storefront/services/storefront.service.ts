import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/storage'
import { appConfig } from '@/config/app'
import { dataSourceMode } from '@/services/data-source'
import { httpRequest } from '@/services/http-client'

import { fallbackCustomerAccount, fallbackStorefrontRuntime } from '../data/storefront-fallback'
import {
  customerAddressSchema,
  type CustomerAddressFormValues,
  type CustomerLoginFormValues,
  type CustomerRegisterFormValues,
} from '../schemas/storefront.schema'
import type {
  AiGeneratedStorefrontPayload,
  CartItem,
  CheckoutInput,
  CheckoutSummary,
  CustomerAccount,
  CustomerOrder,
  StoreProfile,
  Product,
  StorefrontRuntime,
} from '../types/storefront.types'
import { normalizeStorefrontPayload } from '../utils/normalizeStorefrontPayload'
import type { PublicStoreSummaryResponseDto } from '../types/storefront.contracts'

const runtimeStorageKey = 'souq-storefront-runtime'
const customerStorageKey = 'souq-storefront-customer'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function normalizeRuntimeRecord(runtime: Partial<StorefrontRuntime> | null | undefined): StorefrontRuntime {
  return {
    profile: {
      ...fallbackStorefrontRuntime.profile,
      ...(runtime?.profile ?? {}),
    },
    settings: {
      ...fallbackStorefrontRuntime.settings,
      ...(runtime?.settings ?? {}),
    },
    theme: {
      ...fallbackStorefrontRuntime.theme,
      ...(runtime?.theme ?? {}),
    },
    navigation: runtime?.navigation ?? fallbackStorefrontRuntime.navigation,
    homePage: {
      hero: {
        ...fallbackStorefrontRuntime.homePage.hero,
        ...(runtime?.homePage?.hero ?? {}),
      },
      sections: runtime?.homePage?.sections ?? fallbackStorefrontRuntime.homePage.sections,
    },
    categories: runtime?.categories ?? fallbackStorefrontRuntime.categories,
    products: runtime?.products ?? fallbackStorefrontRuntime.products,
    footer: {
      ...fallbackStorefrontRuntime.footer,
      ...(runtime?.footer ?? {}),
      navigation: runtime?.footer?.navigation ?? fallbackStorefrontRuntime.footer.navigation,
      supportLinks: runtime?.footer?.supportLinks ?? fallbackStorefrontRuntime.footer.supportLinks,
      legalLinks: runtime?.footer?.legalLinks ?? fallbackStorefrontRuntime.footer.legalLinks,
      contactLines: runtime?.footer?.contactLines ?? fallbackStorefrontRuntime.footer.contactLines,
    },
    pages: runtime?.pages ?? fallbackStorefrontRuntime.pages,
    policies: runtime?.policies ?? fallbackStorefrontRuntime.policies,
  }
}

function normalizeCustomerRecord(customer: Partial<CustomerAccount> | null | undefined): CustomerAccount {
  return {
    ...fallbackCustomerAccount,
    ...(customer ?? {}),
    addresses: customer?.addresses ?? fallbackCustomerAccount.addresses,
    orders: customer?.orders ?? fallbackCustomerAccount.orders,
  }
}

function readRuntime(): StorefrontRuntime {
  const raw = safeLocalStorageGet(runtimeStorageKey)
  if (!raw) return clone(fallbackStorefrontRuntime)

  try {
    return normalizeRuntimeRecord(JSON.parse(raw) as Partial<StorefrontRuntime>)
  } catch {
    return clone(fallbackStorefrontRuntime)
  }
}

function writeRuntime(runtime: StorefrontRuntime) {
  safeLocalStorageSet(runtimeStorageKey, JSON.stringify(runtime))
}

function readCustomer(): CustomerAccount {
  const raw = safeLocalStorageGet(customerStorageKey)
  if (!raw) return clone(fallbackCustomerAccount)

  try {
    return normalizeCustomerRecord(JSON.parse(raw) as Partial<CustomerAccount>)
  } catch {
    return clone(fallbackCustomerAccount)
  }
}

function writeCustomer(customer: CustomerAccount) {
  safeLocalStorageSet(customerStorageKey, JSON.stringify(customer))
}

export const storefrontService = {
  getRuntime() {
    return Promise.resolve(readRuntime())
  },
  setRuntime(runtime: StorefrontRuntime) {
    writeRuntime(runtime)
    return Promise.resolve(runtime)
  },
  applyAiPayload(payload: AiGeneratedStorefrontPayload) {
    const runtime = normalizeStorefrontPayload(payload)
    writeRuntime(runtime)
    return Promise.resolve(runtime)
  },
  resetRuntime() {
    writeRuntime(fallbackStorefrontRuntime)
    return Promise.resolve(clone(fallbackStorefrontRuntime))
  },
  listProducts() {
    return Promise.resolve(readRuntime().products)
  },
  listFeaturedProducts() {
    return Promise.resolve(readRuntime().products.filter((product) => product.featured))
  },
  listCategories() {
    return Promise.resolve(readRuntime().categories)
  },
  getProduct(productSlug: string) {
    const product = readRuntime().products.find((entry) => entry.slug === productSlug)
    return Promise.resolve(product ?? null)
  },
  getCategory(categorySlug: string) {
    const runtime = readRuntime()
    const category = runtime.categories.find((entry) => entry.slug === categorySlug) ?? null
    if (!category) return Promise.resolve(null)

    return Promise.resolve({
      category,
      products: runtime.products.filter((product) => product.categoryId === category.id),
    })
  },
  getStaticPage(pageSlug: string) {
    return Promise.resolve(readRuntime().pages.find((entry) => entry.slug === pageSlug) ?? null)
  },
  getPolicyPage(policySlug: string) {
    return Promise.resolve(readRuntime().policies.find((entry) => entry.slug === policySlug) ?? null)
  },
  async getPublicStore(subdomain: string): Promise<Pick<StoreProfile, 'id' | 'name' | 'slug' | 'description'>> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const { data } = await httpRequest<PublicStoreSummaryResponseDto>(`/stores/public/store/${subdomain}/`, {
        method: 'GET',
      })

      return {
        id: String(data.store.id),
        name: data.store.name ?? 'Store',
        slug: data.store.subdomain ?? subdomain,
        description: data.store.description ?? '',
      }
    }

    const runtime = readRuntime()

    return {
      id: runtime.profile.id,
      name: runtime.profile.name,
      slug: runtime.profile.slug,
      description: runtime.profile.description,
    }
  },
}

export const customerAccountService = {
  login(input: CustomerLoginFormValues) {
    const customer = readCustomer()
    if (input.email.toLowerCase() !== customer.email.toLowerCase()) {
      return Promise.reject(new Error('Customer account not found in local storefront fallback.'))
    }

    return Promise.resolve(customer)
  },
  register(input: CustomerRegisterFormValues) {
    const customer: CustomerAccount = {
      id: 'customer-generated',
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      addresses: [],
      orders: [],
    }
    writeCustomer(customer)
    return Promise.resolve(customer)
  },
  getAccount() {
    return Promise.resolve(readCustomer())
  },
  updateProfile(input: Pick<CustomerAccount, 'fullName' | 'email' | 'phone'>) {
    const customer = readCustomer()
    const updated = { ...customer, ...input }
    writeCustomer(updated)
    return Promise.resolve(updated)
  },
  saveAddress(input: CustomerAddressFormValues & { id?: string }) {
    const parsed = customerAddressSchema.parse(input)
    const customer = readCustomer()
    const addressId = input.id ?? `address-${crypto.randomUUID()}`

    let addresses = customer.addresses.slice()
    if (parsed.isDefault) {
      addresses = addresses.map((address) => ({ ...address, isDefault: false }))
    }

    const existingIndex = addresses.findIndex((address) => address.id === input.id)
    const nextAddress = { id: addressId, ...parsed }

    if (existingIndex >= 0) {
      addresses[existingIndex] = nextAddress
    } else {
      addresses = [nextAddress, ...addresses]
    }

    const updated = { ...customer, addresses }
    writeCustomer(updated)
    return Promise.resolve(updated)
  },
  getOrder(orderId: string) {
    return Promise.resolve(readCustomer().orders.find((order) => order.id === orderId) ?? null)
  },
}

export const checkoutService = {
  getSummary(cart: CartItem[]): CheckoutSummary {
    const products = readRuntime().products
    const subtotal = cart.reduce((sum, item) => {
      const product = products.find((entry) => entry.id === item.productId)
      return sum + (product?.price ?? 0) * item.quantity
    }, 0)
    const shipping = subtotal > 0 ? 25 : 0
    const tax = subtotal * 0.05
    return {
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    }
  },
  startCheckout(input: CheckoutInput, cart: Array<CartItem & { product?: Product | null }>) {
    return Promise.resolve({
      status: 'pending-backend',
      customer: input.email,
      items: cart.length,
      message:
        'Checkout foundation is ready. Replace this with backend order creation and payment session logic.',
    })
  },
  listCustomerOrders(): Promise<CustomerOrder[]> {
    return Promise.resolve(readCustomer().orders)
  },
}
