import { fallbackStorefrontRuntime } from '@/features/storefront/data/storefront-fallback'
import { useAuthStore } from '@/features/auth/store/auth-store'
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
import { appConfig } from '@/config/app'
import { dataSource, dataSourceMode } from '@/services/data-source'
import { ApiError, httpRequest } from '@/services/http-client'
import type { GeneratedStore } from '@/types/models'

import {
  aiClarificationAnswersSchema,
  aiPromptSchema,
  validateStoreDraftRuntime,
} from '../schemas/ai-draft.schema'
import type {
  AIBackendApplyDraftResponse,
  AIBackendDraftPayload,
  AIBackendDraftStateResponse,
  AIBackendDraftWorkflowStatus,
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

function sanitizeCssColor(value: string | undefined, fallback: string) {
  if (!value?.trim()) return fallback
  return value.trim()
}

function deriveDirection(language: string | undefined): 'ltr' | 'rtl' {
  return language === 'ar' ? 'rtl' : 'ltr'
}

function deriveStoreName(prompt: string) {
  const words = prompt.trim().split(/\s+/).slice(0, 3)
  return `${words.join(' ') || 'Souq Engine'} Store`
}

function normalizeBackendDraftStatus(value: unknown): AIBackendDraftWorkflowStatus | null {
  return value === 'processing' ||
    value === 'needs_clarification' ||
    value === 'draft_ready' ||
    value === 'failed' ||
    value === 'applied'
    ? value
    : null
}

function mapBackendClarificationQuestions(
  questions: AIBackendDraftPayload['clarification_questions'],
): AIDraftClarificationQuestion[] {
  return questions.map((question, index) => ({
    id: question.question_key?.trim() || `question-${index + 1}`,
    label: question.question_key?.replace(/_/g, ' ').trim() || `Question ${index + 1}`,
    prompt: question.question_text?.trim() || `Clarification question ${index + 1}`,
    placeholder:
      question.options && question.options.length > 0
        ? `Options: ${question.options.join(', ')}`
        : 'Provide the missing detail here',
    options: question.options?.filter((option) => option.trim().length > 0) ?? [],
  }))
}

function mapBackendDraftPayloadToStorefrontPayload(
  payload: AIBackendDraftPayload,
  storeId: string,
): AiGeneratedStorefrontPayload {
  const storeName = payload.store.name?.trim() || fallbackStorefrontRuntime.profile.name
  const storeDescription = payload.store.description?.trim() || fallbackStorefrontRuntime.profile.description
  const storeSlug = slugify(storeName || storeId || 'ai-store')
  const locale = payload.store_settings.language === 'ar' ? 'ar' : 'en'
  const direction = deriveDirection(payload.store_settings.language)
  const categoryLookup = new Map<string, string>()

  const categories: Category[] =
    payload.categories.length > 0
      ? payload.categories.map((category, index) => {
          const name = category.name?.trim() || `Category ${index + 1}`
          const id = `backend-category-${index + 1}`
          categoryLookup.set(name, id)

          return {
            id,
            slug: slugify(name),
            name,
            description: category.description?.trim() || `Featured collection for ${storeName}.`,
            image: '',
            productCount: payload.products.filter((product) => product.category_name?.trim() === name).length,
            isFeatured: index < 4,
          }
        })
      : fallbackStorefrontRuntime.categories.map((category) => ({ ...category }))

  const products: Product[] =
    payload.products.length > 0
      ? payload.products.map((product, index) => {
          const categoryName = product.category_name?.trim() || categories[0]?.name || 'Catalog'
          const categoryId = categoryLookup.get(categoryName) ?? categories[0]?.id ?? `backend-category-${index + 1}`
          const productName = product.name?.trim() || `Product ${index + 1}`

          return {
            id: `backend-product-${index + 1}`,
            slug: slugify(productName),
            categoryId,
            categoryName,
            name: productName,
            subtitle: categoryName,
            description: product.description?.trim() || `Generated product for ${storeName}.`,
            price: product.price ?? 0,
            compareAtPrice: product.price ? product.price + Math.round(product.price * 0.15) : undefined,
            sku: product.sku?.trim() || `AI-${index + 1}-${storeSlug}`.toUpperCase(),
            stockStatus:
              typeof product.stock_quantity === 'number'
                ? product.stock_quantity > 5
                  ? 'in_stock'
                  : product.stock_quantity > 0
                    ? 'low_stock'
                    : 'out_of_stock'
                : 'in_stock',
            stockCount: product.stock_quantity ?? 0,
            images: product.image_url?.trim()
              ? [
                  {
                    id: `backend-product-${index + 1}-hero`,
                    url: product.image_url.trim(),
                    alt: productName,
                    kind: 'hero',
                  },
                ]
              : [],
            tags: ['ai-generated', slugify(categoryName)],
            featured: index < 4,
            rating: 4.5,
            reviewsCount: 0,
            highlights: ['Generated from backend AI draft', 'Review before applying to the live store'],
          }
        })
      : fallbackStorefrontRuntime.products.map((product) => ({ ...product }))

  const primaryColor = sanitizeCssColor(payload.theme.primary_color, fallbackStorefrontRuntime.theme.primaryColor)
  const secondaryColor = sanitizeCssColor(payload.theme.secondary_color, fallbackStorefrontRuntime.theme.accentColor)

  return {
    storeProfile: {
      id: storeId,
      slug: storeSlug,
      name: storeName,
      slogan: `Built from your AI store brief`,
      description: storeDescription,
      logoText: storeName,
      logoUrl: payload.theme.logo_url?.trim() || undefined,
      supportEmail: `hello@${storeSlug || 'souq-engine'}.local`,
      supportPhone: '+000 000 0000',
      currency: payload.store_settings.currency?.trim() || fallbackStorefrontRuntime.profile.currency,
      locale,
      direction,
      socialLinks: fallbackStorefrontRuntime.profile.socialLinks,
    },
    theme: {
      themeName: payload.theme.theme_template?.trim() || 'AI Draft Theme',
      primaryColor,
      accentColor: secondaryColor,
      surfaceColor: '#ffffff',
      backgroundColor: fallbackStorefrontRuntime.theme.backgroundColor,
      foregroundColor: fallbackStorefrontRuntime.theme.foregroundColor,
      mutedColor: fallbackStorefrontRuntime.theme.mutedColor,
      borderRadius: 'xl',
      fontHeading: payload.theme.font_family?.trim() || fallbackStorefrontRuntime.theme.fontHeading,
      fontBody: payload.theme.font_family?.trim() || fallbackStorefrontRuntime.theme.fontBody,
      cardStyle: 'modern',
    },
    navigation: fallbackStorefrontRuntime.navigation,
    homePage: {
      hero: {
        badge: 'AI-generated draft',
        title: storeName,
        subtitle: storeDescription,
        primaryCtaLabel: 'Browse products',
        primaryCtaHref: '/storefront/products',
        secondaryCtaLabel: 'View categories',
        secondaryCtaHref: '/storefront/categories',
      },
      sections: [
        {
          id: 'featured-categories',
          type: 'featured_categories',
          enabled: true,
          title: 'Featured categories',
          subtitle: 'Built from the backend AI draft.',
          categoryIds: categories.slice(0, 4).map((category) => category.id),
          limit: 4,
        },
        {
          id: 'featured-products',
          type: 'featured_products',
          enabled: true,
          title: 'Featured products',
          subtitle: 'Review these products before applying the draft.',
          productIds: products.slice(0, 4).map((product) => product.id),
          limit: 4,
        },
      ],
    },
    categories,
    products,
    footer: {
      ...fallbackStorefrontRuntime.footer,
      about: storeDescription,
      contactLines: [
        `Email: hello@${storeSlug || 'souq-engine'}.local`,
        payload.store_settings.timezone?.trim() || fallbackStorefrontRuntime.footer.contactLines[2] || 'Add verified support details before publishing',
      ],
    },
    pages: [
      {
        slug: 'about',
        title: 'About',
        lead: `About ${storeName}`,
        body: storeDescription,
      },
      {
        slug: 'contact',
        title: 'Contact',
        lead: 'Review the generated support information before publishing.',
        body: 'This AI draft is connected to the backend workflow and should be verified before final application.',
      },
    ],
    policies: fallbackStorefrontRuntime.policies,
  }
}

async function refreshBackendAccessToken() {
  const refreshToken = useAuthStore.getState().refreshToken

  if (!refreshToken) {
    throw new Error('Missing refresh token. Please log in again.')
  }

  const { data } = await httpRequest<{ access: string }>('/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken }),
  })

  useAuthStore.setState({ accessToken: data.access })
  return data.access
}

