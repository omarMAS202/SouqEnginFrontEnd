import type { RequestMetadata, StoreScopedResource } from '@/types/api-contracts'
import type { Order } from '@/types/models'

export interface OrderItemDto {
  id: string | number
  name?: string | null
  quantity?: number | null
  price?: number | string | null
}

export interface OrderRecordDto extends StoreScopedResource {
  id: string | number
  customer_id?: string | null
  customer_name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  total?: number | string | null
  status?: Order['status'] | null
  created_at?: string | null
  items?: OrderItemDto[] | null
}

export interface OrderDetailCustomerDto {
  id?: string | number | null
  name?: string | null
  email?: string | null
  phone?: string | null
}

export interface OrderDetailShippingAddressDto {
  country?: string | null
  city?: string | null
  address_line_1?: string | null
  address_line_2?: string | null
  postal_code?: string | null
}

export interface OrderDetailItemDto {
  id: string | number
  product_id?: string | number | null
  product_name?: string | null
  sku?: string | null
  image_url?: string | null
  quantity?: number | null
  unit_price?: number | string | null
  line_total?: number | string | null
}

export interface OrderDetailDto extends StoreScopedResource {
  id: string | number
  order_number?: string | null
  status?: Order['status'] | null
  created_at?: string | null
  updated_at?: string | null
  subtotal?: number | string | null
  shipping_fee?: number | string | null
  discount?: number | string | null
  total?: number | string | null
  payment_method?: string | null
  notes?: string | null
  customer?: OrderDetailCustomerDto | null
  shipping_address?: OrderDetailShippingAddressDto | null
  items?: OrderDetailItemDto[] | null
}

export interface OrderDetailResponseDto {
  order: OrderDetailDto
}

export interface OrderListResponseDto extends RequestMetadata {
  store_id: string
  items: OrderRecordDto[]
}

export interface UpdateOrderStatusRequestDto extends StoreScopedResource {
  order_id: string
  status: Order['status']
}

export interface OrderListItemModel extends Order {}

export interface OrderDetailModel {
  id: string
  storeId: string
  orderNumber: string
  status: Order['status']
  createdAt: string
  updatedAt: string | null
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  paymentMethod: string
  notes: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  shippingAddress: {
    country: string
    city: string
    addressLine1: string
    addressLine2: string
    postalCode: string
  }
  items: Array<{
    id: string
    productId: string
    productName: string
    sku: string
    imageUrl: string | null
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

export function normalizeOrderRecord(dto: OrderRecordDto): OrderListItemModel {
  return {
    id: String(dto.id),
    storeId: dto.store_id,
    customerId: dto.customer_id ?? '',
    customerName: dto.customer_name ?? 'Customer',
    email: dto.email ?? '',
    phone: dto.phone ?? '',
    address: dto.address ?? '',
    total: toNumber(dto.total),
    status: dto.status ?? 'pending',
    date: dto.created_at ?? new Date(0).toISOString(),
    items:
      dto.items?.map((item) => ({
        id: String(item.id),
        name: item.name ?? 'Order item',
        quantity: item.quantity ?? 0,
        price: toNumber(item.price),
      })) ?? [],
  }
}

export function normalizeOrderDetail(dto: OrderDetailDto): OrderDetailModel {
  return {
    id: String(dto.id),
    storeId: dto.store_id,
    orderNumber: dto.order_number ?? String(dto.id),
    status: dto.status ?? 'pending',
    createdAt: dto.created_at ?? new Date(0).toISOString(),
    updatedAt: dto.updated_at ?? null,
    subtotal: toNumber(dto.subtotal),
    shippingFee: toNumber(dto.shipping_fee),
    discount: toNumber(dto.discount),
    total: toNumber(dto.total),
    paymentMethod: dto.payment_method ?? '',
    notes: dto.notes ?? '',
    customer: {
      id: dto.customer?.id !== undefined && dto.customer?.id !== null ? String(dto.customer.id) : '',
      name: dto.customer?.name ?? 'Customer',
      email: dto.customer?.email ?? '',
      phone: dto.customer?.phone ?? '',
    },
    shippingAddress: {
      country: dto.shipping_address?.country ?? '',
      city: dto.shipping_address?.city ?? '',
      addressLine1: dto.shipping_address?.address_line_1 ?? '',
      addressLine2: dto.shipping_address?.address_line_2 ?? '',
      postalCode: dto.shipping_address?.postal_code ?? '',
    },
    items:
      dto.items?.map((item) => ({
        id: String(item.id),
        productId:
          item.product_id !== undefined && item.product_id !== null ? String(item.product_id) : '',
        productName: item.product_name ?? 'Order item',
        sku: item.sku ?? '',
        imageUrl: item.image_url ?? null,
        quantity: item.quantity ?? 0,
        unitPrice: toNumber(item.unit_price),
        lineTotal: toNumber(item.line_total),
      })) ?? [],
  }
}
