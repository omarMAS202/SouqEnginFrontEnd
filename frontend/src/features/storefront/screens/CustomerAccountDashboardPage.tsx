'use client'

import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/features/localization'

import { CustomerAccountShell } from '../components/CustomerAccountShell'
import { useCustomerAccountQuery } from '../hooks/useCustomerAccount'

export default function CustomerAccountDashboardPage() {
  const { language } = useLanguage()
  const { data: customer } = useCustomerAccountQuery()

  return (
    <CustomerAccountShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'لوحة حساب العميل' : 'Customer account overview'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar'
              ? 'ملخص سريع للطلبات والعناوين والبيانات الشخصية.'
              : 'A quick overview of orders, addresses, and customer profile data.'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>{language === 'ar' ? 'الطلبات' : 'Orders'}</CardTitle></CardHeader>
            <CardContent>{customer?.orders.length ?? 0}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{language === 'ar' ? 'العناوين' : 'Addresses'}</CardTitle></CardHeader>
            <CardContent>{customer?.addresses.length ?? 0}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{language === 'ar' ? 'البريد' : 'Email'}</CardTitle></CardHeader>
            <CardContent>{customer?.email}</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'روابط سريعة' : 'Quick actions'}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/storefront/account/orders" className="text-primary hover:underline">
              {language === 'ar' ? 'عرض الطلبات' : 'View orders'}
            </Link>
            <Link href="/storefront/account/addresses" className="text-primary hover:underline">
              {language === 'ar' ? 'إدارة العناوين' : 'Manage addresses'}
            </Link>
            <Link href="/storefront/account/profile" className="text-primary hover:underline">
              {language === 'ar' ? 'تحديث الملف الشخصي' : 'Update profile'}
            </Link>
          </CardContent>
        </Card>
      </div>
    </CustomerAccountShell>
  )
}
