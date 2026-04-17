'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Mail, Store, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/features/localization'
import { toast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

import { useAuth } from '../hooks/useAuth'
import { type RegisterFormValues, registerSchema } from '../schemas/auth.schema'

const requirements = [
  { key: 'length', label: { en: 'At least 8 characters', ar: '8 أحرف على الأقل' } },
] as const

const featureHighlights = [
  {
    en: 'Public registration endpoint with email activation',
    ar: 'تسجيل عام مع تفعيل الحساب عبر البريد الإلكتروني',
  },
  {
    en: 'Store owner role is sent explicitly to the backend',
    ar: 'يتم إرسال دور صاحب المتجر بشكل صريح إلى الـ backend',
  },
  {
    en: 'The frontend does not fake auto-login after registration',
    ar: 'الواجهة لا تفترض تسجيل الدخول تلقائيًا بعد التسجيل',
  },
] as const

export default function RegisterPage() {
  const { t, direction, language, setLanguage } = useLanguage()
  const { register, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  })

  useEffect(() => {
    if (!isAuthenticated || !user) return
    router.replace(user.role === 'super_admin' ? '/admin' : '/dashboard')
  }, [isAuthenticated, router, user])

  const passwordValue = form.watch('password')
  const confirmPasswordValue = form.watch('confirmPassword')

  const passwordChecks = useMemo(
    () => ({
      length: passwordValue.length >= 8,
      match: passwordValue.length > 0 && passwordValue === confirmPasswordValue,
    }),
    [confirmPasswordValue, passwordValue],
  )

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await register({
        username: values.username,
        email: values.email,
        password: values.password,
      })

      toast({
        title: language === 'ar' ? 'تم إنشاء الحساب' : 'Account created',
        description: result.message,
      })

      router.push('/login')
    } catch (error) {
      toast({
        title: language === 'ar' ? 'تعذر إنشاء الحساب' : 'Unable to create account',
        description: error instanceof Error ? error.message : language === 'ar' ? 'يرجى المحاولة مرة أخرى.' : 'Please try again.',
        variant: 'destructive',
      })
    }
  })

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight

  return (
    <div className={cn('min-h-screen flex', direction === 'rtl' && 'flex-row-reverse')}>
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-accent via-accent/90 to-primary lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-t from-accent/80 to-transparent" />
        <div className={cn('relative z-10 flex flex-col justify-between p-12 text-white', direction === 'rtl' && 'text-right')}>
          <Link href="/" className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Store className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">SOUQ ENGINE</span>
          </Link>

          <div className="space-y-8">
            <h1 className="text-4xl font-bold leading-tight">
              {language === 'ar'
                ? 'أنشئ حساب صاحب متجر ثم فعّل البريد الإلكتروني قبل أول تسجيل دخول'
                : 'Create a store-owner account, then activate it by email before your first sign-in'}
            </h1>

            <div className="space-y-4">
              {featureHighlights.map((feature) => (
                <div key={feature.en} className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-4 w-4" />
                  </div>
                  <span>{language === 'ar' ? feature.ar : feature.en}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/80">
            {language === 'ar'
              ? 'هذه الخطوة ترسل طلب التسجيل فقط، وبعدها يؤكد المستخدم الحساب من رسالة التفعيل.'
              : 'This step only creates the account request. The user confirms the account from the activation email.'}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className={cn('flex items-center justify-between p-6', direction === 'rtl' && 'flex-row-reverse')}>
          <div className="lg:hidden">
            <Link href="/" className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">SOUQ ENGINE</span>
            </Link>
          </div>

          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            {language === 'en' ? 'العربية' : 'English'}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            <div className={cn('space-y-2', direction === 'rtl' && 'text-right')}>
              <h2 className="text-2xl font-bold text-foreground">{t('auth.registerTitle')}</h2>
              <p className="text-muted-foreground">
                {language === 'ar'
                  ? 'سيرسل النظام رسالة تفعيل إلى البريد الإلكتروني بعد نجاح التسجيل.'
                  : 'The system will send an activation email after successful registration.'}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className={cn(direction === 'rtl' && 'block text-right')}>
                    {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                  </Label>
                  <div className="relative">
                    <User
                      className={cn(
                        'absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground',
                        direction === 'rtl' ? 'right-3' : 'left-3',
                      )}
                    />
                    <Input
                      id="username"
                      className={cn('h-12', direction === 'rtl' ? 'pr-10 text-right' : 'pl-10')}
                      {...form.register('username')}
                    />
                  </div>
                  {form.formState.errors.username && (
                    <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className={cn(direction === 'rtl' && 'block text-right')}>
                    {t('auth.email')}
                  </Label>
                  <div className="relative">
                    <Mail
                      className={cn(
                        'absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground',
                        direction === 'rtl' ? 'right-3' : 'left-3',
                      )}
                    />
                    <Input
                      id="email"
                      type="email"
                      className={cn('h-12', direction === 'rtl' ? 'pr-10 text-right' : 'pl-10')}
                      {...form.register('email')}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className={cn(direction === 'rtl' && 'block text-right')}>
                    {t('auth.password')}
                  </Label>
                  <div className="relative">
                    <Lock
                      className={cn(
                        'absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground',
                        direction === 'rtl' ? 'right-3' : 'left-3',
                      )}
                    />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={cn('h-12', direction === 'rtl' ? 'pl-10 pr-10 text-right' : 'pl-10 pr-10')}
                      {...form.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground',
                        direction === 'rtl' ? 'left-3' : 'right-3',
                      )}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {passwordValue && (
                    <div className="space-y-1 pt-1">
                      {requirements.map((requirement) => (
                        <div
                          key={requirement.key}
                          className={cn(
                            'flex items-center gap-2 text-xs',
                            direction === 'rtl' && 'flex-row-reverse',
                            passwordChecks[requirement.key] ? 'text-green-600' : 'text-muted-foreground',
                          )}
                        >
                          <Check className={cn('h-3 w-3', !passwordChecks[requirement.key] && 'opacity-30')} />
                          <span>{language === 'ar' ? requirement.label.ar : requirement.label.en}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className={cn(direction === 'rtl' && 'block text-right')}>
                    {t('auth.confirmPassword')}
                  </Label>
                  <div className="relative">
                    <Lock
                      className={cn(
                        'absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground',
                        direction === 'rtl' ? 'right-3' : 'left-3',
                      )}
                    />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={cn(
                        'h-12',
                        direction === 'rtl' ? 'pl-10 pr-10 text-right' : 'pl-10 pr-10',
                        confirmPasswordValue &&
                          (passwordChecks.match
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : 'border-destructive focus-visible:ring-destructive'),
                      )}
                      {...form.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground',
                        direction === 'rtl' ? 'left-3' : 'right-3',
                      )}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className={cn('flex items-start gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                  <Checkbox
                    id="terms"
                    checked={form.watch('agreeToTerms')}
                    onCheckedChange={(checked) => form.setValue('agreeToTerms', checked === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="terms"
                    className={cn('cursor-pointer text-sm font-normal leading-relaxed', direction === 'rtl' && 'text-right')}
                  >
                    {language === 'ar'
                      ? 'أوافق على شروط الاستخدام وسياسة الخصوصية الخاصة بواجهة Souq Engine.'
                      : 'I agree to the Terms of Service and Privacy Policy for the Souq Engine frontend.'}
                  </Label>
                </div>
                {form.formState.errors.agreeToTerms && (
                  <p className="text-sm text-destructive">{form.formState.errors.agreeToTerms.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className={cn('h-12 w-full gap-2 text-base', direction === 'rtl' && 'flex-row-reverse')}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {language === 'ar' ? 'جارٍ إنشاء الحساب...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {t('auth.register')}
                    <ArrowIcon className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <p className={cn('text-center text-sm text-muted-foreground', direction === 'rtl' && 'text-right')}>
              {t('auth.hasAccount')}{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
