export type StorefrontDirection = 'ltr' | 'rtl'

export interface StoreProfile {
  id: string
  slug: string
  name: string
  slogan: string
  description: string
  logoText: string
  logoUrl?: string
  supportEmail: string
  supportPhone: string
  currency: string
  locale: 'en' | 'ar'
  direction: StorefrontDirection
  socialLinks: Array<{
    label: string
    href: string
  }>
}

export interface StoreSettings {
  tenantId: string
  language: 'en' | 'ar'
  direction: StorefrontDirection
  allowGuestCheckout: boolean
  enableCustomerAccounts: boolean
  enableWishlist: boolean
  defaultSort: 'featured' | 'newest' | 'price_asc' | 'price_desc'
}

export interface StorefrontThemeConfig {
  themeName: string
  primaryColor: string
  accentColor: string
  surfaceColor: string
  backgroundColor: string
  foregroundColor: string
  mutedColor: string
  borderRadius: 'sm' | 'md' | 'lg' | 'xl'
  fontHeading: string
  fontBody: string
  cardStyle: 'soft' | 'editorial' | 'modern'
}

export interface StorefrontNavigationItem {
  id: string
  label: string
  href: string
  kind: 'page' | 'category' | 'account' | 'external'
  isVisible: boolean
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  kind: 'gallery' | 'thumbnail' | 'hero'
}

export interface Category {
  id: string
  slug: string
  name: string
  description: string
  image?: string
  productCount: number
  isFeatured?: boolean
}

export interface Product {
  id: string
  slug: string
  categoryId: string
  categoryName: string
  name: string
  subtitle: string
  description: string
  price: number
  compareAtPrice?: number
  sku: string
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
  stockCount?: number
  images: ProductImage[]
  tags: string[]
  featured: boolean
  rating: number
  reviewsCount: number
  highlights: string[]
}

export interface PromotionalBlock {
  id: string
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}

export interface Testimonial {
  id: string
  quote: string
  customerName: string
  customerTitle: string
}

export type StorefrontSectionKind =
  | 'hero'
  | 'featured_categories'
  | 'featured_products'
  | 'promotional_grid'
  | 'testimonials'
  | 'newsletter'
  | 'rich_text'

export interface StorefrontSectionConfig {
  id: string
  type: StorefrontSectionKind
  enabled: boolean
  title?: string
  subtitle?: string
  limit?: number
  categoryIds?: string[]
  productIds?: string[]
  blocks?: PromotionalBlock[]
  testimonials?: Testimonial[]
  content?: string
  ctaLabel?: string
  ctaHref?: string
}

export interface HomePageConfig {
  hero: {
    badge: string
    title: string
    subtitle: string
    primaryCtaLabel: string
    primaryCtaHref: string
    secondaryCtaLabel?: string
    secondaryCtaHref?: string
  }
  sections: StorefrontSectionConfig[]
}

export interface FooterContent {
  about: string
  navigation: StorefrontNavigationItem[]
  supportLinks: Array<{
    label: string
    href: string
  }>
  legalLinks: Array<{
    label: string
    href: string
  }>
  contactTitle: string
  contactLines: string[]
}

export interface PolicyContent {
  slug: string
  title: string
  summary: string
  sections: Array<{
    id: string
    heading: string
    body: string
  }>
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface CheckoutInput {
  email: string
  firstName: string
  lastName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  country: string
  postalCode: string
  notes?: string
}

export interface CheckoutSummary {
  subtotal: number
  shipping: number
  tax: number
  total: number
  itemCount: number
}

export interface CustomerAddress {
  id: string
  label: string
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  country: string
  postalCode: string
  isDefault: boolean
}

export interface CustomerOrder {
  id: string
  orderNumber: string
  createdAt: string
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: Array<{
    productId: string
    productName: string
    quantity: number
    unitPrice: number
  }>
  shippingAddress: CustomerAddress
}

export interface CustomerAccount {
  id: string
  fullName: string
  email: string
  phone: string
  avatarUrl?: string
  addresses: CustomerAddress[]
  orders: CustomerOrder[]
}

export interface StaticContentPage {
  slug: string
  title: string
  lead: string
  body: string
}

export interface StorefrontRuntime {
  profile: StoreProfile
  settings: StoreSettings
  theme: StorefrontThemeConfig
  navigation: StorefrontNavigationItem[]
  homePage: HomePageConfig
  categories: Category[]
  products: Product[]
  footer: FooterContent
  pages: StaticContentPage[]
  policies: PolicyContent[]
}

export interface AiGeneratedStorefrontPayload {
  storeProfile?: Partial<StoreProfile>
  theme?: Partial<StorefrontThemeConfig>
  navigation?: Array<Partial<StorefrontNavigationItem>>
  homePage?: {
    hero?: Partial<HomePageConfig['hero']>
    sections?: Array<Partial<StorefrontSectionConfig>>
  }
  categories?: Array<Partial<Category>>
  products?: Array<Partial<Product>>
  footer?: Partial<FooterContent>
  pages?: Array<Partial<StaticContentPage>>
  policies?: Array<Partial<PolicyContent>>
}
