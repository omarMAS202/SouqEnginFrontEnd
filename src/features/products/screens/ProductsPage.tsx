'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Edit,
  Eye,
  Filter,
  FolderOpen,
  ImageIcon,
  MoreHorizontal,
  Package,
  PencilLine,
  Plus,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/shared/ScreenState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { requireStoreScope } from '@/features/auth/utils/require-store-scope'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useLanguage } from '@/features/localization'
import { toast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

import { useProductMutations, useProducts } from '../hooks/useProducts'
import {
  productSchema,
  type ProductSchemaValues,
} from '../schemas/product.schema'
import { productsService } from '../services/products.service'
import type { ProductImageModel, ProductListItem } from '../types/product.types'

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  draft: 'bg-muted text-muted-foreground',
  out_of_stock: 'bg-destructive/10 text-destructive',
}

const emptyFormValues: ProductSchemaValues = {
  name: '',
  sku: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: '',
  status: 'draft',
  image: '',
}
function formatDate(value?: string | null) {
  if (!value) return 'Not available'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date)
}
function StatusPill({
  status,
}: {
  status: ProductSchemaValues['status'] | ProductListItem['status']
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        statusColors[status],
      )}
    >
      {status === 'active'
        ? 'Active'
        : status === 'draft'
          ? 'Draft'
          : 'Out of Stock'}
    </span>
  )
}

