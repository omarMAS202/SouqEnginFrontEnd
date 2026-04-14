'use client'

import { Bell, CreditCard, Globe, Mail, Save, Shield, Store, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useLanguage } from '@/features/localization'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/useToast'
import type { StoreSettings } from '@/types/models'
import { cn } from '@/utils/cn'

import { useStoreSettings, useStoreSettingsMutation } from '../hooks/useDashboard'

const sections = [
  { id: 'general', icon: Store, title: { en: 'General', ar: 'عام' } },
  { id: 'localization', icon: Globe, title: { en: 'Localization', ar: 'اللغة والمنطقة' } },
  { id: 'notifications', icon: Bell, title: { en: 'Notifications', ar: 'الإشعارات' } },
  { id: 'shipping', icon: Truck, title: { en: 'Shipping', ar: 'الشحن' } },
  { id: 'payments', icon: CreditCard, title: { en: 'Payments', ar: 'المدفوعات' } },
  { id: 'security', icon: Shield, title: { en: 'Security', ar: 'الأمان' } },
] as const

export default function SettingsPage() {
  const { t, direction, language } = useLanguage()
  const { data, isLoading, isError, error } = useStoreSettings()
  const saveSettings = useStoreSettingsMutation()
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]['id']>('general')
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  useEffect(() => {
    if (data) setSettings(data)
  }, [data])

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />
  }

  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل إعدادات المتجر' : 'Could not load store settings'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  if (!settings) {
    return (
      <EmptyState
        title={language === 'ar' ? 'لا توجد إعدادات متاحة' : 'No settings available'}
        description={
          language === 'ar'
            ? 'يمكن ربط هذه الصفحة بإعدادات المتجر فور توفر نقطة التكامل الخلفية.'
            : 'This screen can connect to store settings as soon as the backend endpoint is available.'
        }
      />
    )
  }

  const handleSave = async () => {
    try {
      await saveSettings.mutateAsync(settings)
      toast({
        title: language === 'ar' ? 'تم حفظ الإعدادات' : 'Settings saved',
        description:
          language === 'ar'
            ? 'تم تحديث إعدادات المتجر بنجاح.'
            : 'Your store settings were updated successfully.',
      })
    } catch (saveError) {
      toast({
        title: language === 'ar' ? 'تعذر حفظ الإعدادات' : 'Could not save settings',
        description: saveError instanceof Error ? saveError.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={cn(direction === 'rtl' && 'block text-right')}>{t('settings.storeName')}</Label>
              <Input
                value={settings.storeName}
                onChange={(event) => setSettings({ ...settings, storeName: event.target.value })}
                className={cn(direction === 'rtl' && 'text-right')}
              />
            </div>
            <div className="space-y-2">
              <Label className={cn(direction === 'rtl' && 'block text-right')}>{t('settings.storeUrl')}</Label>
              <Input
                value={settings.storeUrl}
                onChange={(event) => setSettings({ ...settings, storeUrl: event.target.value })}
                className={cn(direction === 'rtl' && 'text-right')}
              />
            </div>
            <div className="space-y-2">
              <Label className={cn(direction === 'rtl' && 'block text-right')}>
                {language === 'ar' ? 'وصف المتجر' : 'Store Description'}
              </Label>
              <Textarea
                rows={3}
                value={settings.storeDescription}
                onChange={(event) => setSettings({ ...settings, storeDescription: event.target.value })}
                className={cn(direction === 'rtl' && 'text-right')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                <div className="relative">
                  <Mail
                    className={cn(
                      'absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
                      direction === 'rtl' ? 'right-3' : 'left-3',
                    )}
                  />
                  <Input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(event) => setSettings({ ...settings, storeEmail: event.target.value })}
                    className={cn(direction === 'rtl' ? 'pr-9 text-right' : 'pl-9')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الهاتف' : 'Phone'}</Label>
                <Input
                  type="tel"
                  value={settings.storePhone}
                  onChange={(event) => setSettings({ ...settings, storePhone: event.target.value })}
                  className={cn(direction === 'rtl' && 'text-right')}
                />
              </div>
            </div>
          </div>
        )
      case 'localization':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('settings.currency')}</Label>
              <Select value={settings.currency} onValueChange={(value) => setSettings({ ...settings, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('settings.timezone')}</Label>
              <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                  <SelectItem value="Asia/Riyadh">Asia/Riyadh</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 'notifications':
        return (
          <div className="space-y-4">
            {[
              ['emailNotifications', language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'],
              ['orderNotifications', language === 'ar' ? 'إشعارات الطلبات' : 'Order Notifications'],
              ['marketingNotifications', language === 'ar' ? 'تحديثات التسويق' : 'Marketing Updates'],
            ].map(([key, label]) => (
              <div
                key={key}
                className={cn('flex items-center justify-between rounded-lg border border-border p-4', direction === 'rtl' && 'flex-row-reverse')}
              >
                <div className={cn(direction === 'rtl' && 'text-right')}>
                  <p className="font-medium">{label}</p>
                </div>
                <Switch
                  checked={settings[key as keyof StoreSettings] as boolean}
                  onCheckedChange={(checked) => setSettings({ ...settings, [key]: checked })}
                />
              </div>
            ))}
          </div>
        )
      case 'security':
        return (
          <div className={cn('flex items-center justify-between rounded-lg border border-border p-4', direction === 'rtl' && 'flex-row-reverse')}>
            <div className={cn(direction === 'rtl' && 'text-right')}>
              <p className="font-medium">{language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</p>
              <p className="text-sm text-muted-foreground">
                {language === 'ar'
                  ? 'أضف طبقة إضافية من الأمان إلى حسابك'
                  : 'Add an extra layer of security to your account'}
              </p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
            />
          </div>
        )
      default:
        return (
          <div className="rounded-lg border border-border p-6 text-muted-foreground">
            {language === 'ar'
              ? 'يمكنك توصيل هذه الإعدادات مع الـ backend لاحقاً.'
              : 'You can connect this section to the backend next.'}
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className={cn('flex flex-col justify-between gap-4 sm:flex-row sm:items-center', direction === 'rtl' && 'sm:flex-row-reverse')}>
        <div className={cn(direction === 'rtl' && 'text-right')}>
          <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'إدارة إعدادات متجرك' : 'Manage your store settings'}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveSettings.isPending}
          className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}
        >
          <Save className="h-4 w-4" />
          {saveSettings.isPending ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : t('common.save')}
        </Button>
      </div>

      <div className={cn('flex flex-col gap-6 lg:flex-row', direction === 'rtl' && 'lg:flex-row-reverse')}>
        <div className="w-full shrink-0 lg:w-64">
          <nav className="space-y-1 rounded-xl border border-border bg-card p-2">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    direction === 'rtl' && 'flex-row-reverse text-right',
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {language === 'ar' ? section.title.ar : section.title.en}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex-1 rounded-xl border border-border bg-card p-6">{renderSection()}</div>
      </div>
    </div>
  )
}
