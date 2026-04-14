import { fallbackStorefrontRuntime } from '@/features/storefront/data/storefront-fallback'
import { storefrontService } from '@/features/storefront/services/storefront.service'
import type {
  AiGeneratedStorefrontPayload,
  Category,
  HomePageConfig,
  Product,
  StorefrontRuntime,
  StorefrontSectionConfig,
} from '@/features/storefront/types/storefront.types'
import { normalizeStorefrontPayload } from '@/features/storefront/utils/normalizeStorefrontPayload'
import { dataSource } from '@/services/data-source'
import type { GeneratedStore } from '@/types/models'

import {
  aiClarificationAnswersSchema,
  aiPromptSchema,
  validateStoreDraftRuntime,
} from '../schemas/ai-draft.schema'
import type {
  AIDraftClarificationQuestion,
  AIDraftGenerationResponse,
  StoreDraft,
} from '../types/ai-draft.types'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildClarificationQuestions(prompt: string): AIDraftClarificationQuestion[] {
  const shortPrompt = prompt.trim().split(/\s+/).length < 6 || prompt.trim().length < 35
  if (!shortPrompt) return []

  return [
    {
      id: 'audience',
      label: 'Target audience',
      prompt: 'Who is this store mainly for?',
      placeholder: 'Example: young parents shopping for organic baby essentials',
    },
    {
      id: 'catalog',
      label: 'Main product focus',
      prompt: 'What are the main categories or hero products?',
      placeholder: 'Example: baby skincare, organic cotton clothes, nursery accessories',
    },
  ]
}

