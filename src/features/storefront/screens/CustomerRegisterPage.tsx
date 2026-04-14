'use client'

import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/features/localization'
import { toast } from '@/hooks/useToast'

import { useCustomerSession } from '../hooks/useCustomerAccount'
import { customerRegisterSchema, type CustomerRegisterFormValues } from '../schemas/storefront.schema'

export default function CustomerRegisterPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { register } = useCustomerSession()
  const form = useForm<CustomerRegisterFormValues>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await register(values)
      toast({
        title: language === 'ar' ? 'تم إنشاء الحساب' : 'Account created',
        description:
          language === 'ar'
            ? 'هذا حساب عميل frontend-only ويمكن لاحقاً ربطه بمصادقة backend حقيقية.'
            : 'This is a frontend-only customer account foundation and can later connect to real backend auth.',
      })
      router.push('/storefront/account')
    } catch (error) {
      toast({
        title: language === 'ar' ? 'تعذر إنشاء الحساب' : 'Could not create account',
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      })
    }
  })

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'إنشاء حساب عميل' : 'Create customer account'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
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
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
              <Input type="password" {...form.register('password')} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm password'}</Label>
              <Input type="password" {...form.register('confirmPassword')} />
            </div>
            <Button type="submit" className="w-full">
              {language === 'ar' ? 'إنشاء الحساب' : 'Create account'}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
            <Link href="/storefront/login" className="text-primary hover:underline">
              {language === 'ar' ? 'سجّل الدخول' : 'Sign in'}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
