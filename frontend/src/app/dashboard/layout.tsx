import DashboardLayoutShell from '@/components/layouts/dashboard/DashboardLayoutShell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutShell>{children}</DashboardLayoutShell>
}
