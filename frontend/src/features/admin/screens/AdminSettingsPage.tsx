'use client'

import { useEffect, useState } from 'react'

import { ErrorState, LoadingState } from '@/components/shared/ScreenState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/useToast'

import { useAdminSettings, useAdminSettingsMutation } from '../hooks/useAdmin'
import type { AdminSettingsInput } from '../types/admin.contracts'

export default function AdminSettingsPage() {
  const settingsQuery = useAdminSettings()
  const updateSettings = useAdminSettingsMutation()
  const [form, setForm] = useState<AdminSettingsInput | null>(null)

  useEffect(() => {
    if (settingsQuery.data) {
      setForm(settingsQuery.data)
    }
  }, [settingsQuery.data])

  if (settingsQuery.isLoading) {
    return <LoadingState message="Loading platform settings..." />
  }

  if (settingsQuery.isError) {
    return (
      <ErrorState
        title="Unable to load platform settings."
        description={settingsQuery.error instanceof Error ? settingsQuery.error.message : undefined}
      />
    )
  }

  if (!form) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground">Control registration, approvals, maintenance mode, and support defaults.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input
                id="support-email"
                type="email"
                value={form.supportEmail}
                onChange={(event) => setForm({ ...form, supportEmail: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-currency">Default Currency</Label>
              <Input
                id="default-currency"
                value={form.defaultCurrency}
                onChange={(event) => setForm({ ...form, defaultCurrency: event.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-foreground">Allow Public Registration</p>
                <p className="text-sm text-muted-foreground">Enable self-serve signups for new store owners.</p>
              </div>
              <Switch
                checked={form.allowPublicRegistration}
                onCheckedChange={(checked) => setForm({ ...form, allowPublicRegistration: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-foreground">Require Store Approval</p>
                <p className="text-sm text-muted-foreground">Keep new stores pending until a super admin approves them.</p>
              </div>
              <Switch
                checked={form.requireStoreApproval}
                onCheckedChange={(checked) => setForm({ ...form, requireStoreApproval: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-foreground">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Pause public access while the platform is under maintenance.</p>
              </div>
              <Switch
                checked={form.maintenanceMode}
                onCheckedChange={(checked) => setForm({ ...form, maintenanceMode: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              disabled={updateSettings.isPending}
              onClick={async () => {
                try {
                  await updateSettings.mutateAsync(form)
                  toast({ title: 'Settings saved', description: 'Super admin settings were updated successfully.' })
                } catch (error) {
                  toast({
                    title: 'Unable to save settings',
                    description: error instanceof Error ? error.message : 'Please try again.',
                    variant: 'destructive',
                  })
                }
              }}
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
