'use client'

import { useDeferredValue, useState } from 'react'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useAdminUsers } from '../hooks/useAdmin'
import type { AdminUserModel } from '../types/admin.contracts'

function roleBadgeVariant(role: AdminUserModel['role']) {
  if (role === 'super_admin') return 'default'
  if (role === 'support') return 'secondary'
  return 'outline'
}

function statusBadgeVariant(status: AdminUserModel['status']) {
  if (status === 'active') return 'default'
  if (status === 'suspended') return 'destructive'
  return 'secondary'
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const usersQuery = useAdminUsers(deferredSearch)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">Track platform admins, support staff, and store owners from one place.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or role"
          />

          {usersQuery.isLoading ? (
            <LoadingState message="Loading users..." />
          ) : usersQuery.isError ? (
            <ErrorState
              title="Unable to load users."
              description={usersQuery.error instanceof Error ? usersQuery.error.message : undefined}
            />
          ) : !usersQuery.data?.length ? (
            <EmptyState title="No users found." description="Connect the admin users endpoint to populate the team directory." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stores</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant(user.role)} className="capitalize">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(user.status)} className="capitalize">
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.storesCount}</TableCell>
                    <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'No date'}</TableCell>
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