async function backendRequest<T>(path: string, init: RequestInit = {}) {
  const { accessToken } = useAuthStore.getState()

  if (!accessToken) {
    throw new Error('Missing access token. Please log in again.')
  }

  try {
    const { data } = await httpRequest<T>(path, {
      ...init,
      accessToken,
    })
    return data
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error
    }

    const nextAccessToken = await refreshBackendAccessToken()
    const { data } = await httpRequest<T>(path, {
      ...init,
      accessToken: nextAccessToken,
    })
    return data
  }
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
  rawAiResponse: GeneratedStore | AIBackendDraftPayload | null = null,
  overrides: Partial<StoreDraft> = {},
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
    persistedPayload: payload,
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
    ...overrides,
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
  isBackendEnabled() {
    return dataSourceMode === 'backend' && !!appConfig.apiBaseUrl
  },

  isBackendSyncedDraft(draft: StoreDraft) {
    return (
      this.isBackendEnabled() &&
      draft.source === 'ai' &&
      !!draft.storeId &&
      !!draft.persistedPayload &&
      this.isBackendDraftReady(draft)
    )
  },

  isBackendDraftReady(draft: StoreDraft) {
    return draft.backendStatus === 'draft_ready'
  },

  hasUnsyncedLocalChanges(draft: StoreDraft) {
    if (!draft.persistedPayload) return false
    return JSON.stringify(normalizeStorefrontPayload(draft.persistedPayload)) !== JSON.stringify(draft.runtime)
  },

  mapBackendDraftState(prompt: string, response: AIBackendDraftStateResponse): StoreDraft {
    const storeId = String(response.store_id)
    const mappedPayload = mapBackendDraftPayloadToStorefrontPayload(response.draft_payload, storeId)
    const runtime = normalizeStorefrontPayload(mappedPayload)
    const validation = validateStoreDraftRuntime(runtime)
    const backendStatus = normalizeBackendDraftStatus(response.draft_metadata.status)
    const backendIsFallback = response.draft_metadata.is_fallback === true
    const backendReason =
      typeof response.draft_metadata.reason === 'string' ? response.draft_metadata.reason.trim() : null

    return {
      draftId:
        typeof response.draft_metadata.draft_id === 'string' ? response.draft_metadata.draft_id : `draft-${storeId}`,
      requestId:
        typeof response.draft_metadata.request_id === 'string'
          ? response.draft_metadata.request_id
          : `request-${storeId}`,
      storeId,
      prompt,
      source: 'ai',
      rawAiResponse: response.draft_payload,
      runtime,
      rawPayload: mappedPayload,
      persistedPayload: mappedPayload,
      validation,
      backendStatus,
      backendIsFallback,
      backendReason,
      metadata: {
        draft_id:
          typeof response.draft_metadata.draft_id === 'string' ? response.draft_metadata.draft_id : null,
        request_id:
          typeof response.draft_metadata.request_id === 'string' ? response.draft_metadata.request_id : null,
        expires_at:
          typeof response.draft_metadata.expires_at === 'string' ? response.draft_metadata.expires_at : null,
        confirmed_at:
          typeof response.draft_metadata.confirmed_at === 'string' ? response.draft_metadata.confirmed_at : null,
        audit_id:
          typeof response.draft_metadata.audit_id === 'string' ? response.draft_metadata.audit_id : null,
        actor_id:
          typeof response.draft_metadata.actor_id === 'string' ? response.draft_metadata.actor_id : null,
        actor_type:
          response.draft_metadata.actor_type === 'merchant' ||
          response.draft_metadata.actor_type === 'admin' ||
          response.draft_metadata.actor_type === 'system' ||
          response.draft_metadata.actor_type === 'ai'
            ? response.draft_metadata.actor_type
            : 'ai',
        created_at:
          typeof response.draft_metadata.created_at === 'string'
            ? response.draft_metadata.created_at
            : new Date().toISOString(),
      },
    }
  },

  async requestDraft(prompt: string): Promise<AIDraftGenerationResponse> {
    const normalizedPrompt = aiPromptSchema.parse(prompt)

    if (this.isBackendEnabled()) {
      const response = await backendRequest<AIBackendDraftStateResponse>('/ai/stores/draft/start/', {
        method: 'POST',
        body: JSON.stringify({
          user_description: normalizedPrompt,
        }),
      })

      if (response.draft_payload.clarification_needed) {
        return {
          kind: 'clarification',
          questions: mapBackendClarificationQuestions(response.draft_payload.clarification_questions),
          draft: this.mapBackendDraftState(normalizedPrompt, response),
        }
      }

      return {
        kind: 'draft',
        draft: this.mapBackendDraftState(normalizedPrompt, response),
      }
    }

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
    storeId: string | null,
    clarificationAnswers: Record<string, string>,
  ): Promise<StoreDraft> {
    const normalizedPrompt = aiPromptSchema.parse(prompt)
    const answers = aiClarificationAnswersSchema.parse(clarificationAnswers)

    if (this.isBackendEnabled()) {
      if (!storeId) {
        throw new Error('No AI draft store is available for clarification.')
      }
      const response = await backendRequest<AIBackendDraftStateResponse>(
        `/ai/stores/${storeId}/draft/clarify/`,
        {
          method: 'POST',
          body: JSON.stringify({
            clarification_answers: answers,
          }),
        },
      )
      return this.mapBackendDraftState(normalizedPrompt, response)
    }

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

  async applyDraftToBackend(draft: StoreDraft): Promise<AIBackendApplyDraftResponse> {
    if (!this.isBackendEnabled()) {
      throw new Error('Backend AI apply is only available in backend mode.')
    }

    if (!draft.storeId) {
      throw new Error('Draft is missing its backend store id.')
    }

    if (!this.isBackendDraftReady(draft)) {
      throw new Error('The backend AI workflow is not draft_ready yet. Answer the clarification questions or regenerate the draft first.')
    }

    if (this.hasUnsyncedLocalChanges(draft)) {
      throw new Error('This draft has local frontend edits that cannot be persisted to the backend yet.')
    }

    return backendRequest<AIBackendApplyDraftResponse>(`/ai/stores/${draft.storeId}/draft/apply/`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  getConfirmReadyPayload(draft: StoreDraft): StorefrontRuntime {
    return clone(draft.runtime)
  },
}
