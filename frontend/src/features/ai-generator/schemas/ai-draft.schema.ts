import { z } from 'zod'

import type { StorefrontRuntime } from '@/features/storefront/types/storefront.types'

import type {
  AIDraftValidationIssue,
  AIDraftValidationResult,
} from '../types/ai-draft.types'

export const aiPromptSchema = z
  .string()
  .trim()
  .min(12, 'Describe the store idea in at least 12 characters.')
  .max(500, 'Prompt must be 500 characters or fewer.')

export const aiClarificationAnswersSchema = z.record(
  z.string().trim().min(2, 'Please answer all clarification questions.'),
)

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Store name is required.'),
  slogan: z.string().trim().min(4, 'Store slogan is required.'),
  description: z.string().trim().min(12, 'Store description is required.'),
  supportEmail: z.string().email('Support email must be valid.'),
  supportPhone: z.string().trim().min(6, 'Support phone is required.'),
})

const themeSchema = z.object({
  themeName: z.string().trim().min(2, 'Theme name is required.'),
  primaryColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Primary color must be a hex value.'),
  accentColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Accent color must be a hex value.'),
  backgroundColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Background color must be a hex value.'),
})

const navigationItemSchema = z.object({
  label: z.string().trim().min(1, 'Navigation label is required.'),
  href: z.string().trim().min(1, 'Navigation href is required.'),
})

const heroSchema = z.object({
  title: z.string().trim().min(4, 'Hero title is required.'),
  subtitle: z.string().trim().min(12, 'Hero subtitle is required.'),
  primaryCtaLabel: z.string().trim().min(2, 'Primary CTA label is required.'),
  primaryCtaHref: z.string().trim().min(1, 'Primary CTA href is required.'),
})

const categorySchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(2, 'Category name is required.'),
  description: z.string().trim().min(6, 'Category description is required.'),
})

const productSchema = z.object({
  id: z.string().trim().min(1),
  categoryId: z.string().trim().min(1, 'Product category is required.'),
  categoryName: z.string().trim().min(1, 'Product category name is required.'),
  name: z.string().trim().min(2, 'Product name is required.'),
  description: z.string().trim().min(12, 'Product description is required.'),
  price: z.number().nonnegative('Product price must be zero or more.'),
  sku: z.string().trim().min(1, 'Product SKU is required.'),
})

function issue(
  id: string,
  path: string,
  message: string,
  severity: 'error' | 'warning' = 'error',
): AIDraftValidationIssue {
  return { id, path, message, severity }
}

export function validateStoreDraftRuntime(runtime: StorefrontRuntime): AIDraftValidationResult {
  const issues: AIDraftValidationIssue[] = []

  const profileResult = profileSchema.safeParse(runtime.profile)
  if (!profileResult.success) {
    profileResult.error.issues.forEach((entry, index) => {
      issues.push(
        issue(
          `profile-${index}`,
          `profile.${entry.path.join('.')}`,
          entry.message,
        ),
      )
    })
  }

  const themeResult = themeSchema.safeParse(runtime.theme)
  if (!themeResult.success) {
    themeResult.error.issues.forEach((entry, index) => {
      issues.push(
        issue(
          `theme-${index}`,
          `theme.${entry.path.join('.')}`,
          entry.message,
        ),
      )
    })
  }

  if (runtime.navigation.filter((item) => item.isVisible).length === 0) {
    issues.push(issue('navigation-empty', 'navigation', 'At least one visible navigation item is required.'))
  } else {
    runtime.navigation.forEach((item, index) => {
      const result = navigationItemSchema.safeParse(item)
      if (!result.success) {
        result.error.issues.forEach((entry, issueIndex) => {
          issues.push(
            issue(
              `navigation-${index}-${issueIndex}`,
              `navigation.${index}.${entry.path.join('.')}`,
              entry.message,
            ),
          )
        })
      }
    })
  }

  const heroResult = heroSchema.safeParse(runtime.homePage.hero)
  if (!heroResult.success) {
    heroResult.error.issues.forEach((entry, index) => {
      issues.push(
        issue(
          `hero-${index}`,
          `homePage.hero.${entry.path.join('.')}`,
          entry.message,
        ),
      )
    })
  }

  if (runtime.homePage.sections.length === 0) {
    issues.push(issue('home-sections', 'homePage.sections', 'Homepage needs at least one section.', 'warning'))
  }

  if (runtime.categories.length === 0) {
    issues.push(issue('categories-empty', 'categories', 'At least one category is required.'))
  }

  runtime.categories.forEach((category, index) => {
    const result = categorySchema.safeParse(category)
    if (!result.success) {
      result.error.issues.forEach((entry, issueIndex) => {
        issues.push(
          issue(
            `category-${index}-${issueIndex}`,
            `categories.${index}.${entry.path.join('.')}`,
            entry.message,
          ),
        )
      })
    }
  })

  const categoryIds = new Set(runtime.categories.map((category) => category.id))

  if (runtime.products.length === 0) {
    issues.push(issue('products-empty', 'products', 'At least one product is required.'))
  }

  runtime.products.forEach((product, index) => {
    const result = productSchema.safeParse(product)
    if (!result.success) {
      result.error.issues.forEach((entry, issueIndex) => {
        issues.push(
          issue(
            `product-${index}-${issueIndex}`,
            `products.${index}.${entry.path.join('.')}`,
            entry.message,
          ),
        )
      })
    }

    if (!categoryIds.has(product.categoryId)) {
      issues.push(
        issue(
          `product-category-${index}`,
          `products.${index}.categoryId`,
          'Product category must reference an existing category.',
        ),
      )
    }

    if (product.images.length === 0) {
      issues.push(
        issue(
          `product-images-${index}`,
          `products.${index}.images`,
          'Product has no images yet. You can continue, but media should be added before publishing.',
          'warning',
        ),
      )
    }
  })

  if (runtime.footer.contactLines.length === 0) {
    issues.push(
      issue(
        'footer-contact',
        'footer.contactLines',
        'Footer contact details are empty.',
        'warning',
      ),
    )
  }

  const hasBlockingIssues = issues.some((entry) => entry.severity === 'error')

  return {
    isValid: !hasBlockingIssues,
    hasBlockingIssues,
    issues,
  }
}