function ProductRowThumbnail({ product }: { product: ProductListItem }) {
  const imageUrl = product.image || ''

  if (imageUrl) {
    return (
      <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-border bg-secondary">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    )
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary">
      <Package className="h-5 w-5 text-muted-foreground" />
    </div>
  )
}

function ProductPreviewCard({
  imageUrl,
  title,
  subtitle,
}: {
  imageUrl: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">No image selected</span>
          </div>
        )}
      </div>

      <div className="mt-4 min-w-0">
        <p className="truncate text-base font-semibold text-slate-900">
          {title}
        </p>
        {subtitle ? (
          <p className="truncate text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const { t, direction } = useLanguage()
  const { currentStoreId } = useAuth()
  const { data: products = [], isLoading, isError, error } = useProducts()
  const { data: categories = [] } = useCategories()
  const { createProduct, updateProduct, deleteProduct } = useProductMutations()

  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductListItem | null>(
    null,
  )
  const [selectedProduct, setSelectedProduct] =
    useState<ProductListItem | null>(null)
  const [selectedProductImages, setSelectedProductImages] = useState<
    ProductImageModel[]
  >([])
  const [editingImages, setEditingImages] = useState<ProductImageModel[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imageInputKey, setImageInputKey] = useState(0)

  const form = useForm<ProductSchemaValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyFormValues,
  })

  const watchedImageUrl = form.watch('image')

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        [
          product.name,
          product.sku ?? '',
          product.categoryLabel,
          product.description,
        ]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [products, searchQuery],
  )

  const formPreviewUrl = useMemo(() => {
    if (selectedImageFile) {
      return URL.createObjectURL(selectedImageFile)
    }

    return watchedImageUrl || editingImages[0]?.url || ''
  }, [editingImages, selectedImageFile, watchedImageUrl])

  useEffect(() => {
    if (!formPreviewUrl.startsWith('blob:')) {
      return
    }

    return () => URL.revokeObjectURL(formPreviewUrl)
  }, [formPreviewUrl])

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load products"
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  const resetImageSelection = () => {
    setSelectedImageFile(null)
    setImageInputKey((current) => current + 1)
  }

  const clearEditState = () => {
    setEditingProduct(null)
    setEditingImages([])
    form.reset(emptyFormValues)
    resetImageSelection()
  }

  const openCreateDialog = () => {
    setEditingProduct(null)
    setEditingImages([])
    form.reset({
      ...emptyFormValues,
      categoryId: categories[0]?.id ?? '',
    })
    resetImageSelection()
    setDialogOpen(true)
  }

  const openEditDialog = async (product: ProductListItem) => {
    if (!currentStoreId) {
      return
    }

    setDetailsLoading(true)

    try {
      const scopedStoreId = requireStoreScope(currentStoreId)
      const [productDetails, productImages] = await Promise.all([
        productsService.getById(scopedStoreId, product.id),
        productsService.listImages(scopedStoreId, product.id),
      ])

      setEditingProduct(productDetails)
      setEditingImages(productImages)
      form.reset({
        name: productDetails.name,
        sku: productDetails.sku ?? '',
        description: productDetails.description,
        price: productDetails.price,
        stock: productDetails.stock,
        categoryId: productDetails.categoryId || product.categoryId,
        status: productDetails.status,
        image: productImages[0]?.url ?? productDetails.image,
      })
      resetImageSelection()
      setDialogOpen(true)
    } catch (loadError) {
      toast({
        title: 'Unable to load product details',
        description:
          loadError instanceof Error ? loadError.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDetailsLoading(false)
    }
  }

  const openViewDialog = async (productId: string) => {
    if (!currentStoreId) {
      return
    }

    setDetailsOpen(true)
    setDetailsLoading(true)
    setSelectedProduct(null)
    setSelectedProductImages([])

    try {
      const scopedStoreId = requireStoreScope(currentStoreId)
      const [productDetails, productImages] = await Promise.all([
        productsService.getById(scopedStoreId, productId),
        productsService.listImages(scopedStoreId, productId),
      ])

      setSelectedProduct(productDetails)
      setSelectedProductImages(productImages)
    } catch (loadError) {
      toast({
        title: 'Unable to load product details',
        description:
          loadError instanceof Error ? loadError.message : 'Please try again.',
        variant: 'destructive',
      })
      setDetailsOpen(false)
    } finally {
      setDetailsLoading(false)
    }
  }

  const removeSelectedImage = () => {
    form.setValue('image', '', { shouldDirty: true })
    setEditingImages([])
    resetImageSelection()
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const mutationInput = {
        ...values,
        imageFile: selectedImageFile,
        existingImage: editingImages[0]?.url ?? editingProduct?.image ?? null,
      }

      if (editingProduct) {
        await updateProduct.mutateAsync({
          productId: editingProduct.id,
          input: mutationInput,
        })
        toast({
          title: 'Product updated',
          description: `${values.name} was updated successfully.`,
        })
      } else {
        await createProduct.mutateAsync(mutationInput)
        toast({
          title: 'Product created',
          description: `${values.name} was added to your catalog.`,
        })
      }

      setDialogOpen(false)
      clearEditState()
    } catch (saveError) {
      toast({
        title: 'Unable to save product',
        description:
          saveError instanceof Error ? saveError.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  })

  return (
    <div className="space-y-6">
      <div
        className={cn(
          'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
          direction === 'rtl' && 'md:flex-row-reverse',
        )}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('products.title')}
          </h1>
          <p className="text-muted-foreground">
            Manage your product catalog, SKU, stock, images, and backend-backed
            details.
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              clearEditState()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}
              onClick={openCreateDialog}
            >
              <Plus className="h-4 w-4" />
              {t('products.addProduct')}
            </Button>
          </DialogTrigger>

          <DialogContent className="!w-[96vw] !max-w-[1440px] h-[94vh] overflow-hidden border-0 bg-transparent p-0 shadow-none">
            <DialogTitle className="sr-only">
              {editingProduct ? 'Edit Product Dialog' : 'Add Product Dialog'}
            </DialogTitle>

            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
              <DialogHeader className="shrink-0 border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eef4ff_55%,#f8fafc_100%)] px-6 py-5 sm:px-8 lg:px-10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3 min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                      <PencilLine className="h-3.5 w-3.5 text-primary" />
                      Product Workspace
                    </div>

                    <div className="space-y-2">
                      <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-950">
                        {editingProduct
                          ? 'Edit Product'
                          : t('products.addProduct')}
                      </DialogTitle>

                      <DialogDescription className="max-w-2xl text-sm leading-6 text-slate-600">
                        Refine the core product information, then review the
                        live preview and image controls before saving.
                      </DialogDescription>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Mode
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {editingProduct
                        ? 'Editing existing item'
                        : 'Creating new item'}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <form
                onSubmit={onSubmit}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="grid min-h-0 flex-1 gap-0 xl:grid-cols-[minmax(0,1.2fr)_420px]">
                  <div className="min-w-0 overflow-y-auto px-6 py-6 sm:px-8 lg:px-10">
                    <div className="grid min-w-0 gap-6 2xl:grid-cols-2">
                      <section className="min-w-0 space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Package className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">
                              Core Details
                            </p>
                            <p className="text-sm text-slate-500">
                              Name, SKU, copy, and pricing information.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="grid gap-2 min-w-0">
                            <Label>{t('products.name')}</Label>
                            <Input
                              {...form.register('name')}
                              placeholder="Wireless Mouse"
                              className="h-12 rounded-2xl bg-white"
                            />
                            {form.formState.errors.name && (
                              <p className="text-sm text-destructive">
                                {form.formState.errors.name.message}
                              </p>
                            )}
                          </div>

                          <div className="grid gap-2 min-w-0">
                            <Label>SKU</Label>
                            <Input
                              {...form.register('sku')}
                              placeholder="MOUSE-BT-001"
                              className="h-12 rounded-2xl bg-white"
                            />
                            {form.formState.errors.sku && (
                              <p className="text-sm text-destructive">
                                {form.formState.errors.sku.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-2 min-w-0">
                          <Label>Description</Label>
                          <Textarea
                            rows={6}
                            {...form.register('description')}
                            placeholder="Describe the product..."
                            className="min-h-36 rounded-2xl bg-white"
                          />
                          {form.formState.errors.description && (
                            <p className="text-sm text-destructive">
                              {form.formState.errors.description.message}
                            </p>
                          )}
                        </div>
                      </section>

                      <section className="min-w-0 space-y-4 rounded-3xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">
                              Catalog Settings
                            </p>
                            <p className="text-sm text-slate-500">
                              Set pricing, stock, category, and availability.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="grid gap-2 min-w-0">
                            <Label>{t('products.price')}</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...form.register('price')}
                              className="h-12 rounded-2xl bg-white"
                            />
                            {form.formState.errors.price && (
                              <p className="text-sm text-destructive">
                                {form.formState.errors.price.message}
                              </p>
                            )}
                          </div>

                          <div className="grid gap-2 min-w-0">
                            <Label>{t('products.stock')}</Label>
                            <Input
                              type="number"
                              {...form.register('stock')}
                              className="h-12 rounded-2xl bg-white"
                            />
                            {form.formState.errors.stock && (
                              <p className="text-sm text-destructive">
                                {form.formState.errors.stock.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="grid gap-2 min-w-0">
                            <Label>{t('products.category')}</Label>
                            <Select
                              value={form.watch('categoryId')}
                              onValueChange={(value) =>
                                form.setValue('categoryId', value, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger className="h-12 rounded-2xl bg-white">
                                <SelectValue placeholder="Choose a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {form.formState.errors.categoryId && (
                              <p className="text-sm text-destructive">
                                {form.formState.errors.categoryId.message}
                              </p>
                            )}
                          </div>

                          <div className="grid gap-2 min-w-0">
                            <Label>{t('products.status')}</Label>
                            <Select
                              value={form.watch('status')}
                              onValueChange={(
                                value: ProductSchemaValues['status'],
                              ) =>
                                form.setValue('status', value, {
                                  shouldDirty: true,
                                })
                              }
                            >
                              <SelectTrigger className="h-12 rounded-2xl bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="out_of_stock">
                                  Out of Stock
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid gap-2 min-w-0">
                          <Label>Image URL</Label>
                          <Input
                            {...form.register('image')}
                            placeholder="https://example.com/product-image.jpg"
                            className="h-12 rounded-2xl bg-white"
                          />
                          {form.formState.errors.image && (
                            <p className="text-sm text-destructive">
                              {form.formState.errors.image.message}
                            </p>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>

                  <aside className="min-w-0 overflow-y-auto border-t border-slate-200 bg-slate-50/70 px-6 py-6 xl:border-l xl:border-t-0">
                    <div className="space-y-5">
                      <ProductPreviewCard
                        imageUrl={formPreviewUrl}
                        title={form.watch('name') || 'Product preview'}
                        subtitle={
                          form.watch('sku')
                            ? `SKU: ${form.watch('sku')}`
                            : 'No SKU yet'
                        }
                      />

                      <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
                        <CardContent className="space-y-4 p-5">
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                              <FolderOpen className="h-3.5 w-3.5" />
                              Media
                            </div>
                            <p className="text-lg font-semibold text-slate-950">
                              Image controls
                            </p>
                            <p className="text-sm leading-6 text-slate-500">
                              Replace the current image, upload a new one, or
                              remove it before saving.
                            </p>
                          </div>

                          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                            <Label className="mb-3 block text-sm font-medium text-slate-700">
                              Upload image file
                            </Label>
                            <div className="space-y-3">
                              <Input
                                key={imageInputKey}
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                  setSelectedImageFile(
                                    event.target.files?.[0] ?? null,
                                  )
                                }
                                className="rounded-2xl bg-white"
                              />
                              {selectedImageFile ? (
                                <span className="block break-all text-sm text-slate-500">
                                  {selectedImageFile.name}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {(formPreviewUrl ||
                            editingImages.length > 0 ||
                            selectedImageFile) && (
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full gap-2 rounded-2xl"
                              onClick={removeSelectedImage}
                            >
                              <X className="h-4 w-4" />
                              Remove image
                            </Button>
                          )}

                          {editingImages.length > 0 ? (
                            <div className="space-y-3">
                              <p className="text-sm font-medium text-slate-700">
                                Existing backend images
                              </p>
                              <div className="grid grid-cols-3 gap-2">
                                {editingImages.map((image) => (
                                  <div
                                    key={image.id}
                                    className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                                  >
                                    {image.url ? (
                                      <Image
                                        src={image.url}
                                        alt="Product image"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <ImageIcon className="h-5 w-5" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    </div>
                  </aside>
                </div>

                <DialogFooter className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 sm:px-8 lg:px-10">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => setDialogOpen(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-2xl px-6"
                    disabled={
                      createProduct.isPending ||
                      updateProduct.isPending ||
                      detailsLoading
                    }
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {editingProduct ? 'Save changes' : t('common.save')}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="!w-[96vw] !max-w-[1480px] h-[94vh] overflow-hidden border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">
            {selectedProduct
              ? `${selectedProduct.name} product details`
              : 'Product details dialog'}
          </DialogTitle>

          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            {detailsLoading ? (
              <div className="p-8">
                <LoadingState message={t('common.loading')} />
              </div>
            ) : selectedProduct ? (
              <>
                <DialogHeader className="shrink-0 border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_52%,#eef3ff_100%)] px-6 py-5 sm:px-8 lg:px-10">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3 min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        <Tag className="h-3.5 w-3.5 text-primary" />
                        Product Snapshot
                      </div>

                      <div className="space-y-2 min-w-0">
                        <DialogTitle className="truncate text-2xl font-semibold tracking-tight text-slate-950">
                          {selectedProduct.name}
                        </DialogTitle>
                        <DialogDescription className="max-w-2xl text-sm leading-6 text-slate-600">
                          Complete backend-backed product information, including
                          status, inventory, media, and timestamps.
                        </DialogDescription>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
                        SKU: {selectedProduct.sku ?? 'Not provided'}
                      </div>
                      <StatusPill status={selectedProduct.status} />
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid min-h-0 flex-1 gap-6 overflow-hidden px-6 py-6 sm:px-8 lg:px-10 xl:grid-cols-[minmax(0,1.25fr)_380px]">
                  <div className="min-w-0 overflow-y-auto pr-1 space-y-6">
                    <Card className="overflow-hidden rounded-3xl border-slate-200 bg-slate-50/70 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex h-[320px] items-center justify-center overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 p-4 sm:h-[380px] lg:h-[420px]">
                          {selectedProductImages[0]?.url ||
                          selectedProduct.image ? (
                            <div className="relative h-full w-full">
                              <Image
                                src={
                                  selectedProductImages[0]?.url ||
                                  selectedProduct.image
                                }
                                alt={selectedProduct.name}
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
                              <ImageIcon className="h-10 w-10" />
                              <span className="text-sm font-medium">
                                No product image
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-200 shadow-sm">
                      <CardContent className="p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Description
                        </p>
                        <p className="mt-4 text-sm leading-7 text-slate-700">
                          {selectedProduct.description ||
                            'No description available.'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-200 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold text-slate-950">
                          Image gallery
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedProductImages.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                            No uploaded images for this product yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                            {selectedProductImages.map((image) => (
                              <div
                                key={image.id}
                                className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                              >
                                {image.url ? (
                                  <Image
                                    src={image.url}
                                    alt={selectedProduct.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <ImageIcon className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <aside className="min-w-0 overflow-y-auto pr-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="rounded-3xl border-slate-200 shadow-sm">
                        <CardContent className="p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Price
                          </p>
                          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                            ${selectedProduct.price.toFixed(2)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="rounded-3xl border-slate-200 shadow-sm">
                        <CardContent className="p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Stock
                          </p>
                          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                            {selectedProduct.stock}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="rounded-3xl border-slate-200 shadow-sm">
                      <CardContent className="space-y-3 p-5">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Category
                          </p>
                          <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                            {selectedProduct.categoryLabel}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Status
                          </p>
                          <div className="mt-2">
                            <StatusPill status={selectedProduct.status} />
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Created at
                          </p>
                          <p className="mt-1 break-words text-sm font-medium leading-6 text-slate-900">
                            {formatDate(selectedProduct.createdAt)}{' '}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Updated at
                          </p>
                          <p className="mt-1 break-words text-sm font-medium leading-6 text-slate-900">
                            {formatDate(selectedProduct.updatedAt)}{' '}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </aside>
                </div>
              </>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="No product selected"
                  description="Choose a product to inspect its backend-backed details."
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="py-4">
          <div
            className={cn(
              'flex flex-col gap-4 md:flex-row md:items-center',
              direction === 'rtl' && 'md:flex-row-reverse',
            )}
          >
            <div className="relative flex-1">
              <Search
                className={cn(
                  'absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
                  direction === 'rtl' ? 'right-3' : 'left-3',
                )}
              />
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className={cn(direction === 'rtl' ? 'pr-10' : 'pl-10')}
              />
            </div>
            <div
              className={cn(
                'flex items-center gap-2',
                direction === 'rtl' && 'flex-row-reverse',
              )}
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {t('common.filter')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle
            className={cn(
              'flex items-center gap-2',
              direction === 'rtl' && 'flex-row-reverse',
            )}
          >
            <Package className="h-5 w-5" />
            {`All Products (${filteredProducts.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No products yet"
              description="Add your first product to start building the catalog."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th
                      className={cn(
                        'py-3 text-sm font-medium text-muted-foreground',
                        direction === 'rtl' ? 'text-right' : 'text-left',
                      )}
                    >
                      Product
                    </th>
                    <th
                      className={cn(
                        'py-3 text-sm font-medium text-muted-foreground',
                        direction === 'rtl' ? 'text-right' : 'text-left',
                      )}
                    >
                      Category
                    </th>
                    <th
                      className={cn(
                        'py-3 text-sm font-medium text-muted-foreground',
                        direction === 'rtl' ? 'text-right' : 'text-left',
                      )}
                    >
                      Price
                    </th>
                    <th
                      className={cn(
                        'py-3 text-sm font-medium text-muted-foreground',
                        direction === 'rtl' ? 'text-right' : 'text-left',
                      )}
                    >
                      Stock
                    </th>
                    <th
                      className={cn(
                        'py-3 text-sm font-medium text-muted-foreground',
                        direction === 'rtl' ? 'text-right' : 'text-left',
                      )}
                    >
                      Status
                    </th>
                    <th className="w-16 py-3 text-center text-sm font-medium text-muted-foreground">
                      {t('products.actions')}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-border transition-colors hover:bg-secondary/30"
                    >
                      <td className="py-4">
                        <div
                          className={cn(
                            'flex items-center gap-3',
                            direction === 'rtl' && 'flex-row-reverse',
                          )}
                        >
                          <ProductRowThumbnail product={product} />
                          <div className="space-y-1">
                            <span className="font-medium text-foreground">
                              {product.name}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              SKU: {product.sku ?? 'Not provided'}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {product.description ||
                                'Open View to see the full product details.'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-muted-foreground">
                          {product.categoryLabel}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="font-semibold text-foreground">
                          ${product.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={cn(
                            'font-medium',
                            product.stock === 0
                              ? 'text-destructive'
                              : product.stock < 20
                                ? 'text-warning'
                                : 'text-foreground',
                          )}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-medium',
                            statusColors[product.status],
                          )}
                        >
                          {product.status === 'active'
                            ? 'Active'
                            : product.status === 'draft'
                              ? 'Draft'
                              : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align={direction === 'rtl' ? 'start' : 'end'}
                          >
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => openViewDialog(product.id)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="h-4 w-4" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={async () => {
                                try {
                                  await deleteProduct.mutateAsync(product.id)
                                  toast({
                                    title: 'Product removed',
                                    description: `${product.name} was deleted.`,
                                  })
                                } catch (deleteError) {
                                  toast({
                                    title: 'Unable to delete product',
                                    description:
                                      deleteError instanceof Error
                                        ? deleteError.message
                                        : 'Please try again.',
                                    variant: 'destructive',
                                  })
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
