'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/features/localization'
import { toast } from '@/hooks/useToast'

import { CustomerAccountShell } from '../components/CustomerAccountShell'
import { useCustomerAccountMutations, useCustomerAccountQuery } from '../hooks/useCustomerAccount'
import { z } from 'zod'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().min(6, 'Phone number is required.'),
})

type ProfileFormValues = {
  fullName: string
  email: string
  phone: string
}

export default function CustomerProfilePage() {
  const { language } = useLanguage()
  const { data: customer } = useCustomerAccountQuery()
  const { updateProfile } = useCustomerAccountMutations()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (customer) {
      form.reset({
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      })
    }
  }, [customer, form])

  return (
    <CustomerAccountShell>
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'الملف الشخصي' : 'Profile details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              await updateProfile.mutateAsync(values)
              toast({
                title: language === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profile updated',
              })
            })}
          >
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الاسم الكامل' : 'Full name'}</Label>
              <Input {...form.register('fullName')} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...form.register('email')} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الهاتف' : 'Phone'}</Label>
              <Input {...form.register('phone')} />
            </div>
            <Button type="submit">
              {language === 'ar' ? 'حفظ التغييرات' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </CustomerAccountShell>
  )
}
