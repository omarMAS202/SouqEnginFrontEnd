import type {
  AiGeneratedStorefrontPayload,
  Category,
  HomePageConfig,
  Product,
  StorefrontNavigationItem,
  StorefrontRuntime,
  StorefrontSectionConfig,
} from '../types/storefront.types'

import { fallbackStorefrontRuntime } from '../data/storefront-fallback'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeNavigation(
  items: AiGeneratedStorefrontPayload['navigation'],
): StorefrontNavigationItem[] {
  if (!items?.length) return fallbackStorefrontRuntime.navigation

  return items.map((item, index) => ({
    id: item.id ?? `nav-${index + 1}`,
    label: item.label ?? `Navigation ${index + 1}`,
    href: item.href ?? '/storefront',
    kind: item.kind ?? 'page',
    isVisible: item.isVisible ?? true,
  }))
}

function normalizeCategories(categories: AiGeneratedStorefrontPayload['categories']): Category[] {
  if (!categories?.length) return fallbackStorefrontRuntime.categories

  return categories.map((category, index) => ({
    id: category.id ?? `category-${index + 1}`,
    slug: category.slug ?? slugify(category.name ?? `category-${index + 1}`),
    name: category.name ?? `Category ${index + 1}`,
    description: category.description ?? '',
    image: category.image ?? '',
    productCount: category.productCount ?? 0,
    isFeatured: category.isFeatured ?? index < 4,
  }))
}

function normalizeProducts(products: AiGeneratedStorefrontPayload['products']): Product[] {
  if (!products?.length) return fallbackStorefrontRuntime.products

  return products.map((product, index) => ({
    id: product.id ?? `product-${index + 1}`,
    slug: product.slug ?? slugify(product.name ?? `product-${index + 1}`),
    categoryId: product.categoryId ?? '',
    categoryName: product.categoryName ?? 'Uncategorized',
    name: product.name ?? `Product ${index + 1}`,
    subtitle: product.subtitle ?? '',
    description: product.description ?? '',
    price: product.price ?? 0,
    compareAtPrice: product.compareAtPrice,
    sku: product.sku ?? `SKU-${index + 1}`,
    stockStatus: product.stockStatus ?? 'in_stock',
    stockCount: product.stockCount,
    images: product.images ?? [],
    tags: product.tags ?? [],
    featured: product.featured ?? index < 4,
    rating: product.rating ?? 4.5,
    reviewsCount: product.reviewsCount ?? 0,
    highlights: product.highlights ?? [],
  }))
}

function normalizeSections(
  sections?: Partial<StorefrontSectionConfig>[],
): StorefrontSectionConfig[] {
  if (!sections || sections.length === 0) return fallbackStorefrontRuntime.homePage.sections

  return sections.map((section, index) => ({
    id: section.id ?? `section-${index + 1}`,
    type: section.type ?? 'rich_text',
    enabled: section.enabled ?? true,
    title: section.title,
    subtitle: section.subtitle,
    limit: section.limit,
    categoryIds: section.categoryIds,
    productIds: section.productIds,
    blocks: section.blocks,
    testimonials: section.testimonials,
    content: section.content,
    ctaLabel: section.ctaLabel,
    ctaHref: section.ctaHref,
  }))
}

function normalizeHomePage(homePage: AiGeneratedStorefrontPayload['homePage']): HomePageConfig {
  return {
    hero: {
      ...fallbackStorefrontRuntime.homePage.hero,
      ...homePage?.hero,
    },
    sections: normalizeSections(homePage?.sections),
  }
}

export function normalizeStorefrontPayload(
  payload: AiGeneratedStorefrontPayload,
): StorefrontRuntime {
  return {
    profile: {
      ...fallbackStorefrontRuntime.profile,
      ...payload.storeProfile,
      slug:
        payload.storeProfile?.slug ??
        slugify(payload.storeProfile?.name ?? fallbackStorefrontRuntime.profile.slug),
    },
    settings: {
      ...fallbackStorefrontRuntime.settings,
      language: payload.storeProfile?.locale ?? fallbackStorefrontRuntime.settings.language,
      direction: payload.storeProfile?.direction ?? fallbackStorefrontRuntime.settings.direction,
    },
    theme: {
      ...fallbackStorefrontRuntime.theme,
      ...payload.theme,
    },
    navigation: normalizeNavigation(payload.navigation),
    homePage: normalizeHomePage(payload.homePage),
    categories: normalizeCategories(payload.categories),
    products: normalizeProducts(payload.products),
    footer: {
      ...fallbackStorefrontRuntime.footer,
      ...payload.footer,
    },
    pages:
      payload.pages?.map((page, index) => ({
        slug: page.slug ?? `page-${index + 1}`,
        title: page.title ?? `Page ${index + 1}`,
        lead: page.lead ?? '',
        body: page.body ?? '',
      })) ?? fallbackStorefrontRuntime.pages,
    policies:
      payload.policies?.map((policy, index) => ({
        slug: policy.slug ?? `policy-${index + 1}`,
        title: policy.title ?? `Policy ${index + 1}`,
        summary: policy.summary ?? '',
        sections: policy.sections ?? [],
      })) ?? fallbackStorefrontRuntime.policies,
  }
}
