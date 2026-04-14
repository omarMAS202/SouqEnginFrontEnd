'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, Eye, Filter, MoreHorizontal, Package, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useLanguage } from '@/features/localization'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
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
import { toast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

import { useCategories } from '@/features/categories/hooks/useCategories'
import { useProductMutations, useProducts } from '../hooks/useProducts'
import { productSchema, type ProductSchemaValues } from '../schemas/product.schema'
import type { ProductListItem } from '../types/product.types'

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  draft: 'bg-muted text-muted-foreground',
  out_of_stock: 'bg-destructive/10 text-destructive',
}

const emptyFormValues: ProductSchemaValues = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: '',
  status: 'draft',
  image: '',
}

export default function ProductsPage() {
  const { t, direction, language } = useLanguage()
  const { data: products = [], isLoading, isError, error } = useProducts()
  const { data: categories = [] } = useCategories()
  const { createProduct, updateProduct, deleteProduct } = useProductMutations()
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductListItem | null>(null)

  const form = useForm<ProductSchemaValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyFormValues,
  })

  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [products, searchQuery],
  )

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />
  }

  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل المنتجات' : 'Could not load products'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  const openCreateDialog = () => {
    setEditingProduct(null)
    form.reset({
      ...emptyFormValues,
      categoryId: categories[0]?.id ?? '',
    })
    setDialogOpen(true)
  }

  const openEditDialog = (product: ProductListItem) => {
    setEditingProduct(product)
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      status: product.status,
      image: product.image,
    })
    setDialogOpen(true)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ productId: editingProduct.id, input: values })
        toast({
          title: language === 'ar' ? 'تم تحديث المنتج' : 'Product updated',
          description:
            language === 'ar' ? `تم تحديث ${values.name}.` : `${values.name} was updated.`,
        })
      } else {
        await createProduct.mutateAsync(values)
        toast({
          title: language === 'ar' ? 'تم إنشاء المنتج' : 'Product created',
          description:
            language === 'ar'
              ? `تمت إضافة ${values.name} إلى الكتالوج.`
              : `${values.name} was added to your catalog.`,
        })
      }
      setDialogOpen(false)
      form.reset(emptyFormValues)
    } catch (saveError) {
      toast({
        title: language === 'ar' ? 'تعذر حفظ المنتج' : 'Unable to save product',
        description:
          saveError instanceof Error
            ? saveError.message
            : language === 'ar'
              ? 'يرجى المحاولة مرة أخرى.'
              : 'Please try again.',
        variant: 'destructive',
      })
    }
  })

  return (
    <div className="space-y-6">
      <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between', direction === 'rtl' && 'md:flex-row-reverse')}>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('products.title')}</h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'إدارة كتالوج منتجات المتجر' : 'Manage your product catalog'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')} onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              {t('products.addProduct')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct
                  ? language === 'ar'
                    ? 'تعديل المنتج'
                    : 'Edit Product'
                  : t('products.addProduct')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('products.name')}</Label>
                <Input
                  {...form.register('name')}
                  placeholder={language === 'ar' ? 'حقيبة جلد فاخرة' : 'Premium Leather Bag'}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                <Textarea
                  rows={3}
                  {...form.register('description')}
                  placeholder={language === 'ar' ? 'اكتب وصف المنتج...' : 'Describe the product...'}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('products.price')}</Label>
                  <Input type="number" step="0.01" {...form.register('price')} />
                </div>
                <div className="grid gap-2">
                  <Label>{t('products.stock')}</Label>
                  <Input type="number" {...form.register('stock')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('products.category')}</Label>
                  <Select
                    value={form.watch('categoryId')}
                    onValueChange={(value) => form.setValue('categoryId', value, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ar' ? 'اختر فئة' : 'Choose a category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t('products.status')}</Label>
                  <Select
                    value={form.watch('status')}
                    onValueChange={(value: ProductSchemaValues['status']) => form.setValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{language === 'ar' ? 'نشط' : 'Active'}</SelectItem>
                      <SelectItem value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</SelectItem>
                      <SelectItem value="out_of_stock">{language === 'ar' ? 'نفد المخزون' : 'Out of Stock'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                  {t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className={cn('flex flex-col gap-4 md:flex-row md:items-center', direction === 'rtl' && 'md:flex-row-reverse')}>
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
            <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
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
          <CardTitle className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
            <Package className="h-5 w-5" />
            {language === 'ar' ? `كل المنتجات (${filteredProducts.length})` : `All Products (${filteredProducts.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <EmptyState
              title={language === 'ar' ? 'لا توجد منتجات بعد' : 'No products yet'}
              description={
                language === 'ar'
                  ? 'أضف منتجك الأول لبدء بناء الكتالوج.'
                  : 'Add your first product to start building the catalog.'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className={cn('py-3 text-sm font-medium text-muted-foreground', direction === 'rtl' ? 'text-right' : 'text-left')}>
                      {language === 'ar' ? 'المنتج' : 'Product'}
                    </th>
                    <th className={cn('py-3 text-sm font-medium text-muted-foreground', direction === 'rtl' ? 'text-right' : 'text-left')}>
                      {t('products.category')}
                    </th>
                    <th className={cn('py-3 text-sm font-medium text-muted-foreground', direction === 'rtl' ? 'text-right' : 'text-left')}>
                      {t('products.price')}
                    </th>
                    <th className={cn('py-3 text-sm font-medium text-muted-foreground', direction === 'rtl' ? 'text-right' : 'text-left')}>
                      {t('products.stock')}
                    </th>
                    <th className={cn('py-3 text-sm font-medium text-muted-foreground', direction === 'rtl' ? 'text-right' : 'text-left')}>
                      {t('products.status')}
                    </th>
                    <th className="w-16 py-3 text-center text-sm font-medium text-muted-foreground">
                      {t('products.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border transition-colors hover:bg-secondary/30">
                      <td className="py-4">
                        <div className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{product.name}</span>
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-muted-foreground">{product.categoryLabel}</span>
                      </td>
                      <td className="py-4">
                        <span className="font-semibold text-foreground">${product.price}</span>
                      </td>
                      <td className="py-4">
                        <span className={cn('font-medium', product.stock === 0 ? 'text-destructive' : product.stock < 20 ? 'text-warning' : 'text-foreground')}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', statusColors[product.status])}>
                          {language === 'ar'
                            ? product.status === 'active'
                              ? 'نشط'
                              : product.status === 'draft'
                                ? 'مسودة'
                                : 'نفد المخزون'
                            : product.status === 'active'
                              ? 'Active'
                              : product.status === 'draft'
                                ? 'Draft'
                                : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'}>
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              {language === 'ar' ? 'عرض' : 'View'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => openEditDialog(product)}>
                              <Edit className="h-4 w-4" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={async () => {
                                await deleteProduct.mutateAsync(product.id)
                                toast({
                                  title: language === 'ar' ? 'تم حذف المنتج' : 'Product removed',
                                  description:
                                    language === 'ar'
                                      ? `تم حذف ${product.name}.`
                                      : `${product.name} was deleted.`,
                                })
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
