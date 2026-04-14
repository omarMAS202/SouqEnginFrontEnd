import { CategoryDetailsPage } from '@/features/storefront'

export default async function Page({
  params,
}: {
  params: Promise<{ categorySlug: string }>
}) {
  const { categorySlug } = await params
  return <CategoryDetailsPage categorySlug={categorySlug} />
}
