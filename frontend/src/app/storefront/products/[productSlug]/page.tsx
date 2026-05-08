import { ProductDetailsPage } from '@/features/storefront'

export default async function Page({
  params,
}: {
  params: Promise<{ productSlug: string }>
}) {
  const { productSlug } = await params
  return <ProductDetailsPage productSlug={productSlug} />
}
