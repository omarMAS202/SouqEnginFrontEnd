'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, DollarSign, Edit, Eye, Mail, MoreHorizontal, Phone, Plus, Search, ShoppingBag, Trash2, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useLanguage } from '@/features/localization'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

import { useCustomerMutations, useCustomers } from '../hooks/useCustomers'
import { customerSchema, type CustomerSchemaValues } from '../schemas/customer.schema'

export default function CustomersPage() {
  const { t, direction, language } = useLanguage()
  const { data: customers = [], isLoading, isError, error } = useCustomers()
  const { createCustomer } = useCustomerMutations()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  const form = useForm<CustomerSchemaValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  })

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? null

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(language === 'ar' ? 'ar-AE' : 'en-US', {
      style: 'currency',
      currency: 'AED',
    }).format(amount)

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />
  }

  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل العملاء' : 'Could not load customers'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className={cn('flex flex-col justify-between gap-4 sm:flex-row sm:items-center', direction === 'rtl' && 'sm:flex-row-reverse')}>
        <div className={cn(direction === 'rtl' && 'text-right')}>
          <h1 className="text-2xl font-bold text-foreground">{t('customers.title')}</h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'إدارة عملاء متجرك' : 'Manage your store customers'}
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}>
              <Plus className="h-4 w-4" />
              {t('customers.addCustomer')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className={cn(direction === 'rtl' && 'text-right')}>
                {t('customers.addCustomer')}
              </DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4 pt-4"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await createCustomer.mutateAsync(values)
                  toast({
                    title: language === 'ar' ? 'تمت إضافة العميل' : 'Customer created',
                    description:
                      language === 'ar'
                        ? `تمت إضافة ${values.name} بنجاح.`
                        : `${values.name} was added successfully.`,
                  })
                  setIsAddDialogOpen(false)
                  form.reset()
                } catch (saveError) {
                  toast({
                    title: language === 'ar' ? 'تعذر إضافة العميل' : 'Could not add customer',
                    description: saveError instanceof Error ? saveError.message : undefined,
                    variant: 'destructive',
                  })
                }
              })}
            >
              <div className="space-y-2">
                <Label className={cn(direction === 'rtl' && 'block text-right')}>{t('customers.name')}</Label>
                <Input {...form.register('name')} className={cn(direction === 'rtl' && 'text-right')} />
              </div>
              <div className="space-y-2">
                <Label className={cn(direction === 'rtl' && 'block text-right')}>{t('customers.email')}</Label>
                <Input type="email" {...form.register('email')} className={cn(direction === 'rtl' && 'text-right')} />
              </div>
              <div className="space-y-2">
                <Label className={cn(direction === 'rtl' && 'block text-right')}>{t('customers.phone')}</Label>
                <Input type="tel" {...form.register('phone')} className={cn(direction === 'rtl' && 'text-right')} />
              </div>
              <div className={cn('flex justify-end gap-2 pt-4', direction === 'rtl' && 'flex-row-reverse')}>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">{t('common.save')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: User,
            label: language === 'ar' ? 'إجمالي العملاء' : 'Total Customers',
            value: customers.length.toString(),
            color: 'text-primary',
            bgColor: 'bg-primary/10',
          },
          {
            icon: ShoppingBag,
            label: language === 'ar' ? 'العملاء النشطون' : 'Active Customers',
            value: customers.filter((customer) => customer.ordersCount > 0).length.toString(),
            color: 'text-green-600',
            bgColor: 'bg-green-100',
          },
          {
            icon: DollarSign,
            label: language === 'ar' ? 'متوسط الإنفاق' : 'Avg. Spending',
            value: formatCurrency(
              customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / Math.max(customers.length, 1),
            ),
            color: 'text-accent',
            bgColor: 'bg-accent/10',
          },
          {
            icon: Calendar,
            label: language === 'ar' ? 'جدد هذا الشهر' : 'New This Month',
            value: customers.length.toString(),
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
              <div className={cn('rounded-xl p-3', stat.bgColor)}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
              <div className={cn(direction === 'rtl' && 'text-right')}>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="relative">
          <Search
            className={cn(
              'absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground',
              direction === 'rtl' ? 'right-3' : 'left-3',
            )}
          />
          <Input
            placeholder={t('common.search')}
            className={cn('h-10 max-w-sm', direction === 'rtl' ? 'pr-10 text-right' : 'pl-10')}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={cn(direction === 'rtl' && 'text-right')}>{t('customers.name')}</TableHead>
              <TableHead className={cn(direction === 'rtl' && 'text-right')}>{t('customers.email')}</TableHead>
              <TableHead className={cn(direction === 'rtl' && 'text-right')}>{t('customers.phone')}</TableHead>
              <TableHead className="text-center">{t('customers.orders')}</TableHead>
              <TableHead className={cn(direction === 'rtl' ? 'text-right' : 'text-left')}>
                {t('customers.totalSpent')}
              </TableHead>
              <TableHead className={cn(direction === 'rtl' && 'text-right')}>{t('customers.lastOrder')}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6">
                  <EmptyState
                    title={language === 'ar' ? 'لا يوجد عملاء بعد' : 'No customers yet'}
                    description={
                      language === 'ar'
                        ? 'سيظهر العملاء هنا بعد أول طلب أو بعد إضافتهم يدوياً.'
                        : 'Customers will appear here after their first order or once they are added manually.'
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">{customer.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className={cn(direction === 'rtl' && 'text-right')}>
                    <div
                      className={cn(
                        'flex items-center gap-2 text-muted-foreground',
                        direction === 'rtl' && 'flex-row-reverse justify-end',
                      )}
                    >
                      <Mail className="h-4 w-4" />
                      {customer.email}
                    </div>
                  </TableCell>
                  <TableCell className={cn(direction === 'rtl' && 'text-right')}>
                    <div
                      className={cn(
                        'flex items-center gap-2 text-muted-foreground',
                        direction === 'rtl' && 'flex-row-reverse justify-end',
                      )}
                    >
                      <Phone className="h-4 w-4" />
                      {customer.phone}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {customer.ordersCount}
                    </span>
                  </TableCell>
                  <TableCell className={cn('font-medium', direction === 'rtl' ? 'text-right' : 'text-left')}>
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>
                  <TableCell className={cn('text-muted-foreground', direction === 'rtl' && 'text-right')}>
                    {customer.lastOrder
                      ? new Date(customer.lastOrder).toLocaleDateString()
                      : language === 'ar'
                        ? 'لا يوجد'
                        : 'No orders yet'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'}>
                        <DropdownMenuItem
                          className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}
                          onClick={() => setSelectedCustomerId(customer.id)}
                        >
                          <Eye className="h-4 w-4" />
                          {language === 'ar' ? 'عرض' : 'View'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                          <Edit className="h-4 w-4" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={cn('gap-2 text-red-600', direction === 'rtl' && 'flex-row-reverse')}
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomerId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={cn(direction === 'rtl' && 'text-right')}>
              {language === 'ar' ? 'تفاصيل العميل' : 'Customer Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 pt-4">
              <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">{selectedCustomer.name.charAt(0)}</span>
                </div>
                <div className={cn(direction === 'rtl' && 'text-right')}>
                  <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                  <p className="text-muted-foreground">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={cn('rounded-lg border border-primary/10 bg-primary/5 p-4', direction === 'rtl' && 'text-right')}>
                  <p className="text-sm text-muted-foreground">{t('customers.orders')}</p>
                  <p className="text-2xl font-bold text-primary">{selectedCustomer.ordersCount}</p>
                </div>
                <div className={cn('rounded-lg border border-accent/10 bg-accent/5 p-4', direction === 'rtl' && 'text-right')}>
                  <p className="text-sm text-muted-foreground">{t('customers.totalSpent')}</p>
                  <p className="text-2xl font-bold text-accent">{formatCurrency(selectedCustomer.totalSpent)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
