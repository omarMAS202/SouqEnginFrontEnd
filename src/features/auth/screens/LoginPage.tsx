'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Store } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useLanguage } from '@/features/localization'
import { toast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'

import { useAuth } from '../hooks/useAuth'
import { type LoginFormValues, loginSchema } from '../schemas/auth.schema'

export default function LoginPage() {
  const { t, direction, language, setLanguage } = useLanguage()
  const { login, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'owner@souqengine.com',
      password: 'Owner123',
    },
  })

  useEffect(() => {
    if (!isAuthenticated || !user) return
    router.replace(user.role === 'admin' ? '/admin' : '/dashboard')
  }, [isAuthenticated, router, user])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const loggedInUser = await login(values)
      toast({
        title: language === 'ar' ? 'تم تسجيل الدخول' : 'Signed in successfully',
        description:
          language === 'ar'
            ? `مرحباً بعودتك يا ${loggedInUser.fullName}.`
            : `Welcome back, ${loggedInUser.fullName}.`,
      })
      router.push(loggedInUser.role === 'admin' ? '/admin' : '/dashboard')
    } catch (error) {
      toast({
        title: language === 'ar' ? 'تعذر تسجيل الدخول' : 'Unable to sign in',
        description:
          error instanceof Error ? error.message : language === 'ar' ? 'يرجى المحاولة مرة أخرى.' : 'Please try again.',
        variant: 'destructive',
      })
    }
  })

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight

  return (
    <div className={cn('min-h-screen flex', direction === 'rtl' && 'flex-row-reverse')}>
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div
          className={cn(
            'relative z-10 flex flex-col justify-between p-12 text-primary-foreground',
            direction === 'rtl' && 'text-right',
          )}
        >
          <Link href="/" className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Store className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">SOUQ ENGINE</span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              {language === 'ar'
                ? 'أنشئ متجرك الإلكتروني خلال دقائق بمساعدة الذكاء الاصطناعي'
                : 'Build your e-commerce store in minutes with AI'}
            </h1>
            <p className="text-lg text-primary-foreground/80">
              {language === 'ar'
                ? 'واجهة جاهزة للتكامل مع أنظمة المتجر، إدارة المنتجات، والطلبات دون تشتيت.'
                : 'An integration-ready storefront workspace for products, orders, and store operations.'}
            </p>
          </div>

          <div className={cn('flex items-center gap-4', direction === 'rtl' && 'flex-row-reverse')}>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((value) => (
                <div
                  key={value}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white/20 text-xs font-medium"
                >
                  {String.fromCharCode(64 + value)}
                </div>
              ))}
            </div>
            <p className="text-sm text-primary-foreground/80">
              {language === 'ar' ? 'مساحة عمل جاهزة للفريق والربط الخلفي' : 'Built for fast team handoff and backend integration'}
            </p>
          </div>
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
          <div className="w-full max-w-md space-y-8">
            <div className={cn('space-y-2', direction === 'rtl' && 'text-right')}>
              <h2 className="text-2xl font-bold text-foreground">{t('auth.loginTitle')}</h2>
              <p className="text-muted-foreground">{t('auth.loginSubtitle')}</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-4">
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
                      placeholder="name@example.com"
                      className={cn('h-12', direction === 'rtl' ? 'pr-10 text-right' : 'pl-10')}
                      {...form.register('email')}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className={cn('flex items-center justify-between', direction === 'rtl' && 'flex-row-reverse')}>
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <span className="text-sm text-muted-foreground">
                      {language === 'ar'
                        ? 'استعادة كلمة المرور تتطلب ربط backend لاحقاً'
                        : 'Password recovery will be enabled after backend integration'}
                    </span>
                  </div>
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
                      placeholder="********"
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
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="cursor-pointer text-sm font-normal">
                    {t('auth.rememberMe')}
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className={cn('h-12 w-full gap-2 text-base', direction === 'rtl' && 'flex-row-reverse')}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {language === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    {t('auth.login')}
                    <ArrowIcon className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <p className={cn('text-center text-sm text-muted-foreground', direction === 'rtl' && 'text-right')}>
              {t('auth.noAccount')}{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                {t('auth.register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
