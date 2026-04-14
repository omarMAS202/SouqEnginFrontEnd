'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useLanguage } from '@/features/localization'
import { toast } from '@/hooks/useToast'

import { CustomerAccountShell } from '../components/CustomerAccountShell'
import { useCustomerAccountMutations, useCustomerAccountQuery } from '../hooks/useCustomerAccount'
import { customerAddressSchema, type CustomerAddressFormValues } from '../schemas/storefront.schema'

export default function CustomerAddressesPage() {
  const { language } = useLanguage()
  const { data: customer } = useCustomerAccountQuery()
  const { saveAddress } = useCustomerAccountMutations()
  const form = useForm<CustomerAddressFormValues>({
    resolver: zodResolver(customerAddressSchema),
    defaultValues: {
      label: '',
      recipientName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      country: 'UAE',
      postalCode: '',
      isDefault: false,
    },
  })

  return (
    <CustomerAccountShell>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'العناوين المحفوظة' : 'Saved addresses'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer?.addresses.map((address) => (
              <div key={address.id} className="rounded-xl border border-border p-4">
                <p className="font-semibold text-foreground">{address.label}</p>
                <p className="text-sm text-muted-foreground">{address.recipientName}</p>
                <p className="text-sm text-muted-foreground">{address.addressLine1}</p>
                <p className="text-sm text-muted-foreground">
                  {address.city}, {address.country}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'إضافة عنوان' : 'Add address'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={form.handleSubmit(async (values) => {
                await saveAddress.mutateAsync(values)
                toast({ title: language === 'ar' ? 'تم حفظ العنوان' : 'Address saved' })
                form.reset()
              })}
            >
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'اسم العنوان' : 'Address label'}</Label>
                <Input {...form.register('label')} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'اسم المستلم' : 'Recipient name'}</Label>
                <Input {...form.register('recipientName')} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الهاتف' : 'Phone'}</Label>
                <Input {...form.register('phone')} />
              </div>
              <div className="space-y-2">
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
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.watch('isDefault')}
                  onCheckedChange={(checked) => form.setValue('isDefault', checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'اجعله العنوان الافتراضي' : 'Set as default address'}
                </span>
              </div>
              <div className="md:col-span-2">
                <Button type="submit">{language === 'ar' ? 'حفظ العنوان' : 'Save address'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </CustomerAccountShell>
  )
}
