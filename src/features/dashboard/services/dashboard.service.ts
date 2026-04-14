import { dataSource } from '@/services/data-source'
import type { Order } from '@/types/models'

import type { DashboardOverviewModel } from '../types/dashboard.contracts'

const defaultOrderStatus: Order['status'] = 'pending'

export const dashboardService = {
  async getOverview(storeId: string): Promise<DashboardOverviewModel> {
    const response = await dataSource.dashboard.overview(storeId)

    return {
      stats: {
        totalOrders: response?.stats?.totalOrders ?? 0,
        totalRevenue: response?.stats?.totalRevenue ?? 0,
        totalProducts: response?.stats?.totalProducts ?? 0,
        totalCustomers: response?.stats?.totalCustomers ?? 0,
      },
      recentOrders:
        response?.recentOrders?.map((order) => ({
          id: order.id,
          customerName: order.customerName ?? 'Customer',
          total: order.total ?? 0,
          status: order.status ?? defaultOrderStatus,
          date: order.date ?? new Date(0).toISOString(),
        })) ?? [],
      topProducts:
        response?.topProducts?.map((product) => ({
          id: product.id,
          name: product.name ?? 'Product',
          sales: product.sales ?? 0,
          revenue: product.revenue ?? 0,
        })) ?? [],
    }
  },
  getSettings: dataSource.dashboard.settings,
  updateSettings: dataSource.dashboard.updateSettings,
}
