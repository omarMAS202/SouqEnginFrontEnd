'use client'

import { Bell, Globe, Mail, Save, Shield, Store, Globe2, Rocket, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'

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
import { useCurrentStoreBootstrap } from '@/features/auth/hooks/useUserStores'
import { useLanguage } from '@/features/localization'
import { toast } from '@/hooks/useToast'
import type { StoreSettings } from '@/types/models'
import { cn } from '@/utils/cn'

import { useStoreDomains, useStoreManagementMutations, useStoreSettings, useStoreSettingsMutation } from '../hooks/useDashboard'
import { dashboardService } from '../services/dashboard.service'
import type { StoreDomainModel } from '../types/dashboard.contracts'

const sections = [
  { id: 'general', icon: Store, title: { en: 'General', ar: 'عام' } },
  { id: 'localization', icon: Globe, title: { en: 'Localization', ar: 'اللغة والمنطقة' } },
  { id: 'notifications', icon: Bell, title: { en: 'Notifications', ar: 'الإشعارات' } },
  { id: 'publishing', icon: Rocket, title: { en: 'Publishing', ar: 'النشر' } },
  { id: 'domains', icon: Globe2, title: { en: 'Domains', ar: 'الدومينات' } },
  { id: 'security', icon: Shield, title: { en: 'Security', ar: 'الأمان' } },
] as const

type ActiveSection = (typeof sections)[number]['id']

type StoreDraft = {
  name: string
  slug: string
  description: string
  status: 'active' | 'inactive' | 'draft' | 'setup'
}

type DomainDraft = {
  domain: string
  isPrimary: boolean
}

export default function SettingsPage() {
  const { t, direction, language } = useLanguage()
  const { data, isLoading, isError, error } = useStoreSettings()
  const { data: storeBootstrap } = useCurrentStoreBootstrap()
  const { data: domains = [], isLoading: domainsLoading } = useStoreDomains()
  const saveSettings = useStoreSettingsMutation()
  const storeMutations = useStoreManagementMutations()

  const [activeSection, setActiveSection] = useState<ActiveSection>('general')
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [storeDraft, setStoreDraft] = useState<StoreDraft | null>(null)
  const [subdomain, setSubdomain] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [newDomainPrimary, setNewDomainPrimary] = useState(false)
  const [domainDrafts, setDomainDrafts] = useState<Record<string, DomainDraft>>({})
  const [slugCheckResult, setSlugCheckResult] = useState<{ slug: string; available: boolean } | null>(null)
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([])
  const currentStore = storeBootstrap?.store ?? null
  const canSavePageSettings =
    activeSection === 'general' ||
    activeSection === 'localization' ||
    activeSection === 'notifications' ||
    activeSection === 'security'

  useEffect(() => {
    if (data) {
      setSettings(data)
    }
  }, [data])

  useEffect(() => {
    if (!currentStore) {
      return
    }

    setStoreDraft({
      name: currentStore.name,
      slug: currentStore.slug,
      description: currentStore.description ?? '',
      status: currentStore.status ?? 'draft',
    })
    setSubdomain(currentStore.subdomain ?? '')
  }, [currentStore])

  useEffect(() => {
    setDomainDrafts(
      Object.fromEntries(
        domains.map((domain) => [
          domain.id,
          {
            domain: domain.domain,
            isPrimary: domain.isPrimary,
          },
        ]),
      ),
    )
  }, [domains])

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
            ? 'ستظهر هنا إعدادات المتجر فور توفر بياناته.'
            : 'Store settings will appear here as soon as the store data is available.'
        }
      />
    )
  }

  const handleSaveSettings = async () => {
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

  const handleSaveStoreDraft = async () => {
    if (!storeDraft) {
      return
    }

    try {
      await storeMutations.patchStore.mutateAsync({
        name: storeDraft.name,
        slug: storeDraft.slug,
        description: storeDraft.description,
        status: storeDraft.status,
      })

      toast({
        title: language === 'ar' ? 'تم تحديث بيانات المتجر' : 'Store details updated',
        description:
          language === 'ar'
            ? 'تم تحديث الاسم والوصف والـ slug والحالة.'
            : 'Store profile, slug, and status were updated.',
      })
    } catch (saveError) {
      toast({
        title: language === 'ar' ? 'تعذر تحديث بيانات المتجر' : 'Could not update store details',
        description: saveError instanceof Error ? saveError.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handleCheckSlug = async () => {
    if (!storeDraft?.slug.trim()) {
      return
    }

    try {
      const result = await dashboardService.checkSlug(storeDraft.slug.trim(), currentStore?.store_id ?? null)
      setSlugCheckResult(result)
    } catch (checkError) {
      toast({
        title: language === 'ar' ? 'تعذر فحص الـ slug' : 'Could not check slug',
        description: checkError instanceof Error ? checkError.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handleSuggestSlugs = async () => {
    if (!storeDraft?.name.trim()) {
      return
    }

    try {
      const result = await dashboardService.suggestSlugs(storeDraft.name.trim(), currentStore?.store_id ?? null, 5)
      setSlugSuggestions(result.suggestions)
    } catch (suggestError) {
      toast({
        title: language === 'ar' ? 'تعذر اقتراح Slugs' : 'Could not suggest slugs',
        description: suggestError instanceof Error ? suggestError.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handleSetSubdomain = async () => {
    try {
      await storeMutations.setSubdomain.mutateAsync(subdomain.trim())
      toast({
        title: language === 'ar' ? 'تم تحديث الـ subdomain' : 'Subdomain updated',
        description:
          language === 'ar'
            ? 'تم حفظ الـ subdomain بنجاح.'
            : 'The store subdomain was updated successfully.',
      })
    } catch (saveError) {
      toast({
        title: language === 'ar' ? 'تعذر تحديث الـ subdomain' : 'Could not update subdomain',
        description: saveError instanceof Error ? saveError.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handlePublish = async (action: 'publish' | 'unpublish') => {
    try {
      await storeMutations.publishStore.mutateAsync(action)
      toast({
        title: action === 'publish'
          ? language === 'ar' ? 'تم تنفيذ النشر' : 'Publish action completed'
          : language === 'ar' ? 'تم إلغاء النشر' : 'Unpublish action completed',
        description:
          action === 'publish'
            ? language === 'ar'
              ? 'تم إرسال طلب النشر للباك.'
              : 'The publish request was sent successfully.'
            : language === 'ar'
              ? 'تم إرسال طلب إلغاء النشر للباك.'
              : 'The unpublish request was sent successfully.',
      })
    } catch (publishError) {
      toast({
        title: language === 'ar' ? 'تعذر تنفيذ عملية النشر' : 'Could not change publish state',
        description: publishError instanceof Error ? publishError.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handleCreateDomain = async () => {
    try {
      await storeMutations.createDomain.mutateAsync({
        domain: newDomain.trim(),
        isPrimary: newDomainPrimary,
      })

      setNewDomain('')
      setNewDomainPrimary(false)
      toast({
        title: language === 'ar' ? 'تمت إضافة الدومين' : 'Domain added',
        description:
          language === 'ar'
            ? 'تم إنشاء الدومين الجديد بنجاح.'
            : 'The new domain was created successfully.',
      })
    } catch (createError) {
      toast({
        title: language === 'ar' ? 'تعذر إضافة الدومين' : 'Could not add domain',
        description: createError instanceof Error ? createError.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handleUpdateDomain = async (domainId: string) => {
    const draft = domainDrafts[domainId]

    if (!draft) {
      return
    }

    try {
      await storeMutations.patchDomain.mutateAsync({
        domainId,
        input: {
          domain: draft.domain.trim(),
          isPrimary: draft.isPrimary,
        },
      })

      toast({
        title: language === 'ar' ? 'تم تحديث الدومين' : 'Domain updated',
        description:
          language === 'ar'
            ? 'تم تحديث بيانات الدومين بنجاح.'
            : 'The domain was updated successfully.',
      })
    } catch (updateError) {
      toast({
        title: language === 'ar' ? 'تعذر تحديث الدومين' : 'Could not update domain',
        description: updateError instanceof Error ? updateError.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteDomain = async (domainId: string) => {
    const confirmed = window.confirm(
      language === 'ar' ? 'هل تريد حذف هذا الدومين؟' : 'Do you want to delete this domain?',
    )

    if (!confirmed) {
      return
    }

    try {
      await storeMutations.deleteDomain.mutateAsync(domainId)
      toast({
        title: language === 'ar' ? 'تم حذف الدومين' : 'Domain deleted',
        description:
          language === 'ar'
            ? 'تم حذف الدومين بنجاح.'
            : 'The domain was deleted successfully.',
      })
    } catch (deleteError) {
      toast({
        title: language === 'ar' ? 'تعذر حذف الدومين' : 'Could not delete domain',
        description: deleteError instanceof Error ? deleteError.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteStore = async () => {
    const confirmed = window.confirm(
      language === 'ar'
        ? 'سيتم حذف المتجر الحالي نهائيًا. هل تريد المتابعة؟'
        : 'The current store will be permanently deleted. Continue?',
    )

    if (!confirmed) {
      return
    }

    try {
      await storeMutations.deleteStore.mutateAsync()
    } catch (deleteError) {
      toast({
        title: language === 'ar' ? 'تعذر حذف المتجر' : 'Could not delete store',
        description: deleteError instanceof Error ? deleteError.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const renderDomainRow = (domain: StoreDomainModel) => {
    const draft = domainDrafts[domain.id] ?? {
      domain: domain.domain,
      isPrimary: domain.isPrimary,
    }

    return (
      <div
        key={domain.id}
        className={cn(
          'space-y-3 rounded-xl border border-border p-4',
          direction === 'rtl' && 'text-right',
        )}
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <Input
            value={draft.domain}
            onChange={(event) =>
              setDomainDrafts((current) => ({
                ...current,
                [domain.id]: {
                  ...draft,
                  domain: event.target.value,
                },
              }))
            }
          />
          <div className={cn('flex items-center gap-2 rounded-lg border border-border px-3', direction === 'rtl' && 'flex-row-reverse')}>
            <Switch
              checked={draft.isPrimary}
              onCheckedChange={(checked) =>
                setDomainDrafts((current) => ({
                  ...current,
                  [domain.id]: {
                    ...draft,
                    isPrimary: checked,
                  },
                }))
              }
            />
            <span className="text-sm text-muted-foreground">
              {language === 'ar' ? 'أساسي' : 'Primary'}
            </span>
          </div>
          <div className={cn('flex gap-2', direction === 'rtl' && 'flex-row-reverse')}>
            <Button variant="outline" onClick={() => void handleUpdateDomain(domain.id)}>
              {language === 'ar' ? 'حفظ' : 'Save'}
            </Button>
            <Button variant="destructive" onClick={() => void handleDeleteDomain(domain.id)}>
              {language === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {domain.isPrimary
            ? language === 'ar'
              ? 'هذا هو الدومين الأساسي الحالي.'
              : 'This is currently the primary domain.'
            : domain.createdAt ?? ''}
        </p>
      </div>
    )
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
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                  <SelectItem value="Asia/Riyadh">Asia/Riyadh</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'اللغة' : 'Language'}</Label>
              <Select value={settings.language} onValueChange={(value: 'en' | 'ar') => setSettings({ ...settings, language: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
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
                <p className="font-medium">{label}</p>
                <Switch
                  checked={settings[key as keyof StoreSettings] as boolean}
                  onCheckedChange={(checked) => setSettings({ ...settings, [key]: checked })}
                />
              </div>
            ))}
          </div>
        )
      case 'publishing':
        return storeDraft ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-border p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {language === 'ar' ? 'بيانات المتجر الأساسية' : 'Core store metadata'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar'
                      ? 'هذه البيانات تُحدّث عبر endpoint المتجر مباشرة.'
                      : 'These fields are updated through the store update endpoint.'}
                  </p>
                </div>
                <Button onClick={() => void handleSaveStoreDraft()} disabled={storeMutations.patchStore.isPending}>
                  {language === 'ar' ? 'حفظ بيانات المتجر' : 'Save store details'}
                </Button>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اسم المتجر' : 'Store name'}</Label>
                  <Input value={storeDraft.name} onChange={(event) => setStoreDraft({ ...storeDraft, name: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <div className="flex gap-2">
                    <Input value={storeDraft.slug} onChange={(event) => setStoreDraft({ ...storeDraft, slug: event.target.value })} />
                    <Button variant="outline" onClick={() => void handleCheckSlug()}>
                      {language === 'ar' ? 'فحص' : 'Check'}
                    </Button>
                    <Button variant="outline" onClick={() => void handleSuggestSlugs()}>
                      {language === 'ar' ? 'اقتراح' : 'Suggest'}
                    </Button>
                  </div>
                  {slugCheckResult ? (
                    <p className={cn('text-sm', slugCheckResult.available ? 'text-emerald-600' : 'text-destructive')}>
                      {slugCheckResult.available
                        ? language === 'ar'
                          ? 'هذا الـ slug متاح.'
                          : 'This slug is available.'
                        : language === 'ar'
                          ? 'هذا الـ slug مستخدم.'
                          : 'This slug is already in use.'}
                    </p>
                  ) : null}
                  {slugSuggestions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {slugSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setStoreDraft({ ...storeDraft, slug: suggestion })}
                          className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                  <Textarea
                    rows={3}
                    value={storeDraft.description}
                    onChange={(event) => setStoreDraft({ ...storeDraft, description: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
                  <Select
                    value={storeDraft.status}
                    onValueChange={(value: StoreDraft['status']) => setStoreDraft({ ...storeDraft, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="setup">setup</SelectItem>
                      <SelectItem value="draft">draft</SelectItem>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="inactive">inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border p-5">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">
                  {language === 'ar' ? 'Subdomain والنشر' : 'Subdomain and publishing'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar'
                    ? 'يمكنك تحديث الـ subdomain ثم تنفيذ النشر أو إلغاءه.'
                    : 'Update the store subdomain, then publish or unpublish the store.'}
                </p>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Subdomain</Label>
                  <div className="flex gap-2">
                    <Input value={subdomain} onChange={(event) => setSubdomain(event.target.value)} />
                    <Button variant="outline" onClick={() => void handleSetSubdomain()} disabled={storeMutations.setSubdomain.isPending}>
                      {language === 'ar' ? 'حفظ' : 'Save'}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => void handlePublish('publish')} disabled={storeMutations.publishStore.isPending}>
                    {language === 'ar' ? 'نشر المتجر' : 'Publish store'}
                  </Button>
                  <Button variant="outline" onClick={() => void handlePublish('unpublish')} disabled={storeMutations.publishStore.isPending}>
                    {language === 'ar' ? 'إلغاء النشر' : 'Unpublish'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title={language === 'ar' ? 'لا توجد بيانات متجر' : 'No store metadata'}
            description={language === 'ar' ? 'تعذر تحميل بيانات المتجر الحالية.' : 'Current store metadata could not be loaded.'}
          />
        )
      case 'domains':
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-border p-5">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">
                  {language === 'ar' ? 'إضافة دومين جديد' : 'Add a new domain'}
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
                <Input
                  value={newDomain}
                  onChange={(event) => setNewDomain(event.target.value)}
                  placeholder={language === 'ar' ? 'example.com' : 'example.com'}
                />
                <div className={cn('flex items-center gap-2 rounded-lg border border-border px-3', direction === 'rtl' && 'flex-row-reverse')}>
                  <Switch checked={newDomainPrimary} onCheckedChange={setNewDomainPrimary} />
                  <span className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'أساسي' : 'Primary'}
                  </span>
                </div>
                <Button onClick={() => void handleCreateDomain()} disabled={storeMutations.createDomain.isPending || !newDomain.trim()}>
                  {language === 'ar' ? 'إضافة' : 'Add'}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {domainsLoading ? (
                <LoadingState message={t('common.loading')} />
              ) : domains.length === 0 ? (
                <EmptyState
                  title={language === 'ar' ? 'لا توجد دومينات بعد' : 'No domains yet'}
                  description={
                    language === 'ar'
                      ? 'أضف أول دومين ليظهر هنا.'
                      : 'Add your first domain to manage it here.'
                  }
                />
              ) : (
                domains.map((domain) => renderDomainRow(domain))
              )}
            </div>
          </div>
        )
      case 'security':
        return (
          <div className="space-y-6">
            <div className={cn('flex items-center justify-between rounded-lg border border-border p-4', direction === 'rtl' && 'flex-row-reverse')}>
              <div className={cn(direction === 'rtl' && 'text-right')}>
                <p className="font-medium">{language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar'
                    ? 'أضف طبقة حماية إضافية إلى الحساب.'
                    : 'Add an extra layer of protection to the account.'}
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
              />
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
              <div className="mb-4">
                <h3 className="font-semibold text-destructive">
                  {language === 'ar' ? 'منطقة خطرة' : 'Danger zone'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar'
                    ? 'إذا كان لديك متجر آخر سنحوّلك إليه، وإلا ستنتهي الجلسة الحالية.'
                    : 'If you own another store, you will be switched to it. Otherwise, the current session will end.'}
                </p>
              </div>
              <Button variant="destructive" onClick={() => void handleDeleteStore()} disabled={storeMutations.deleteStore.isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'حذف المتجر' : 'Delete store'}
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className={cn('flex flex-col justify-between gap-4 sm:flex-row sm:items-center', direction === 'rtl' && 'sm:flex-row-reverse')}>
        <div className={cn(direction === 'rtl' && 'text-right')}>
          <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'إدارة إعدادات وربط ونشر المتجر' : 'Manage store settings, domains, and publishing'}
          </p>
        </div>
        {canSavePageSettings ? (
          <Button
            onClick={() => void handleSaveSettings()}
            disabled={saveSettings.isPending}
            className={cn('gap-2', direction === 'rtl' && 'flex-row-reverse')}
          >
            <Save className="h-4 w-4" />
            {saveSettings.isPending ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : t('common.save')}
          </Button>
        ) : null}
      </div>

      {currentStore ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{language === 'ar' ? 'اسم المتجر' : 'Store name'}</p>
            <p className="mt-1 font-semibold text-foreground">{currentStore.name}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Slug</p>
            <p className="mt-1 font-semibold text-foreground">{currentStore.slug}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Subdomain</p>
            <p className="mt-1 font-semibold text-foreground">{currentStore.subdomain || '—'}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الحالة' : 'Status'}</p>
            <p className="mt-1 font-semibold text-foreground">{currentStore.status ?? 'draft'}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الدومينات' : 'Domains'}</p>
            <p className="mt-1 font-semibold text-foreground">{domains.length}</p>
          </div>
        </div>
      ) : null}

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
