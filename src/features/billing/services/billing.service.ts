import { dataSource } from '@/services/data-source'

import { normalizeBillingOverview, type BillingSnapshotModel } from '../types/billing.contracts'

export const billingService = {
  async getBillingSnapshot(storeId: string): Promise<BillingSnapshotModel> {
    const invoices = await dataSource.billing.listInvoices(storeId)
    return normalizeBillingOverview({
      store_id: storeId,
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        store_id: invoice.storeId,
        issued_at: invoice.date,
        amount: invoice.amount,
        status: invoice.status,
        plan_id: invoice.planId,
      })),
      subscription: invoices[0]
        ? {
            store_id: storeId,
            plan_id: invoices[0].planId,
            status: 'active',
            next_payment_at: new Date(
              new Date(invoices[0].date).setMonth(new Date(invoices[0].date).getMonth() + 1),
            ).toISOString(),
          }
        : null,
    })
  },
}
