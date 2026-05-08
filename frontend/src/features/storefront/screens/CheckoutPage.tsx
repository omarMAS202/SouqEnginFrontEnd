'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { EmptyState } from '@/components/shared/ScreenState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/features/localization'
import { toast } from '@/hooks/useToast'

import { StorefrontCartSummary } from '../components/StorefrontCartSummary'
import { useCart } from '../hooks/useCart'
import { checkoutSchema, type CheckoutFormValues } from '../schemas/storefront.schema'
import { checkoutService } from '../services/storefront.service'

export default function CheckoutPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { items, clear } = useCart()

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      country: 'UAE',
      postalCode: '',
      notes: '',
    },
  })

  if (!items.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title={language === 'ar' ? 'لا يمكن بدء الطلب بدون سلة' : 'Checkout needs cart items'}
          description={language === 'ar' ? 'أضف منتجات إلى السلة أولاً.' : 'Add products to cart first.'}
        />
      </div>
    )
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await checkoutService.startCheckout(values, items)
    toast({
      title: language === 'ar' ? 'تم تجهيز الطلب مبدئيًا' : 'Checkout prepared',
      description: result.message,
    })
    clear()
    router.push('/storefront/account/orders')
  })

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">{language === 'ar' ? 'بدء الطلب' : 'Start checkout'}</h1>
        <p className="text-muted-foreground">
          {language === 'ar'
            ? 'هذه بنية Checkout حقيقية من جهة الواجهة ويمكن استبدالها لاحقاً بإنشاء طلب وجلسة دفع من الـ backend.'
            : 'This is a real frontend checkout foundation that can later connect to backend order creation and payment sessions.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'معلومات التواصل' : 'Contact information'}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Email</Label>
                <Input {...form.register('email')} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الاسم الأول' : 'First name'}</Label>
                <Input {...form.register('firstName')} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'اسم العائلة' : 'Last name'}</Label>
                <Input {...form.register('lastName')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{language === 'ar' ? 'الهاتف' : 'Phone'}</Label>
                <Input {...form.register('phone')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'عنوان الشحن' : 'Shipping address'}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>{language === 'ar' ? 'العنوان' : 'Address line 1'}</Label>
                <Input {...form.register('addressLine1')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{language === 'ar' ? 'تفاصيل إضافية' : 'Address line 2'}</Label>
                <Input {...form.register('addressLine2')} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'المدينة' : 'City'}</Label>
                <Input {...form.register('city')} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الدولة' : 'Country'}</Label>
                <Input {...form.register('country')} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الرمز البريدي' : 'Postal code'}</Label>
                <Input {...form.register('postalCode')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{language === 'ar' ? 'ملاحظات الطلب' : 'Order notes'}</Label>
                <Textarea rows={4} {...form.register('notes')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'الدفع' : 'Payment'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {language === 'ar'
                  ? 'لا يوجد تكامل دفع حقيقي بعد. هذا المكان مخصص لاحقاً لربط Stripe أو Moyasar أو أي مزود دفع.'
                  : 'Real payment processing is not connected yet. This area is reserved for Stripe, Moyasar, or another payment provider later.'}
              </p>
            </CardContent>
          </Card>

          <Button size="lg" type="submit">
            {language === 'ar' ? 'تأكيد الطلب مبدئيًا' : 'Submit checkout foundation'}
          </Button>
        </form>

        <StorefrontCartSummary />
      </div>
    </div>
  )
}
