'use client'

import { useState } from 'react'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Palette,
  Type,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Tablet,
  Check,
  Upload
} from 'lucide-react'

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
  const { t, direction } = useLanguage()
  const [selectedTheme, setSelectedTheme] = useState('modern')
  const [selectedFont, setSelectedFont] = useState('inter')
  const [primaryColor, setPrimaryColor] = useState('#4F46E5')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
        direction === 'rtl' && "md:flex-row-reverse"
      )}>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('appearance.title')}</h1>
          <p className="text-muted-foreground">Customize your store&apos;s look and feel</p>
        </div>
        <Button className="gap-2">
          <Check className="w-4 h-4" />
          {t('common.save')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings */}
        <div className="space-y-6">
          {/* Theme Selection */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", direction === 'rtl' && "flex-row-reverse")}>
                <Palette className="w-5 h-5" />
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
                      "relative p-4 rounded-xl border-2 transition-all text-start",
                      selectedTheme === theme.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    {selectedTheme === theme.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div 
                      className="w-8 h-8 rounded-lg mb-3"
                      style={{ backgroundColor: theme.color }}
                    />
                    <p className="font-medium text-foreground">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", direction === 'rtl' && "flex-row-reverse")}>
                <Palette className="w-5 h-5" />
                Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn("flex items-center justify-between", direction === 'rtl' && "flex-row-reverse")}>
                <div>
                  <p className="font-medium text-foreground">{t('appearance.primaryColor')}</p>
                  <p className="text-sm text-muted-foreground">Main brand color</p>
                </div>
                <div className={cn("flex items-center gap-2", direction === 'rtl' && "flex-row-reverse")}>
                  <Input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-24 font-mono text-sm"
                  />
                </div>
              </div>
              <div className={cn("flex items-center justify-between", direction === 'rtl' && "flex-row-reverse")}>
                <div>
                  <p className="font-medium text-foreground">{t('appearance.backgroundColor')}</p>
                  <p className="text-sm text-muted-foreground">Page background</p>
                </div>
                <div className={cn("flex items-center gap-2", direction === 'rtl' && "flex-row-reverse")}>
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-24 font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", direction === 'rtl' && "flex-row-reverse")}>
                <Type className="w-5 h-5" />
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
                      "w-full flex items-center justify-between p-4 rounded-lg border transition-all",
                      direction === 'rtl' && "flex-row-reverse",
                      selectedFont === font.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className={cn("flex items-center gap-3", direction === 'rtl' && "flex-row-reverse")}>
                      {selectedFont === font.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <span className="font-medium text-foreground">{font.name}</span>
                    </div>
                    <span className="text-muted-foreground">{font.preview}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", direction === 'rtl' && "flex-row-reverse")}>
                <ImageIcon className="w-5 h-5" />
                {t('appearance.logo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium text-foreground">Drop your logo here</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or SVG (max 2MB)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader>
              <div className={cn("flex items-center justify-between", direction === 'rtl' && "flex-row-reverse")}>
                <CardTitle className={cn("flex items-center gap-2", direction === 'rtl' && "flex-row-reverse")}>
                  <Monitor className="w-5 h-5" />
                  {t('appearance.preview')}
                </CardTitle>
                <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="w-3 h-3" />
                  </Button>
                  <Button
                    variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewMode('tablet')}
                  >
                    <Tablet className="w-3 h-3" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className={cn(
                  "mx-auto rounded-lg overflow-hidden border border-border shadow-lg transition-all",
                  previewMode === 'desktop' && "w-full",
                  previewMode === 'tablet' && "w-80",
                  previewMode === 'mobile' && "w-48"
                )}
                style={{ backgroundColor }}
              >
                {/* Preview Header */}
                <div 
                  className="p-4 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <p className="font-bold text-lg">My Store</p>
                </div>
                
                {/* Preview Content */}
                <div className="p-4 space-y-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>
                      Welcome to Our Store
                    </h2>
                    <p className="text-sm text-gray-600">
                      Discover amazing products
                    </p>
                  </div>
                  
                  {/* Mini Product Cards */}
                  <div className={cn(
                    "grid gap-2",
                    previewMode === 'mobile' ? "grid-cols-1" : "grid-cols-2"
                  )}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white rounded-lg p-3 shadow-sm border">
                        <div className="aspect-square bg-gray-100 rounded mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                        <div 
                          className="h-3 rounded w-1/2"
                          style={{ backgroundColor: primaryColor + '40' }}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* CTA Button */}
                  <button
                    className="w-full py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: primaryColor }}
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

