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
import { customerLoginSchema, type CustomerLoginFormValues } from '../schemas/storefront.schema'

export default function CustomerLoginPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { login } = useCustomerSession()
  const form = useForm<CustomerLoginFormValues>({
    resolver: zodResolver(customerLoginSchema),
    defaultValues: {
      email: 'lina@example.com',
      password: 'Customer123',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login(values)
      toast({
        title: language === 'ar' ? 'تم تسجيل الدخول' : 'Signed in',
        description:
          language === 'ar'
            ? 'تم فتح جلسة عميل frontend-only ويمكن لاحقاً استبدالها بمصادقة حقيقية.'
            : 'A frontend-only customer session has started and can later be replaced with real auth.',
      })
      router.push('/storefront/account')
    } catch (error) {
      toast({
        title: language === 'ar' ? 'تعذر تسجيل الدخول' : 'Could not sign in',
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      })
    }
  })

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'دخول العميل' : 'Customer sign in'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...form.register('email')} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
              <Input type="password" {...form.register('password')} />
            </div>
            <Button type="submit" className="w-full">
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
            <Link href="/storefront/register" className="text-primary hover:underline">
              {language === 'ar' ? 'أنشئ حساباً' : 'Create one'}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
