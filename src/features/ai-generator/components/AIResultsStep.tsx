'use client'

import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/features/localization'
import type { StorefrontRuntime } from '@/features/storefront/types/storefront.types'
import { cn } from '@/utils/cn'

import { AIDraftValidationSummary } from './AIDraftValidationSummary'
import type { StoreDraft } from '../types/ai-draft.types'

interface AIResultsStepProps {
  draft: StoreDraft
  onUpdateRuntime: (runtime: StorefrontRuntime) => void
  onConfirm: () => void
  onBack: () => void
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export function AIResultsStep({
  draft,
  onUpdateRuntime,
  onConfirm,
  onBack,
}: AIResultsStepProps) {
  const { direction, language } = useLanguage()
  const runtime = draft.runtime

  const updateRuntime = (updater: (current: StorefrontRuntime) => StorefrontRuntime) => {
    const next = updater(clone(runtime))
    onUpdateRuntime(next)
  }

  return (
    <div className="space-y-6">
      <div className={cn('flex items-start justify-between gap-4', direction === 'rtl' && 'flex-row-reverse')}>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'راجع المسودة وعدّلها قبل التأكيد' : 'Review and edit the draft before confirmation'}
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            {language === 'ar'
              ? 'هذه المسودة ليست نهائية. عدّل ما يلزم، أصلح مشاكل التحقق إن وجدت، ثم أكد أنها جاهزة للحفظ لاحقاً عبر الـ backend.'
              : 'This draft is not final. Adjust what you need, fix validation issues if they exist, then confirm that it is ready for future backend persistence.'}
          </p>
        </div>

        <div className={cn('flex gap-3', direction === 'rtl' && 'flex-row-reverse')}>
          <Button variant="ghost" onClick={onBack} className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}>
            <ArrowLeft className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
            {language === 'ar' ? 'العودة' : 'Back'}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={draft.validation.hasBlockingIssues}
            className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}
          >
            {language === 'ar' ? 'متابعة إلى التأكيد' : 'Continue to confirmation'}
            <ArrowRight className={cn('h-4 w-4', direction === 'rtl' && 'rotate-180')} />
          </Button>
        </div>
      </div>

      <AIDraftValidationSummary validation={draft.validation} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'هوية المتجر ومعلومات التواصل' : 'Store identity and contact info'}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'اسم المتجر' : 'Store name'}</Label>
                <Input
                  value={runtime.profile.name}
                  onChange={(event) =>
                    updateRuntime((current) => ({
                      ...current,
                      profile: { ...current.profile, name: event.target.value, logoText: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الشعار النصي' : 'Store slogan'}</Label>
                <Input
                  value={runtime.profile.slogan}
                  onChange={(event) =>
                    updateRuntime((current) => ({
                      ...current,
                      profile: { ...current.profile, slogan: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{language === 'ar' ? 'وصف المتجر' : 'Store description'}</Label>
                <Textarea
                  rows={4}
                  value={runtime.profile.description}
                  onChange={(event) =>
                    updateRuntime((current) => ({
                      ...current,
                      profile: { ...current.profile, description: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'بريد الدعم' : 'Support email'}</Label>
                <Input
                  value={runtime.profile.supportEmail}
                  onChange={(event) =>
                    updateRuntime((current) => ({
                      ...current,
                      profile: { ...current.profile, supportEmail: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'هاتف الدعم' : 'Support phone'}</Label>
                <Input
                  value={runtime.profile.supportPhone}
                  onChange={(event) =>
                    updateRuntime((current) => ({
                      ...current,
                      profile: { ...current.profile, supportPhone: event.target.value },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'الثيم والواجهة الرئيسية' : 'Theme and homepage basics'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اسم الثيم' : 'Theme name'}</Label>
                  <Input
                    value={runtime.theme.themeName}
                    onChange={(event) =>
                      updateRuntime((current) => ({
                        ...current,
                        theme: { ...current.theme, themeName: event.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اللون الأساسي' : 'Primary color'}</Label>
                  <Input
                    type="color"
                    value={runtime.theme.primaryColor}
                    onChange={(event) =>
                      updateRuntime((current) => ({
                        ...current,
                        theme: { ...current.theme, primaryColor: event.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'لون الخلفية' : 'Background color'}</Label>
                  <Input
                    type="color"
                    value={runtime.theme.backgroundColor}
                    onChange={(event) =>
                      updateRuntime((current) => ({
                        ...current,
                        theme: { ...current.theme, backgroundColor: event.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'عنوان الـ hero' : 'Hero title'}</Label>
                  <Input
                    value={runtime.homePage.hero.title}
                    onChange={(event) =>
                      updateRuntime((current) => ({
                        ...current,
                        homePage: {
                          ...current.homePage,
                          hero: { ...current.homePage.hero, title: event.target.value },
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'وصف الـ hero' : 'Hero subtitle'}</Label>
                  <Textarea
                    rows={3}
                    value={runtime.homePage.hero.subtitle}
                    onChange={(event) =>
                      updateRuntime((current) => ({
                        ...current,
                        homePage: {
                          ...current.homePage,
                          hero: { ...current.homePage.hero, subtitle: event.target.value },
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className={cn('flex flex-row items-center justify-between', direction === 'rtl' && 'flex-row-reverse')}>
              <CardTitle>{language === 'ar' ? 'الفئات' : 'Categories'}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateRuntime((current) => ({
                    ...current,
                    categories: [
                      ...current.categories,
                      {
                        id: `category-${crypto.randomUUID()}`,
                        slug: `new-category-${current.categories.length + 1}`,
                        name: language === 'ar' ? 'فئة جديدة' : 'New category',
                        description: language === 'ar' ? 'أضف وصف الفئة' : 'Add a category description',
                        image: '',
                        productCount: 0,
                        isFeatured: false,
                      },
                    ],
                  }))
                }
                className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}
              >
                <Plus className="h-4 w-4" />
                {language === 'ar' ? 'إضافة فئة' : 'Add category'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {runtime.categories.map((category, index) => (
                <div key={category.id} className="rounded-xl border border-border p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'اسم الفئة' : 'Category name'}</Label>
                      <Input
                        value={category.name}
                        onChange={(event) =>
                          updateRuntime((current) => ({
                            ...current,
                            categories: current.categories.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, name: event.target.value } : entry,
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                      <Input
                        value={category.description}
                        onChange={(event) =>
                          updateRuntime((current) => ({
                            ...current,
                            categories: current.categories.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, description: event.target.value } : entry,
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateRuntime((current) => ({
                            ...current,
                            categories: current.categories.filter((entry) => entry.id !== category.id),
                            products: current.products.filter((product) => product.categoryId !== category.id),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className={cn('flex flex-row items-center justify-between', direction === 'rtl' && 'flex-row-reverse')}>
              <CardTitle>{language === 'ar' ? 'أقسام الصفحة الرئيسية' : 'Homepage sections'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {runtime.homePage.sections.map((section, index) => (
                <div key={section.id} className="rounded-xl border border-border p-3">
                  <div className={cn('flex items-start justify-between gap-3', direction === 'rtl' && 'flex-row-reverse')}>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{section.title || section.type}</p>
                      <p className="text-xs text-muted-foreground">{section.type}</p>
                    </div>
                    <Switch
                      checked={section.enabled}
                      onCheckedChange={(checked) =>
                        updateRuntime((current) => ({
                          ...current,
                          homePage: {
                            ...current.homePage,
                            sections: current.homePage.sections.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, enabled: checked } : entry,
                            ),
                          },
                        }))
                      }
                    />
                  </div>

                  <div className={cn('mt-3 flex gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={index === 0}
                      onClick={() =>
                        updateRuntime((current) => {
                          const nextSections = [...current.homePage.sections]
                          ;[nextSections[index - 1], nextSections[index]] = [nextSections[index], nextSections[index - 1]]
                          return {
                            ...current,
                            homePage: { ...current.homePage, sections: nextSections },
                          }
                        })
                      }
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={index === runtime.homePage.sections.length - 1}
                      onClick={() =>
                        updateRuntime((current) => {
                          const nextSections = [...current.homePage.sections]
                          ;[nextSections[index], nextSections[index + 1]] = [nextSections[index + 1], nextSections[index]]
                          return {
                            ...current,
                            homePage: { ...current.homePage, sections: nextSections },
                          }
                        })
                      }
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className={cn('flex flex-row items-center justify-between', direction === 'rtl' && 'flex-row-reverse')}>
              <CardTitle>{language === 'ar' ? 'المنتجات الأولية' : 'Starter products'}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateRuntime((current) => ({
                    ...current,
                    products: [
                      ...current.products,
                      {
                        id: `product-${crypto.randomUUID()}`,
                        slug: `new-product-${current.products.length + 1}`,
                        categoryId: current.categories[0]?.id ?? '',
                        categoryName: current.categories[0]?.name ?? 'Catalog',
                        name: language === 'ar' ? 'منتج جديد' : 'New product',
                        subtitle: language === 'ar' ? 'قابل للتعديل' : 'Editable starter item',
                        description:
                          language === 'ar'
                            ? 'أضف وصفاً تفصيلياً للمنتج قبل التأكيد.'
                            : 'Add a detailed product description before confirmation.',
                        price: 0,
                        sku: `AI-${current.products.length + 1}`,
                        stockStatus: 'in_stock',
                        stockCount: 10,
                        images: [],
                        tags: [],
                        featured: false,
                        rating: 4.5,
                        reviewsCount: 0,
                        highlights: [],
                      },
                    ],
                  }))
                }
                className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}
              >
                <Plus className="h-4 w-4" />
                {language === 'ar' ? 'إضافة منتج' : 'Add product'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {runtime.products.map((product, index) => (
                <div key={product.id} className="rounded-xl border border-border p-4">
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-[1fr_120px_180px_auto]">
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'اسم المنتج' : 'Product name'}</Label>
                        <Input
                          value={product.name}
                          onChange={(event) =>
                            updateRuntime((current) => ({
                              ...current,
                              products: current.products.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, name: event.target.value } : entry,
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'السعر' : 'Price'}</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.price}
                          onChange={(event) =>
                            updateRuntime((current) => ({
                              ...current,
                              products: current.products.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? { ...entry, price: Number(event.target.value || 0) }
                                  : entry,
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الفئة' : 'Category'}</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={product.categoryId}
                          onChange={(event) =>
                            updateRuntime((current) => {
                              const selectedCategory = current.categories.find((category) => category.id === event.target.value)
                              return {
                                ...current,
                                products: current.products.map((entry, entryIndex) =>
                                  entryIndex === index
                                    ? {
                                        ...entry,
                                        categoryId: event.target.value,
                                        categoryName: selectedCategory?.name ?? entry.categoryName,
                                      }
                                    : entry,
                                ),
                              }
                            })
                          }
                        >
                          {runtime.categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            updateRuntime((current) => ({
                              ...current,
                              products: current.products.filter((entry) => entry.id !== product.id),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'وصف المنتج' : 'Product description'}</Label>
                      <Textarea
                        rows={3}
                        value={product.description}
                        onChange={(event) =>
                          updateRuntime((current) => ({
                            ...current,
                            products: current.products.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, description: event.target.value } : entry,
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'التواصل والفوتر' : 'Contact and footer basics'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'عنوان قسم التواصل' : 'Footer contact title'}</Label>
                <Input
                  value={runtime.footer.contactTitle}
                  onChange={(event) =>
                    updateRuntime((current) => ({
                      ...current,
                      footer: { ...current.footer, contactTitle: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نبذة الفوتر' : 'Footer about text'}</Label>
                <Textarea
                  rows={3}
                  value={runtime.footer.about}
                  onChange={(event) =>
                    updateRuntime((current) => ({
                      ...current,
                      footer: { ...current.footer, about: event.target.value },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
