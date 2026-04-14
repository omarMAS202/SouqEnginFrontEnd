import { CustomerOrderDetailsPage } from '@/features/storefront'

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  return <CustomerOrderDetailsPage orderId={orderId} />
}
