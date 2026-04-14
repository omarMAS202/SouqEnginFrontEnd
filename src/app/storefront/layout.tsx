import StorefrontLayoutShell from '@/components/layouts/storefront/StorefrontLayoutShell'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StorefrontLayoutShell>{children}</StorefrontLayoutShell>
}
