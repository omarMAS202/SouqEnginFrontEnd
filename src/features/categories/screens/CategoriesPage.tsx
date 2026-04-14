'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, FolderTree, MoreHorizontal, Package, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
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
import { toast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

import { useCategories, useCategoryMutations } from '../hooks/useCategories'
import { categorySchema, type CategorySchemaValues } from '../schemas/category.schema'

export default function CategoriesPage() {
  const { t, direction, language } = useLanguage()
  const { data: categories = [], isLoading, isError, error } = useCategories()
  const { saveCategory, deleteCategory } = useCategoryMutations()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>()

  const form = useForm<CategorySchemaValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const openCreateDialog = () => {
    setEditingCategoryId(undefined)
    form.reset({ name: '', description: '' })
    setDialogOpen(true)
  }

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />
  }

  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل الفئات' : 'Could not load categories'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between', direction === 'rtl' && 'md:flex-row-reverse')}>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('categories.title')}</h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'نظّم منتجاتك ضمن فئات واضحة' : 'Organize your products into categories'}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')} onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              {t('categories.addCategory')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategoryId
                  ? language === 'ar'
                    ? 'تعديل الفئة'
                    : 'Edit Category'
                  : t('categories.addCategory')}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await saveCategory.mutateAsync({ id: editingCategoryId, input: values })
                  toast({
                    title: language === 'ar' ? 'تم حفظ الفئة' : 'Category saved',
                    description:
                      language === 'ar'
                        ? `تم حفظ ${values.name} بنجاح.`
                        : `${values.name} was saved successfully.`,
                  })
                  setDialogOpen(false)
                } catch (saveError) {
                  toast({
                    title: language === 'ar' ? 'تعذر حفظ الفئة' : 'Could not save category',
                    description: saveError instanceof Error ? saveError.message : undefined,
                    variant: 'destructive',
                  })
                }
              })}
              className="grid gap-4 py-4"
            >
              <div className="grid gap-2">
                <Label>{t('categories.name')}</Label>
                <Input {...form.register('name')} placeholder={language === 'ar' ? 'إكسسوارات' : 'Accessories'} />
              </div>
              <div className="grid gap-2">
                <Label>{t('categories.description')}</Label>
                <Input
                  {...form.register('description')}
                  placeholder={language === 'ar' ? 'حقائب، أحزمة، وأكثر' : 'Bags, belts, and more'}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">{t('common.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FolderTree className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إجمالي الفئات' : 'Total Categories'}
                </p>
                <p className="text-2xl font-bold text-foreground">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Package className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {categories.reduce((sum, category) => sum + category.productCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'متوسط المنتجات لكل فئة' : 'Avg Products/Category'}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {categories.length
                    ? Math.round(
                        categories.reduce((sum, category) => sum + category.productCount, 0) /
                          categories.length,
                      )
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
            <FolderTree className="h-5 w-5" />
            {language === 'ar' ? 'كل الفئات' : 'All Categories'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <EmptyState
              title={language === 'ar' ? 'لا توجد فئات بعد' : 'No categories yet'}
              description={
                language === 'ar'
                  ? 'أنشئ أول فئة لتنظيم منتجات المتجر.'
                  : 'Create your first category to organize your store products.'
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <div className={cn('flex items-start justify-between', direction === 'rtl' && 'flex-row-reverse')}>
                    <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                        <FolderTree className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'}>
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => {
                            setEditingCategoryId(category.id)
                            form.reset({ name: category.name, description: category.description })
                            setDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-destructive"
                          onClick={async () => {
                            try {
                              await deleteCategory.mutateAsync(category.id)
                              toast({
                                title: language === 'ar' ? 'تم حذف الفئة' : 'Category deleted',
                                description:
                                  language === 'ar'
                                    ? `تم حذف ${category.name}.`
                                    : `${category.name} was removed.`,
                              })
                            } catch (removeError) {
                              toast({
                                title: language === 'ar' ? 'تعذر حذف الفئة' : 'Could not delete category',
                                description: removeError instanceof Error ? removeError.message : undefined,
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
                  </div>
                  <div className={cn('mt-4 flex items-center gap-2 border-t border-border pt-4', direction === 'rtl' && 'flex-row-reverse')}>
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {category.productCount} {t('categories.productCount')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
