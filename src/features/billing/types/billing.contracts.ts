import type { RequestMetadata, StoreScopedResource } from '@/types/api-contracts'
import type { Invoice } from '@/types/models'

export interface InvoiceRecordDto extends StoreScopedResource {
  id: string
  issued_at?: string | null
  amount?: number | null
  status?: Invoice['status'] | null
  plan_id?: Invoice['planId'] | null
}

export interface BillingSubscriptionDto extends StoreScopedResource {
  plan_id?: Invoice['planId'] | null
  status?: 'active' | 'trialing' | 'past_due' | 'cancelled' | null
  next_payment_at?: string | null
}

export interface BillingOverviewResponseDto extends RequestMetadata {
  store_id: string
  subscription?: BillingSubscriptionDto | null
  invoices?: InvoiceRecordDto[] | null
}

export interface BillingSnapshotModel {
  subscription: {
    planId: Invoice['planId']
    status: 'active' | 'trialing' | 'past_due' | 'cancelled'
    nextPaymentAt: string | null
  } | null
  invoices: Invoice[]
}

export function normalizeBillingOverview(dto: BillingOverviewResponseDto): BillingSnapshotModel {
  return {
    subscription: dto.subscription
      ? {
          planId: dto.subscription.plan_id ?? 'starter',
          status: dto.subscription.status ?? 'active',
          nextPaymentAt: dto.subscription.next_payment_at ?? null,
        }
      : null,
    invoices:
      dto.invoices?.map((invoice) => ({
        id: invoice.id,
        storeId: invoice.store_id,
        date: invoice.issued_at ?? new Date(0).toISOString(),
        amount: invoice.amount ?? 0,
        status: invoice.status ?? 'pending',
        planId: invoice.plan_id ?? 'starter',
      })) ?? [],
  }
}
