'use client'

import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, ShoppingBag, Star, Truck, Shield, Headphones } from 'lucide-react'
import Link from 'next/link'

const featuredProducts = [
  { id: '1', name: 'Premium Leather Bag', price: 299, originalPrice: 399, rating: 4.8, reviews: 124 },
  { id: '2', name: 'Silk Evening Dress', price: 449, originalPrice: null, rating: 4.9, reviews: 89 },
  { id: '3', name: 'Gold Watch Collection', price: 899, originalPrice: 1099, rating: 4.7, reviews: 56 },
  { id: '4', name: 'Designer Sunglasses', price: 199, originalPrice: null, rating: 4.6, reviews: 203 },
]

const categories = [
  { id: '1', name: 'Women', description: 'Elegant women fashion', productCount: 124 },
  { id: '2', name: 'Men', description: 'Stylish men clothing', productCount: 98 },
  { id: '3', name: 'Accessories', description: 'Bags, belts, and more', productCount: 67 },
  { id: '4', name: 'Watches', description: 'Luxury timepieces', productCount: 34 },
]

const features = [
  { icon: Truck, title: 'Free Shipping', description: 'On orders over $100' },
  { icon: Shield, title: 'Secure Payment', description: '100% secure checkout' },
  { icon: Headphones, title: '24/7 Support', description: 'Always here to help' },
]

export default function StorefrontHome() {
  const { t, direction } = useLanguage()

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className={cn(
            "grid md:grid-cols-2 gap-12 items-center",
            direction === 'rtl' && "md:flex-row-reverse"
          )}>
            <div className={direction === 'rtl' ? 'text-right' : ''}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                {t('store.newArrivals')}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 text-balance">
                Discover Your Perfect Style
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg text-pretty">
                Explore our curated collection of premium fashion and accessories. 
                Handpicked for the modern, style-conscious individual.
              </p>
              <div className={cn("flex items-center gap-4", direction === 'rtl' && "flex-row-reverse")}>
                <Link href="/storefront/shop">
                  <Button size="lg" className={cn("gap-2", direction === 'rtl' && "flex-row-reverse")}>
                    {t('store.shop')}
                    <ArrowRight className={cn("w-4 h-4", direction === 'rtl' && "rotate-180")} />
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  View Collections
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border flex items-center justify-center">
                <ShoppingBag className="w-32 h-32 text-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={cn(
            "grid md:grid-cols-3 gap-8",
            direction === 'rtl' && "text-right"
          )}>
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  className={cn(
                    "flex items-center gap-4",
                    direction === 'rtl' && "flex-row-reverse"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={cn(
          "flex items-center justify-between mb-8",
          direction === 'rtl' && "flex-row-reverse"
        )}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('store.categories')}</h2>
          <Link href="/storefront/categories">
            <Button variant="ghost" className={cn("gap-1", direction === 'rtl' && "flex-row-reverse")}>
              View All
              <ArrowRight className={cn("w-4 h-4", direction === 'rtl' && "rotate-180")} />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/storefront/categories/${category.id}`}>
              <Card className="group hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="aspect-square bg-secondary/50 rounded-xl mb-4 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.productCount} products</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className={cn(
            "flex items-center justify-between mb-8",
            direction === 'rtl' && "flex-row-reverse"
          )}>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('store.featuredProducts')}</h2>
            <Link href="/storefront/shop">
              <Button variant="ghost" className={cn("gap-1", direction === 'rtl' && "flex-row-reverse")}>
                View All
                <ArrowRight className={cn("w-4 h-4", direction === 'rtl' && "rotate-180")} />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-secondary/50 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-muted-foreground/20" />
                    </div>
                    {product.originalPrice && (
                      <span className="absolute top-3 left-3 px-2 py-1 rounded bg-destructive text-destructive-foreground text-xs font-medium">
                        Sale
                      </span>
                    )}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button size="sm">{t('store.addToCart')}</Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className={cn(
                      "flex items-center gap-1 mb-2",
                      direction === 'rtl' && "flex-row-reverse"
                    )}>
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">({product.reviews})</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2",
                      direction === 'rtl' && "flex-row-reverse"
                    )}>
                      <span className="text-lg font-bold text-primary">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Stay in the Loop
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Subscribe to our newsletter for exclusive offers, new arrivals, and style tips.
            </p>
            <div className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto",
              direction === 'rtl' && "sm:flex-row-reverse"
            )}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full sm:flex-1 px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button>Subscribe</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
