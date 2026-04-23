'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  Check,
  Image as ImageIcon,
  Monitor,
  Palette,
  Smartphone,
  Tablet,
  Type,
  Upload,
} from 'lucide-react'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/useToast'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

import { useAppearance, useAppearanceMutations } from '../hooks/useAppearance'

const themes = [
  { id: 'modern', name: 'Modern', description: 'Clean and minimal design', color: '#4F46E5' },
  { id: 'elegant', name: 'Elegant', description: 'Sophisticated and luxurious', color: '#BE185D' },
  { id: 'natural', name: 'Natural', description: 'Organic and earthy tones', color: '#16A34A' },
  { id: 'bold', name: 'Bold', description: 'Vibrant and eye-catching', color: '#DC2626' },
]

const fonts = [
  { id: 'inter', name: 'Inter', preview: 'The quick brown fox' },
  { id: 'playfair', name: 'Playfair Display', preview: 'The quick brown fox' },
  { id: 'space-grotesk', name: 'Space Grotesk', preview: 'The quick brown fox' },
  { id: 'nunito', name: 'Nunito', preview: 'The quick brown fox' },
]

export default function AppearancePage() {
  const { t, direction, language } = useLanguage()
  const { data, isLoading, isError, error } = useAppearance()
  const { updateAppearance, uploadLogo } = useAppearanceMutations()
  const [selectedTheme, setSelectedTheme] = useState('modern')
  const [selectedFont, setSelectedFont] = useState('inter')
  const [primaryColor, setPrimaryColor] = useState('#4F46E5')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!data) {
      return
    }

    setSelectedTheme(data.style)
    setSelectedFont(data.font)
    setPrimaryColor(data.primaryColor)
    setBackgroundColor(data.backgroundColor)
    setLogoUrl(data.logoUrl)
  }, [data])

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />
  }

  if (isError) {
    return (
      <ErrorState
        title={language === 'ar' ? 'تعذر تحميل إعدادات المظهر' : 'Could not load appearance settings'}
        description={error instanceof Error ? error.message : undefined}
      />
    )
  }

  if (!data) {
    return (
      <EmptyState
        title={language === 'ar' ? 'لا توجد إعدادات مظهر بعد' : 'No appearance settings yet'}
        description={
          language === 'ar'
            ? 'ستظهر إعدادات المظهر هنا بعد ربط المتجر.'
            : 'Appearance settings will appear here once the store is connected.'
        }
      />
    )
  }

  const handleSave = async () => {
    try {
      await updateAppearance.mutateAsync({
        primaryColor,
        backgroundColor,
        font: selectedFont,
        style: selectedTheme,
        logoUrl,
      })

      toast({
        title: language === 'ar' ? 'تم حفظ المظهر' : 'Appearance saved',
        description:
          language === 'ar'
            ? 'تم تحديث مظهر المتجر بنجاح.'
            : 'Store appearance has been updated successfully.',
      })
    } catch (saveError) {
      toast({
        title: language === 'ar' ? 'تعذر حفظ المظهر' : 'Could not save appearance',
        description: saveError instanceof Error ? saveError.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const handleLogoPicked = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const asset = await uploadLogo.mutateAsync({
        file,
        alt: 'Store logo',
      })

      setLogoUrl(asset.url)

      toast({
        title: language === 'ar' ? 'تم رفع الشعار' : 'Logo uploaded',
        description:
          language === 'ar'
            ? 'تم رفع الشعار وتحديثه في مظهر المتجر.'
            : 'The logo was uploaded and linked to the store appearance.',
      })
    } catch (uploadError) {
      toast({
        title: language === 'ar' ? 'تعذر رفع الشعار' : 'Could not upload logo',
        description: uploadError instanceof Error ? uploadError.message : undefined,
        variant: 'destructive',
      })
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div
        className={cn(
          'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
          direction === 'rtl' && 'md:flex-row-reverse',
        )}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('appearance.title')}</h1>
          <p className="text-muted-foreground">Customize your store&apos;s look and feel</p>
        </div>
        <Button className="gap-2" onClick={() => void handleSave()} disabled={updateAppearance.isPending}>
          <Check className="h-4 w-4" />
          {t('common.save')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                <Palette className="h-5 w-5" />
                {t('appearance.theme')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme.id)
                      setPrimaryColor(theme.color)
                    }}
                    className={cn(
                      'relative rounded-xl border-2 p-4 text-start transition-all',
                      selectedTheme === theme.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30',
                    )}
                  >
                    {selectedTheme === theme.id ? (
                      <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    ) : null}
                    <div className="mb-3 h-8 w-8 rounded-lg" style={{ backgroundColor: theme.color }} />
                    <p className="font-medium text-foreground">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                <Palette className="h-5 w-5" />
                Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn('flex items-center justify-between', direction === 'rtl' && 'flex-row-reverse')}>
                <div>
                  <p className="font-medium text-foreground">{t('appearance.primaryColor')}</p>
                  <p className="text-sm text-muted-foreground">Main brand color</p>
                </div>
                <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                  <Input
                    type="color"
                    value={primaryColor}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    className="h-10 w-12 cursor-pointer p-1"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    className="w-24 font-mono text-sm"
                  />
                </div>
              </div>
              <div className={cn('flex items-center justify-between', direction === 'rtl' && 'flex-row-reverse')}>
                <div>
                  <p className="font-medium text-foreground">{t('appearance.backgroundColor')}</p>
                  <p className="text-sm text-muted-foreground">Page background</p>
                </div>
                <div className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(event) => setBackgroundColor(event.target.value)}
                    className="h-10 w-12 cursor-pointer p-1"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(event) => setBackgroundColor(event.target.value)}
                    className="w-24 font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                <Type className="h-5 w-5" />
                {t('appearance.font')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fonts.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border p-4 transition-all',
                      direction === 'rtl' && 'flex-row-reverse',
                      selectedFont === font.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30',
                    )}
                  >
                    <div className={cn('flex items-center gap-3', direction === 'rtl' && 'flex-row-reverse')}>
                      {selectedFont === font.id ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      ) : null}
                      <span className="font-medium text-foreground">{font.name}</span>
                    </div>
                    <span className="text-muted-foreground">{font.preview}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                <ImageIcon className="h-5 w-5" />
                {t('appearance.logo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleLogoPicked(event)}
              />
              <div
                className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/30"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
              >
                <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  {logoUrl
                    ? language === 'ar'
                      ? 'اضغط لتغيير الشعار'
                      : 'Click to replace logo'
                    : language === 'ar'
                      ? 'ارفع شعار المتجر'
                      : 'Upload your store logo'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG or SVG</p>
                {logoUrl ? (
                  <div className="mt-4 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Store logo" className="max-h-20 rounded-lg border border-border bg-white p-2" />
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader>
              <div className={cn('flex items-center justify-between', direction === 'rtl' && 'flex-row-reverse')}>
                <CardTitle className={cn('flex items-center gap-2', direction === 'rtl' && 'flex-row-reverse')}>
                  <Monitor className="h-5 w-5" />
                  {t('appearance.preview')}
                </CardTitle>
                <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewMode('tablet')}
                  >
                    <Tablet className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'mx-auto overflow-hidden rounded-lg border border-border shadow-lg transition-all',
                  previewMode === 'desktop' && 'w-full',
                  previewMode === 'tablet' && 'w-80',
                  previewMode === 'mobile' && 'w-48',
                )}
                style={{ backgroundColor }}
              >
                <div className="p-4 text-white" style={{ backgroundColor: primaryColor }}>
                  <p className="font-bold text-lg">My Store</p>
                  {logoUrl ? (
                    <div className="mt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoUrl} alt="Store logo preview" className="h-10 rounded-md bg-white/90 p-1" />
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4 p-4">
                  <div className="text-center">
                    <h2 className="mb-2 text-xl font-bold" style={{ color: primaryColor }}>
                      Welcome to Our Store
                    </h2>
                    <p className="text-sm text-gray-600">Discover amazing products</p>
                  </div>

                  <div className={cn('grid gap-2', previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="rounded-lg border bg-white p-3 shadow-sm">
                        <div className="mb-2 aspect-square rounded bg-gray-100" />
                        <div className="mb-1 h-3 w-3/4 rounded bg-gray-200" />
                        <div className="h-3 w-1/2 rounded" style={{ backgroundColor: `${primaryColor}40` }} />
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full rounded-lg py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: primaryColor, fontFamily: selectedFont }}
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