function buildPromptContext(prompt: string, clarificationAnswers?: Record<string, string>) {
  if (!clarificationAnswers || Object.keys(clarificationAnswers).length === 0) return prompt.trim()

  const clarification = Object.entries(clarificationAnswers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('. ')

  return `${prompt.trim()}. Additional context: ${clarification}.`
}

function deriveStoreName(prompt: string) {
  const words = prompt.trim().split(/\s+/).slice(0, 3)
  return `${words.join(' ') || 'Souq Engine'} Store`
}

function deriveStorePayload(
  generatedStore: GeneratedStore,
  prompt: string,
): AiGeneratedStorefrontPayload {
  const storeSlug = slugify(generatedStore.name || deriveStoreName(prompt) || 'ai-store')
  const categoryLookup = new Map<string, string>()
  const categories: Category[] = generatedStore.categories.map((category, index) => {
    const id = category.id || `draft-category-${index + 1}`
    categoryLookup.set(category.name, id)

    return {
      id,
      slug: slugify(category.name || `category-${index + 1}`),
      name: category.name || `Category ${index + 1}`,
      description: category.description || `Featured collection ${index + 1} for ${generatedStore.name}.`,
      image: '',
      productCount: generatedStore.products.filter((product) => product.category === category.name).length,
      isFeatured: index < 4,
    }
  })

  const products: Product[] = generatedStore.products.map((product, index) => {
    const matchedCategoryId =
      categoryLookup.get(product.category) ?? categories[0]?.id ?? `draft-category-${index + 1}`
    const matchedCategoryName =
      categories.find((category) => category.id === matchedCategoryId)?.name ?? product.category ?? 'Catalog'

    return {
      id: product.id || `draft-product-${index + 1}`,
      slug: slugify(product.name || `product-${index + 1}`),
      categoryId: matchedCategoryId,
      categoryName: matchedCategoryName,
      name: product.name || `Product ${index + 1}`,
      subtitle: matchedCategoryName,
      description: product.description || `Generated product ${index + 1} for ${generatedStore.name}.`,
      price: product.price ?? 0,
      compareAtPrice: product.price ? product.price + Math.round(product.price * 0.15) : undefined,
      sku: `AI-${index + 1}-${storeSlug}`.toUpperCase(),
      stockStatus: 'in_stock',
      stockCount: 12 + index * 3,
      images: product.image
        ? [
            {
              id: `${product.id || `draft-product-${index + 1}`}-hero`,
              url: product.image,
              alt: product.name,
              kind: 'hero',
            },
          ]
        : [],
      tags: ['ai-generated', matchedCategoryName.toLowerCase()],
      featured: index < 4,
      rating: 4.6,
      reviewsCount: 0,
      highlights: [
        'Generated as a starter catalog item',
        'Edit details before backend persistence',
      ],
    }
  })

  const sectionIds = {
    featuredCategories: categories.slice(0, 4).map((category) => category.id),
    featuredProducts: products.slice(0, 4).map((product) => product.id),
  }

  const homeSections: StorefrontSectionConfig[] = [
    {
      id: 'hero-categories',
      type: 'featured_categories',
      enabled: true,
      title: 'Featured categories',
      subtitle: 'Curated from the generated store draft.',
      categoryIds: sectionIds.featuredCategories,
      limit: 4,
    },
    {
      id: 'hero-products',
      type: 'featured_products',
      enabled: true,
      title: 'Featured products',
      subtitle: 'Review these products before confirming the draft.',
      productIds: sectionIds.featuredProducts,
      limit: 4,
    },
    {
      id: 'trust-blocks',
      type: 'promotional_grid',
      enabled: true,
      title: 'Why this store is ready for review',
      blocks: [
        {
          id: 'trust-configurable',
          title: 'Configurable runtime',
          description: 'Theme, navigation, sections, and catalog can be adjusted before persistence.',
        },
        {
          id: 'trust-review',
          title: 'Human-reviewed draft',
          description: 'The merchant should validate and edit this draft before backend creation.',
        },
        {
          id: 'trust-tenant',
          title: 'Tenant-aware foundation',
          description: 'Draft is shaped to become a tenant storefront when confirmed.',
        },
      ],
    },
  ]

  const hero: HomePageConfig['hero'] = {
    badge: 'AI-generated draft',
    title: generatedStore.name,
    subtitle: generatedStore.description,
    primaryCtaLabel: 'Shop products',
    primaryCtaHref: '/storefront/products',
    secondaryCtaLabel: 'Browse categories',
    secondaryCtaHref: '/storefront/categories',
  }

  return {
    storeProfile: {
      id: `draft-${storeSlug}`,
      slug: storeSlug,
      name: generatedStore.name,
      slogan: `Built from the idea: ${prompt.trim().slice(0, 80)}`,
      description: generatedStore.description,
      logoText: generatedStore.name,
      supportEmail: `hello@${storeSlug || 'souq-engine'}.local`,
      supportPhone: '+000 000 0000',
      currency: 'USD',
      locale: 'en',
      direction: 'ltr',
      socialLinks: [
        { label: 'Instagram', href: '#' },
        { label: 'TikTok', href: '#' },
      ],
    },
    theme: {
      themeName: generatedStore.theme.style || 'AI Draft Theme',
      primaryColor: generatedStore.theme.primaryColor,
      accentColor: generatedStore.theme.primaryColor,
      surfaceColor: '#ffffff',
      backgroundColor: generatedStore.theme.backgroundColor,
      foregroundColor: '#111827',
      mutedColor: '#6b7280',
      borderRadius: 'xl',
      fontHeading: generatedStore.theme.font || fallbackStorefrontRuntime.theme.fontHeading,
      fontBody: generatedStore.theme.font || fallbackStorefrontRuntime.theme.fontBody,
      cardStyle: generatedStore.theme.style === 'minimal' ? 'modern' : 'editorial',
    },
    navigation: [
      { id: 'nav-home', label: 'Home', href: '/storefront', kind: 'page', isVisible: true },
      { id: 'nav-products', label: 'Products', href: '/storefront/products', kind: 'page', isVisible: true },
      { id: 'nav-categories', label: 'Categories', href: '/storefront/categories', kind: 'page', isVisible: true },
      { id: 'nav-about', label: 'About', href: '/storefront/about', kind: 'page', isVisible: true },
      { id: 'nav-contact', label: 'Contact', href: '/storefront/contact', kind: 'page', isVisible: true },
    ],
    homePage: {
      hero,
      sections: homeSections,
    },
    categories,
    products,
    footer: {
      about: generatedStore.description,
      navigation: [
        { id: 'footer-home', label: 'Home', href: '/storefront', kind: 'page', isVisible: true },
        { id: 'footer-products', label: 'Products', href: '/storefront/products', kind: 'page', isVisible: true },
      ],
      supportLinks: [
        { label: 'Contact', href: '/storefront/contact' },
        { label: 'Policies', href: '/storefront/policies' },
      ],
      legalLinks: [{ label: 'Policies', href: '/storefront/policies' }],
      contactTitle: 'Customer care',
      contactLines: [`Email: hello@${storeSlug || 'souq-engine'}.local`, 'Add verified support details before publishing'],
    },
    pages: [
      {
        slug: 'about',
        title: 'About',
        lead: `About ${generatedStore.name}`,
        body: generatedStore.description,
      },
      {
        slug: 'contact',
        title: 'Contact',
        lead: 'Contact information should be reviewed before backend persistence.',
        body: 'Replace local fallback support details with verified store contact information.',
      },
    ],
    policies: [
      {
        slug: 'policies',
        title: 'Store policies',
        summary: 'Starter policy content generated for draft review.',
        sections: [
          {
            id: 'shipping',
            heading: 'Shipping',
            body: 'Shipping policies should be reviewed and replaced with actual merchant rules.',
          },
          {
            id: 'returns',
            heading: 'Returns',
            body: 'Return policies should be validated before the store is persisted.',
          },
        ],
      },
    ],
  }
}

function runtimeToPayload(runtime: StorefrontRuntime): AiGeneratedStorefrontPayload {
  return {
    storeProfile: runtime.profile,
    theme: runtime.theme,
    navigation: runtime.navigation,
    homePage: runtime.homePage,
    categories: runtime.categories,
    products: runtime.products,
    footer: runtime.footer,
    pages: runtime.pages,
    policies: runtime.policies,
  }
}

function buildDraft(
  prompt: string,
  source: StoreDraft['source'],
  payload: AiGeneratedStorefrontPayload,
  rawAiResponse: GeneratedStore | null = null,
): StoreDraft {
  const runtime = normalizeStorefrontPayload(payload)
  const validation = validateStoreDraftRuntime(runtime)
  const draftId = `draft-${crypto.randomUUID()}`
  const requestId = `request-${crypto.randomUUID()}`

  return {
    draftId,
    requestId,
    storeId: runtime.settings.tenantId ?? runtime.profile.id ?? null,
    prompt,
    source,
    rawAiResponse,
    runtime,
    rawPayload: payload,
    validation,
    metadata: {
      draft_id: draftId,
      request_id: requestId,
      expires_at: null,
      confirmed_at: null,
      audit_id: null,
      actor_id: null,
      actor_type: 'ai',
      created_at: new Date().toISOString(),
    },
  }
}

function buildStarterPayload(prompt: string): AiGeneratedStorefrontPayload {
  const storeName = deriveStoreName(prompt)
  const storeSlug = slugify(storeName)
  const runtime = clone(fallbackStorefrontRuntime)

  runtime.profile = {
    ...runtime.profile,
    id: `starter-${storeSlug}`,
    slug: storeSlug,
    name: storeName,
    slogan: 'Starter storefront draft ready for manual refinement',
    description: `Starter storefront created from the idea: ${prompt.trim()}.`,
    logoText: storeName,
    supportEmail: `hello@${storeSlug || 'souq-engine'}.local`,
  }
  runtime.settings = {
    ...runtime.settings,
    tenantId: `starter-${storeSlug}`,
  }
  runtime.homePage = {
    ...runtime.homePage,
    hero: {
      ...runtime.homePage.hero,
      badge: 'Starter template',
      title: storeName,
      subtitle: `This template gives you a safe fallback while you continue editing the AI draft idea: ${prompt.trim()}.`,
    },
  }
  runtime.footer = {
    ...runtime.footer,
    about: `Starter storefront draft for ${storeName}.`,
    contactLines: [`hello@${storeSlug || 'souq-engine'}.local`, 'Add verified support details before publishing'],
  }

  return runtimeToPayload(runtime)
}

export const aiGeneratorService = {
  async requestDraft(prompt: string): Promise<AIDraftGenerationResponse> {
    const normalizedPrompt = aiPromptSchema.parse(prompt)
    const questions = buildClarificationQuestions(normalizedPrompt)

    if (questions.length > 0) {
      return {
        kind: 'clarification',
        questions,
      }
    }

    return {
      kind: 'draft',
      draft: await this.generateDraft(normalizedPrompt),
    }
  },

  async resolveClarification(
    prompt: string,
    clarificationAnswers: Record<string, string>,
  ): Promise<StoreDraft> {
    const normalizedPrompt = aiPromptSchema.parse(prompt)
    const answers = aiClarificationAnswersSchema.parse(clarificationAnswers)
    return this.generateDraft(normalizedPrompt, answers)
  },

  async generateDraft(
    prompt: string,
    clarificationAnswers?: Record<string, string>,
  ): Promise<StoreDraft> {
    const generationPrompt = buildPromptContext(prompt, clarificationAnswers)
    const generatedStore = await dataSource.ai.generate(generationPrompt)
    const payload = deriveStorePayload(generatedStore, generationPrompt)
    return buildDraft(prompt, 'ai', payload, generatedStore)
  },

  createStarterDraft(prompt: string): StoreDraft {
    const normalizedPrompt = aiPromptSchema.parse(prompt)
    return buildDraft(normalizedPrompt, 'starter', buildStarterPayload(normalizedPrompt), null)
  },

  revalidateDraft(draft: StoreDraft): StoreDraft {
    const runtime = clone(draft.runtime)
    return {
      ...draft,
      runtime,
      rawPayload: runtimeToPayload(runtime),
      validation: validateStoreDraftRuntime(runtime),
      metadata: {
        ...draft.metadata,
      },
    }
  },

  updateDraftRuntime(draft: StoreDraft, runtime: StorefrontRuntime): StoreDraft {
    const nextRuntime = clone(runtime)
    return {
      ...draft,
      runtime: nextRuntime,
      rawPayload: runtimeToPayload(nextRuntime),
      validation: validateStoreDraftRuntime(nextRuntime),
      metadata: {
        ...draft.metadata,
      },
    }
  },

  fetchDraft(draft: StoreDraft) {
    return Promise.resolve(clone(draft))
  },

  saveDraftEdits(draft: StoreDraft, runtime: StorefrontRuntime) {
    return Promise.resolve(this.updateDraftRuntime(draft, runtime))
  },

  confirmDraft(draft: StoreDraft) {
    const confirmedAt = new Date().toISOString()

    return Promise.resolve({
      ...draft,
      metadata: {
        ...draft.metadata,
        confirmed_at: confirmedAt,
      },
    })
  },

  applyDraftPreview(draft: StoreDraft) {
    return storefrontService.setRuntime(draft.runtime)
  },

  getConfirmReadyPayload(draft: StoreDraft): StorefrontRuntime {
    return clone(draft.runtime)
  },
}
