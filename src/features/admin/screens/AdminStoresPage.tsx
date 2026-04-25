'use client'

import { useDeferredValue, useState } from 'react'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useAdminStores, useAdminStoreMutations } from '../hooks/useAdmin'
import type { AdminStoreModel } from '../types/admin.contracts'

function statusBadgeVariant(status: AdminStoreModel['status']) {
  if (status === 'active') return 'default'
  if (status === 'suspended') return 'destructive'
  return 'secondary'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminStoresPage() {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const storesQuery = useAdminStores(deferredSearch)
  const { updateStoreStatus } = useAdminStoreMutations()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Stores</h1>
        <p className="text-muted-foreground">Review store performance, approval state, and moderation actions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by store name, owner, or email"
          />

          {storesQuery.isLoading ? (
            <LoadingState message="Loading stores..." />
          ) : storesQuery.isError ? (
            <ErrorState
              title="Unable to load stores."
              description={storesQuery.error instanceof Error ? storesQuery.error.message : undefined}
            />
          ) : !storesQuery.data?.length ? (
            <EmptyState title="No stores found." description="Try a different search term or connect the admin stores endpoint." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storesQuery.data.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>
                      <div>
                        <p>{store.ownerName}</p>
                        <p className="text-xs text-muted-foreground">{store.ownerEmail || 'No email'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(store.status)} className="capitalize">
                        {store.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{store.productsCount.toLocaleString()}</TableCell>
                    <TableCell>{store.ordersCount.toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(store.revenueTotal)}</TableCell>
                    <TableCell>{store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'No date'}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updateStoreStatus.isPending || store.status === 'active'}
                          onClick={() => updateStoreStatus.mutate({ storeId: store.id, status: 'active' })}
                        >
                          Activate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updateStoreStatus.isPending || store.status === 'pending'}
                          onClick={() => updateStoreStatus.mutate({ storeId: store.id, status: 'pending' })}
                        >
                          Mark Pending
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updateStoreStatus.isPending || store.status === 'suspended'}
                          onClick={() => updateStoreStatus.mutate({ storeId: store.id, status: 'suspended' })}
                        >
                          Suspend
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
